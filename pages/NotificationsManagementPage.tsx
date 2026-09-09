import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';
import { 
    BellAlertIcon, InformationCircleIcon, CalendarDaysIcon, 
    CheckCircleIcon, XCircleIcon, CogIcon, ArrowPathIcon,
    EnvelopeIcon, ChatBubbleLeftRightIcon, DevicePhoneMobileIcon,
    ComputerDesktopIcon, ClockIcon, ShieldCheckIcon, SparklesIcon,
    ExclamationTriangleIcon, TrashIcon, MagnifyingGlassIcon, FunnelIcon,
    ArrowDownTrayIcon, AdjustmentsHorizontalIcon,
    FolderIcon, BanknotesIcon, UserGroupIcon, ClipboardDocumentListIcon,
    CheckIcon, EyeIcon, PlusIcon, PaperAirplaneIcon, ArrowTopRightOnSquareIcon,
    XMarkIcon, BellIcon, ListBulletIcon, ArrowRightOnRectangleIcon
} from '../constants';
import { 
    NotificationChannel, SystemNotificationStatus, NotificationType, 
    NotificationSettingItem, NotificationLogEntry, NotificationModuleSettings,
    SystemNotification, NotificationCategory, NotificationPriority
} from '../types';
import { notificationService, ReminderOffsetSetting, ArabicCategory } from '../services/notificationService';
import { useCaseTask } from '../components/CaseTaskContext';

// Warning Correspondence Interface
export interface WarningCorrespondenceRecord {
    id: string;
    noticeRef: string;
    tenantName: string;
    civilId: string;
    phoneNumber: string;
    propertyName: string;
    unitNumber: string;
    paciNumber: string;
    noticeType: string;
    dispatchDate: string;
    overdueAmount: number;
    deliveryStatus: 'DELIVERED' | 'READ_VIEWED' | 'E_SIGNED' | 'FAILED';
    deliveryTimestamp?: string;
    readTimestamp?: string;
    ipAddress?: string;
    pdfUrl?: string;
    legalText: string;
}

const INITIAL_WARNING_CORRESPONDENCES: WarningCorrespondenceRecord[] = [
    {
        id: 'WARN-2026-001',
        noticeRef: 'INF-88401/2026',
        tenantName: 'شركة دار الخليج للمقاولات',
        civilId: '295040411223',
        phoneNumber: '+965 9988 1122',
        propertyName: 'برج ناصر السكني - الشرق',
        unitNumber: 'شقة 302',
        paciNumber: '298101004512',
        noticeType: 'إنذار تكليف بالوفاء (المادة 20 قانون الإيجارات)',
        dispatchDate: '2026-07-05 09:30',
        overdueAmount: 2850,
        deliveryStatus: 'E_SIGNED',
        deliveryTimestamp: '2026-07-05 09:32',
        readTimestamp: '2026-07-05 10:15',
        ipAddress: '188.236.192.44 (الكويت - PACI Auth)',
        pdfUrl: '#',
        legalText: 'نحيطكم علماً بضرورة سداد الأجرة المتأخرة والبالغة 2,850 د.ك عن شقة 302 ببرج ناصر السكني خلال مهلة 20 يوماً من تاريخ هذا التكليف بالوفاء، وإلا سنتخذ كافة الإجراءات القانونية لرفع دعوى إخلاء واستصدار أمر أداء بالحبس والمنع من السفر وفقاً للمادة 20 من قانون الإيجارات رقم 35 لسنة 1978.'
    },
    {
        id: 'WARN-2026-002',
        noticeRef: 'INF-88402/2026',
        tenantName: 'سعود عبدالمحسن العتيبي',
        civilId: '292050588991',
        phoneNumber: '+965 5544 3322',
        propertyName: 'مجمع الفروانية التجاري',
        unitNumber: 'محل 12',
        paciNumber: '298101008899',
        noticeType: 'إنذار تكليف بالوفاء بسندات الإيجار المتأخرة',
        dispatchDate: '2026-07-28 14:10',
        overdueAmount: 1800,
        deliveryStatus: 'READ_VIEWED',
        deliveryTimestamp: '2026-07-28 14:11',
        readTimestamp: '2026-07-28 14:25',
        ipAddress: '37.231.108.12 (الكويت - زين)',
        pdfUrl: '#',
        legalText: 'تكليف بالوفاء بمبلغ 1,800 د.ك متأخرات إيجار محل 12 بمجمع الفروانية التجاري عن الأشهر 5، 6، 7 لسنة 2026، والممهل سدادها قانوناً.'
    },
    {
        id: 'WARN-2026-003',
        noticeRef: 'INF-88403/2026',
        tenantName: 'م. طارق مهدي الشمري',
        civilId: '288090911445',
        phoneNumber: '+965 6677 8899',
        propertyName: 'عمارة السالمية الاستثمارية',
        unitNumber: 'شقة 10',
        paciNumber: '298101007744',
        noticeType: 'إخطار رسمي بإنهاء العقد وعدم التجديد',
        dispatchDate: '2026-08-01 11:00',
        overdueAmount: 0,
        deliveryStatus: 'DELIVERED',
        deliveryTimestamp: '2026-08-01 11:02',
        ipAddress: '188.236.200.10',
        pdfUrl: '#',
        legalText: 'إخطار بعدم رغبة المؤجر بتجديد عقد الإيجار لشقة 10 بعمارة السالمية لمخالفة شروط الاستغلال السكني، وتسليم العين خالية عند نهاية المدة.'
    }
];

// Helper Switch Component
const ToggleSwitch = ({ checked, onChange, label, description, icon }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string; icon?: React.ReactNode }) => (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-dm-card rounded-2xl border border-slate-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group">
        <div className="flex items-center gap-3.5">
            {icon && <div className={`p-3 rounded-xl transition-colors ${checked ? 'bg-[#00796B]/10 text-[#00796B]' : 'bg-slate-100 dark:bg-gray-800 text-slate-400 group-hover:bg-slate-200'}`}>{icon}</div>}
            <div className="text-right">
                <p className="font-black text-slate-900 dark:text-dm-text leading-none text-sm">{label}</p>
                {description && <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{description}</p>}
            </div>
        </div>
        <button 
            type="button" 
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ring-offset-2 focus:ring-2 focus:ring-[#00796B] ${checked ? 'bg-[#00796B]' : 'bg-slate-200 dark:bg-gray-700'}`}
        >
            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
    </div>
);

const GroupHeader = ({ title, icon, color = 'bg-[#00796B]' }: { title: string; icon: React.ReactNode; color?: string }) => (
    <div className="flex items-center gap-3 mb-5 mt-7 first:mt-0">
        <div className={`p-2 rounded-xl ${color} text-white shadow-sm`}>
            {icon}
        </div>
        <h3 className="text-lg font-black text-slate-900 dark:text-dm-text tracking-tight">{title}</h3>
        <div className="flex-grow border-t border-dashed border-slate-200 dark:border-gray-800 ms-2"></div>
    </div>
);

// Initial settings state
const initialSettings: NotificationModuleSettings = {
    senderEmail: 'notifications@adalalaw.com',
    managerEmailForAlerts: 'admin@adalalaw.com',
    whatsappBusinessNumber: '96522221111',
    isPaused: false,
    digestFrequency: 'instant',
    quietHours: {
        enabled: true,
        start: '22:00',
        end: '07:30',
        timezone: 'Asia/Kuwait'
    },
    notificationSettings: [
        { id: 'NEW_CASE_ASSIGNED', type: NotificationType.NEW_CASE_ASSIGNED, description: 'إسناد قضية جديدة للدائرة/المحامي', emailEnabled: true, whatsappEnabled: true, smsEnabled: false, systemEnabled: true, priority: 'high' },
        { id: 'HEARING_REMINDER', type: NotificationType.HEARING_REMINDER, description: 'تذكير بموعد جلسة قادمة بالتقويم ورول الجلسات الموحد', emailEnabled: true, whatsappEnabled: true, smsEnabled: true, systemEnabled: true, priority: 'urgent', reminderIntervals: [15, 60, 1440] },
        { id: 'CASE_STATUS_UPDATED', type: NotificationType.CASE_STATUS_UPDATED, description: 'صدور حكم أو تحديث حالة جلسات الرول القضائي تلقائياً', emailEnabled: true, whatsappEnabled: false, smsEnabled: false, systemEnabled: true, managerAlertEnabled: true, priority: 'high' },
        { id: 'CASE_DEADLINE_APPROACHING', type: NotificationType.CASE_DEADLINE_APPROACHING, description: 'اقتراب موعد تسليم مذكرات استئناف ومستندات حاسمة', emailEnabled: true, whatsappEnabled: true, smsEnabled: false, systemEnabled: true, priority: 'high', reminderIntervals: [1440, 4320] },
        { id: 'CONTRACT_RENEWAL', type: NotificationType.CONTRACT_RENEWAL_DUE, description: 'تنبيه استحقاق وتجديد عينات عقود الإيجار وعمل الموظفين', emailEnabled: true, whatsappEnabled: true, smsEnabled: false, systemEnabled: true, priority: 'high', reminderIntervals: [10080, 43200] },
        { id: 'PAYMENT_DUE_REMINDER', type: NotificationType.PAYMENT_DUE_REMINDER, description: 'تذكير العميل بأقساط ودفعات مستحقة الدقة عمالياً ماليًا', emailEnabled: true, whatsappEnabled: true, smsEnabled: false, systemEnabled: false, managerAlertEnabled: true, priority: 'normal', reminderIntervals: [4320] },
        { id: 'NEW_LEAVE_REQUEST', type: NotificationType.NEW_LEAVE_REQUEST_FOR_APPROVAL, description: 'طلبات إجازة جديدة في شؤون الموظفين بانتظام', emailEnabled: true, whatsappEnabled: false, smsEnabled: false, systemEnabled: true, managerAlertEnabled: true, priority: 'normal' },
        { id: 'LOAN_INSTALLMENT', type: NotificationType.LOAN_INSTALLMENT_DUE, description: 'مواعيد تحصيل قسط قرض أو سلفة الموظف دورياً', emailEnabled: true, whatsappEnabled: false, smsEnabled: false, systemEnabled: true, priority: 'low', reminderIntervals: [4320] },
        { id: 'TASK_ASSIGNED', type: NotificationType.TASK_ASSIGNED_TO_YOU, description: 'مهمة جديدة لمتدرب أو للمستشارين القانونيين بالمكتب', emailEnabled: true, whatsappEnabled: false, smsEnabled: false, systemEnabled: true, priority: 'normal' },
        { id: 'TASK_OVERDUE', type: NotificationType.TASK_OVERDUE_ALERT, description: 'تأخر تسليم مذكرة للمحكمة وتجاوز الاستحقاق مهارياً', emailEnabled: true, whatsappEnabled: true, smsEnabled: false, systemEnabled: true, managerAlertEnabled: true, priority: 'high' },
        { id: 'DOC_EXPIRY', type: NotificationType.IMPORTANT_DOCUMENT_EXPIRY_WARNING, description: 'تحذيرات انتهاء صلاحية وكالة رسمية أو مستند تراخيص إداري', emailEnabled: true, whatsappEnabled: false, smsEnabled: false, systemEnabled: true, managerAlertEnabled: true, priority: 'high', reminderIntervals: [43200] },
    ]
};

const NotificationsManagementPage: React.FC = () => {
    const { addToast } = useToast();
    const { tasks, hearings, addHearing, updateHearing, deleteHearing } = useCaseTask();

    // Active Navigation Tab
    const [activeTab, setActiveTab] = useState<'feed' | 'warnings' | 'settings' | 'timing' | 'logs' | 'diagnostic'>('feed');

    // Live Feed State
    const [notificationsList, setNotificationsList] = useState<SystemNotification[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedPriority, setSelectedPriority] = useState<string>('all');
    const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [selectedNotificationModal, setSelectedNotificationModal] = useState<SystemNotification | null>(null);

    // Warning Correspondence Archives State
    const [warningCorrespondences, setWarningCorrespondences] = useState<WarningCorrespondenceRecord[]>(INITIAL_WARNING_CORRESPONDENCES);
    const [selectedWarningForPdf, setSelectedWarningForPdf] = useState<WarningCorrespondenceRecord | null>(null);
    const [isPdfNoticeModalOpen, setIsPdfNoticeModalOpen] = useState<boolean>(false);
    const [warningSearchTerm, setWarningSearchTerm] = useState<string>('');
    const [warningFilterStatus, setWarningFilterStatus] = useState<string>('ALL');
    const [isCreateWarningModalOpen, setIsCreateWarningModalOpen] = useState<boolean>(false);
    
    // Create Warning Form
    const [newWarningForm, setNewWarningForm] = useState({
        tenantName: '',
        civilId: '',
        phoneNumber: '',
        propertyName: 'برج ناصر السكني - الشرق',
        unitNumber: 'شقة 101',
        noticeType: 'إنذار تكليف بالوفاء (المادة 20 قانون الإيجارات)',
        overdueAmount: '',
        legalText: ''
    });

    // Custom Alert Compose Modal
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [customTitle, setCustomTitle] = useState('');
    const [customMessage, setCustomMessage] = useState('');
    const [customCategory, setCustomCategory] = useState<keyof typeof NotificationCategory>('REMINDER');
    const [customPriority, setCustomPriority] = useState<keyof typeof NotificationPriority>('HIGH');
    const [customRecipient, setCustomRecipient] = useState('جميع مستخدمي النظام');

    // Settings & Logs State
    const [settingsState, setSettingsState] = useState<NotificationModuleSettings>(initialSettings);
    const [logs, setLogs] = useState<NotificationLogEntry[]>([]);
    const [offsets, setOffsets] = useState<ReminderOffsetSetting[]>([]);
    const [logSearchTerm, setLogSearchTerm] = useState('');
    const [logStatusFilter, setLogStatusFilter] = useState<SystemNotificationStatus | ''>('');

    // Load and Sync Notifications
    const refreshData = () => {
        notificationService.syncWithSystem(tasks, hearings);
        setNotificationsList(notificationService.getNotifications());
        setLogs(notificationService.getAuditLogs());
        setOffsets(notificationService.getReminderOffsets());
    };

    useEffect(() => {
        refreshData();
        const unsubscribe = notificationService.subscribe((updated) => {
            setNotificationsList(updated);
            setLogs(notificationService.getAuditLogs());
            setOffsets(notificationService.getReminderOffsets());
        });
        return () => unsubscribe();
    }, [tasks, hearings]);

    // Categories list for pills
    const categoryPills = [
        { id: 'all', label: 'الكل' },
        { id: ArabicCategory.SESSION, label: ArabicCategory.SESSION },
        { id: ArabicCategory.AUTOMATED_ROLL, label: ArabicCategory.AUTOMATED_ROLL },
        { id: ArabicCategory.CASE, label: ArabicCategory.CASE },
        { id: ArabicCategory.CONTRACT, label: ArabicCategory.CONTRACT },
        { id: ArabicCategory.FINANCE, label: ArabicCategory.FINANCE },
        { id: ArabicCategory.DOCUMENT, label: ArabicCategory.DOCUMENT },
        { id: ArabicCategory.HR, label: ArabicCategory.HR },
        { id: ArabicCategory.APPROVAL, label: ArabicCategory.APPROVAL },
        { id: ArabicCategory.SYSTEM, label: ArabicCategory.SYSTEM },
    ];

    // Filtered Feed List
    const filteredNotifications = useMemo(() => {
        return notificationsList.filter(n => {
            const matchesSearch = 
                n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                n.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (n.source && n.source.toLowerCase().includes(searchTerm.toLowerCase()));
            
            const matchesCategory = selectedCategory === 'all' || n.categoryArabic === selectedCategory;
            
            const matchesPriority = selectedPriority === 'all' || n.priority === selectedPriority || n.priorityArabic === selectedPriority;

            const matchesRead = readFilter === 'all' ? true : readFilter === 'unread' ? !n.isRead : n.isRead;

            return matchesSearch && matchesCategory && matchesPriority && matchesRead;
        });
    }, [notificationsList, searchTerm, selectedCategory, selectedPriority, readFilter]);

    // Filtered Audit Logs
    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const matchesSearch = 
                log.recipient.toLowerCase().includes(logSearchTerm.toLowerCase()) || 
                log.notificationType.toLowerCase().includes(logSearchTerm.toLowerCase()) || 
                (log.subject && log.subject.toLowerCase().includes(logSearchTerm.toLowerCase())) ||
                (log.reason && log.reason.toLowerCase().includes(logSearchTerm.toLowerCase()));
            const matchesStatus = !logStatusFilter || log.status === logStatusFilter;
            return matchesSearch && matchesStatus;
        }).sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
    }, [logs, logSearchTerm, logStatusFilter]);

    // Count statistics
    const stats = useMemo(() => {
        const total = notificationsList.length;
        const unread = notificationsList.filter(n => !n.isRead).length;
        const logsSent = logs.filter(l => l.status === SystemNotificationStatus.SENT).length;
        const activeOffsets = offsets.filter(o => o.enabled).length;
        return { total, unread, logsSent, activeOffsets };
    }, [notificationsList, logs, offsets]);

    // Multi-select handlers
    const toggleSelectAll = () => {
        if (selectedIds.length === filteredNotifications.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredNotifications.map(n => n.id));
        }
    };

    const toggleSelectId = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleBulkMarkRead = () => {
        selectedIds.forEach(id => notificationService.markAsRead(id));
        setSelectedIds([]);
        addToast({
            type: 'success',
            title: 'تحديث الإشعارات',
            message: 'تم تعيين الإشعارات المحددة كمقروءة بنجاح.'
        });
    };

    const handleBulkDelete = () => {
        selectedIds.forEach(id => notificationService.deleteNotification(id));
        setSelectedIds([]);
        addToast({
            type: 'info',
            title: 'حذف الإشعارات',
            message: 'تم حذف الإشعارات المحددة.'
        });
    };

    const handleBulkSnooze = (minutes: number = 30) => {
        selectedIds.forEach(id => notificationService.snoozeNotification(id, minutes));
        setSelectedIds([]);
        addToast({
            type: 'success',
            title: 'تأجيل التنبيهات',
            message: `تم تأجيل الإشعارات المحددة لـ ${minutes} دقيقة.`
        });
    };

    // Handle Create Custom Notification
    const handleCreateCustomNotification = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customTitle.trim() || !customMessage.trim()) {
            addToast({
                type: 'warning',
                title: 'بيانات ناقصة',
                message: 'يرجى إدخال عنوان ومضمون الإشعار.'
            });
            return;
        }

        notificationService.addNotification({
            title: customTitle.trim(),
            message: customMessage.trim(),
            category: customCategory,
            priority: customPriority,
        });

        setIsCreateModalOpen(false);
        setCustomTitle('');
        setCustomMessage('');
        addToast({
            type: 'success',
            title: 'تم إرسال الإشعار',
            message: 'تم نشر وإرسال التنبيه المخصص إلى النظام فورياً.'
        });
    };

    // Toggle Offset Threshold
    const handleToggleOffsetThreshold = (key: string) => {
        notificationService.toggleReminderOffset(key);
        setOffsets(notificationService.getReminderOffsets());
        notificationService.syncWithSystem(tasks, hearings);
        addToast({
            type: 'success',
            title: 'تحديث التوقيت',
            message: 'تم تعديل مواقيت الإنذار المسبق وتطبيق المزامنة.'
        });
    };

    // Clear Whole Audit Logs
    const handleClearWholeAuditLogs = () => {
        if (confirm("هل أنت متأكد من تصفير ومسح كامل سجلات التدقيق التاريخية نهائياً؟")) {
            notificationService.clearAuditLogs();
            setLogs([]);
            addToast({
                type: 'info',
                title: 'مسح السجلات',
                message: 'تم مسح سجلات التدقيق بالكامل.'
            });
        }
    };

    // Helper for Priority Styling
    const getPriorityBadge = (priority?: string) => {
        switch (priority) {
            case 'URGENT':
            case 'عاجل جداً':
            case 'urgent':
                return <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-950/30 dark:border-rose-900/50">عاجل جداً 🔴</span>;
            case 'HIGH':
            case 'عالي':
            case 'high':
                return <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/30 dark:border-amber-900/50">عالي 🟠</span>;
            case 'NORMAL':
            case 'عادي':
            case 'normal':
                return <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200/60 dark:bg-blue-950/30 dark:border-blue-900/50">عادي 🔵</span>;
            default:
                return <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-slate-100 text-slate-600 border border-slate-200 dark:bg-gray-800 dark:border-gray-700">منخفض 🟢</span>;
        }
    };

    // Relative Time Formatter
    const formatTimeAgo = (dateStr: string) => {
        const d = new Date(dateStr);
        const now = new Date();
        const diffSecs = Math.floor((now.getTime() - d.getTime()) / 1000);
        
        if (diffSecs < 60) return 'الآن';
        if (diffSecs < 3600) return `منذ ${Math.floor(diffSecs / 60)} دقيقة`;
        if (diffSecs < 86400) return `منذ ${Math.floor(diffSecs / 3600)} ساعة`;
        return d.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    // RENDER: Tab 1 - Feed
    const renderFeedTab = () => (
        <div className="space-y-6 font-sans">
            {/* Toolbar & Search */}
            <div className="bg-white dark:bg-dm-card p-4 rounded-2xl border border-slate-100 dark:border-gray-800 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-3">
                    {/* Search Bar */}
                    <div className="relative w-full md:w-96">
                        <MagnifyingGlassIcon className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text"
                            placeholder="البحث في نص الإشعارات، العناوين، أو المصادر..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pr-10 pl-4 py-2 bg-slate-50 dark:bg-dm-background rounded-xl border border-slate-200 dark:border-gray-800 text-xs font-bold text-right focus:outline-none focus:ring-1 focus:ring-[#00796B]"
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                <XMarkIcon className="w-3.5 h-3.5"/>
                            </button>
                        )}
                    </div>

                    {/* Filter Dropdowns */}
                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                        <div className="flex items-center gap-1 bg-slate-50 dark:bg-dm-background p-1 rounded-xl border border-slate-200 dark:border-gray-800">
                            <button 
                                onClick={() => setReadFilter('all')} 
                                className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${readFilter === 'all' ? 'bg-white dark:bg-dm-card text-[#00796B] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                الكل ({notificationsList.length})
                            </button>
                            <button 
                                onClick={() => setReadFilter('unread')} 
                                className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${readFilter === 'unread' ? 'bg-[#00796B] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                غير مقروء ({notificationsList.filter(n => !n.isRead).length})
                            </button>
                            <button 
                                onClick={() => setReadFilter('read')} 
                                className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${readFilter === 'read' ? 'bg-white dark:bg-dm-card text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                مقروء
                            </button>
                        </div>

                        <select 
                            value={selectedPriority} 
                            onChange={(e) => setSelectedPriority(e.target.value)}
                            className="p-2 bg-slate-50 dark:bg-dm-background rounded-xl border border-slate-200 dark:border-gray-800 text-xs font-bold text-right focus:outline-none focus:ring-1 focus:ring-[#00796B]"
                        >
                            <option value="all">جميع الأولويات</option>
                            <option value="URGENT">عاجل جداً</option>
                            <option value="HIGH">عالي</option>
                            <option value="NORMAL">عادي</option>
                            <option value="LOW">منخفض</option>
                        </select>

                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-xl border-slate-200 dark:border-gray-800"
                            onClick={() => notificationService.markAllAsRead()}
                            leftIcon={<CheckCircleIcon className="w-4 h-4 text-[#00796B]"/>}
                        >
                            قراءة الكل
                        </Button>

                        <Button 
                            variant="primary" 
                            size="sm" 
                            className="bg-[#00796B] hover:bg-[#004D40] text-white rounded-xl font-extrabold"
                            onClick={() => setIsCreateModalOpen(true)}
                            leftIcon={<PlusIcon className="w-4 h-4"/>}
                        >
                            إرسال تنبيه مخصص
                        </Button>
                    </div>
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar border-t border-slate-100 dark:border-gray-800">
                    <span className="text-[10px] font-black text-slate-400 shrink-0 ml-2">الأقسام:</span>
                    {categoryPills.map(pill => {
                        const count = pill.id === 'all' 
                            ? notificationsList.length 
                            : notificationsList.filter(n => n.categoryArabic === pill.id).length;
                        const isSelected = selectedCategory === pill.id;
                        return (
                            <button
                                key={pill.id}
                                onClick={() => setSelectedCategory(pill.id)}
                                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 border flex items-center gap-1.5 cursor-pointer ${
                                    isSelected 
                                        ? 'bg-[#00796B] text-white border-[#00796B] shadow-sm' 
                                        : 'bg-white dark:bg-dm-card text-slate-600 dark:text-gray-300 border-slate-200 dark:border-gray-700 hover:bg-slate-50'
                                }`}
                            >
                                <span>{pill.label}</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-gray-800 text-slate-500'}`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Floating Selection Action Bar */}
            {selectedIds.length > 0 && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#00796B] text-white p-3 px-5 rounded-2xl shadow-lg flex items-center justify-between gap-4 font-sans"
                >
                    <div className="flex items-center gap-3">
                        <span className="bg-white/20 px-2.5 py-1 rounded-lg text-xs font-black">{selectedIds.length} محدد</span>
                        <span className="text-xs font-bold">يمكنك إجراء عمليات جماعية على الإشعارات المختارة:</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button size="sm" onClick={handleBulkMarkRead} className="bg-white text-[#00796B] hover:bg-emerald-50 rounded-xl font-black text-xs">
                            تعليم كمقروء ✅
                        </Button>
                        <Button size="sm" onClick={() => handleBulkSnooze(30)} className="bg-white/20 hover:bg-white/30 text-white rounded-xl font-black text-xs">
                            تأجيل 30 دقيقة ⏰
                        </Button>
                        <Button size="sm" onClick={handleBulkDelete} className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-xs">
                            حذف المحدد 🗑️
                        </Button>
                        <button onClick={() => setSelectedIds([])} className="text-white/80 hover:text-white p-1 ml-2">
                            <XMarkIcon className="w-5 h-5"/>
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Select All Checkbox header */}
            {filteredNotifications.length > 0 && (
                <div className="flex justify-between items-center px-2 text-xs text-slate-500 font-bold">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={selectedIds.length === filteredNotifications.length && filteredNotifications.length > 0} 
                            onChange={toggleSelectAll}
                            className="w-4 h-4 rounded text-[#00796B] focus:ring-[#00796B]"
                        />
                        <span>تحديد كل الإشعارات المعروضة ({filteredNotifications.length})</span>
                    </label>
                    <span>مرتبة حسب الأحدث زمناً</span>
                </div>
            )}

            {/* Notification Cards List */}
            <div className="space-y-3">
                <AnimatePresence>
                    {filteredNotifications.map((n) => {
                        const isSelected = selectedIds.includes(n.id);
                        return (
                            <motion.div
                                key={n.id}
                                layout
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                                    isSelected
                                        ? 'bg-[#00796B]/5 border-[#00796B] ring-2 ring-[#00796B]/20'
                                        : !n.isRead 
                                            ? 'bg-white dark:bg-dm-card border-slate-200 dark:border-gray-800 shadow-sm border-r-4 border-r-[#00796B]' 
                                            : 'bg-slate-50/70 dark:bg-dm-card/40 border-slate-100 dark:border-gray-800/80 opacity-90'
                                }`}
                            >
                                <div className="flex items-start gap-3.5 w-full md:w-auto">
                                    <input 
                                        type="checkbox" 
                                        checked={isSelected}
                                        onChange={() => toggleSelectId(n.id)}
                                        className="mt-1.5 w-4 h-4 rounded text-[#00796B] focus:ring-[#00796B] cursor-pointer shrink-0"
                                    />
                                    <div className={`p-3 rounded-2xl shrink-0 mt-0.5 ${
                                        !n.isRead ? 'bg-[#00796B]/10 text-[#00796B]' : 'bg-slate-200/70 text-slate-500'
                                    }`}>
                                        <BellAlertIcon className="w-5 h-5"/>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-black text-slate-900 dark:text-dm-text text-sm">
                                                {n.title}
                                            </span>
                                            {!n.isRead && (
                                                <span className="w-2 h-2 rounded-full bg-[#00796B] inline-block animate-ping"></span>
                                            )}
                                            {getPriorityBadge(n.priority)}
                                            {n.categoryArabic && (
                                                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-300">
                                                    {n.categoryArabic}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-gray-300 font-medium leading-relaxed max-w-3xl">
                                            {n.message}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 font-bold pt-1">
                                            <span className="flex items-center gap-1">
                                                <ClockIcon className="w-3 h-3 text-slate-400"/>
                                                {formatTimeAgo(n.timestamp)}
                                            </span>
                                            {n.source && (
                                                <span className="before:content-['•'] before:ml-2">
                                                    المصدر: {n.source}
                                                </span>
                                            )}
                                            {n.eventDate && (
                                                <span className="before:content-['•'] before:ml-2 font-mono text-[#00796B]">
                                                    تاريخ الحدث: {n.eventDate} {n.eventTime || ''}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center border-t md:border-t-0 pt-2 md:pt-0 w-full md:w-auto justify-end">
                                    {n.actionUrl && (
                                        <a 
                                            href={`#${n.actionUrl}`}
                                            className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 hover:bg-slate-200 flex items-center gap-1"
                                            title="الانتقال للمعاينة"
                                        >
                                            <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5"/>
                                            <span>القسم</span>
                                        </a>
                                    )}

                                    <button
                                        onClick={() => setSelectedNotificationModal(n)}
                                        className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
                                        title="عرض التفاصيل الكاملة"
                                    >
                                        <EyeIcon className="w-4 h-4"/>
                                    </button>

                                    <button
                                        onClick={() => notificationService.markAsRead(n.id)}
                                        className={`p-1.5 rounded-xl transition-colors ${
                                            n.isRead 
                                                ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20' 
                                                : 'text-slate-400 hover:text-[#00796B] hover:bg-slate-100 dark:hover:bg-gray-800'
                                        }`}
                                        title={n.isRead ? "مقروء" : "تحديد كمقروء"}
                                    >
                                        <CheckCircleIcon className="w-4 h-4"/>
                                    </button>

                                    <button
                                        onClick={() => notificationService.snoozeNotification(n.id, 30)}
                                        className="p-1.5 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors"
                                        title="تأجيل 30 دقيقة"
                                    >
                                        <ClockIcon className="w-4 h-4"/>
                                    </button>

                                    <button
                                        onClick={() => {
                                            notificationService.deleteNotification(n.id);
                                            addToast({ type: 'info', title: 'حذف الإشعار', message: 'تم إزالة الإشعار.' });
                                        }}
                                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                                        title="حذف الإشعار"
                                    >
                                        <TrashIcon className="w-4 h-4"/>
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {filteredNotifications.length === 0 && (
                    <div className="py-16 text-center bg-white dark:bg-dm-card rounded-2xl border border-slate-100 dark:border-gray-800 p-8">
                        <SparklesIcon className="w-12 h-12 mx-auto text-slate-300 dark:text-gray-600 mb-3" />
                        <h4 className="text-sm font-black text-slate-700 dark:text-dm-text mb-1">لا توجد إشعارات تطابق خيارات الفلترة الحالية</h4>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                            يمكنك تعديل كلمات البحث، إعادة تحديد الفئات، أو إرسال تنبيه مخصص جديد فوراً.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );

    // RENDER: Tab 2 - Settings
    const renderSettingsTab = () => (
        <div className="space-y-8 font-sans">
            {/* Global Switches Header Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <ToggleSwitch 
                    checked={!settingsState.isPaused} 
                    onChange={(v) => {
                        setSettingsState(p => ({ ...p, isPaused: !v }));
                        addToast({ type: 'info', title: 'حالة النظام', message: v ? 'تم تشغيل نشاط النظام' : 'تم إيقاف النظام مؤقتاً' });
                    }} 
                    label="نشاط النظام العام" 
                    description={settingsState.isPaused ? "النظام متوقف حالياً" : "الإشعارات تعمل بشكل طبيعي"}
                    icon={<BellAlertIcon className="w-5 h-5"/>}
                />
                <ToggleSwitch 
                    checked={settingsState.quietHours?.enabled || false} 
                    onChange={(v) => {
                        setSettingsState(p => ({ ...p, quietHours: { ...p.quietHours!, enabled: v } }));
                        addToast({ type: 'info', title: 'ساعات الهدوء', message: v ? 'تم تفعيل وضع الهدوء' : 'تم تعطيل وضع الهدوء' });
                    }} 
                    label="ساعات وضع الهدوء" 
                    description={settingsState.quietHours?.enabled ? `من ${settingsState.quietHours.start} إلى ${settingsState.quietHours.end}` : "معطل"}
                    icon={<ClockIcon className="w-5 h-5"/>}
                />
                <div className="p-4 bg-white dark:bg-dm-card rounded-2xl border border-slate-100 dark:border-gray-800 shadow-sm flex flex-col justify-between">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">تكرار الإرسال والمزامنة</p>
                    <Select 
                        options={[
                            { value: 'instant', label: 'فوري وتحسين لحظي (Real-time)' },
                            { value: 'daily', label: 'ملخص يومي ذكي (Digest)' },
                            { value: 'weekly', label: 'ملخص أسبوعي بالأرشفة' }
                        ]}
                        value={settingsState.digestFrequency}
                        onChange={(e) => setSettingsState(p => ({ ...p, digestFrequency: e.target.value as any }))}
                        containerClassName="mb-0"
                    />
                </div>
                <div className="p-4 bg-[#00796B] text-white rounded-2xl shadow-sm flex flex-col justify-center">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-85 mb-1">القواعد والأحداث المفعلة</p>
                    <p className="text-3xl font-black leading-none">
                        {settingsState.notificationSettings.filter(s => s.systemEnabled).length + offsets.filter(o => o.enabled).length}
                    </p>
                </div>
            </div>

            {/* Categorized Settings List */}
            <div className="bg-slate-50/70 dark:bg-dm-card/30 p-6 rounded-3xl border border-slate-200/80 dark:border-gray-800 space-y-6">
                <div>
                    <GroupHeader title="إدارة القضايا ورول المحاكم" icon={<FolderIcon className="w-5 h-5"/>} color="bg-blue-600" />
                    <div className="grid grid-cols-1 gap-3">
                        {settingsState.notificationSettings.filter(s => s.id.includes('CASE') || s.id.includes('HEARING')).map(s => renderSettingRow(s))}
                    </div>
                </div>

                <div>
                    <GroupHeader title="الشؤون المالية والأتعاب القضائية" icon={<BanknotesIcon className="w-5 h-5"/>} color="bg-emerald-600" />
                    <div className="grid grid-cols-1 gap-3">
                        {settingsState.notificationSettings.filter(s => s.id.includes('PAYMENT')).map(s => renderSettingRow(s))}
                    </div>
                </div>

                <div>
                    <GroupHeader title="العقود وتجديد الاتفاقيات" icon={<ClipboardDocumentListIcon className="w-5 h-5"/>} color="bg-rose-600" />
                    <div className="grid grid-cols-1 gap-3">
                        {settingsState.notificationSettings.filter(s => s.id.includes('CONTRACT')).map(s => renderSettingRow(s))}
                    </div>
                </div>

                <div>
                    <GroupHeader title="شؤون الموظفين والإجازات" icon={<UserGroupIcon className="w-5 h-5"/>} color="bg-violet-600" />
                    <div className="grid grid-cols-1 gap-3">
                        {settingsState.notificationSettings.filter(s => s.id.includes('LEAVE') || s.id.includes('LOAN')).map(s => renderSettingRow(s))}
                    </div>
                </div>

                <div>
                    <GroupHeader title="المهام والمستندات الرسمية" icon={<ClipboardDocumentListIcon className="w-5 h-5"/>} color="bg-amber-600" />
                    <div className="grid grid-cols-1 gap-3">
                        {settingsState.notificationSettings.filter(s => s.id.includes('TASK') || s.id.includes('DOC')).map(s => renderSettingRow(s))}
                    </div>
                </div>
            </div>
        </div>
    );

    const handleToggleChannel = (id: string, channel: 'emailEnabled' | 'whatsappEnabled' | 'smsEnabled' | 'systemEnabled' | 'managerAlertEnabled') => {
        setSettingsState(prev => ({
            ...prev,
            notificationSettings: prev.notificationSettings.map(s => s.id === id ? { ...s, [channel]: !s[channel] } : s)
        }));
    };

    const renderSettingRow = (s: NotificationSettingItem) => {
        const intervals = [
            { label: '5 د', value: 5 },
            { label: '15 د', value: 15 },
            { label: '1 س', value: 60 },
            { label: '1 ي', value: 1440 },
            { label: '3 ي', value: 4320 },
            { label: 'أسبوع', value: 10080 },
            { label: 'شهر', value: 43200 }
        ];

        const toggleInterval = (value: number) => {
            setSettingsState(prev => ({
                ...prev,
                notificationSettings: prev.notificationSettings.map(item => 
                    item.id === s.id 
                    ? { 
                        ...item, 
                        reminderIntervals: (item.reminderIntervals || []).includes(value)
                            ? (item.reminderIntervals || []).filter(v => v !== value)
                            : [...(item.reminderIntervals || []), value]
                    } 
                    : item
                )
            }));
        };

        return (
            <div key={s.id} className="bg-white dark:bg-dm-card p-4 rounded-2xl border border-slate-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all flex flex-col gap-4 text-right">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="flex-grow max-w-xl text-right">
                        <div className="flex items-center gap-2 mb-1">
                            <p className="font-black text-slate-800 dark:text-dm-text text-xs sm:text-sm">{s.description}</p>
                            {s.priority && (
                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                                    s.priority === 'urgent' ? 'bg-rose-100 text-rose-700' : 
                                    s.priority === 'high' ? 'bg-amber-100 text-amber-700' : 
                                    'bg-blue-100 text-blue-700'
                                }`}>
                                    {s.priority === 'urgent' ? 'عاجل' : s.priority === 'high' ? 'عالي' : 'عادي'}
                                </span>
                            )}
                        </div>
                        <p className="text-[9px] text-slate-400 font-mono font-bold uppercase">{s.type}</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-1.5 justify-end">
                        <button 
                            type="button"
                            onClick={() => handleToggleChannel(s.id, 'systemEnabled')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${s.systemEnabled ? 'bg-[#00796B]/10 border-[#00796B] text-[#00796B]' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'}`}
                        >
                            <ComputerDesktopIcon className="w-3.5 h-3.5"/>
                            <span>إشعار نظام</span>
                        </button>
                        <button 
                            type="button"
                            onClick={() => handleToggleChannel(s.id, 'emailEnabled')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${s.emailEnabled ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'}`}
                        >
                            <EnvelopeIcon className="w-3.5 h-3.5"/>
                            <span>البريد</span>
                        </button>
                        <button 
                            type="button"
                            onClick={() => handleToggleChannel(s.id, 'whatsappEnabled')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${s.whatsappEnabled ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'}`}
                        >
                            <ChatBubbleLeftRightIcon className="w-3.5 h-3.5"/>
                            <span>واتساب</span>
                        </button>
                        <button 
                            type="button"
                            onClick={() => handleToggleChannel(s.id, 'smsEnabled')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${s.smsEnabled ? 'bg-sky-50 border-sky-200 text-sky-700' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'}`}
                        >
                            <DevicePhoneMobileIcon className="w-3.5 h-3.5"/>
                            <span>SMS</span>
                        </button>
                        <button 
                            type="button"
                            onClick={() => handleToggleChannel(s.id, 'managerAlertEnabled')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${s.managerAlertEnabled ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'}`}
                            title="إرسال نسخة للمدير في الرقابة"
                        >
                            <ShieldCheckIcon className="w-3.5 h-3.5"/>
                            <span>تنبيه المدير</span>
                        </button>
                    </div>
                </div>

                {/* Interval Selection */}
                {(s.id.includes('REMINDER') || s.id.includes('APPROACHING') || s.id.includes('EXPIRY') || s.id.includes('RENEWAL') || s.id.includes('INSTALLMENT')) && (
                    <div className="pt-2 border-t border-slate-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <ClockIcon className="w-3 h-3 text-[#00796B]"/> توقيت التنبيهات المسبق:
                        </span>
                        <div className="flex flex-wrap gap-1.5 justify-end">
                            {intervals.map(int => (
                                <button
                                    type="button"
                                    key={int.value}
                                    onClick={() => toggleInterval(int.value)}
                                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black border transition-all ${
                                        (s.reminderIntervals || []).includes(int.value)
                                            ? 'bg-[#00796B] text-white border-[#00796B] shadow-sm'
                                            : 'bg-white dark:bg-dm-background border-slate-200 dark:border-gray-700 text-slate-400 hover:border-slate-300'
                                    }`}
                                >
                                    {int.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // RENDER: Tab 3 - Timing Offsets
    const renderTimingTab = () => (
        <div className="space-y-6 font-sans">
            <Card className="p-6 bg-gradient-to-br from-teal-50/40 to-white dark:from-dm-card dark:to-dm-card border border-teal-100 dark:border-gray-800 rounded-3xl shadow-sm">
                <div className="border-b pb-4 mb-5">
                    <h3 className="text-base font-black text-slate-800 dark:text-dm-text flex items-center gap-2">
                        <ClockIcon className="w-5 h-5 text-[#00796B]" />
                        تخصيص مواقيت الإنذار والتنبيه المسبق (قبل الجلسات والمهام)
                    </h3>
                    <p className="text-xs text-slate-500 font-bold mt-1">
                        قم بتشغيل أو إيقاف المواعيد التنبيهية المسبقة المرتبطة برول الجلسات والتقويم لمنع العشوائية وضمان التذكير في الوقت المناسب.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {offsets.map((item) => (
                        <div 
                            key={item.key} 
                            className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                                item.enabled 
                                    ? 'bg-[#00796B]/5 border-[#00796B]/30 shadow-sm' 
                                    : 'bg-white dark:bg-dm-background border-slate-200 dark:border-gray-800 text-slate-400'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl ${item.enabled ? 'bg-[#00796B]/10 text-[#00796B]' : 'bg-slate-100 text-slate-400'}`}>
                                    <ClockIcon className="w-4 h-4" />
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-slate-800 dark:text-dm-text leading-none">{item.label}</p>
                                    <p className="text-[10px] text-slate-400 font-bold mt-1">قبل {item.minutes} دقيقة</p>
                                </div>
                            </div>
                            
                            <button 
                                type="button"
                                onClick={() => handleToggleOffsetThreshold(item.key)}
                                className={`w-9 h-5 rounded-full relative transition-colors cursor-pointer ${item.enabled ? 'bg-[#00796B]' : 'bg-slate-300 dark:bg-gray-700'}`}
                            >
                                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${item.enabled ? 'left-4.5' : 'left-0.5'}`} />
                            </button>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );

    // RENDER: Tab 4 - Logs
    const renderLogsTab = () => (
        <div className="space-y-4 font-sans">
            <Card className="p-0 overflow-hidden border border-slate-100 dark:border-gray-800 shadow-sm rounded-2xl">
                <div className="bg-white dark:bg-dm-card p-4 border-b border-slate-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-3">
                    <div className="relative w-full md:w-96">
                        <MagnifyingGlassIcon className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                        <input 
                            placeholder="ابحث في سجل التنبيهات والأحداث..." 
                            value={logSearchTerm}
                            onChange={(e) => setLogSearchTerm(e.target.value)}
                            className="w-full pr-10 pl-4 py-2 bg-slate-50 dark:bg-dm-background rounded-xl border border-slate-200 dark:border-gray-800 text-xs font-bold text-right focus:outline-none focus:ring-1 focus:ring-[#00796B]"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                        <select 
                            value={logStatusFilter}
                            onChange={(e) => setLogStatusFilter(e.target.value as any)}
                            className="p-2 bg-slate-50 dark:bg-dm-background rounded-xl border border-slate-200 dark:border-gray-800 text-xs font-bold text-right focus:outline-none focus:ring-1 focus:ring-[#00796B]"
                        >
                            <option value="">جميع الحالات</option>
                            <option value={SystemNotificationStatus.SENT}>مرسل</option>
                            <option value={SystemNotificationStatus.FAILED}>فشل</option>
                            <option value={SystemNotificationStatus.VIEWED}>تم الاطلاع/العرض</option>
                        </select>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-xl border-slate-200"
                            onClick={() => setLogs(notificationService.getAuditLogs())}
                            leftIcon={<ArrowPathIcon className="w-4 h-4"/>}
                        >
                            تحديث
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-xl border-slate-200"
                            onClick={handleClearWholeAuditLogs}
                            leftIcon={<TrashIcon className="w-4 h-4 text-rose-600"/>}
                        >
                            تصفير السجل
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-dm-background border-b border-slate-100 dark:border-gray-800 text-slate-500 font-black">
                                <th className="p-3">التاريخ والوقت</th>
                                <th className="p-3">الحدث والسبب</th>
                                <th className="p-3 text-center">القناة</th>
                                <th className="p-3">المستهدف</th>
                                <th className="p-3 text-center">الحالة</th>
                                <th className="p-3">مضمون الإشعار والمعاينة</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                            {filteredLogs.map(log => (
                                <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-dm-background/60 transition-colors">
                                    <td className="p-3 font-mono text-[11px] text-slate-500 font-bold whitespace-nowrap">
                                        {new Date(log.dateTime).toLocaleString('ar-EG', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="p-3 max-w-xs">
                                        <div className="font-black text-slate-800 dark:text-dm-text text-xs">{log.subject}</div>
                                        <span className="text-[10px] font-bold text-[#00796B] bg-[#00796B]/10 px-1.5 py-0.5 rounded inline-block mt-0.5">
                                            {log.reason || 'مزامنة تلقائية'}
                                        </span>
                                    </td>
                                    <td className="p-3 text-center">
                                        <div className="inline-flex items-center justify-center p-1.5 rounded-lg bg-slate-100 dark:bg-gray-800 text-slate-600">
                                            {log.channel === NotificationChannel.EMAIL && <EnvelopeIcon className="w-3.5 h-3.5"/>}
                                            {log.channel === NotificationChannel.WHATSAPP && <ChatBubbleLeftRightIcon className="w-3.5 h-3.5 text-emerald-600"/>}
                                            {log.channel === NotificationChannel.SMS && <DevicePhoneMobileIcon className="w-3.5 h-3.5"/>}
                                            {log.channel === NotificationChannel.SYSTEM && <ComputerDesktopIcon className="w-3.5 h-3.5 text-[#00796B]"/>}
                                        </div>
                                    </td>
                                    <td className="p-3 font-bold text-slate-700 whitespace-nowrap">
                                        {log.recipient}
                                    </td>
                                    <td className="p-3 text-center">
                                        <Badge 
                                            text={log.status === SystemNotificationStatus.SENT ? 'مرسل' : log.status === SystemNotificationStatus.VIEWED ? 'تم الاطلاع' : 'فشل'} 
                                            variant={log.status === SystemNotificationStatus.SENT ? 'success' : log.status === SystemNotificationStatus.FAILED ? 'danger' : 'info'} 
                                            size="xs"
                                        />
                                    </td>
                                    <td className="p-3 text-slate-500 dark:text-gray-400 text-xs italic max-w-sm truncate">
                                        {log.messagePreview || '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredLogs.length === 0 && (
                    <div className="py-12 text-center text-slate-400 font-bold text-xs">
                        لا توجد سجلات تدقيق تطابق شروط الفلترة
                    </div>
                )}
            </Card>
        </div>
    );

    // RENDER: Tab 5 - Diagnostic Sandbox
    const renderDiagnosticTab = () => {
        const simulatedHearing = hearings.find(h => h.id.startsWith('simulated-hearing-'));
        
        return (
            <div className="space-y-6 font-sans">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card title="مراقبة وحالة استقراء النظام" className="col-span-1 border border-slate-100 dark:border-gray-800 rounded-2xl">
                        <div className="p-4 space-y-3 font-bold text-xs">
                            <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100">
                                <span className="text-emerald-800 dark:text-emerald-300">حماية العشوائية والحياد</span>
                                <Badge text="نشط وآمن" variant="success" size="sm" />
                            </div>

                            <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100">
                                <span className="text-emerald-800 dark:text-emerald-300">حظر ومقاومة التكرار الفوضوي</span>
                                <Badge text="0 إشعارات مكررة" variant="success" size="sm" />
                            </div>

                            <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100">
                                <span className="text-emerald-800 dark:text-emerald-300">حالة التزامن كلياً</span>
                                <Badge text="متصل متزامن" variant="success" size="sm" />
                            </div>

                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-dm-background rounded-xl border border-slate-200">
                                <span className="text-slate-800 dark:text-dm-text">إجمالي الجلسات النشطة بالتقويم</span>
                                <div className="font-mono text-sm font-black text-[#00796B]">{hearings.length}</div>
                            </div>
                        </div>
                    </Card>

                    <Card title="محاكاة إجراءات التقويم الحية (Live Two-Way Sync Sandbox)" className="lg:col-span-2 border border-slate-100 dark:border-gray-800 rounded-2xl">
                        <div className="p-4 space-y-4">
                            <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed font-medium">
                                استخدم هذا المعمل التفاعلي للتأكد واختيار سيناريوهات التزامن. عند النقر على الأزرار بالأسفل، سيتم تعديل مخزن الجلسات في React Context مما يحفز التحديث اللحظي لنظام الإشعارات فوراً.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <Button 
                                    variant="primary" 
                                    className="bg-[#00796B] hover:bg-[#004D40] text-white rounded-xl h-12 font-black text-xs"
                                    disabled={!!simulatedHearing}
                                    onClick={() => {
                                        const nowPlus2h = new Date(Date.now() + 2 * 3600000);
                                        const targetDateStr = nowPlus2h.toISOString().split('T')[0];
                                        const targetTimeStr = nowPlus2h.toTimeString().split(' ')[0].substring(0, 5);
                                        
                                        addHearing({
                                            id: `simulated-hearing-${Date.now()}`,
                                            caseId: 'case-test-101',
                                            caseTitle: 'جلسة محاكاة فحص وتأكيدات عدالة التزامن',
                                            clientName: 'شركة الأنصار لضمان التزامن المباشر',
                                            date: targetDateStr,
                                            time: targetTimeStr,
                                            courtRoomOrLocation: 'المحكمة الكلية قاعة 23 ب',
                                            type: 'جلسة فحص واختبار حظر التكرار',
                                            status: 'Scheduled',
                                            notes: 'مجدولة تجريبياً بالفحص المباشر.'
                                        });

                                        addToast({ type: 'success', title: 'محاكاة التقويم', message: 'تم إضافة جلسة تجريبية وتوليد الإشعار المتزامن.' });
                                        refreshData();
                                    }}
                                >
                                    {!!simulatedHearing ? "● تم إضافة الجلسة تجريبياً" : "1. إنشاء موعد/جلسة عاجلة بالتقويم"}
                                </Button>

                                <Button 
                                    variant="outline" 
                                    className="rounded-xl h-12 font-black text-xs border-slate-200"
                                    disabled={!simulatedHearing}
                                    onClick={() => {
                                        if (!simulatedHearing) return;
                                        const nowPlus4h = new Date(Date.now() + 4 * 3600000);
                                        const targetDateStr = nowPlus4h.toISOString().split('T')[0];
                                        const targetTimeStr = nowPlus4h.toTimeString().split(' ')[0].substring(0, 5);
                                        
                                        updateHearing({
                                            ...simulatedHearing,
                                            date: targetDateStr,
                                            time: targetTimeStr,
                                            notes: 'تم إعادة الجدولة وتغيير موعد الاستحقاق الحقيقي.'
                                        });

                                        addToast({ type: 'info', title: 'تعديل موعد', message: 'تم تحديث تاريخ الجلسة بالتقويم وتعديل التنبيه.' });
                                        refreshData();
                                    }}
                                >
                                    2. تعديل موعد الجلسة وتاريخها
                                </Button>

                                <Button 
                                    variant="outline" 
                                    className="bg-emerald-600 border-none text-white hover:bg-emerald-700 rounded-xl h-12 font-black text-xs"
                                    disabled={!simulatedHearing || simulatedHearing.status === 'Completed'}
                                    onClick={() => {
                                        if (!simulatedHearing) return;
                                        updateHearing({
                                            ...simulatedHearing,
                                            status: 'Completed',
                                            notes: 'اكتمل حضور المحامي بالرول.'
                                        });

                                        addToast({ type: 'success', title: 'تحديث الحالة', message: 'تم تغيير الجلسة إلى مكتملة وتوليد إشعار رول آلي.' });
                                        refreshData();
                                    }}
                                >
                                    3. اعتماد اكتمال الجلسة (Completed)
                                </Button>

                                <Button 
                                    variant="danger" 
                                    className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-12 font-black text-xs"
                                    disabled={!simulatedHearing}
                                    onClick={() => {
                                        if (!simulatedHearing) return;
                                        deleteHearing(simulatedHearing.id);

                                        addToast({ type: 'info', title: 'إلغاء الجلسة', message: 'تم إزالة الجلسة وتصفية إشعاراتها التلقائية.' });
                                        refreshData();
                                    }}
                                >
                                    4. إلغاء وحذف الجلسة كلياً من التقويم
                                </Button>
                            </div>

                            {simulatedHearing ? (
                                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                                    <div>
                                        <span className="font-black text-emerald-800">الجلسة التجريبية النشطة: </span>
                                        <span className="text-emerald-700 font-bold">{simulatedHearing.caseTitle}</span>
                                    </div>
                                    <Badge text={simulatedHearing.status} variant="success" size="xs"/>
                                </div>
                            ) : (
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-400 font-bold">
                                    لا توجد حالياً جلسة تجريبية بالمعمل.
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        );
    };

    // RENDER: Tab - Warnings & Legal Notice Archive
    const renderWarningsArchiveTab = () => {
        const filteredWarnings = warningCorrespondences.filter(w => {
            const matchesSearch = 
                w.tenantName.toLowerCase().includes(warningSearchTerm.toLowerCase()) ||
                w.noticeRef.toLowerCase().includes(warningSearchTerm.toLowerCase()) ||
                w.propertyName.toLowerCase().includes(warningSearchTerm.toLowerCase()) ||
                w.civilId.includes(warningSearchTerm);
            const matchesStatus = warningFilterStatus === 'ALL' || w.deliveryStatus === warningFilterStatus;
            return matchesSearch && matchesStatus;
        });

        return (
            <div className="space-y-6 font-sans">
                {/* Header & Controls */}
                <div className="bg-white dark:bg-dm-card p-5 rounded-3xl border border-slate-100 dark:border-gray-800 shadow-sm space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-dm-text flex items-center gap-2">
                                <ShieldCheckIcon className="w-6 h-6 text-[#00796B]" />
                                أرشيف مراسلات الإنذار والإخطارات القضائية الموثقة
                            </h3>
                            <p className="text-xs font-bold text-slate-400 mt-1">
                                توثيق إلكتروني كامل لاستلام وتصفح إنذارات المادة 20 قانون الإيجارات مع نسخ PDF معتمدة إثباتاً للمواقف القانونية أمام القضاء
                            </p>
                        </div>
                        <Button 
                            onClick={() => setIsCreateWarningModalOpen(true)}
                            className="bg-[#00796B] hover:bg-[#004D40] text-white rounded-xl font-extrabold text-xs h-10 px-4 shrink-0 shadow-md shadow-[#00796B]/20"
                            leftIcon={<PlusIcon className="w-4 h-4"/>}
                        >
                            إصدار إنذار / تكليف بالوفاء جديد
                        </Button>
                    </div>

                    {/* Search & Status Filter */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-gray-800">
                        <div className="relative w-full sm:w-80">
                            <MagnifyingGlassIcon className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text"
                                placeholder="البحث برقم الإنذار، اسم المستأجر، الرقم المدني..."
                                value={warningSearchTerm}
                                onChange={(e) => setWarningSearchTerm(e.target.value)}
                                className="w-full pr-10 pl-4 py-2 bg-slate-50 dark:bg-dm-background rounded-xl border border-slate-200 dark:border-gray-800 text-xs font-bold text-right focus:outline-none focus:ring-1 focus:ring-[#00796B]"
                            />
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                            <span className="text-[10px] font-black text-slate-400 shrink-0">حالة الاستلام:</span>
                            {[
                                { id: 'ALL', label: 'الكل' },
                                { id: 'E_SIGNED', label: 'توقيع إلكتروني ✍️' },
                                { id: 'READ_VIEWED', label: 'تم الفتح والتصفح 👁️' },
                                { id: 'DELIVERED', label: 'تم التسليم 📩' },
                                { id: 'FAILED', label: 'مرتجع / لم يسلم ❌' }
                            ].map(st => (
                                <button
                                    key={st.id}
                                    onClick={() => setWarningFilterStatus(st.id)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer border ${
                                        warningFilterStatus === st.id
                                            ? 'bg-[#00796B] text-white border-[#00796B]'
                                            : 'bg-slate-50 dark:bg-dm-background text-slate-600 dark:text-gray-300 border-slate-200 dark:border-gray-800'
                                    }`}
                                >
                                    {st.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Table of Warning Notices */}
                <Card className="border border-slate-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-dm-background border-b border-slate-100 dark:border-gray-800 text-slate-500 font-black">
                                    <th className="p-4">مرجع الإنذار</th>
                                    <th className="p-4">المستأجر والعقار</th>
                                    <th className="p-4">نوع الإنذار والمبلغ</th>
                                    <th className="p-4 text-center">تاريخ وتوقيت الإرسال</th>
                                    <th className="p-4 text-center">حالة التتبع والقراءة الإلكترونية</th>
                                    <th className="p-4 text-center">المستند القانوني</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                                {filteredWarnings.map(item => (
                                    <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-dm-background/60 transition-colors">
                                        <td className="p-4 font-mono font-bold text-slate-800 dark:text-dm-text">
                                            <span className="bg-slate-100 dark:bg-gray-800 text-[#00796B] px-2.5 py-1 rounded-lg text-[11px] font-black border border-slate-200 dark:border-gray-700">
                                                {item.noticeRef}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-extrabold text-slate-900 dark:text-dm-text text-xs">{item.tenantName}</div>
                                            <div className="text-[10px] text-slate-400 font-bold mt-0.5">
                                                مدني: {item.civilId} | {item.propertyName} - {item.unitNumber}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-slate-800 dark:text-gray-200 text-xs">{item.noticeType}</div>
                                            {item.overdueAmount > 0 ? (
                                                <span className="text-[11px] font-black text-rose-600 bg-rose-50 dark:bg-rose-950/30 px-2 py-0.5 rounded inline-block mt-0.5 border border-rose-100 dark:border-rose-900">
                                                    المبلغ: {item.overdueAmount.toLocaleString()} د.ك
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-bold text-slate-400">إخطار إداري / عدم تجديد</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center font-mono text-[11px] text-slate-500 font-bold">
                                            {item.dispatchDate}
                                        </td>
                                        <td className="p-4 text-center">
                                            {item.deliveryStatus === 'E_SIGNED' && (
                                                <div className="space-y-1">
                                                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 px-3 py-1 rounded-full text-[10px] font-black">
                                                        <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-600" /> تم التوقيع الهوياتي (PACI Auth)
                                                    </span>
                                                    <p className="text-[9px] font-mono text-slate-400">{item.readTimestamp}</p>
                                                </div>
                                            )}
                                            {item.deliveryStatus === 'READ_VIEWED' && (
                                                <div className="space-y-1">
                                                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 px-3 py-1 rounded-full text-[10px] font-black">
                                                        <EyeIcon className="w-3.5 h-3.5 text-blue-600" /> تم الفتح والتصفح (Read & Viewed)
                                                    </span>
                                                    <p className="text-[9px] font-mono text-slate-400">{item.readTimestamp}</p>
                                                </div>
                                            )}
                                            {item.deliveryStatus === 'DELIVERED' && (
                                                <div className="space-y-1">
                                                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 px-3 py-1 rounded-full text-[10px] font-black">
                                                        <CheckIcon className="w-3.5 h-3.5 text-amber-600" /> تم التسليم للمستقبل (Delivered)
                                                    </span>
                                                    <p className="text-[9px] font-mono text-slate-400">{item.deliveryTimestamp}</p>
                                                </div>
                                            )}
                                            {item.deliveryStatus === 'FAILED' && (
                                                <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 px-3 py-1 rounded-full text-[10px] font-black">
                                                    <XCircleIcon className="w-3.5 h-3.5 text-rose-600" /> مرتجع / متعذر التسليم
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            <Button
                                                onClick={() => {
                                                    setSelectedWarningForPdf(item);
                                                    setIsPdfNoticeModalOpen(true);
                                                }}
                                                size="sm"
                                                className="bg-[#00796B]/10 hover:bg-[#00796B]/20 text-[#00796B] border border-[#00796B]/30 rounded-xl font-black px-3 py-1.5 transition-colors"
                                            >
                                                معاينة PDF الموثقة 📄
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-16 text-right font-sans" dir="rtl">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-dm-card p-6 rounded-3xl border border-slate-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3.5 bg-[#00796B]/10 rounded-2xl text-[#00796B] shrink-0">
                        <BellAlertIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-dm-text">مركز الإشعارات والتنبيهات الموحد</h1>
                        <p className="text-slate-400 font-bold text-xs mt-1">
                            مراقبة التحديثات الحية، إدارة قنوات التواصل، وضبط قواعد التذكير والإنذار الآلي
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                    <Button 
                        variant="outline" 
                        onClick={refreshData} 
                        leftIcon={<ArrowPathIcon className="w-4 h-4 text-[#00796B]"/>} 
                        className="rounded-xl border-slate-200 text-xs font-bold"
                    >
                        تحديث متزامن
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={() => setIsCreateModalOpen(true)}
                        leftIcon={<PaperAirplaneIcon className="w-4 h-4"/>} 
                        className="bg-[#00796B] hover:bg-[#004D40] text-white rounded-xl font-black text-xs shadow-sm"
                    >
                        إرسال تنبيه مخصص
                    </Button>
                </div>
            </div>

            {/* KPI Stat Cards Bar */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <button 
                    onClick={() => { setActiveTab('feed'); setReadFilter('all'); }}
                    className={`p-4 rounded-2xl border text-right transition-all cursor-pointer ${
                        activeTab === 'feed' && readFilter === 'all'
                            ? 'bg-[#00796B]/10 border-[#00796B] ring-2 ring-[#00796B]/20'
                            : 'bg-white dark:bg-dm-card border-slate-100 dark:border-gray-800 hover:border-slate-200'
                    }`}
                >
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase">إجمالي الإشعارات</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-dm-text mt-1">{stats.total}</p>
                </button>

                <button 
                    onClick={() => { setActiveTab('feed'); setReadFilter('unread'); }}
                    className={`p-4 rounded-2xl border text-right transition-all cursor-pointer ${
                        activeTab === 'feed' && readFilter === 'unread'
                            ? 'bg-[#00796B]/10 border-[#00796B] ring-2 ring-[#00796B]/20'
                            : 'bg-white dark:bg-dm-card border-slate-100 dark:border-gray-800 hover:border-slate-200'
                    }`}
                >
                    <p className="text-[10px] font-extrabold text-[#00796B] uppercase">غير مقروءة</p>
                    <p className="text-2xl font-black text-[#00796B] mt-1">{stats.unread}</p>
                </button>

                <button 
                    onClick={() => setActiveTab('logs')}
                    className={`p-4 rounded-2xl border text-right transition-all cursor-pointer ${
                        activeTab === 'logs'
                            ? 'bg-[#00796B]/10 border-[#00796B] ring-2 ring-[#00796B]/20'
                            : 'bg-white dark:bg-dm-card border-slate-100 dark:border-gray-800 hover:border-slate-200'
                    }`}
                >
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase">سجلات التدقيق</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-dm-text mt-1">{stats.logsSent}</p>
                </button>

                <button 
                    onClick={() => setActiveTab('timing')}
                    className={`p-4 rounded-2xl border text-right transition-all cursor-pointer ${
                        activeTab === 'timing'
                            ? 'bg-[#00796B]/10 border-[#00796B] ring-2 ring-[#00796B]/20'
                            : 'bg-white dark:bg-dm-card border-slate-100 dark:border-gray-800 hover:border-slate-200'
                    }`}
                >
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase">مواقيت التنبيه المفعلة</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-dm-text mt-1">{stats.activeOffsets}</p>
                </button>

                <button 
                    onClick={() => setActiveTab('settings')}
                    className={`p-4 rounded-2xl border text-right transition-all cursor-pointer col-span-2 md:col-span-1 ${
                        activeTab === 'settings'
                            ? 'bg-[#00796B]/10 border-[#00796B] ring-2 ring-[#00796B]/20'
                            : 'bg-white dark:bg-dm-card border-slate-100 dark:border-gray-800 hover:border-slate-200'
                    }`}
                >
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase">وضع الهدوء</p>
                    <p className="text-xs font-black text-slate-800 dark:text-dm-text mt-2">
                        {settingsState.quietHours?.enabled ? `نشط (${settingsState.quietHours.start} - ${settingsState.quietHours.end})` : 'معطل'}
                    </p>
                </button>
            </div>

            {/* Navigation Tabs Bar */}
            <div className="bg-slate-100 dark:bg-dm-card p-1.5 rounded-2xl flex flex-wrap gap-1 border border-slate-200/60 dark:border-gray-800">
                {[
                    { id: 'feed', label: 'صندوق الإشعارات المباشر', icon: <BellAlertIcon className="w-4 h-4"/> },
                    { id: 'warnings', label: 'أرشيف مراسلات الإنذار والإخطارات 📄', icon: <ShieldCheckIcon className="w-4 h-4 text-[#00796B]"/> },
                    { id: 'settings', label: 'قنوات وضوابط الإشعارات', icon: <AdjustmentsHorizontalIcon className="w-4 h-4"/> },
                    { id: 'timing', label: 'مواقيت الإنذار والتذكير', icon: <ClockIcon className="w-4 h-4"/> },
                    { id: 'logs', label: 'سجل التدقيق والتتبع', icon: <CalendarDaysIcon className="w-4 h-4"/> },
                    { id: 'diagnostic', label: 'معمل المزامنة والمحاكاة', icon: <SparklesIcon className="w-4 h-4 text-[#00796B]"/> }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                            activeTab === tab.id 
                                ? 'bg-white dark:bg-dm-background text-[#00796B] shadow-sm font-black' 
                                : 'text-slate-500 hover:text-slate-800 dark:hover:text-gray-200'
                        }`}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Active Tab View */}
            <div className="min-h-[450px]">
                {activeTab === 'feed' && renderFeedTab()}
                {activeTab === 'warnings' && renderWarningsArchiveTab()}
                {activeTab === 'settings' && renderSettingsTab()}
                {activeTab === 'timing' && renderTimingTab()}
                {activeTab === 'logs' && renderLogsTab()}
                {activeTab === 'diagnostic' && renderDiagnosticTab()}
            </div>

            {/* Modal 1: Custom Alert Compose */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="إرسال تنبيه / إشعار مخصص"
                size="md"
            >
                <form onSubmit={handleCreateCustomNotification} className="space-y-4 font-sans text-right">
                    <Input 
                        label="عنوان الإشعار (*)" 
                        placeholder="مثال: تنبيه هام بشأن اجتماع دائرة المحكمة الكلية" 
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        required
                    />

                    <div>
                        <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">مضمون الإشعار (*)</label>
                        <textarea 
                            rows={3}
                            placeholder="اكتب تفاصيل الإشعار بوضوح..."
                            value={customMessage}
                            onChange={(e) => setCustomMessage(e.target.value)}
                            className="w-full p-2.5 bg-white dark:bg-dm-background border border-slate-200 dark:border-gray-800 rounded-xl text-xs font-bold text-right focus:outline-none focus:ring-1 focus:ring-[#00796B]"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">تصنيف الإشعار</label>
                            <select 
                                value={customCategory} 
                                onChange={(e) => setCustomCategory(e.target.value as any)}
                                className="w-full p-2.5 bg-white dark:bg-dm-background border border-slate-200 dark:border-gray-800 rounded-xl text-xs font-bold text-right"
                            >
                                <option value="REMINDER">تذكير</option>
                                <option value="IMPORTANT">هام</option>
                                <option value="URGENT">عاجل جداً</option>
                                <option value="INFORMATIONAL">إعلامي</option>
                                <option value="ADMINISTRATIVE">إداري</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">درجة الأولوية</label>
                            <select 
                                value={customPriority} 
                                onChange={(e) => setCustomPriority(e.target.value as any)}
                                className="w-full p-2.5 bg-white dark:bg-dm-background border border-slate-200 dark:border-gray-800 rounded-xl text-xs font-bold text-right"
                            >
                                <option value="URGENT">عاجل جداً</option>
                                <option value="HIGH">عالي</option>
                                <option value="NORMAL">عادي</option>
                                <option value="LOW">منخفض</option>
                            </select>
                        </div>
                    </div>

                    <Input 
                        label="المستلم / الجهة المستهدفة" 
                        value={customRecipient} 
                        onChange={(e) => setCustomRecipient(e.target.value)}
                        placeholder="مثال: المستشارون، الموكلين..."
                    />

                    <div className="flex justify-end gap-2 pt-3 border-t">
                        <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)} className="rounded-xl text-xs">
                            إلغاء
                        </Button>
                        <Button type="submit" className="bg-[#00796B] hover:bg-[#004D40] text-white rounded-xl font-black text-xs">
                            نشر وإرسال الإشعار
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal 2: Notification Detail Viewer */}
            <Modal
                isOpen={!!selectedNotificationModal}
                onClose={() => setSelectedNotificationModal(null)}
                title="تفاصيل الإشعار المقتفى"
                size="md"
            >
                {selectedNotificationModal && (
                    <div className="space-y-4 font-sans text-right">
                        <div className="bg-slate-50 dark:bg-dm-background p-4 rounded-2xl border border-slate-200/80 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="font-mono text-[11px] text-slate-400 font-bold">{selectedNotificationModal.id}</span>
                                {getPriorityBadge(selectedNotificationModal.priority)}
                            </div>
                            <h3 className="font-black text-slate-900 dark:text-dm-text text-base">{selectedNotificationModal.title}</h3>
                            <p className="text-xs text-slate-700 dark:text-gray-300 font-medium leading-relaxed">
                                {selectedNotificationModal.message}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs font-bold text-slate-600">
                            <div className="p-3 bg-white dark:bg-dm-card border border-slate-100 rounded-xl">
                                <span className="text-slate-400 text-[10px] block">التصنيف العربي:</span>
                                <span>{selectedNotificationModal.categoryArabic || 'عام'}</span>
                            </div>
                            <div className="p-3 bg-white dark:bg-dm-card border border-slate-100 rounded-xl">
                                <span className="text-slate-400 text-[10px] block">تاريخ الإنشاء:</span>
                                <span>{new Date(selectedNotificationModal.timestamp).toLocaleString('ar-EG')}</span>
                            </div>
                            <div className="p-3 bg-white dark:bg-dm-card border border-slate-100 rounded-xl">
                                <span className="text-slate-400 text-[10px] block">المصدر:</span>
                                <span>{selectedNotificationModal.source || 'النظام'}</span>
                            </div>
                            <div className="p-3 bg-white dark:bg-dm-card border border-slate-100 rounded-xl">
                                <span className="text-slate-400 text-[10px] block">حالة القراءة:</span>
                                <span className={selectedNotificationModal.isRead ? 'text-emerald-600' : 'text-amber-600'}>
                                    {selectedNotificationModal.isRead ? 'مقروء ✅' : 'غير مقروء 🔴'}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => {
                                    notificationService.deleteNotification(selectedNotificationModal.id);
                                    setSelectedNotificationModal(null);
                                }}
                                className="rounded-xl text-xs text-rose-600 border-rose-200"
                            >
                                حذف الإشعار
                            </Button>
                            <Button 
                                type="button" 
                                className="bg-[#00796B] hover:bg-[#004D40] text-white rounded-xl font-black text-xs"
                                onClick={() => {
                                    notificationService.markAsRead(selectedNotificationModal.id);
                                    setSelectedNotificationModal(null);
                                }}
                            >
                                إغلاق
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal: PDF Printable Warning Letter & Receipt Proof */}
            <Modal
                isOpen={isPdfNoticeModalOpen}
                onClose={() => setIsPdfNoticeModalOpen(false)}
                title="نسخة PDF الموثقة - إشعار وتكليف بالوفاء"
                size="lg"
            >
                {selectedWarningForPdf && (
                    <div className="space-y-6 font-sans text-right p-2" id="printable-warning-document">
                        {/* Printable Letterhead Header */}
                        <div className="p-6 bg-slate-50 dark:bg-dm-card rounded-3xl border border-slate-200 dark:border-gray-800 space-y-4">
                            <div className="flex justify-between items-start border-b pb-4 border-slate-200 dark:border-gray-700">
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 dark:text-dm-text">مكتب المحامي صبري شطا</h2>
                                    <p className="text-xs font-bold text-[#00796B]">للمحاماة والاستشارات القانونية والتحكيم - دولة الكويت</p>
                                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">مرجع الإشعار: {selectedWarningForPdf.noticeRef}</p>
                                </div>
                                <div className="text-left font-mono text-xs font-bold text-slate-600 dark:text-gray-300">
                                    <div>تاريخ الإصدار: {selectedWarningForPdf.dispatchDate}</div>
                                    <div className="text-[#00796B] font-black text-[11px] mt-1">نظام عدالة القانوني - قسم الإخطارات</div>
                                </div>
                            </div>

                            {/* Tenant & Property Details Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-white dark:bg-dm-background p-4 rounded-2xl border border-slate-100 dark:border-gray-800">
                                <div>
                                    <span className="text-[10px] text-slate-400 font-bold block">المستأجر / الموجه إليه:</span>
                                    <span className="font-extrabold text-slate-900 dark:text-dm-text">{selectedWarningForPdf.tenantName}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-400 font-bold block">الرقم المدني:</span>
                                    <span className="font-mono font-bold text-slate-800 dark:text-gray-200">{selectedWarningForPdf.civilId}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-400 font-bold block">العقار والوحدة:</span>
                                    <span className="font-bold text-slate-800 dark:text-gray-200">{selectedWarningForPdf.propertyName} ({selectedWarningForPdf.unitNumber})</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-400 font-bold block">رقم الآلي (PACI):</span>
                                    <span className="font-mono font-bold text-slate-800 dark:text-gray-200">{selectedWarningForPdf.paciNumber}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-400 font-bold block">نوع الإنذار:</span>
                                    <span className="font-bold text-[#00796B]">{selectedWarningForPdf.noticeType}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-400 font-bold block">المبلغ المتأخر المطالب به:</span>
                                    <span className="font-black text-rose-600 text-sm">{selectedWarningForPdf.overdueAmount.toLocaleString()} د.ك</span>
                                </div>
                            </div>

                            {/* Warning Body Text */}
                            <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-2xl">
                                <h4 className="font-black text-amber-900 dark:text-amber-300 text-xs mb-2">نص التكليف بالوفاء والإنذار القانوني:</h4>
                                <p className="text-xs leading-relaxed font-bold text-slate-800 dark:text-gray-200">
                                    "{selectedWarningForPdf.legalText}"
                                </p>
                            </div>

                            {/* Delivery & Electronic Audit Trail Proof */}
                            <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-2xl space-y-2">
                                <div className="flex items-center justify-between text-xs font-black text-emerald-900 dark:text-emerald-300">
                                    <span className="flex items-center gap-1.5">
                                        <ShieldCheckIcon className="w-4 h-4 text-emerald-600" />
                                        سجل التتبع وتأكيد الاستلام الإلكتروني (Court Delivery Certificate):
                                    </span>
                                    <span className="bg-emerald-600 text-white text-[10px] px-2.5 py-0.5 rounded-full">موثق قضاءً</span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-bold text-slate-700 dark:text-gray-300 pt-1">
                                    <div>حالة التصفح: <span className="font-black text-emerald-700">{selectedWarningForPdf.deliveryStatus}</span></div>
                                    <div>توقيت التسليم: <span className="font-mono text-slate-900 dark:text-dm-text">{selectedWarningForPdf.deliveryTimestamp || '2026-07-05 09:32'}</span></div>
                                    <div>عنوان البريد/IP: <span className="font-mono text-slate-900 dark:text-dm-text">{selectedWarningForPdf.ipAddress || '188.236.192.44'}</span></div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-between items-center pt-2">
                            <Button 
                                variant="outline" 
                                onClick={() => setIsPdfNoticeModalOpen(false)}
                                className="rounded-xl text-xs font-bold"
                            >
                                إغلاق
                            </Button>
                            <div className="flex gap-2">
                                <Button 
                                    onClick={() => {
                                        window.print();
                                        addToast({ type: 'success', title: 'طباعة الإشعار', message: 'تم إرسال النسخة للطباعة الرسمية.' });
                                    }}
                                    className="bg-[#00796B] hover:bg-[#004D40] text-white rounded-xl font-black text-xs px-5"
                                >
                                    طباعة / حفظ PDF 🖨️
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal: Create & Issue New Warning Notice */}
            <Modal
                isOpen={isCreateWarningModalOpen}
                onClose={() => setIsCreateWarningModalOpen(false)}
                title="إصدار إنذار وتكليف بالوفاء جديد للمستأجر"
                size="md"
            >
                <form 
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (!newWarningForm.tenantName || !newWarningForm.civilId) {
                            addToast({ type: 'warning', title: 'بيانات ناقصة', message: 'يرجى إدخال اسم المستأجر والرقم المدني.' });
                            return;
                        }
                        const newRec: WarningCorrespondenceRecord = {
                            id: `WARN-2026-00${warningCorrespondences.length + 1}`,
                            noticeRef: `INF-${Math.floor(88400 + Math.random() * 900)}/2026`,
                            tenantName: newWarningForm.tenantName,
                            civilId: newWarningForm.civilId,
                            phoneNumber: newWarningForm.phoneNumber || '+965 9000 0000',
                            propertyName: newWarningForm.propertyName,
                            unitNumber: newWarningForm.unitNumber,
                            paciNumber: '29810100' + Math.floor(1000 + Math.random() * 8000),
                            noticeType: newWarningForm.noticeType,
                            dispatchDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
                            overdueAmount: Number(newWarningForm.overdueAmount) || 0,
                            deliveryStatus: 'DELIVERED',
                            deliveryTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
                            legalText: newWarningForm.legalText || 'تكليف بالوفاء بالمبالغ والمتأخرات القانونية المستحقة.'
                        };
                        setWarningCorrespondences(prev => [newRec, ...prev]);
                        setIsCreateWarningModalOpen(false);
                        addToast({ type: 'success', title: 'تم الإصدار الأرشيفي', message: 'تم إصدار الإنذار وحفظ نسخة PDF بالأرشيف.' });
                    }} 
                    className="space-y-4 font-sans text-right"
                >
                    <Input 
                        label="اسم المستأجر الثلاثي / الشركة" 
                        value={newWarningForm.tenantName} 
                        onChange={(e) => setNewWarningForm({ ...newWarningForm, tenantName: e.target.value })} 
                        placeholder="أدخل اسم المستأجر كما بالعقد..." 
                        required 
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <Input 
                            label="الرقم المدني" 
                            value={newWarningForm.civilId} 
                            onChange={(e) => setNewWarningForm({ ...newWarningForm, civilId: e.target.value })} 
                            placeholder="12 رقم مدني..." 
                            required 
                        />
                        <Input 
                            label="رقم الهاتف للتتبع" 
                            value={newWarningForm.phoneNumber} 
                            onChange={(e) => setNewWarningForm({ ...newWarningForm, phoneNumber: e.target.value })} 
                            placeholder="+965 ..." 
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Input 
                            label="اسم العقار" 
                            value={newWarningForm.propertyName} 
                            onChange={(e) => setNewWarningForm({ ...newWarningForm, propertyName: e.target.value })} 
                        />
                        <Input 
                            label="رقم الوحدة/الشقة" 
                            value={newWarningForm.unitNumber} 
                            onChange={(e) => setNewWarningForm({ ...newWarningForm, unitNumber: e.target.value })} 
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Select 
                            label="نوع الإنذار القانوني" 
                            value={newWarningForm.noticeType} 
                            onChange={(e) => setNewWarningForm({ ...newWarningForm, noticeType: e.target.value })} 
                            options={[
                                { value: 'إنذار تكليف بالوفاء (المادة 20 قانون الإيجارات)', label: 'إنذار تكليف بالوفاء (المادة 20 قانون الإيجارات)' },
                                { value: 'إخطار بعدم تجديد عقد الإيجار', label: 'إخطار بعدم تجديد عقد الإيجار' },
                                { value: 'إنذار بإزالة المخالفة وتعديل الاستغلال', label: 'إنذار بإزالة المخالفة وتعديل الاستغلال' }
                            ]}
                        />
                        <Input 
                            label="المبلغ المتأخر المستحق (د.ك)" 
                            type="number"
                            value={newWarningForm.overdueAmount} 
                            onChange={(e) => setNewWarningForm({ ...newWarningForm, overdueAmount: e.target.value })} 
                            placeholder="0.000" 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-dm-text mb-1">مضمون الإنذار القانوني والملاحظات</label>
                        <textarea 
                            rows={3} 
                            value={newWarningForm.legalText} 
                            onChange={(e) => setNewWarningForm({ ...newWarningForm, legalText: e.target.value })}
                            placeholder="يكتب هنا نص الإنذار والتكليف بالوفاء..."
                            className="w-full p-3 bg-slate-50 dark:bg-dm-background rounded-xl border border-slate-200 dark:border-gray-800 text-xs font-bold text-right focus:outline-none focus:ring-1 focus:ring-[#00796B]"
                        />
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t">
                        <Button type="button" variant="outline" onClick={() => setIsCreateWarningModalOpen(false)} className="rounded-xl text-xs font-bold">
                            إلغاء
                        </Button>
                        <Button type="submit" className="bg-[#00796B] hover:bg-[#004D40] text-white rounded-xl font-black text-xs px-5">
                            حفظ وحفظ نسخة PDF بالأرشيف 💾
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default NotificationsManagementPage;
