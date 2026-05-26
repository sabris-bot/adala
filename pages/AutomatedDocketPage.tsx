import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    format, 
    startOfMonth, 
    endOfMonth, 
    startOfWeek, 
    endOfWeek, 
    eachDayOfInterval, 
    isSameMonth, 
    isSameDay, 
} from 'date-fns';
import { ar } from 'date-fns/locale';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select'; 
import TextArea from '../components/ui/TextArea'; 
import Modal from '../components/ui/Modal'; 
import { Hearing, Case, ExpertField, ExpertActionStatus, CourtLevel, AdminTask } from '../types';
import { useCaseTask } from '../components/CaseTaskContext';
import { initialCases } from '../data/caseData';
import { 
    ListBulletIcon, 
    CalendarDaysIcon, 
    PrinterIcon, 
    MagnifyingGlassIcon,
    ArrowPathIcon,
    DocumentDuplicateIcon, 
    EyeIcon, 
    PencilIcon, 
    BriefcaseIcon,
    PlusCircleIcon, 
    UserGroupIcon, 
    ClockIcon,
    CalculatorIcon,
    ScaleIcon,
    GavelIcon,
    InformationCircleIcon,
    HomeIcon,
    BuildingLibraryIcon,
    UsersIcon,
    ExclamationTriangleIcon,
    ArrowDownTrayIcon,
    ShareIcon,
    TrashIcon,
    ShieldCheckIcon
} from '../constants';
import Button from '../components/ui/Button';
import { Badge, ExpertActionStatusBadge } from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';

// --- TYPES & STRUCTURES ---
type ViewMode = 'day' | 'week' | 'month' | 'timeline';
type TabType = 'roll' | 'experts' | 'deadlines' | 'audit_rbac';

interface Appointment {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    category: string;
    description?: string;
    attendees?: string;
    status: 'Scheduled' | 'Completed' | 'Cancelled';
}

interface ScheduleEvent {
    id: string;
    type: 'Hearing' | 'Appointment';
    date: string;
    time: string;
    title: string;
    subtitle?: string; 
    location: string;
    status: string;
    notes?: string;
    rawSource: Hearing | Appointment;
    court?: string;
    circuit?: string;
    lawyer?: string;
    client?: string;
    opponents?: string;
    lastAction?: string;
    nextAction?: string;
    progress?: number;
    caseType?: string;
}

interface AuditLog {
    id: string;
    timestamp: string;
    user: string;
    role: string;
    action: string;
    ip: string;
}

// Roll Categories Data (The 25 Roll Types)
const ROLL_CATEGORIES = [
    { id: 'all', name: 'الكل / الرول الموحد', group: 'زمني', color: 'bg-slate-500' },
    { id: 'daily', name: 'الرول اليومي', group: 'زمني', color: 'bg-amber-600' },
    { id: 'weekly', name: 'الرول الأسبوعي', group: 'زمني', color: 'bg-amber-600' },
    { id: 'monthly', name: 'الرول الشهري', group: 'زمني', color: 'bg-amber-600' },
    { id: 'yearly', name: 'الرول السنوي', group: 'زمني', color: 'bg-amber-600' },
    { id: 'court', name: 'حسب المحكمة', group: 'قضائي', color: 'bg-teal-600' },
    { id: 'circuit', name: 'حسب الدائرة القضائية', group: 'قضائي', color: 'bg-teal-600' },
    { id: 'lawyer', name: 'حسب المحامي المسؤول', group: 'قضائي', color: 'bg-indigo-600' },
    { id: 'client', name: 'حسب الموكل', group: 'قضائي', color: 'bg-indigo-600' },
    { id: 'casetype', name: 'حسب نوع القضية', group: 'قضائي', color: 'bg-teal-600' },
    { id: 'execution', name: 'رول التنفيذ والجبر', group: 'نوعي', color: 'bg-rose-600' },
    { id: 'appeal', name: 'رول الاستئناف العالي', group: 'نوعي', color: 'bg-rose-600' },
    { id: 'cassation', name: 'رول التمييز العليا', group: 'نوعي', color: 'bg-rose-600' },
    { id: 'commercial', name: 'رول القضايا التجارية', group: 'نوعي', color: 'bg-emerald-600' },
    { id: 'labor', name: 'رول القضايا العمالية', group: 'نوعي', color: 'bg-emerald-600' },
    { id: 'civil', name: 'رول القضايا المدنية الكلية', group: 'نوعي', color: 'bg-emerald-600' },
    { id: 'criminal', name: 'رول القضايا الجنائية', group: 'نوعي', color: 'bg-rose-700' },
    { id: 'personal', name: 'رول قضايا الأحوال الشخصية', group: 'نوعي', color: 'bg-pink-600' },
    { id: 'upcoming', name: 'الجلسات المقبلة والأجندة', group: 'حالة', color: 'bg-sky-600' },
    { id: 'postponed', name: 'الجلسات المؤجلة تقنياً', group: 'حالة', color: 'bg-sky-600' },
    { id: 'completed', name: 'الجلسات المنتهية ومحاضرها', group: 'حالة', color: 'bg-sky-600' },
    { id: 'tasks', name: 'رول المهام القانونية الإلزامية', group: 'إداري', color: 'bg-purple-600' },
    { id: 'admin_appointments', name: 'المواعيد الإدارية والمقابلات', group: 'إداري', color: 'bg-purple-600' },
    { id: 'gov_followups', name: 'المتابعات الحكومية ومجمع الوزارات', group: 'إداري', color: 'bg-purple-600' },
    { id: 'announcements', name: 'الإعلانات والتبليغات القانونية', group: 'إداري', color: 'bg-red-600' },
    { id: 'internal', name: 'المتابعات ومحاضر الاجتماعات الداخلية', group: 'إداري', color: 'bg-purple-600' }
];

const PRESETS_FILTERS = [
    { id: 'none', name: '--- لا يوجد فلتر محفوظ ---' },
    { id: 'capital_today', name: 'جلسات قصر العدل العاصمة اليوم' },
    { id: 'labor_shata', name: 'القضايا العمالية - المستشار صبري شطا' },
    { id: 'urgent_execution', name: 'مواعيد التنفيذ العاجلة والتسوية' }
];

const ROLES_LIST = [
    { id: 'Partner', name: 'محامي شريك (Partner - صلاحيات كاملة)', level: 'تضم كامل الصلاحيات لغرفة الإدارة مع تعديل الرول والقواعد والموظفين والاطلاع على الأرشيف والتقارير المالية.' },
    { id: 'Senior', name: 'محامي أول / مستشار (Senior - تعديل واستعراض)', level: 'صلاحية تعديل الإجراءات والطلبات ومواعيد الجلسات وكتابة المذكرات، دون تغيير هيكلية المحسوبيات والتقارير الحساسة.' },
    { id: 'Associate', name: 'محامي مجدول / منفذ إجرائي (Associate - تعديل جزئي)', level: 'صلاحية استعراض وتحديث حالة الحضور في الرول، دون الحق في إضافة عناصر المواعيد الاستراتيجية للشركاء.' },
    { id: 'Clerk', name: 'مساعد إداري / معقب قضائي (Junior Clerk - إدخال فقط)', level: 'حق تدوين وقائع الجلسة ونسب الإنجاز لإجراءات التنفيذ المباشر.' }
];

export const generateMockHearings = (): Hearing[] => {
    const today = new Date();
    const hearings: Hearing[] = [];
    const casesSource = [...initialCases, ...initialCases, ...initialCases];

    casesSource.forEach((caseItem, index) => {
        const offset = Math.floor((index - casesSource.length / 2) * 2);
        const hearingDate = new Date(today);
        hearingDate.setDate(today.getDate() + offset);
        
        if (hearingDate.getDay() === 5) hearingDate.setDate(hearingDate.getDate() + 2);
        if (hearingDate.getDay() === 6) hearingDate.setDate(hearingDate.getDate() + 1);

        const hour = 9 + (index % 4);
        const minute = (index * 15) % 60;
        const hearingTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        const hearingDateTime = new Date(hearingDate);
        hearingDateTime.setHours(hour, minute);

        let status: Hearing['status'] = 'Scheduled';
        if (hearingDateTime < new Date()) {
            status = index % 5 === 0 ? 'Postponed' : (index % 7 === 0 ? 'Cancelled' : 'Completed');
        }

        hearings.push({
            id: `h-docket-${index}`,
            caseId: caseItem.id,
            caseTitle: caseItem.title,
            clientName: caseItem.clientName,
            date: hearingDate.toISOString().split('T')[0],
            time: hearingTime,
            courtRoomOrLocation: caseItem.courtName || `${caseItem.courtLevel} - قاعة ${9 + index}`,
            type: index % 3 === 0 ? 'جلسة مرافعة كتابية غيابية' : (index % 3 === 1 ? 'تقديم مستندات ودفاع صائب' : 'النطق بالحكم القطعي والمصاريف'),
            status: status,
            notes: status === 'Postponed' ? 'تأجلت لقصور مستندات الخصم إدارياً.' : (status === 'Completed' ? 'تم الحضور والمطالبة برفض الدعوى.' : 'مدرجة بجدول الرول القضائي.'),
            attendedBy: status === 'Completed' ? [caseItem.assignedLawyer] : [],
        });
    });

    const now = new Date();
    
    // Test Alerts
    const tomorrowTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    hearings.push({
        id: `h-notify-24h-static`, 
        caseId: '1',
        caseTitle: 'جلسة عاجلة لشركة الأمل العقارية لتفادي السقوط',
        clientName: 'ناصر فهد العتيبي',
        date: tomorrowTime.toISOString().split('T')[0],
        time: '09:00',
        courtRoomOrLocation: 'قصر العدل قاعة 14',
        type: 'جلسة تنبيه حاسم',
        status: 'Scheduled',
        notes: 'هذه الجلسة تبدأ غداً صباحاً لتقديم شهادة وزارة العدل.',
    });

    return hearings.sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
};

const mockInitialAppointments: Appointment[] = [
    { id: 'apt-1', title: 'اجتماع مع الموكل (شركة الأمل التصفوية)', date: new Date().toISOString().split('T')[0], time: '11:00', location: 'المكتب الرئيسي - قاعة الاجتماعات الكبرى', category: 'اجتماع موكل', description: 'مناقشة الدفوع قبل المرافعة', status: 'Scheduled', attendees: 'أحمد محمود, ممثل الشركة' },
    { id: 'apt-2', title: 'زيارة لوزارة العدل - مجمع محاكم الرقعي', date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0], time: '09:00', location: 'إدارة كتاب محكمة التوثيق والتمييز', category: 'إجراء قلم كتاب', description: 'سحب وطلب صورة رسمية من شيكات الإعسار', status: 'Scheduled', attendees: 'أ. صبري شطا' },
];

const initialAuditLogs: AuditLog[] = [
    { id: 'log-1', timestamp: '2026-05-26 08:15:22', user: 'المستشار صبري شطا', role: 'محامي أول', action: 'استعراض وطباعة جدول كلي بالدائرة السادسة تجاري', ip: '192.168.1.42' },
    { id: 'log-2', timestamp: '2026-05-26 08:10:05', user: 'أحمد مبارك الأنصاري', role: 'محامي شريك', action: 'تغيير حالة جلسة قضية التعويضات رقم 988221054 إلى مكتملة', ip: '192.168.1.10' },
    { id: 'log-3', timestamp: '2026-05-26 07:55:00', user: 'مريم العتيبي', role: 'محامي أول', action: 'تعديل موعد اجتماع موكل مجموعة الأنوار في التقويم', ip: '192.168.1.45' },
    { id: 'log-4', timestamp: '2026-05-26 07:44:11', user: 'سالم أحمد', role: 'معقب قضائي', action: 'إضافة مهمة إرسال إعلانات مجمع محاكم الفروانية بالرقم الآلي', ip: '192.168.1.92' }
];

const AutomatedDocketPage: React.FC = () => {
    const { addToast } = useToast();
    const { hearings, updateHearingStatus } = useCaseTask();
    
    // --- APP STATES ---
    const [activeTab, setActiveTab] = useState<TabType>('roll');
    const [viewMode, setViewMode] = useState<ViewMode>('timeline');
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    
    // Filters & Search
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [courtFilter, setCourtFilter] = useState<string>('all');
    const [lawyerFilter, setLawyerFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedPreset, setSelectedPreset] = useState<string>('none');
    const [sortBy, setSortBy] = useState<string>('time-asc');
    
    // Expanded Record Rows State
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    
    // Simulated Upload attachments state mapped by case/apt ID
    const [attachments, setAttachments] = useState<Record<string, {title: string, size: string, date: string, type: string}[]>>({
        'h-docket-0': [
            { title: 'صحيفة الاستئناف الموثقة الأصيلة.pdf', size: '2.4 MB', date: '2026-05-20', type: 'PDF' },
            { title: 'تقرير الخبير الحسابي المعتمد لأسواق المال.pdf', size: '4.1 MB', date: '2026-05-18', type: 'PDF' }
        ]
    });
    
    // Session Audit Trail & Current User Simulation (RBAC)
    const [currentUserRole, setCurrentUserRole] = useState<string>('Partner'); // Partner, Senior, Associate, Clerk
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);
    
    // Interactive case memorandum drafts mapped by ID
    const [memos, setMemos] = useState<Record<string, string>>({
        'h-docket-0': 'الدفع أولاً ببطلان قرار اللجنة النفطية لخرقه مادة ١١ من اللائحة.\nثانياً: المطالبة بالإحالة الفنية لتعديل المقاصة الحسابية.'
    });
    
    // Appointments & Reminders Data
    const [appointments, setAppointments] = useState<Appointment[]>(mockInitialAppointments);
    const [activeNotificationLog, setActiveNotificationLog] = useState([
        { id: 'notif-1', text: 'تنبيه عاجل: جلسة هامة لشركة الأمل تبدأ غداً صباحاً الساعة 09:00', type: 'urgent', time: 'متبقي أقل من 24 ساعة', code: 'h-notify-24h-static' },
        { id: 'notif-2', text: 'ميعاد حرج: انتهاء ميعاد سقوط استئناف مجموعة الأنوار رقم 99112992 متبقي 19 يوماً.', type: 'critical', time: 'ميعاد إجرائي للمادة 129 مرافعات' }
    ]);

    // Deadlines interactive inputs (Art 16 & 18 Kuwait Procedural Law)
    const [dlStartDate, setDlStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [dlDistance, setDlDistance] = useState<number>(0);
    const [dlCustomDays, setDlCustomDays] = useState<number>(0);
    
    // Modals
    const [isAptModalOpen, setIsAptModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [editAppointment, setEditAppointment] = useState<Appointment | null>(null);
    const [viewEvent, setViewEvent] = useState<ScheduleEvent | null>(null);
    
    // Form templates state for appointments
    const [aptForm, setAptForm] = useState<Partial<Appointment>>({ status: 'Scheduled', category: 'اجتماع موكل' });

    // Print & Report Generation Preferences
    const [reportType, setReportType] = useState<string>('official');
    const [reportSignature, setReportSignature] = useState<string>('shata');
    const [reportIncludesNotes, setReportIncludesNotes] = useState<boolean>(true);

    // --- SENSE DOCKET LOGS ---
    const addAuditLog = (action: string) => {
        const newLog: AuditLog = {
            id: `log-${Date.now()}`,
            timestamp: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            user: currentUserRole === 'Partner' ? 'أحمد مبارك الأنصاري' : currentUserRole === 'Senior' ? 'المستشار صبري شطا' : currentUserRole === 'Associate' ? 'فاطمة الكندري' : 'سالم أحمد',
            role: currentUserRole === 'Partner' ? 'محامي شريك' : currentUserRole === 'Senior' ? 'محامي أول' : currentUserRole === 'Associate' ? 'جدول أ' : 'معقب إداري',
            action,
            ip: `192.168.1.${Math.floor(Math.random() * 250) + 1}`
        };
        setAuditLogs(prev => [newLog, ...prev]);
    };

    // --- UNIFIED EVENTS BUILDER (Cases + Appointments) ---
    const allEvents: ScheduleEvent[] = useMemo(() => {
        const hearingEvents: ScheduleEvent[] = hearings.map(h => {
            const caseObj = initialCases.find(c => c.id === h.caseId) as any;
            return {
                id: h.id,
                type: 'Hearing',
                date: h.date,
                time: h.time || '09:00',
                title: caseObj ? caseObj.title : (h as any).caseTitle,
                subtitle: `الموكل: ${(h as any).clientName || caseObj?.clientName || 'غير محدد'} | الخصم: ${caseObj?.opponentName || 'غير محدد'}`,
                location: (h as any).courtRoomOrLocation || 'قصر العدل العاصمة',
                status: h.status,
                notes: h.notes,
                rawSource: h,
                court: (h as any).courtRoomOrLocation?.split(' - ')[0] || 'قصر العدل',
                circuit: caseObj?.circuit || 'الدائرة التجارية السادسة',
                lawyer: (h as any).assignedLawyer || caseObj?.assignedLawyer || 'أ. صبري أحمد شطا',
                client: (h as any).clientName || caseObj?.clientName,
                opponents: caseObj?.opponentName || 'شركة الخليج للبترولية',
                lastAction: 'تم تقديم مذكرة مكملة بأسباب الدفع العقدية.',
                nextAction: 'المطالبة بندب خبير فني لتحديد قيم الخسائر المادية والتقييم العقدي.',
                progress: h.status === 'Completed' ? 100 : h.status === 'Postponed' ? 45 : 75,
                caseType: caseObj?.title.includes('عمالي') ? 'عمالي' : caseObj?.title.includes('إيجار') ? 'إيجارات' : caseObj?.title.includes('تظلم') ? 'إداري' : 'تجاري'
            };
        });

        const aptEvents: ScheduleEvent[] = appointments.map(a => ({
            id: a.id,
            type: 'Appointment',
            date: a.date,
            time: a.time,
            title: a.title,
            subtitle: a.attendees ? `الحضور: ${a.attendees}` : 'موعد داخلي للمكتب',
            location: a.location || 'المكتب الرئيسي قاعة الاجتماعات',
            status: a.status,
            notes: a.description,
            rawSource: a,
            lawyer: 'العموم المتواجد والمنتدبين',
            client: 'شركة الأمل تصفية',
            progress: a.status === 'Completed' ? 100 : 20,
            caseType: 'إداري'
        }));

        return [...hearingEvents, ...aptEvents].sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
    }, [hearings, appointments]);

    // --- APPLY PRESET FILTERS ---
    useEffect(() => {
        if (selectedPreset === 'capital_today') {
            setSearchQuery('');
            setCourtFilter('قصر العدل');
            setStatusFilter('all');
            setLawyerFilter('all');
            addAuditLog('تفعيل فلتر محفوظ: جلسات قصر العدل العاصمة اليوم');
            addToast({ type: 'info', title: 'تم الفلترة', message: 'تطبيق فلتر قصر العدل تلقائياً.' });
        } else if (selectedPreset === 'labor_shata') {
            setSearchQuery('عمالي');
            setLawyerFilter('lawyer'); // representation
            setCourtFilter('all');
            addAuditLog('تفعيل فلتر محفوظ: قضايا عمالية للمستشار شطا');
        } else if (selectedPreset === 'urgent_execution') {
            setSelectedCategory('execution');
            setSearchQuery('');
            addAuditLog('تفعيل فلتر محفوظ: مواعيد التنفيذ العاجلة والتسوية والقرارات الهوائية');
        }
    }, [selectedPreset]);

    // --- FILTER & SORT LOGIC ---
    const filteredEvents = useMemo(() => {
        let result = allEvents;

        // 1. Text Search
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(e => 
                e.title.toLowerCase().includes(query) ||
                (e.subtitle && e.subtitle.toLowerCase().includes(query)) ||
                e.location.toLowerCase().includes(query) ||
                (e.notes && e.notes.toLowerCase().includes(query)) ||
                (e.rawSource.id.includes(query))
            );
        }

        // 2. Select Roll Type (The 25 court rolls mapping/logic)
        if (selectedCategory !== 'all') {
            if (selectedCategory === 'daily') {
                const todayStr = new Date().toISOString().split('T')[0];
                result = result.filter(e => e.date === todayStr);
            } else if (selectedCategory === 'weekly') {
                const today = new Date();
                const start = startOfWeek(today, { weekStartsOn: 0 });
                const end = endOfWeek(today, { weekStartsOn: 0 });
                result = result.filter(e => {
                    const d = new Date(e.date);
                    return d >= start && d <= end;
                });
            } else if (selectedCategory === 'monthly') {
                const monthStr = format(new Date(), 'yyyy-MM');
                result = result.filter(e => e.date.startsWith(monthStr));
            } else if (selectedCategory === 'yearly') {
                const yearStr = format(new Date(), 'yyyy');
                result = result.filter(e => e.date.startsWith(yearStr));
            } else if (selectedCategory === 'execution') {
                result = result.filter(e => e.title.includes('إخلاء') || e.title.includes('تنفيذ') || e.location.includes('تنفيذ'));
            } else if (selectedCategory === 'appeal') {
                result = result.filter(e => e.title.includes('استئناف') || e.location.includes('استئناف') || e.circuit?.includes('استئناف'));
            } else if (selectedCategory === 'cassation') {
                result = result.filter(e => e.title.includes('تمييز') || e.location.includes('تمييز'));
            } else if (selectedCategory === 'commercial') {
                result = result.filter(e => e.caseType === 'تجاري');
            } else if (selectedCategory === 'labor') {
                result = result.filter(e => e.caseType === 'عمالي');
            } else if (selectedCategory === 'civil') {
                result = result.filter(e => e.caseType === 'مدني' || e.title.includes('تعويض'));
            } else if (selectedCategory === 'criminal') {
                result = result.filter(e => e.caseType === 'جنائي' || e.title.includes('جناية') || e.title.includes('حقوق'));
            } else if (selectedCategory === 'personal') {
                result = result.filter(e => e.caseType === 'شخصي' || e.title.includes('أسرة') || e.title.includes('أحوال'));
            } else if (selectedCategory === 'upcoming') {
                const todayStr = new Date().toISOString().split('T')[0];
                result = result.filter(e => e.date >= todayStr && e.status === 'Scheduled');
            } else if (selectedCategory === 'postponed') {
                result = result.filter(e => e.status === 'Postponed' || e.status === 'مؤجلة');
            } else if (selectedCategory === 'completed') {
                result = result.filter(e => e.status === 'Completed' || e.status === 'منتهية');
            } else if (selectedCategory === 'tasks') {
                result = result.filter(e => e.type === 'Appointment' && e.title.includes('إجراء'));
            } else if (selectedCategory === 'admin_appointments') {
                result = result.filter(e => e.type === 'Appointment' && e.title.includes('اجتماع'));
            } else if (selectedCategory === 'gov_followups') {
                result = result.filter(e => e.title.includes('وزارات') || e.location.includes('مجمع'));
            } else if (selectedCategory === 'court') {
                result = result.filter(e => e.type === 'Hearing' && e.location.includes('محكمة'));
            } else if (selectedCategory === 'circuit') {
                result = result.filter(e => e.type === 'Hearing' && e.circuit !== undefined);
            } else if (selectedCategory === 'lawyer') {
                result = result.filter(e => e.lawyer !== undefined);
            } else if (selectedCategory === 'client') {
                result = result.filter(e => e.client !== undefined);
            } else if (selectedCategory === 'casetype') {
                result = result.filter(e => e.caseType !== undefined);
            } else if (selectedCategory === 'announcements') {
                result = result.filter(e => e.type === 'Appointment' && e.title.includes('إعلان'));
            } else if (selectedCategory === 'internal') {
                result = result.filter(e => e.type === 'Appointment' && e.location.includes('المكتب'));
            }
        }

        // 3. Dropdown Filters
        if (courtFilter !== 'all') {
            result = result.filter(e => e.location.includes(courtFilter));
        }
        if (lawyerFilter !== 'all') {
            result = result.filter(e => e.lawyer && e.lawyer.includes('صبري'));
        }
        if (statusFilter !== 'all') {
            result = result.filter(e => e.status === statusFilter);
        }

        // 4. View mode timing
        if (viewMode === 'day') {
            const dateStr = currentDate.toISOString().split('T')[0];
            result = result.filter(e => e.date === dateStr);
        }

        // Sort Map
        return result.sort((a, b) => {
            const timeA = new Date(`${a.date}T${a.time}`).getTime();
            const timeB = new Date(`${b.date}T${b.time}`).getTime();
            if (sortBy === 'time-asc') return timeA - timeB;
            if (sortBy === 'time-desc') return timeB - timeA;
            if (sortBy === 'progress-desc') return (b.progress || 0) - (a.progress || 0);
            return 0;
        });

    }, [allEvents, searchQuery, selectedCategory, courtFilter, lawyerFilter, statusFilter, viewMode, currentDate, sortBy]);

    // KPI Counters
    const kpis = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        return {
            totalHearings: hearings.length,
            scheduledToday: allEvents.filter(e => e.date === todayStr).length,
            totalPostponed: hearings.filter(h => h.status === 'Postponed').length,
            completedCount: hearings.filter(h => h.status === 'Completed').length,
            successRate: hearings.length ? Math.round((hearings.filter(h => h.status === 'Completed').length / hearings.length) * 100) : 0
        };
    }, [hearings, allEvents]);

    // --- EXPERT MEETINGS (Calculated) ---
    const expertMeetings = useMemo(() => {
        const meetings: any[] = [];
        initialCases.forEach(c => {
            if (c.expertActions) {
                c.expertActions.forEach(action => {
                    meetings.push({
                        ...action,
                        caseId: c.id,
                        caseTitle: c.title,
                        caseNumber: c.caseNumber,
                        clientName: c.clientName,
                        lawyer: c.assignedLawyer
                    });
                });
            }
        });
        return meetings;
    }, []);

    // --- DEADLINE RESULTS CALCULATOR ---
    const isHoliday = (date: Date): { name: string } | null => {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        
        const holidays: Record<number, {m: number, d: number, name: string}[]> = {
            2026: [
                { m: 1, d: 1, name: "رأس السنة الميلادية" },
                { m: 2, d: 25, name: "اليوم الوطني الكويتي" },
                { m: 2, d: 26, name: "يوم التحرير" }
            ]
        };

        const h = holidays[year]?.find(h => h.m === month && h.d === day);
        if (h) return { name: h.name };
        if (date.getDay() === 5) return { name: "عطلة الجمعة الأسبوعية" };
        if (date.getDay() === 6) return { name: "عطلة السبت القضائية" };
        return null;
    };

    const deadlineResults = useMemo(() => {
        if (!dlStartDate) return [];
        const procedures = [
            { label: 'استئناف حكم كلي (مدني/تجاري)', days: 30, ref: 'مادة 129 مرافعات كويتي' },
            { label: 'استئناف أحكام أمور مستعجلة وحيازة', days: 15, ref: 'مادة 129 مكرر مرافعات' },
            { label: 'تمييز حكم محكمة الاستئناف العليا', days: 60, ref: 'مادة 152 قانون مرافعات كويتي' },
            { label: 'طلب معارضة في حكم غيابي مدني', days: 8, ref: 'مادة 188 مرافعات' },
            { label: 'استئناف الحكم الجزائي الصادر من محاكمة الجنح', days: 20, ref: 'مادة 202 قانون إجراءات وجزاء' },
        ];

        return procedures.map(p => {
            let resDate = new Date(dlStartDate);
            // Day after award (Art 17)
            resDate.setDate(resDate.getDate() + 1);
            resDate.setDate(resDate.getDate() + p.days - 1);
            
            // Distance Rule (Art 16 Kuwait Civil Law: +1 day per 50 km)
            if (dlDistance > 0) {
                resDate.setDate(resDate.getDate() + Math.ceil(dlDistance / 50));
            }

            // Custom days
            if (dlCustomDays > 0) {
                resDate.setDate(resDate.getDate() + dlCustomDays);
            }

            // Holiday extension (Art 18)
            let holidayFound = isHoliday(resDate);
            while (holidayFound) {
                resDate.setDate(resDate.getDate() + 1);
                holidayFound = isHoliday(resDate);
            }

            const diff = resDate.getTime() - new Date().getTime();
            const daysRem = Math.ceil(diff / (1000 * 60 * 60 * 24));

            return {
                ...p,
                finalDate: resDate,
                daysRemaining: daysRem,
                isExpired: daysRem < 0
            };
        });
    }, [dlStartDate, dlDistance, dlCustomDays]);

    // Handle interactive appointments save
    const handleSubmitApt = (e: React.FormEvent) => {
        e.preventDefault();
        const randId = `apt-session-${Date.now()}`;
        const newApt: Appointment = {
            id: randId,
            title: aptForm.title || 'موعد إداري جديد',
            date: aptForm.date || new Date().toISOString().split('T')[0],
            time: aptForm.time || '10:00',
            location: aptForm.location || 'مجمع العاصمة',
            category: aptForm.category || 'اجتماع موكل',
            description: aptForm.description,
            attendees: aptForm.attendees,
            status: 'Scheduled'
        };
        setAppointments(prev => [newApt, ...prev]);
        setIsAptModalOpen(false);
        addAuditLog(`إضافة موعد في جدول الأعمال: ${newApt.title}`);
        addToast({ type: 'success', title: 'تمت الإضافة', message: 'تم إدراج الموعد وإرسال إشعار للمحامين.' });
    };

    // Simulated Document attachments upload handler
    const handleAddMockFile = (eventId: string, category: string) => {
        const mockFiles = [
            { title: `${category}_النسخة_المعتمدة_مسح_ضوئي.pdf`, size: '1.8 MB', date: '2026-05-26', type: 'PDF' },
            { title: 'صحيفة_الدعوى_المعلنة_سهل_الحكومية.docxs', size: '540 KB', date: '2026-05-26', type: 'Word' }
        ];
        
        setAttachments(prev => {
            const current = prev[eventId] || [];
            return {
                ...prev,
                [eventId]: [...current, mockFiles[Math.floor(Math.random() * mockFiles.length)]]
            };
        });

        addAuditLog(`رفع وحقن وثيقة أرشيف رقمي للجلسة/الموعد بقيمة الآلي للحدث #${eventId}`);
        addToast({ type: 'success', title: 'تم الرفع الرقمي', message: 'الأرشيف محدث ومحمي من الفقدان والقرصنة.' });
    };

    // Update case notes memorandum
    const handleSaveMemoText = (eventId: string, text: string) => {
        setMemos(prev => ({ ...prev, [eventId]: text }));
        addAuditLog(`صياغة وتحديث مسودة مذكرة المرافعة الدفاعية للحدث #${eventId}`);
        addToast({ type: 'success', title: 'حفظ المسودة', message: 'تمت الصيانة التلقائية والأمان الرقمي للدفوع.' });
    };

    // Download CSV
    const triggerExcelMockExport = () => {
        const headers = ['النوع', 'رقم القضية / الموعد', 'التاريخ', 'الوقت', 'العنوان والخصوم', 'الدائرة القضائية', 'الموقع والمحكمة', 'الحالة'];
        const rows = filteredEvents.map(e => [
            e.type === 'Hearing' ? 'جلسة رول قضائي' : 'موعد إداري مكثف',
            e.id,
            e.date,
            e.time,
            `"${e.title} - ${e.subtitle}"`,
            `"${e.circuit || 'المكتب الرئيسي'}"`,
            `"${e.location}"`,
            e.status
        ].join(','));

        const csvString = '\uFEFF' + [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `adl_court_roll_export_2026_${selectedCategory}.csv`;
        link.click();

        addAuditLog(`تصدير الرول المختار من الفئة [${selectedCategory}] إلى كشف Excel مالي وإداري`);
        addToast({ type: 'success', title: 'تم تصدير الكشف', message: 'تنزيل ملف Excel بنجاح.' });
    };

    return (
        <div className="space-y-6 pb-20 font-sans text-right" dir="rtl">
            
            {/* ALERT CONTROL BOX (CRITICAL EVENTS BANNER) */}
            <AnimatePresence>
                {activeNotificationLog.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-red-50 dark:bg-red-950/20 border-r-4 border-red-600 rounded-xl p-4 overflow-hidden shadow-sm"
                    >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg text-red-600">
                                    <ExclamationTriangleIcon className="w-5 h-5 animate-bounce" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-red-800 dark:text-red-300">مواعيد حرجة وجلسات معلنة تبدأ خلال الـ 24 ساعة القادمة</h4>
                                    <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">يرجى التأكد من تجهيز التوكيلات وأدلة الدفاع القضائية لتجنب السقوط ورفض الطعون.</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => {
                                        setActiveNotificationLog([]);
                                        addAuditLog('تأجيل وتجاوز تحذيرات الجلسات العاجلة');
                                    }}
                                    className="text-red-700 border-red-200 hover:bg-red-100"
                                >
                                    تجاوز التحذير مؤقتاً
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* HEADER DESIGN AREA */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:20px_20px]" />
                <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary/20 rounded-full blur-3xl" />
                
                <div className="relative flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="bg-amber-500 text-slate-900 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse flex items-center gap-1">
                                <ClockIcon className="w-3.5 h-3.5" /> بوابة منظومة العدالة الذكية
                            </span>
                            <span className="bg-slate-800/80 text-gray-300 text-[10px] px-2.5 py-1 rounded-full border border-slate-700/60">
                                نظام الرول الآلي الموحد v3
                            </span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-2">
                            نظام الرول الآلي وجدولة المحاكمات الذكية
                        </h1>
                        <p className="text-sm text-slate-300 font-bold max-w-2xl leading-relaxed">
                            إدارة متقدمة لجميع الجلسات، لجان الخبراء، والمهام الإدارية لمكاتب المحاماة في دولة الكويت مع تتبع المواعيد الإجرائية لضمان تفادي تفويت مدد الطعون والاستئناف والتمييز.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2.5 self-stretch sm:self-auto justify-end">
                        <Button 
                            onClick={() => setIsReportModalOpen(true)} 
                            variant="primary" 
                            className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-black shadow-lg shadow-amber-500/10"
                            leftIcon={<PrinterIcon className="w-5 h-5"/>}
                        >
                            مركز التقارير والطباعة القضائية
                        </Button>
                        <Button 
                            onClick={() => setIsAptModalOpen(true)} 
                            variant="secondary" 
                            className="bg-slate-800 border border-slate-700 text-white font-bold hover:bg-slate-700"
                            leftIcon={<PlusCircleIcon className="w-5 h-5" />}
                        >
                            جدولة اجتماع / إعلان جديد
                        </Button>
                    </div>
                </div>

                {/* KPI BENTO GRID */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 mt-8 relative border-t border-white/10 pt-6">
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-all">
                        <span className="text-slate-400 text-xs font-bold block mb-1">إجمالي قضايا الرول النشطة</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-amber-500">{kpis.totalHearings}</span>
                            <span className="text-[10px] text-slate-400">جلسة مسجلة</span>
                        </div>
                    </div>
                    
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-all">
                        <span className="text-slate-400 text-xs font-bold block mb-1">جلسات مجدولة اليوم</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-emerald-400">{kpis.scheduledToday}</span>
                            <span className="text-[10px] text-slate-400">أجندة معلقة</span>
                        </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-all">
                        <span className="text-slate-400 text-xs font-bold block mb-1">الجلسات المؤجلة تقنياً</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-amber-400">{kpis.totalPostponed}</span>
                            <span className="text-[10px] text-slate-400">انتظار المراجعة</span>
                        </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-all">
                        <span className="text-slate-400 text-xs font-bold block mb-1">معدل الحضور والإنجاز</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-indigo-400">{kpis.successRate}%</span>
                            <span className="text-[10px] text-slate-400">حضور قطعي</span>
                        </div>
                    </div>

                    <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-amber-500/10 to-indigo-500/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                        <span className="text-amber-400 text-xs font-black block mb-1">رول المحاماة النشط</span>
                        <div className="text-[11px] text-slate-300 leading-snug">
                            مستوي الحماية الأمنية والرقابة: <span className="font-black text-emerald-400">فعّال</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* TAB SELECTOR INTERACTIVE BAR */}
            <div className="bg-white dark:bg-dm-card p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-wrap gap-1">
                <button 
                    onClick={() => setActiveTab('roll')}
                    className={`flex items-center gap-2 px-5 py-3 text-xs font-black rounded-xl transition-all ${activeTab === 'roll' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-gray-800'}`}
                >
                    <GavelIcon className="w-4 h-4" /> الرول اليومي وجداول الجلسات والمواعيد
                </button>
                <button 
                    onClick={() => setActiveTab('experts')}
                    className={`flex items-center gap-2 px-5 py-3 text-xs font-black rounded-xl transition-all ${activeTab === 'experts' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-gray-800'}`}
                >
                    <UsersIcon className="w-4 h-4" /> جلسات الخبراء ولجان التحقيق م.ع ({expertMeetings.length})
                </button>
                <button 
                    onClick={() => setActiveTab('deadlines')}
                    className={`flex items-center gap-2 px-5 py-3 text-xs font-black rounded-xl transition-all ${activeTab === 'deadlines' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-gray-800'}`}
                >
                    <CalculatorIcon className="w-4 h-4" /> حاسبة المواعيد الإجرائية (للائحتي ١٦ و ١٨ مرافعات)
                </button>
                <button 
                    onClick={() => setActiveTab('audit_rbac')}
                    className={`flex items-center gap-2 px-5 py-3 text-xs font-black rounded-xl transition-all ${activeTab === 'audit_rbac' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-gray-800'}`}
                >
                    <ShieldCheckIcon className="w-4 h-4" /> تفعيل الرقابة وسجل التعديلات (Audit & RBAC)
                </button>
            </div>

            {/* MAIN CONTENT BLOCK */}
            <AnimatePresence mode="wait">
                
                {/* TAB 1: ADVANCED COURT ROLL */}
                {activeTab === 'roll' && (
                    <motion.div 
                        key="roll"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="space-y-6"
                    >
                        
                        {/* 25 COURT ROLL SWITCHER */}
                        <div className="bg-white dark:bg-dm-card p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                            <span className="text-gray-400 text-xs font-black block mb-3">اختر تصنيف الرول من الأقسام الـ 25 المعتمدة:</span>
                            <div className="flex flex-wrap gap-1.5 max-h-[145px] overflow-y-auto scrollbar-thin">
                                {ROLL_CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => {
                                            setSelectedCategory(cat.id);
                                            addAuditLog(`استعراض رول فئة: [${cat.name}]`);
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-tight transition-all flex items-center gap-1.5 ${
                                            selectedCategory === cat.id 
                                                ? 'bg-slate-900 text-white shadow-sm ring-2 ring-primary/20' 
                                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300'
                                        }`}
                                    >
                                        <span className={`w-1.5 h-1.5 rounded-full ${cat.color}`} />
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* FILTERS PANEL DRAWER */}
                        <div className="bg-white dark:bg-dm-card p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b pb-4">
                                <h3 className="font-black text-sm text-slate-800 dark:text-gray-200">التحكم الذكي وتصفية الرول</h3>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs text-slate-400 font-bold">الفلاتر المحفوظة مسبقاً:</span>
                                    <select
                                        value={selectedPreset}
                                        onChange={(e) => setSelectedPreset(e.target.value)}
                                        className="text-xs bg-slate-50 dark:bg-gray-800 border-none rounded-lg p-2 font-bold cursor-pointer text-slate-700 dark:text-gray-200"
                                    >
                                        {PRESETS_FILTERS.map(preset => (
                                            <option key={preset.id} value={preset.id}>{preset.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* CORE INPUT CONTROLS */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="relative">
                                    <span className="text-[10px] text-slate-400 font-bold block mb-1">البحث النصي الفوري والمحسوب</span>
                                    <div className="relative">
                                        <input 
                                            type="text"
                                            placeholder="ابحث برقم قضية، اسم موكل..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full text-xs bg-slate-50 dark:bg-gray-800 border-none rounded-xl py-3 pr-10 pl-3 font-bold"
                                        />
                                        <MagnifyingGlassIcon className="w-4 h-4 absolute right-3.5 top-3.5 text-gray-400" />
                                    </div>
                                </div>

                                <div>
                                    <span className="text-[10px] text-slate-400 font-bold block mb-1">المحكمة ومجمع الوزارات</span>
                                    <select 
                                        value={courtFilter} 
                                        onChange={(e) => setCourtFilter(e.target.value)}
                                        className="w-full text-xs bg-slate-50 dark:bg-gray-800 border-none rounded-xl py-3 font-bold text-slate-700 dark:text-gray-200"
                                    >
                                        <option value="all">كل المحاكم الكترونياً</option>
                                        <option value="قصر العدل">قصر العدل (العاصمة)</option>
                                        <option value="الرقعي">مجمع محاكم الرقعي (الفروانية)</option>
                                        <option value="حولي">مجمع محاكم حولي</option>
                                        <option value="المكتب الرئيسي">المكتب الرئيسي الداخلي</option>
                                    </select>
                                </div>

                                <div>
                                    <span className="text-[10px] text-slate-400 font-bold block mb-1">المحامي المندوب المسؤول</span>
                                    <select
                                        value={lawyerFilter}
                                        onChange={(e) => setLawyerFilter(e.target.value)}
                                        className="w-full text-xs bg-slate-50 dark:bg-gray-800 border-none rounded-xl py-3 font-bold text-slate-700 dark:text-gray-200"
                                    >
                                        <option value="all">الكل بدون قيود</option>
                                        <option value="lawyer">أ. صبري أحمد شطا (محامي أول)</option>
                                        <option value="associate">أ. فاطمة علي الكندري</option>
                                    </select>
                                </div>

                                <div>
                                    <span className="text-[10px] text-slate-400 font-bold block mb-1">حالة الجلسة / الموقف</span>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full text-xs bg-slate-50 dark:bg-gray-800 border-none rounded-xl py-3 font-bold text-slate-700 dark:text-gray-200"
                                    >
                                        <option value="all">الكل</option>
                                        <option value="Scheduled">Scheduled (مجدولة)</option>
                                        <option value="Completed">Completed (منتهية ومحضرها)</option>
                                        <option value="Postponed">Postponed (مؤجلة إدارياً)</option>
                                        <option value="Cancelled">Cancelled (ملغاة)</option>
                                    </select>
                                </div>
                            </div>

                            {/* TIMEFRAME VIEWER BAR & DATE NAVIGATION */}
                            <div className="flex flex-col md:flex-row justify-between items-center gap-3 pt-3 border-t">
                                <div className="flex items-center gap-1.5">
                                    <button 
                                        onClick={() => setViewMode('day')}
                                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${viewMode === 'day' ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                                    >
                                        الرول اليومي للجدول
                                    </button>
                                    <button 
                                        onClick={() => setViewMode('week')}
                                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${viewMode === 'week' ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                                    >
                                        رول المخطط الأسبوعي
                                    </button>
                                    <button 
                                        onClick={() => setViewMode('month')}
                                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${viewMode === 'month' ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                                    >
                                        أجندة التقويم الشهري
                                    </button>
                                    <button 
                                        onClick={() => setViewMode('timeline')}
                                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${viewMode === 'timeline' ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                                    >
                                        المخطط التاريخي التراكمي
                                    </button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => {
                                            const prev = new Date(currentDate);
                                            prev.setDate(prev.getDate() - (viewMode === 'month' ? 30 : 7));
                                            setCurrentDate(prev);
                                        }}
                                        className="p-2 bg-slate-50 dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 text-primary font-black text-sm rounded-lg"
                                    >
                                        &gt;
                                    </button>
                                    <span className="text-xs font-black bg-slate-100 dark:bg-gray-800 py-2 px-4 rounded-xl text-slate-800 dark:text-gray-200">
                                        {format(currentDate, 'dd MMMM yyyy', { locale: ar })}
                                    </span>
                                    <button 
                                        onClick={() => {
                                            const next = new Date(currentDate);
                                            next.setDate(next.getDate() + (viewMode === 'month' ? 30 : 7));
                                            setCurrentDate(next);
                                        }}
                                        className="p-2 bg-slate-50 dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 text-primary font-black text-sm rounded-lg"
                                    >
                                        &lt;
                                    </button>
                                </div>

                                <div className="flex gap-2">
                                    <Button 
                                        size="sm" 
                                        variant="outline" 
                                        onClick={triggerExcelMockExport}
                                        leftIcon={<ArrowDownTrayIcon className="w-4 h-4" />}
                                    >
                                        تصدير جدول الـ Excel
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => {
                                            window.open('https://www.moj.gov.kw/AR/Pages/default.aspx', '_blank');
                                            addAuditLog('الاستعلام المباشر عبر بوابة البوابة العدل الإلكترونية (MOJ)');
                                        }}
                                        leftIcon={<ShareIcon className="w-4 h-4" />}
                                    >
                                        بوابة وزراة العدل (MOJ)
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        variant="outline" 
                                        onClick={() => {
                                            setStatusFilter('all');
                                            setCourtFilter('all');
                                            setLawyerFilter('all');
                                            setSearchQuery('');
                                            setSelectedCategory('all');
                                            addToast({ type: 'info', title: 'تمت التهيئة', message: 'تم تصفير جميع فلاتر البحث وإجراءات التقويم.' });
                                        }}
                                    >
                                        إعادة الضبط
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* RENDER VIEW: WEEK/MONTH CALENDARS OR DETAILED LIST/TIMELINE */}
                        {viewMode === 'month' ? (
                            <div className="bg-white dark:bg-dm-card p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                <span className="text-gray-400 text-xs font-bold block mb-3">مناظرة الأحداث والجدولة الشهرية:</span>
                                <div className="grid grid-cols-7 border-b pb-2 text-center text-xs font-black text-gray-400 gap-2">
                                    {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map(day => (
                                        <div key={day} className="py-2 bg-slate-50 dark:bg-gray-800/30 rounded-lg">{day}</div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7 gap-2 mt-2">
                                    {Array.from({ length: 35 }).map((_, idx) => {
                                        const dayNum = (idx % 30) + 1;
                                        const tempDate = new Date(currentDate);
                                        tempDate.setDate(dayNum);
                                        const dayEvents = filteredEvents.filter(e => isSameDay(new Date(e.date), tempDate)).slice(0, 2);
                                        return (
                                            <div key={idx} className="min-h-[100px] bg-slate-50/40 dark:bg-gray-800/20 rounded-xl p-2 border border-gray-100/60 hover:border-indigo-400/30 transition-all flex flex-col justify-between">
                                                <span className="text-[10px] font-black">{dayNum}</span>
                                                <div className="space-y-1">
                                                    {dayEvents.map(ev => (
                                                        <div 
                                                            key={ev.id} 
                                                            onClick={() => {
                                                                setViewEvent(ev);
                                                                addAuditLog(`عرض مفصل للجلسة #${ev.id} من التقويم الشهري`);
                                                            }}
                                                            className={`text-[8px] font-black p-1 rounded truncate cursor-pointer hover:shadow-sm ${
                                                                ev.type === 'Hearing' ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                                            }`}
                                                        >
                                                            {ev.time} | {ev.title}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : viewMode === 'week' ? (
                            <div className="bg-white dark:bg-dm-card p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                <span className="text-gray-400 text-xs font-bold block mb-4">الأجندة الأسبوعية النشطة:</span>
                                <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                                    {['الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'].map((day, idx) => {
                                        const tempDate = new Date(currentDate);
                                        tempDate.setDate(currentDate.getDate() + idx - 3);
                                        const dayEvents = filteredEvents.filter(e => isSameDay(new Date(e.date), tempDate));
                                        return (
                                            <div key={day} className="bg-slate-50/50 dark:bg-gray-800/10 rounded-2xl p-3 border">
                                                <h4 className="text-[11px] font-black border-b pb-2 text-slate-700 dark:text-gray-300">
                                                    {day} <span className="text-[10px] text-slate-400">({tempDate.getDate()}/{tempDate.getMonth() + 1})</span>
                                                </h4>
                                                <div className="space-y-2 mt-3">
                                                    {dayEvents.length === 0 ? (
                                                        <span className="text-[9px] text-gray-400 italic block text-center py-4">بلا التزامات</span>
                                                    ) : (
                                                        dayEvents.map(ev => (
                                                            <div 
                                                                key={ev.id} 
                                                                onClick={() => {
                                                                    setViewEvent(ev);
                                                                    addAuditLog(`تفحص الحدث #${ev.id} من الجدول الأسبوعي`);
                                                                }}
                                                                className={`p-2 rounded-xl text-[9px] font-bold cursor-pointer transition-all hover:-translate-y-0.5 border ${
                                                                    ev.type === 'Hearing' ? 'bg-blue-50/80 border-blue-100 text-blue-900' : 'bg-emerald-50/80 border-emerald-100 text-emerald-900'
                                                                }`}
                                                            >
                                                                <span className="block font-black">{ev.time}</span>
                                                                <span className="line-clamp-2 mt-1">{ev.title}</span>
                                                                <span className="block text-[8px] opacity-70 mt-1">{ev.location}</span>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            
                            // LIST & TIMELINE EXPANDABLE VIEWS
                            <div className="bg-white dark:bg-dm-card rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50/50 dark:bg-gray-800/30">
                                    <h4 className="text-xs font-black text-slate-800 dark:text-gray-200">نتائج البحث والاستعراض الفوري للرول الموحد</h4>
                                    <span className="text-[10px] bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-black">
                                        يتم عرض {filteredEvents.length} تدوينات من الجلسات والمواعيد
                                    </span>
                                </div>

                                {filteredEvents.length === 0 ? (
                                    <div className="text-center py-20">
                                        <div className="w-16 h-16 bg-slate-50 dark:bg-gray-800/40 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <BriefcaseIcon className="w-8 h-8 text-slate-300" />
                                        </div>
                                        <h3 className="text-sm font-black text-slate-700 dark:text-slate-300">لم يتم العثور على أي جلسات أو التزامات</h3>
                                        <p className="text-xs text-slate-400 mt-1">يرجى تعديل شروط الفلترة أو إعادة تحديد الأيام في شريط السجل.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {filteredEvents.map((event) => {
                                            const isExpanded = expandedRow === event.id;
                                            return (
                                                <div key={event.id} className="transition-all hover:bg-slate-50/30 dark:hover:bg-gray-800/10">
                                                    
                                                    {/* ROW SUMMARY SUMMARY CARD */}
                                                    <div className="p-5 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 cursor-pointer" onClick={() => setExpandedRow(isExpanded ? null : event.id)}>
                                                        
                                                        {/* Timing Block */}
                                                        <div className="flex items-center gap-4">
                                                            <div className="text-center font-mono py-2 px-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl min-w-[75px]">
                                                                <span className="block text-xs font-black text-indigo-700 dark:text-indigo-400">{event.time}</span>
                                                                <span className="text-[9px] text-slate-400 block mt-0.5">{event.date}</span>
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <Badge 
                                                                        text={event.type === 'Hearing' ? 'جلسة رول محكمة' : 'موعد إداري'} 
                                                                        variant={event.type === 'Hearing' ? 'primary' : 'success'} 
                                                                        size="xs" 
                                                                    />
                                                                    {event.circuit && (
                                                                        <span className="text-[10px] bg-slate-100 dark:bg-gray-800 text-gray-500 font-extrabold px-2 py-0.5 rounded">
                                                                            {event.circuit}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <h4 className="text-xs font-black text-slate-800 dark:text-white mt-1.5 leading-snug">
                                                                    {event.title}
                                                                </h4>
                                                                <span className="text-[10px] text-slate-400 font-bold block mt-1">
                                                                    {event.subtitle}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Location & Status Progress Row */}
                                                        <div className="flex flex-wrap items-center gap-6 xl:ms-auto">
                                                            <div className="text-right">
                                                                <span className="text-[10px] text-slate-400 block font-bold">المقر والقاعة</span>
                                                                <span className="text-xs font-black text-slate-700 dark:text-gray-200 flex items-center gap-1.5 mt-1">
                                                                    <HomeIcon className="w-3.5 h-3.5 text-slate-400" /> {event.location}
                                                                </span>
                                                            </div>

                                                            <div className="min-w-[110px]">
                                                                <div className="flex justify-between text-[10px] font-black mb-1">
                                                                    <span className="text-slate-400">نسبة تقدم الإجراءات</span>
                                                                    <span className="text-indigo-600 dark:text-indigo-400">{event.progress || 0}%</span>
                                                                </div>
                                                                <div className="w-full bg-slate-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                                                                    <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${event.progress || 0}%` }} />
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <Badge 
                                                                    text={event.status} 
                                                                    variant={
                                                                        event.status === 'Completed' || event.status === 'منتهية' ? 'success' : 
                                                                        event.status === 'Postponed' || event.status === 'مؤجلة' ? 'warning' : 'primary'
                                                                    }
                                                                    size="sm"
                                                                />
                                                            </div>
                                                        </div>

                                                    </div>

                                                    {/* EXPANDED PANEL DETAILS IN PLACE */}
                                                    <AnimatePresence>
                                                        {isExpanded && (
                                                            <motion.div
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: 'auto' }}
                                                                exit={{ opacity: 0, height: 0 }}
                                                                className="overflow-hidden bg-slate-50/50 dark:bg-gray-900/10 border-t"
                                                            >
                                                                <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
                                                                    
                                                                    {/* Col 1: Extra Details and actions taken */}
                                                                    <div className="space-y-4">
                                                                        <Card title="بيانات الموقف والتحضير" titleClassName="text-xs font-black">
                                                                            <div className="space-y-2.5 text-slate-600 dark:text-slate-300">
                                                                                <p><strong>الإجراء الأخير المتخذ:</strong> {event.lastAction || '---'}</p>
                                                                                <p><strong>الإجراء القادم بالتكليف:</strong> {event.nextAction || '---'}</p>
                                                                                <p><strong>المحامي المباشر للدعوى:</strong> {event.lawyer || '---'}</p>
                                                                                <p><strong>الخصوم وممثلوهم القانونيون:</strong> {event.opponents || '---'}</p>
                                                                            </div>
                                                                        </Card>
                                                                        
                                                                        {/* Action to complete or change status */}
                                                                        <div className="bg-white dark:bg-dm-card p-4 rounded-2xl border flex items-center justify-between gap-4">
                                                                            <div>
                                                                                <span className="text-[10px] text-gray-400 block font-bold">تغيير حالة الحضور إجرائياً</span>
                                                                                <span className="text-[11px] font-black text-slate-800">أتمتة المهام المرتبطة</span>
                                                                            </div>
                                                                            <div className="flex gap-1.5">
                                                                                {event.type === 'Hearing' && event.status !== 'Completed' && (
                                                                                    <Button 
                                                                                        size="sm" 
                                                                                        onClick={() => {
                                                                                            updateHearingStatus(event.id, 'Completed');
                                                                                            addAuditLog(`تحديث حالة حضور جلسة #${event.id} إلى مكتملة (تنشيط أتمتة المهام)`);
                                                                                            addToast({ type: 'success', title: 'تم التحديث', message: 'اكتملت الجلسة وصدر إشعار الأتمتة.' });
                                                                                        }}
                                                                                    >
                                                                                        تم الحضور (فعال)
                                                                                    </Button>
                                                                                )}
                                                                                <Button 
                                                                                    size="sm" 
                                                                                    variant="outline"
                                                                                    onClick={() => setViewEvent(event)}
                                                                                >
                                                                                    التفاصيل والبطاقة
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                     </div>

                                                                    {/* Col 2: Interactive Memorandum text editor */}
                                                                    <div className="space-y-4">
                                                                        <div className="bg-white dark:bg-dm-card p-5 rounded-2xl border">
                                                                            <h5 className="font-black mb-2 text-slate-800 dark:text-gray-200 flex items-center gap-2">
                                                                                <ScaleIcon className="w-4 h-4 text-primary" /> مذكرة دفاع ومسودة الجلسة العاجلة
                                                                            </h5>
                                                                            <textarea 
                                                                                value={memos[event.id] || ''}
                                                                                onChange={(e) => setMemos({ ...memos, [event.id]: e.target.value })}
                                                                                placeholder="اكتب هنا الدفوع والطلبات الختامية وملاحظات المرافعة الشفهية المقترحة للجلسة..."
                                                                                rows={4}
                                                                                className="w-full text-xs p-2.5 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                                                                            />
                                                                            <div className="flex justify-end gap-2 mt-2">
                                                                                <Button 
                                                                                    size="sm" 
                                                                                    onClick={() => handleSaveMemoText(event.id, memos[event.id] || '')}
                                                                                >
                                                                                    حفظ الدفوع بالمسودة
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Col 3: Interactive attachments documents file box */}
                                                                    <div className="space-y-3">
                                                                        <div className="bg-white dark:bg-dm-card p-5 rounded-2xl border">
                                                                            <h5 className="font-black text-slate-800 dark:text-gray-200 mb-2 flex items-center justify-between">
                                                                                <span>الأرشيف ووثائق ومرفقات الجلسة</span>
                                                                                <span className="text-[9px] text-gray-400">سعة آمنة ومدروسة</span>
                                                                            </h5>
                                                                            
                                                                            {/* Documents List */}
                                                                            <div className="space-y-2 max-h-[110px] overflow-y-auto">
                                                                                {(attachments[event.id] || []).length === 0 ? (
                                                                                    <span className="text-[10px] text-gray-400 italic block text-center py-4">لا توجد وثائق معلنة بالجلسة حتى الآن</span>
                                                                                ) : (
                                                                                    (attachments[event.id] || []).map((file, fIdx) => (
                                                                                        <div key={fIdx} className="p-2 bg-slate-50 dark:bg-gray-800 rounded-lg flex items-center justify-between">
                                                                                            <span className="truncate max-w-[150px] font-bold text-slate-700">{file.title}</span>
                                                                                            <span className="text-[9px] text-gray-400 font-mono">{file.size}</span>
                                                                                        </div>
                                                                                    ))
                                                                                )}
                                                                            </div>

                                                                            {/* Simulated upload box */}
                                                                            <div 
                                                                                onClick={() => handleAddMockFile(event.id, event.type === 'Hearing' ? 'مذكرة' : 'مستمسك')}
                                                                                className="mt-3 py-3 border-2 border-dashed border-gray-200 rounded-xl text-center cursor-pointer hover:border-indigo-400 transition-all bg-indigo-50/10 hover:bg-indigo-50/20"
                                                                            >
                                                                                <span className="text-[10px] font-black text-indigo-700 block">اسحب الملف أو انقر لرفع ملحق جديد</span>
                                                                                <span className="text-[8px] text-gray-400 mt-0.5 font-bold">يقبل PDF, Word, JPG بحد أقصى 20 MB</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>

                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                    </motion.div>
                )}

                {/* TAB 2: ACTIVE EXPERT MEETINGS */}
                {activeTab === 'experts' && (
                    <motion.div 
                        key="experts"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <Card title="إدارة وإثبات لجان وجلسات الخبراء الكويتيين" icon={<UsersIcon className="w-5 h-5 text-indigo-500" />}>
                            <div className="overflow-x-auto text-xs">
                                <table className="min-w-full text-right border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-gray-800 text-slate-400 border-b">
                                            <th className="px-4 py-4 font-black">رقم القضية والعنوان</th>
                                            <th className="px-4 py-4 font-black">تخصص الخبرة / الخبير المنتدب</th>
                                            <th className="px-4 py-4 font-black">المهمة المكلف بها مكتب الخبراء</th>
                                            <th className="px-4 py-4 font-black">تاريخ الإحالة الرسمي</th>
                                            <th className="px-4 py-4 font-black">حالة الندب والتقدير</th>
                                            <th className="px-4 py-4 font-black text-left">تفاصيل</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {expertMeetings.map(meeting => (
                                            <tr key={meeting.id} className="hover:bg-slate-50/50">
                                                <td className="px-4 py-4 font-bold text-slate-800">
                                                    <div>{meeting.caseTitle}</div>
                                                    <span className="text-[10px] text-slate-400 block mt-0.5">رقم القضية: {meeting.caseNumber}</span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <Badge text={meeting.expertField} variant="secondary" />
                                                    <span className="block mt-1 text-slate-500 font-bold">{meeting.expertName || 'وزارة العدل'}</span>
                                                </td>
                                                <td className="px-4 py-4 text-slate-600 font-medium">
                                                    {meeting.assignedTask}
                                                </td>
                                                <td className="px-4 py-4 font-mono font-bold text-slate-500">
                                                    {meeting.referralDate}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <ExpertActionStatusBadge status={meeting.status} />
                                                </td>
                                                <td className="px-4 py-4 text-left">
                                                    <Button size="sm" variant="outline">تقرير الدفاع</Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>

                        <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 rounded-2xl border flex items-center gap-4">
                            <InformationCircleIcon className="w-6 h-6 text-indigo-600 flex-shrink-0" />
                            <div className="text-xs">
                                <h5 className="font-black text-indigo-800 dark:text-indigo-400">التوافق وبينه قانون الإثبات الكويتي</h5>
                                <p className="text-slate-500 mt-0.5 leading-relaxed">
                                    تلتزم الإدارة العامة للخبراء لدى محاكم الكويت بتدوير جلسات المناقشة الحسابية والهندسية وإلزام الخبير بتقديم المحاضر بمواعيد مدونة بقرار الندب. نلتمس تقديم مذكرات الرد على الخبير قبل موعد الجلسة بـ ٤٨ ساعة على الأقل.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* TAB 3: PROCEDURAL DEADLINES CALCULATOR */}
                {activeTab === 'deadlines' && (
                    <motion.div 
                        key="deadlines"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                    >
                        
                        {/* inputs Column */}
                        <div className="lg:col-span-4 space-y-6">
                            <Card title="معايير تتبع مدد السقوط والطعن" icon={<CalculatorIcon className="w-5 h-5 text-indigo-500" />}>
                                <div className="space-y-4 text-xs">
                                    <Input 
                                        label="تاريخ صدور الحكم الابتدائي للخصومة"
                                        type="date"
                                        value={dlStartDate}
                                        onChange={(e) => setDlStartDate(e.target.value)}
                                        helperText="مادة ١٧ مرافعات: يسير ميعاد السقوط باليوم الموالي لصدور الحكم علناً"
                                    />

                                    <Input 
                                        label="مسافة الموكل أو الخصم بالبلاد (كم)"
                                        type="number"
                                        value={dlDistance.toString()}
                                        onChange={(e) => setDlDistance(parseInt(e.target.value) || 0)}
                                        helperText="مادة ١٦ مرافعات كويتي: يضاف ميعاد مسافة يوم واحد لكل ٥٠ كم"
                                    />

                                    <Input 
                                        label="أيام مخصصة إضافية للتسوية الودية"
                                        type="number"
                                        value={dlCustomDays.toString()}
                                        onChange={(e) => setDlCustomDays(parseInt(e.target.value) || 0)}
                                    />

                                    <div className="p-4 bg-slate-50 dark:bg-gray-800 rounded-2xl border text-[11px] text-slate-500 space-y-2">
                                        <div className="font-black text-slate-800 flex items-center gap-1.5">
                                            <ScaleIcon className="w-4 h-4 text-primary" /> المواد المطبقة لمرافعات الكويت:
                                        </div>
                                        <p className="italic">" المادة ١٨: إذا صادف ميعاد السقوط أو الطعن عطلة رسمية أو نهاية أسبوع قضائية، يمتد الميعاد إدارياً لأول يوم عمل معلن للعملاء. "</p>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* results output Column */}
                        <div className="lg:col-span-8 space-y-4">
                            <h3 className="text-sm font-black text-slate-800 dark:text-gray-200 flex items-center gap-2">
                                <ArrowPathIcon className="w-4 h-4 text-slate-500 animate-spin" /> المواعيد القانونية المشتقة لإيداع الطعون
                            </h3>

                            {deadlineResults.map((res, idx) => (
                                <div key={idx} className="bg-white dark:bg-dm-card p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-indigo-400 transition-all">
                                    <div>
                                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-black block uppercase tracking-wide">{res.ref}</span>
                                        <h4 className="text-xs font-black text-slate-800 dark:text-white mt-1">{res.label}</h4>
                                        <div className="flex gap-2 mt-2">
                                            <span className="bg-slate-100 dark:bg-gray-800 px-2.5 py-1 text-[9px] rounded font-bold text-slate-600">
                                                الميعاد المحدد بالقانون: {res.days} يوماً
                                            </span>
                                            {dlDistance > 0 && (
                                                <span className="bg-amber-50 text-amber-700 px-2.5 py-1 text-[9px] rounded font-bold">
                                                    + ميعاد مسافة مضاف
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-right md:text-left flex flex-col items-end md:items-start select-none">
                                        <span className="text-[9px] text-slate-400 font-bold block">تاريخ السقوط النهائي المعدل:</span>
                                        <span className={`text-[15px] font-black block mt-0.5 ${res.isExpired ? 'text-red-500' : 'text-indigo-600 dark:text-indigo-400'}`}>
                                            {format(res.finalDate, 'EEEE - dd MMMM yyyy', { locale: ar })}
                                        </span>
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full mt-1.5 ${
                                            res.isExpired ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'
                                        }`}>
                                            {res.isExpired ? 'تجاوزت الموعد القانوني' : `متبقي ${res.daysRemaining} يوماً لمباشرة الإجراء`}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </motion.div>
                )}

                {/* TAB 4: AUDIT RAIL & RBAC SECURITY CONSOLE */}
                {activeTab === 'audit_rbac' && (
                    <motion.div 
                        key="audit"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-xs">
                            
                            {/* Role Simulator select bar */}
                            <div className="bg-white dark:bg-dm-card p-5 rounded-3xl border shadow-sm space-y-4">
                                <h3 className="font-black text-sm text-slate-800 dark:text-gray-200">التحكم في مستويات الوصول (RBAC)</h3>
                                <p className="text-slate-500 leading-relaxed">
                                    تتبع الرقابة الإدارية في دولة الكويت لمنع تسريب الجلسات أو تغيير ملفاتها بغير صلاحية مستحقة.
                                </p>
                                
                                <div>
                                    <span className="text-[10px] text-gray-400 block mb-1 font-bold">اختر مستواك الوظيفي الحالي لغرض معاينة التقارير:</span>
                                    <select
                                        value={currentUserRole}
                                        onChange={(e) => {
                                            setCurrentUserRole(e.target.value);
                                            addAuditLog(`تغيير واختبار مستوى المحامي الوظيفي إلى: [${e.target.value}]`);
                                            addToast({ type: 'info', title: 'تغير المستوى الوظيفي', message: `تم تفعيل صلاحيات ${e.target.value} بنجاح.` });
                                        }}
                                        className="w-full bg-slate-100 border-none rounded-xl py-3 font-bold"
                                    >
                                        <option value="Partner">محامي شريك (Partner)</option>
                                        <option value="Senior">محامي أول (Senior Associate)</option>
                                        <option value="Associate">محامي جدول أ (Associate)</option>
                                        <option value="Clerk">معقب ومساعد إداري (Clerk)</option>
                                    </select>
                                </div>

                                <div className="p-3.5 bg-indigo-50/60 dark:bg-indigo-950/20 border rounded-xl text-slate-600">
                                    <span className="font-black block text-indigo-800 mb-1">صلاحيتك النشطة حالياً:</span>
                                    {ROLES_LIST.find(r => r.id === currentUserRole)?.level}
                                </div>
                            </div>

                            {/* Session Audit trail logger list */}
                            <div className="lg:col-span-3 bg-white dark:bg-dm-card p-6 rounded-3xl border shadow-sm space-y-4">
                                <div className="flex justify-between items-center border-b pb-3">
                                    <h3 className="font-black text-sm text-slate-800 dark:text-gray-200">سجل عمليات الرقابة للمستندات والجدولة (Audit Logging Trail)</h3>
                                    <Button size="sm" variant="outline" onClick={() => {
                                        setAuditLogs(initialAuditLogs);
                                        addToast({ type: 'info', title: 'تهيئة السجل', message: 'تم إرجاع تدوينات العمليات للحالة الأولية.' });
                                    }}>تصفير السجل</Button>
                                </div>

                                <div className="space-y-3 max-h-[350px] overflow-y-auto">
                                    {auditLogs.map(log => (
                                        <div key={log.id} className="p-3 bg-slate-50 dark:bg-gray-800/40 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                                            <div>
                                                <span className="font-black text-slate-700 dark:text-gray-300">{log.action}</span>
                                                <div className="flex gap-2.5 mt-1 text-[10px] text-slate-400 font-bold">
                                                    <span>المشغل: {log.user} ({log.role})</span>
                                                    <span>IP المشغل: {log.ip}</span>
                                                </div>
                                            </div>
                                            <span className="font-mono text-[10px] text-gray-400">{log.timestamp}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </motion.div>
                )}

            </AnimatePresence>

            {/* MODAL 1: SCHEDULING NEW EVENT/APPOINTMENT */}
            <Modal 
                isOpen={isAptModalOpen} 
                onClose={() => setIsAptModalOpen(false)} 
                title="إدراج موعـد أو إعلان جديد في جدول أعمال المكتب"
                size="md"
            >
                <form onSubmit={handleSubmitApt} className="space-y-4 text-xs font-sans">
                    <Input 
                        label="عنوان الموعد أو التفاصيل العاجلة للاجتماع"
                        value={aptForm.title || ''}
                        onChange={(e) => setAptForm({ ...aptForm, title: e.target.value })}
                        required
                        placeholder="مثال: مرافعة مكملة مع شركة الأمل في قاعة العاصمة..."
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <Input 
                            label="تاريخ الاستحقاق والجدولة"
                            type="date"
                            value={aptForm.date || ''}
                            onChange={(e) => setAptForm({ ...aptForm, date: e.target.value })}
                            required
                        />
                        <Input 
                            label="ساعة الموعد"
                            type="time"
                            value={aptForm.time || ''}
                            onChange={(e) => setAptForm({ ...aptForm, time: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Input 
                            label="المقر والقاعة / المكتب"
                            value={aptForm.location || ''}
                            onChange={(e) => setAptForm({ ...aptForm, location: e.target.value })}
                            required
                            placeholder="مثال: قصر العدل قاعة 15"
                        />
                        <Select
                            label="تصنيف الإلـزام"
                            value={aptForm.category || 'اجتماع موكل'}
                            onChange={(e) => setAptForm({ ...aptForm, category: e.target.value })}
                            options={[
                                { value: 'اجتماع موكل', label: 'اجتماع موكل' },
                                { value: 'إجراء قلم كتاب', label: 'إجراء قلم كتاب' },
                                { value: 'جلسة خبراء حسابية', label: 'جلسة خبراء حسابية' },
                                { value: 'تسوية ودية ومصالحات', label: 'تسوية ودية ومصالحات' }
                            ]}
                        />
                    </div>

                    <Input 
                        label="الأطراف والشهود والخصوم المنتمين للاجتماع"
                        value={aptForm.attendees || ''}
                        onChange={(e) => setAptForm({ ...aptForm, attendees: e.target.value })}
                        placeholder="مثال: ناصر فهد العتيبي، مندوب وزارة الشؤون"
                    />

                    <TextArea 
                        label="الأجندة والطلب المطلوب صياغته بالجلسة"
                        value={aptForm.description || ''}
                        onChange={(e) => setAptForm({ ...aptForm, description: e.target.value })}
                        rows={3}
                        placeholder="أدخل هنا جدول الأعمال المقترح والمستندات المطالب باصطحابها..."
                    />

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={() => setIsAptModalOpen(false)}>إلغاء الأمر</Button>
                        <Button type="submit">تثبيت وإدراج الموعد بالرول</Button>
                    </div>
                </form>
            </Modal>

            {/* MODAL 2: PRINT REPORT CONTROL CENTER */}
            <Modal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                title="مركز تجهيز التقارير واستصدار كشوف الرول الموثقة"
                size="lg"
            >
                <div className="space-y-6 text-xs text-right">
                    <div className="bg-slate-50 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <span className="text-[10px] text-gray-400 font-bold block mb-1">اختر نموذج الكشف</span>
                            <select 
                                value={reportType} 
                                onChange={(e) => setReportType(e.target.value)}
                                className="w-full bg-white border rounded-lg p-2 font-bold"
                            >
                                <option value="official">الكشف الرسمي المعتمد بختم المكتب</option>
                                <option value="internal">تقرير العمليات الداخلي المخصص للشركاء</option>
                                <option value="summary">كشف الرول السريع للمحامين المندوبين</option>
                            </select>
                        </div>

                        <div>
                            <span className="text-[10px] text-gray-400 font-bold block mb-1">توقيع وختم المستشار</span>
                            <select 
                                value={reportSignature} 
                                onChange={(e) => setReportSignature(e.target.value)}
                                className="w-full bg-white border rounded-lg p-2 font-bold"
                            >
                                <option value="shata">المستشار صبري أحمد شطا</option>
                                <option value="al-ansari">المستشار الشريك أحمد مبارك الأنصاري</option>
                                <option value="both">كلاهما معاً بختم مشترك</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2 pt-4">
                            <input 
                                type="checkbox" 
                                checked={reportIncludesNotes} 
                                onChange={(e) => setReportIncludesNotes(e.target.checked)}
                                className="w-4 h-4 text-indigo-600 focus:ring-primary rounded"
                            />
                            <span className="font-bold text-slate-700">تضمين مذكرة الدفاع المتخذة</span>
                        </div>
                    </div>

                    <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-xl flex items-center gap-3">
                        <InformationCircleIcon className="w-5 h-5 text-amber-600 flex-shrink-0" />
                        <span className="text-[11px] text-amber-700 font-bold">
                            تتم الطباعة متكاملة ومتوافقة مع نظام ورقة الطباعة الرسمية بمكاتب وزارة العدل والناقل الآلي الكويتي.
                        </span>
                    </div>

                    {/* OFFICIAL PREVIEW CENTER */}
                    <div id="adal-official-report-print" className="border-2 border-slate-300 rounded-2xl p-6 bg-white text-slate-900 shadow-sm space-y-6 relative font-sans">
                        
                        {/* Custom Stamped Header */}
                        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                            <div className="text-right">
                                <h2 className="text-lg font-black text-slate-900">مكتب الأنصاري وبشطا للمحاماة والاستشارات القانونية</h2>
                                <p className="text-[9px] text-slate-500 mt-0.5">شارع الهلالي، مجمع قيس الغانم، شرق، م. د الكويت</p>
                                <span className="text-[9px] bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full inline-block mt-2 font-bold select-none text-right">
                                    تاريخ إصدار الكشف: {format(new Date(), 'dd/MM/yyyy HH:mm:ss')}
                                </span>
                            </div>

                            {/* Center Emblem Visual */}
                            <div className="text-center font-bold px-4 py-2 border-2 border-slate-900 rounded-xl max-w-[125px]">
                                <span className="text-sm font-black tracking-widest block text-slate-900">عــدالـــة</span>
                                <span className="text-[7px] uppercase tracking-widest font-black block text-slate-500">Legal Firm Kuwait</span>
                            </div>
                        </div>

                        {/* Title details */}
                        <div className="text-center bg-slate-100/60 p-3 rounded-xl border">
                            <h3 className="text-sm font-black text-slate-900">
                                كـشـف الـرول والـتـزامـات جـدول الـقـضـايـا - فـئـة [{ROLL_CATEGORIES.find(c => c.id === selectedCategory)?.name || selectedCategory}]
                            </h3>
                            <span className="text-[10px] text-slate-500 mt-1 block">تعداد السجلات المستهدفة للطباعة العاجلة: {filteredEvents.length} سجلات نشطة</span>
                        </div>

                        {/* Minimal Printing Table */}
                        <table className="w-full text-right text-[10px] border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800 text-slate-700 font-black">
                                    <th className="py-2">ساعة</th>
                                    <th className="py-2">القضية والخصوم</th>
                                    <th className="py-2">المحكمة ومقر الجلسة</th>
                                    <th className="py-2">الدائرة القضائية</th>
                                    <th className="py-2">الموقف الحالي</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {filteredEvents.map(ev => (
                                    <tr key={ev.id} className="py-3">
                                        <td className="py-2.5 font-bold font-mono text-indigo-700">{ev.time}</td>
                                        <td className="py-2.5 font-bold">
                                            {ev.title}
                                            {reportIncludesNotes && memos[ev.id] && (
                                                <span className="block text-[8px] text-slate-500 font-bold bg-slate-50 p-1.5 rounded mt-1">
                                                    دفاع المكتب: {memos[ev.id]}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-2.5 font-semibold text-slate-600">{ev.location}</td>
                                        <td className="py-2.5 font-black">{ev.circuit || 'المكتب الرئيسي'}</td>
                                        <td className="py-2.5 font-bold text-slate-800">{ev.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Printing Stamps Footnote */}
                        <div className="grid grid-cols-2 gap-6 pt-6 border-t font-semibold">
                            <div className="text-right">
                                <span className="block text-slate-400 underline">الشريك التنفيذي للمكتب:</span>
                                <span className="block text-xs font-black text-slate-900 mt-2">
                                    {reportSignature === 'shata' ? 'المستشار صبري أحمد شطا' : 'أحمد مبارك الأنصاري'}
                                </span>
                                <span className="text-[9px] text-slate-500">خاتم الإدارة والتوثيق مفعّل الكترونياً</span>
                            </div>
                            <div className="text-left flex flex-col items-end justify-center">
                                <div className="w-16 h-16 border-4 border-dashed border-slate-300 rounded-full flex items-center justify-center font-bold text-[8px] opacity-70">
                                    خاتم المكتب الرسمي
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="flex justify-end gap-2.5 pt-4 border-t">
                        <Button variant="outline" onClick={() => setIsReportModalOpen(false)}>إلغاء وإيراد</Button>
                        <Button 
                            onClick={() => {
                                setTimeout(() => window.print(), 300);
                                addAuditLog('استدعاء برمجية الطباعة المدمجة window.print للكشف المالي للمحاكم');
                            }}
                        >
                            تنشيط طباعة الكشف (Print PDF)
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* MODAL 3: VIEW SPECIFIC SCHEDULE ITEM CARD */}
            <Modal
                isOpen={!!viewEvent}
                onClose={() => setViewEvent(null)}
                title={viewEvent?.type === 'Hearing' ? 'بطاقة جلسة محكمة معتمدة' : 'تفاصيل الموعد الإداري'}
                size="md"
            >
                {viewEvent && (
                    <div className="space-y-4 text-xs font-sans text-right">
                        <div className="p-4 bg-indigo-50 rounded-2xl border flex items-center gap-3">
                            <div className="p-2 bg-indigo-100/80 rounded-lg text-indigo-700">
                                <GavelIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-extrabold text-indigo-900">{viewEvent.title}</h4>
                                <p className="text-[10px] text-slate-400 mt-0.5">{viewEvent.subtitle}</p>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-2xl border space-y-2 text-slate-600">
                            <p><strong>ساعة الجلسة وتوقيتها:</strong> {viewEvent.time} بتاريخ {viewEvent.date}</p>
                            <p><strong>الموقع المروي:</strong> {viewEvent.location}</p>
                            {viewEvent.circuit && <p><strong>الدائرة القضائية المنتدبة:</strong> {viewEvent.circuit}</p>}
                            <p><strong>المحامي المسؤول المندوب:</strong> {viewEvent.lawyer}</p>
                            <p><strong>الحالة الإدارية بجدول الرول:</strong> {viewEvent.status}</p>
                            <p><strong>الدفع والطلبات المستودعة:</strong> {viewEvent.notes || 'لا يوجد ملاحظات إضافية بجدول السجلات.'}</p>
                        </div>

                        <div className="flex justify-end gap-2 border-t pt-4">
                            <Button variant="outline" onClick={() => setViewEvent(null)}>أغلـق المعاينة</Button>
                            <Button 
                                onClick={() => {
                                    setTimeout(() => window.print(), 350);
                                    addAuditLog(`طباعة منفردة لبطاقة الجلسة #${viewEvent.id} لمندوبي المحاكم`);
                                }}
                            >
                                طباعة البطاقة المنفردة
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

        </div>
    );
};

export default AutomatedDocketPage;
