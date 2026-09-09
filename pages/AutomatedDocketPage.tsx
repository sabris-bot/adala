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
    ShieldCheckIcon,
    MapPinIcon
} from '../constants';
import Button from '../components/ui/Button';
import { Badge, ExpertActionStatusBadge } from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';

import SmartProceduralRoadmap from '../components/SmartProceduralRoadmap';
import CourtLocationMapModal from '../components/CourtLocationMapModal';
import AiTaskBar from '../components/AiTaskBar';
import DocketAudioSettingsModal from '../components/DocketAudioSettingsModal';
import DocketActivityLog, { DocketActivityLogItem } from '../components/DocketActivityLog';

// --- TYPES & STRUCTURES ---
type ViewMode = 'day' | 'week' | 'month' | 'timeline' | 'year' | 'date-range' | 'court-group' | 'lawyer-group' | 'casetype-group' | 'client-group';
type TabType = 'roll' | 'roadmap' | 'experts' | 'deadlines' | 'audit_rbac' | 'moj_connector';

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
    category?: string;
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
    const { hearings, updateHearingStatus, addHearing, updateHearing, deleteHearing } = useCaseTask();
    
    // --- APP STATES ---
    const [activeTab, setActiveTab] = useState<TabType>('roll');
    const [viewMode, setViewMode] = useState<ViewMode>('timeline');
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    
    // Additional States for Court Roll Management CRUD & Calendars
    const [isHearingModalOpen, setIsHearingModalOpen] = useState(false);
    const [editingHearing, setEditingHearing] = useState<Hearing | null>(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [selectedHearingForDelete, setSelectedHearingForDelete] = useState<string | null>(null);
    const [customRangeStart, setCustomRangeStart] = useState<string>('2026-05-24');
    const [customRangeEnd, setCustomRangeEnd] = useState<string>('2026-06-05');

    // Audio Alert, Court Map & Drag-and-Drop States
    const [audioAlertsEnabled, setAudioAlertsEnabled] = useState<boolean>(true);
    const [selectedTone, setSelectedTone] = useState<string>('chime');
    const [audioVolume, setAudioVolume] = useState<number>(80);
    const [alertLeadMinutes, setAlertLeadMinutes] = useState<number>(15);
    const [isAudioSettingsOpen, setIsAudioSettingsOpen] = useState<boolean>(false);

    const [isCourtMapModalOpen, setIsCourtMapModalOpen] = useState<boolean>(false);
    const [selectedCourtNameModal, setSelectedCourtNameModal] = useState<string>('قصر العدل');
    const [draggedHearingId, setDraggedHearingId] = useState<string | null>(null);
    const [dropZoneHighlight, setDropZoneHighlight] = useState<string | null>(null);

    // Activity Log State for Drag-and-Drop Operations
    const [activityLogs, setActivityLogs] = useState<DocketActivityLogItem[]>([]);

    const playDocketChime = (overrideTone?: string, overrideVolume?: number) => {
        try {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const tone = overrideTone || selectedTone;
            const volPercent = overrideVolume !== undefined ? overrideVolume : audioVolume;
            const gainValue = Math.max(0.01, (volPercent / 100) * 0.35);

            if (tone === 'gavel') {
                [0, 0.16].forEach((delay) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(190, ctx.currentTime + delay);
                    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + delay + 0.12);
                    gain.gain.setValueAtTime(gainValue * 1.3, ctx.currentTime + delay);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.12);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(ctx.currentTime + delay);
                    osc.stop(ctx.currentTime + delay + 0.12);
                });
            } else if (tone === 'harp') {
                [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
                    const delay = idx * 0.07;
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
                    gain.gain.setValueAtTime(gainValue, ctx.currentTime + delay);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.35);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(ctx.currentTime + delay);
                    osc.stop(ctx.currentTime + delay + 0.35);
                });
            } else if (tone === 'urgent') {
                [0, 0.12, 0.24].forEach((delay) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(1046.5, ctx.currentTime + delay);
                    gain.gain.setValueAtTime(gainValue * 0.4, ctx.currentTime + delay);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.09);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(ctx.currentTime + delay);
                    osc.stop(ctx.currentTime + delay + 0.09);
                });
            } else {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(587.33, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.25);
                gain.gain.setValueAtTime(gainValue, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.45);
            }
        } catch (err) {
            console.error('Audio play error', err);
        }
    };

    // --- DRAG AND DROP & ACTIVITY LOG HANDLERS ---
    const handleDragAndDropStatusChange = (hearingId: string, newStatus: string) => {
        const targetEvent = allEvents.find(e => e.id === hearingId);
        const oldStatus = targetEvent?.status || 'Scheduled';

        if (oldStatus === newStatus) return;

        updateHearingStatus(hearingId, newStatus as any);

        const newLogItem: DocketActivityLogItem = {
            id: `draglog-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            timestamp: format(new Date(), 'HH:mm:ss'),
            hearingId: hearingId,
            caseTitle: targetEvent?.title || 'جلسة قضائية بالرول',
            oldStatus: oldStatus,
            newStatus: newStatus,
            actionType: 'status_change',
            performedBy: currentUserRole
        };

        setActivityLogs(prev => [newLogItem, ...prev]);
        addAuditLog(`سحب وإسقاط الجلسة (${targetEvent?.title || hearingId}) وتغيير حالتها من [${oldStatus}] إلى [${newStatus}]`);

        if (audioAlertsEnabled) playDocketChime();

        addToast({
            type: newStatus === 'Scheduled' ? 'success' : newStatus === 'Postponed' ? 'warning' : 'info',
            title: 'تحديث السحب والإسقاط 🎯',
            message: `تم نقل الجلسة إلى [${newStatus === 'Scheduled' ? 'جاهز للمرافعة' : newStatus === 'Postponed' ? 'مؤجلة' : 'تم الحضور'}] وتسجيلها بسجل النشاط.`
        });
    };

    const handleUndoLastDrag = () => {
        if (activityLogs.length === 0) return;
        const lastLog = activityLogs[0];
        handleUndoSpecificLog(lastLog.id);
    };

    const handleUndoSpecificLog = (logId: string) => {
        const logItem = activityLogs.find(l => l.id === logId);
        if (!logItem) return;

        updateHearingStatus(logItem.hearingId, logItem.oldStatus as any);
        setActivityLogs(prev => prev.filter(l => l.id !== logId));

        addAuditLog(`تراجع عن عملية السحب والإسقاط للجلسة (${logItem.caseTitle}) وإعادة حالتها لـ [${logItem.oldStatus}]`);

        if (audioAlertsEnabled) playDocketChime();

        addToast({
            type: 'info',
            title: '↩️ تم التراجع بنجاح (Undo)',
            message: `تم إعادة الجلسة (${logItem.caseTitle}) إلى حالتها السابقة [${logItem.oldStatus}].`
        });
    };
    const [hearingForm, setHearingForm] = useState<Partial<Hearing>>({
        caseId: '1',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        courtRoomOrLocation: 'قصر العدل قاعة 15',
        type: 'جلسة مرافعة كتابية',
        status: 'Scheduled',
        notes: '',
        courtDecision: ''
    } as any);

    // Filter controls for courts, lawyers, case types, and clients
    const [casetypeFilter, setCasetypeFilter] = useState<string>('all');
    const [clientFilterVal, setClientFilterVal] = useState<string>('all');

    // Filters & Search
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [courtFilter, setCourtFilter] = useState<string>('all');
    const [lawyerFilter, setLawyerFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedPreset, setSelectedPreset] = useState<string>('none');
    const [sortBy, setSortBy] = useState<string>('time-asc');
    
    // Expanded Record Rows State (Standard & Multi support)
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
    const [customWeights, setCustomWeights] = useState<Record<string, number>>({});
    
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

    // MOJ API Connector States
    const [mojAutomatedNo, setMojAutomatedNo] = useState('26198543');
    const [mojCaseNo, setMojCaseNo] = useState('1192/2026');
    const [mojYear, setMojYear] = useState('2026');
    const [mojCourt, setMojCourt] = useState('capital-total');
    const [isMojQuerying, setIsMojQuerying] = useState(false);
    const [mojQueryStep, setMojQueryStep] = useState(0);
    const [fetchedResults, setFetchedResults] = useState<any[]>([]);

    const handleMojQuery = () => {
        if (!mojAutomatedNo) {
            addToast({ type: 'error', title: 'حقل مطلوب', message: 'يرجى إدخال الرقم الآلي الموحد لغرض مطابقة الملف.' });
            return;
        }

        setIsMojQuerying(true);
        setMojQueryStep(0);
        setFetchedResults([]);

        // Staggered Steps Simulation
        setTimeout(() => {
            setMojQueryStep(1);
            setTimeout(() => {
                setMojQueryStep(2);
                setTimeout(() => {
                    setMojQueryStep(3);
                    setTimeout(() => {
                        setIsMojQuerying(false);
                        addToast({ type: 'success', title: 'تم جلب التحديثات', message: 'تم الربط ببوابة وزارة العدل وسحب الجلسات المتطابقة.' });
                        setFetchedResults([
                            {
                                automatedNo: mojAutomatedNo,
                                caseNumber: mojCaseNo || '1192/2026',
                                title: 'دعوى عمالية ضد مؤسسة الموانئ الكويتية',
                                courtName: mojCourt === 'capital-total' ? 'العاصمة الكلية' : 'محكمة الاستئناف',
                                circuit: 'العمالية الكلية - الدائرة الأولى',
                                mojStatus: 'نشطة - بانتظار الحكم',
                                localHearing: 'لا توجد جلسات مجدولة',
                                mojHearing: 'جلسة مرافعة مجدولة في 2026-08-14 بقاعة 102 (تقديم مذكرات ختامية)',
                                mojDate: '2026-08-14'
                            }
                        ]);
                    }, 1200);
                }, 1200);
            }, 1200);
        }, 1200);
    };

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

    // --- MOJ PORTAL LIVE SYNCHRONIZATION STATES ---
    const [isSyncing, setIsSyncing] = useState<boolean>(false);
    const [syncProgress, setSyncProgress] = useState<number>(0);
    const [syncStatus, setSyncStatus] = useState<string>('');
    const [lastSyncedAt, setLastSyncedAt] = useState<string>('لم تتم المزامنة الفورية اليوم بعد');

    // Live link simulation function to fetch sessions from Ministry of Justice Kuwait
    const handleMOJSync = () => {
        if (isSyncing) return;
        setIsSyncing(true);
        setSyncProgress(5);
        setSyncStatus('جاري تهيئة الاتصال المشفر بمخدم السجل المدني وبوابة وزارة العدل الكويتية (MOJ-SSL)...');
        
        const steps = [
            { p: 25, text: 'جاري التحقق من التوكيلات وتوافق الرقم الآلي الموحد في دولة الكويت...' },
            { p: 55, text: 'جاري جلب جدول الرول العام للدوائر التجارية، العمالية والأحوال الشخصية...' },
            { p: 80, text: 'جاري تحليل تعارض حضور المحامين ومقارنة نسب توافق لجان الخبراء...' },
            { p: 100, text: 'اكتمل الربط الإلكتروني بنجاح! جاري دمج جلسات الرول الآلي مع قواعد المكاتب...' }
        ];

        steps.forEach((step, index) => {
            setTimeout(() => {
                setSyncProgress(step.p);
                setSyncStatus(step.text);
                
                if (step.p === 100) {
                    setTimeout(() => {
                        setIsSyncing(false);
                        const nowString = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
                        setLastSyncedAt(nowString);
                        
                        // Inject 3 high-priority sessions that were "discovered" on MOJ portal
                        const fetchedHearings: Hearing[] = [
                            {
                                id: `h-moj-sync-1-${Date.now()}`,
                                caseId: '1',
                                caseTitle: 'دعوى بطلان طعن استئنافي وإلزام رد المدفوعات',
                                clientName: 'ناصر فهد العتيبي',
                                date: new Date().toISOString().split('T')[0],
                                time: '10:30',
                                courtRoomOrLocation: 'قصر العدل - الدائرة ٢٢ استئناف مستعجل الكبرى',
                                type: 'تقديم مستندات ودفاع صائب وتكليف خبير كويتي',
                                status: 'Scheduled',
                                notes: 'تم سحبها مباشرة عبر البوابة الآلية الموحدة لوزارة العدل.',
                                attendedBy: []
                            },
                            {
                                id: `h-moj-sync-2-${Date.now()}`,
                                caseId: '2',
                                caseTitle: 'دعوى شطب رهن عقاري مصطنع بقصر العاصمة',
                                clientName: 'شركة الأمل العقارية',
                                date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0],
                                time: '09:00',
                                courtRoomOrLocation: 'مجمع محاكم الرقعي - قاعة ٩ تجاري كلي',
                                type: 'تقديم المرافعة الختامية',
                                status: 'Scheduled',
                                notes: 'مستندة لقرارات لجنة تسوية المنازعات ومحاضر الخبراء.',
                                attendedBy: []
                            },
                            {
                                id: `h-moj-sync-3-${Date.now()}`,
                                caseId: '3',
                                caseTitle: 'تظلم إداري مالي لترسية مناقصات عامة',
                                clientName: 'مجموعة الأنوار للتجارة',
                                date: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split('T')[0],
                                time: '11:15',
                                courtRoomOrLocation: 'قصر العدل - الدائرة ٥ إداري تظلمات',
                                type: 'جلسة تمهيدية لتقديم الدفوع ومصادقة المستندات',
                                status: 'Scheduled',
                                notes: 'جلسة هامة تم جدولتها آلياً تحت الرقم الآلي من السجل القضائي الكويتي.',
                                attendedBy: []
                            }
                        ];

                        fetchedHearings.forEach(h => addHearing(h));
                        
                        addAuditLog('مزامنة ناجحة لكامل الرول والآليات القانونية المعتمدة من خوادم بوابة وزارة العدل الإلكترونية (Kuwait MOJ Gateway)');
                        addToast({
                            type: 'success',
                            title: 'اكتملت مزامنة الرول الآلي ⚡',
                            message: 'تم تحديث ٣ قضايا للجلسات والمواعيد عبر الاتصال المباشر بقصر العدل والمحاكم بنجاح.'
                        });
                    }, 400);
                }
            }, (index + 1) * 500);
        });
    };

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
                (e.rawSource.id && e.rawSource.id.toLowerCase().includes(query)) ||
                (e.circuit && e.circuit.toLowerCase().includes(query)) ||
                (e.lawyer && e.lawyer.toLowerCase().includes(query)) ||
                (e.client && e.client.toLowerCase().includes(query))
            );
        }

        // 2. Select Roll Type (The 25 court rolls mapping/logic)
        if (selectedCategory !== 'all') {
            if (selectedCategory === 'daily') {
                result = result.filter(e => e.date === '2026-05-30');
            } else if (selectedCategory === 'weekly') {
                result = result.filter(e => e.date >= '2026-05-24' && e.date <= '2026-05-31');
            } else if (selectedCategory === 'monthly') {
                result = result.filter(e => e.date.startsWith('2026-05'));
            } else if (selectedCategory === 'yearly') {
                result = result.filter(e => e.date.startsWith('2026'));
            } else if (selectedCategory === 'execution') {
                result = result.filter(e => e.title.includes('إخلاء') || e.title.includes('تنفيذ') || e.location.includes('تنفيذ'));
            } else if (selectedCategory === 'appeal') {
                result = result.filter(e => e.title.includes('استئناف') || e.location.includes('استئناف') || (e.circuit && e.circuit.includes('استئناف')));
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
                result = result.filter(e => e.date >= '2026-05-30' && e.status === 'Scheduled');
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
                result = result.filter(e => e.type === 'Appointment' && e.title.includes('إعلن'));
            } else if (selectedCategory === 'internal') {
                result = result.filter(e => e.type === 'Appointment' && e.location.includes('المكتب'));
            }
        }

        // 3. Dropdown Filters
        if (courtFilter !== 'all') {
            result = result.filter(e => e.location.includes(courtFilter));
        }
        if (lawyerFilter !== 'all') {
            result = result.filter(e => e.lawyer && (e.lawyer.includes(lawyerFilter) || (lawyerFilter === 'lawyer' && e.lawyer.includes('شطا')) || (lawyerFilter === 'associate' && e.lawyer.includes('الكندري'))));
        }
        if (statusFilter !== 'all') {
            result = result.filter(e => e.status === statusFilter);
        }
        if (casetypeFilter !== 'all') {
            result = result.filter(e => e.caseType === casetypeFilter);
        }
        if (clientFilterVal !== 'all') {
            result = result.filter(e => e.client && e.client.includes(clientFilterVal));
        }

        // 4. View mode timing overrides
        if (viewMode === 'day') {
            const dateStr = format(currentDate, 'yyyy-MM-dd');
            result = result.filter(e => e.date === dateStr);
        } else if (viewMode === 'week') {
            const startStr = format(startOfWeek(currentDate, { weekStartsOn: 0 }), 'yyyy-MM-dd');
            const endStr = format(endOfWeek(currentDate, { weekStartsOn: 0 }), 'yyyy-MM-dd');
            result = result.filter(e => e.date >= startStr && e.date <= endStr);
        } else if (viewMode === 'month') {
            const monthStr = format(currentDate, 'yyyy-MM');
            result = result.filter(e => e.date.startsWith(monthStr));
        } else if (viewMode === 'year') {
            const yearStr = format(currentDate, 'yyyy');
            result = result.filter(e => e.date.startsWith(yearStr));
        } else if (viewMode === 'date-range') {
            if (customRangeStart && customRangeEnd) {
                result = result.filter(e => e.date >= customRangeStart && e.date <= customRangeEnd);
            }
        }

        // Sort Map
        return result.sort((a, b) => {
            const timeA = new Date(`${a.date}T${a.time}`).getTime();
            const timeB = new Date(`${b.date}T${b.time}`).getTime();
            if (sortBy === 'custom-order') {
                const weightA = customWeights[a.id] || 0;
                const weightB = customWeights[b.id] || 0;
                if (weightB !== weightA) return weightB - weightA;
                return timeA - timeB;
            }
            if (sortBy === 'time-asc') return timeA - timeB;
            if (sortBy === 'time-desc') return timeB - timeA;
            if (sortBy === 'progress-desc') return (b.progress || 0) - (a.progress || 0);
            return 0;
        });

    }, [allEvents, searchQuery, selectedCategory, courtFilter, lawyerFilter, statusFilter, casetypeFilter, clientFilterVal, viewMode, currentDate, customRangeStart, customRangeEnd, sortBy, customWeights]);

    // KPI Counters (Dynamic stats for layout dashboard)
    const kpis = useMemo(() => {
        const todayStr = '2026-05-30';
        return {
            totalHearings: hearings.length,
            scheduledToday: hearings.filter(h => h.date === todayStr).length,
            scheduledThisWeek: hearings.filter(h => h.date >= '2026-05-24' && h.date <= '2026-05-31').length,
            scheduledThisMonth: hearings.filter(h => h.date.startsWith('2026-05')).length,
            upcomingCount: hearings.filter(h => h.date >= todayStr && h.status === 'Scheduled').length,
            totalPostponed: hearings.filter(h => h.status === 'Postponed').length,
            completedCount: hearings.filter(h => h.status === 'Completed').length,
            cancelledCount: hearings.filter(h => h.status === 'Cancelled').length,
            successRate: hearings.length ? Math.round((hearings.filter(h => h.status === 'Completed').length / hearings.length) * 100) : 0
        };
    }, [hearings]);

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

    // Reordering actions
    const moveEventUp = (eventId: string) => {
        setCustomWeights(prev => {
            const currentWeight = prev[eventId] || 0;
            return { ...prev, [eventId]: currentWeight + 1 };
        });
        addAuditLog(`إعادة ترتيب الحدث #${eventId} برفع أولويته بجدول الرول`);
        addToast({ type: 'info', title: 'تم تغيير الترتيب', message: 'تم رفع أولوية ترتيب السجل في القائمة.' });
    };

    const moveEventDown = (eventId: string) => {
        setCustomWeights(prev => {
            const currentWeight = prev[eventId] || 0;
            return { ...prev, [eventId]: currentWeight - 1 };
        });
        addAuditLog(`إعادة ترتيب الحدث #${eventId} بخفض أولويته بجدول الرول`);
        addToast({ type: 'info', title: 'تم تغيير الترتيب', message: 'تم خفض أولوية ترتيب السجل في القائمة.' });
    };

    // Collapse/Expand all
    const expandAllRows = () => {
        const nextExpanded: Record<string, boolean> = {};
        filteredEvents.forEach(e => {
            nextExpanded[e.id] = true;
        });
        setExpandedRows(nextExpanded);
        addAuditLog('تطبيق التوسيع الشامل لكامل الجلسات المرئية في الرول');
        addToast({ type: 'info', title: 'توسيع الكل', message: 'تم توسيع كامل تفاصيل الجلسات المسجلة.' });
    };

    const collapseAllRows = () => {
        setExpandedRows({});
        addAuditLog('تطبيق الطي الشامل والسرية لجدول الرول');
        addToast({ type: 'info', title: 'طي الكل', message: 'تم طي كامل تفاصيل الجلسات.' });
    };

    // Copy Content to clipboard
    const handleCopyEventContent = (event: ScheduleEvent) => {
        const content = `[رول القضائي الكويتي المحمي]
الحدث: ${event.type === 'Hearing' ? 'جلسة رول قضائي' : 'موعد إداري مكثف'}
العنوان: ${event.title}
الأطراف والموكل: ${event.subtitle}
المقر والقاعة: ${event.location}
التوقيت: يوم ${event.date} الساعة ${event.time}
الحالة والدائرة: ${event.status} | ${event.circuit || 'عام'}
الملاحظات والإجراءات: ${event.notes || 'بلا ملاحظات مضافة بالملف'}`;
        
        navigator.clipboard.writeText(content).then(() => {
            addAuditLog(`نسخ محتوى كارت الحدث #${event.id} للحافظة الإلكترونية`);
            addToast({ type: 'success', title: 'تم النسخ للحافظة 📋', message: 'تم نسخ تفاصيل الجلسة لتتمكن من مشاركتها بسهولة.' });
        }).catch(() => {
            addToast({ type: 'error', title: 'خطأ في النسخ', message: 'تعذر الوصول إلى الحافظة.' });
        });
    };

    // Submit Hearing (Add & Edit)
    const handleSubmitHearing = (e: React.FormEvent) => {
        e.preventDefault();
        const activeCase = initialCases.find(c => c.id === hearingForm.caseId) || initialCases[0];
        
        if (editingHearing) {
            const updated: Hearing = {
                ...editingHearing,
                caseId: hearingForm.caseId,
                caseTitle: hearingForm.caseTitle || activeCase.title,
                clientName: hearingForm.clientName || activeCase.clientName,
                date: hearingForm.date || new Date().toISOString().split('T')[0],
                time: hearingForm.time || '09:00',
                courtRoomOrLocation: hearingForm.courtRoomOrLocation || 'قصر العدل قاعة 15',
                type: hearingForm.type || 'جلسة مرافعة',
                status: (hearingForm.status as any) || 'Scheduled',
                notes: hearingForm.notes || '',
                courtDecision: hearingForm.courtDecision || '',
                attendedBy: editingHearing.attendedBy || []
            };
            updateHearing(updated);
            addAuditLog(`تعديل بيانات جلسة رول: ${updated.caseTitle} (${updated.id})`);
            addToast({ type: 'success', title: 'تم التعديل الكلي', message: 'تم حفظ كافة التحديثات لورقة الرول.' });
        } else {
            const randId = `h-docket-custom-${Date.now()}`;
            const newHearing: Hearing = {
                id: randId,
                caseId: hearingForm.caseId,
                caseTitle: hearingForm.caseTitle || activeCase.title,
                clientName: hearingForm.clientName || activeCase.clientName,
                date: hearingForm.date || new Date().toISOString().split('T')[0],
                time: hearingForm.time || '09:00',
                courtRoomOrLocation: hearingForm.courtRoomOrLocation || 'قصر العدل قاعة 15',
                type: hearingForm.type || 'جلسة مرافعة كتابية',
                status: 'Scheduled',
                notes: hearingForm.notes || '',
                courtDecision: '',
                attendedBy: []
            };
            addHearing(newHearing);
            addAuditLog(`إضافة وجدولة جلسة رول جديدة: ${newHearing.caseTitle}`);
            addToast({ type: 'success', title: 'تم تسجيل الجلسة', message: 'تم إدراج الجلسة بنجاح بنظام الرول الموحد.' });
        }
        setIsHearingModalOpen(false);
        setEditingHearing(null);
    };

    // Delete confirmation handler
    const handleConfirmDelete = () => {
        if (!selectedHearingForDelete) return;
        if (selectedHearingForDelete.startsWith('apt-')) {
            setAppointments(prev => prev.filter(a => a.id !== selectedHearingForDelete));
            addAuditLog(`حذف موعد إداري: ${selectedHearingForDelete}`);
        } else {
            deleteHearing(selectedHearingForDelete);
            addAuditLog(`حذف جلسة محكمة من الرول: ${selectedHearingForDelete}`);
        }
        setIsDeleteConfirmOpen(false);
        setSelectedHearingForDelete(null);
        addToast({ type: 'warning', title: 'تم الحذف', message: 'تم إرجاع وتطهير السجل من الرول بنجاح.' });
    };

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

    const handleExportCalendar = (event: any) => {
        const formatDate = (dateStr: string, timeStr: string, isEnd: boolean = false) => {
            if (!dateStr) {
                const d = new Date();
                if (isEnd) d.setHours(d.getHours() + 1);
                return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            }
            
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                const year = parts[0];
                const month = parts[1].padStart(2, '0');
                const day = parts[2].padStart(2, '0');
                
                let hourNum = 9;
                let minNum = 0;
                if (timeStr && timeStr.includes(':')) {
                    const tParts = timeStr.split(':');
                    hourNum = parseInt(tParts[0], 10) || 9;
                    minNum = parseInt(tParts[1], 10) || 0;
                }
                
                if (isEnd) {
                    hourNum += 1;
                }
                
                const hour = String(hourNum).padStart(2, '0');
                const min = String(minNum).padStart(2, '0');
                return `${year}${month}${day}T${hour}${min}00Z`;
            }
            
            try {
                const d = new Date(dateStr);
                if (isNaN(d.getTime())) {
                    const now = new Date();
                    if (isEnd) now.setHours(now.getHours() + 1);
                    return now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                }
                if (isEnd) d.setHours(d.getHours() + 1);
                return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            } catch (e) {
                const now = new Date();
                if (isEnd) now.setHours(now.getHours() + 1);
                return now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            }
        };

        const start = formatDate(event.date, event.time);
        const end = formatDate(event.date, event.time, true);

        const cleanDesc = `النوع: ${event.type === 'Hearing' ? 'جلسة محكمة' : 'موعد إداري'}\nالموكل: ${event.subtitle || event.client || 'غير محدد'}\nالدائرة القضائية: ${event.circuit || 'المكتب الرئيسي'}\nالمحامي المسؤول: ${event.lawyer || 'غير محدد'}\nالتفاصيل: ${event.notes || 'لا يوجد ملاحظات إضافية'}`
            .replace(/\n/g, '\\n')
            .replace(/,/g, '\\,')
            .replace(/;/g, '\\;');
            
        const cleanTitle = (event.title || '').replace(/,/g, '\\,').replace(/;/g, '\\;');
        const cleanLoc = (event.location || '').replace(/,/g, '\\,').replace(/;/g, '\\;');

        const icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Adala Law Firm//Calendar Export//EN',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'BEGIN:VEVENT',
            `UID:event-${event.id || 'export'}-${Math.random().toString(36).substr(2, 9)}@adala.com`,
            `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
            `DTSTART:${start}`,
            `DTEND:${end}`,
            `SUMMARY:جلسة/موعد: ${cleanTitle}`,
            `DESCRIPTION:${cleanDesc}`,
            cleanLoc ? `LOCATION:${cleanLoc}` : '',
            'STATUS:CONFIRMED',
            'SEQUENCE:0',
            'END:VEVENT',
            'END:VCALENDAR'
        ].filter(Boolean).join('\r\n');

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `event_${event.id || 'export'}.ics`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        addAuditLog(`تصدير ملف التقويم .ics للحدث #${event.id} بنجاح`);
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

            {/* HEADER DESIGN AREA - SLATE SYSTEM */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:20px_20px]" />
                <div className="absolute -top-12 -left-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 border-b border-slate-800 pb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-500/20 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                الرول الآلي وجدولة المحاكمات الذكية
                            </span>
                            <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-slate-700">
                                Slate Design System
                            </span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-1 text-white">
                            جدولة الجلسات والرول القضائي الموحد
                        </h1>
                        <p className="text-xs text-slate-400 font-medium max-w-2xl leading-relaxed">
                            متابعة وتنظيم رول اليوم، لجان الخبراء، والقرارات الإدارية في دولة الكويت بأسلوب عصري فائق البساطة والانسيابية.
                        </p>
                    </div>

                    {/* QUICK ACTIONS CENTER */}
                    <div className="flex flex-wrap gap-2.5 self-stretch sm:self-auto justify-end">
                        <Button 
                            onClick={() => {
                                setEditingHearing(null);
                                setHearingForm({
                                    caseId: '1',
                                    date: new Date().toISOString().split('T')[0],
                                    time: '09:00',
                                    courtRoomOrLocation: 'قصر العدل قاعة 15',
                                    type: 'جلسة مرافعة كتابية',
                                    status: 'Scheduled',
                                    notes: '',
                                    courtDecision: ''
                                });
                                setIsHearingModalOpen(true);
                            }}
                            variant="primary"
                            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black shadow-md shadow-emerald-500/20 text-xs px-4 py-2.5"
                            leftIcon={<PlusCircleIcon className="w-4 h-4" />}
                        >
                            + إضافة جلسة / موعد
                        </Button>
                        <Button 
                            disabled={isSyncing}
                            onClick={handleMOJSync}
                            variant="secondary"
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs px-4 py-2.5 font-bold"
                            leftIcon={<ArrowPathIcon className={`w-4 h-4 ${isSyncing ? 'animate-spin text-amber-400' : 'text-slate-300'}`} />}
                        >
                            {isSyncing ? 'جاري المزامنة...' : 'تحديث الرول (مزامنة بوابة العدل)'}
                        </Button>
                        <Button 
                            onClick={() => setIsReportModalOpen(true)} 
                            variant="secondary" 
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs px-3.5 py-2.5 font-bold"
                            leftIcon={<PrinterIcon className="w-4 h-4"/>}
                        >
                            طباعة الرول اليومي
                        </Button>
                        <Button 
                            onClick={triggerExcelMockExport} 
                            variant="secondary" 
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs px-3.5 py-2.5 font-bold"
                            leftIcon={<ArrowDownTrayIcon className="w-4 h-4"/>}
                        >
                            تصدير Excel
                        </Button>
                    </div>
                </div>

                {/* 3 CLEAN KPI INDICATORS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-4 border border-slate-700/60 flex items-center justify-between">
                        <div>
                            <span className="text-slate-400 text-xs font-bold block mb-1">📅 جلسات اليوم</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-emerald-400">{kpis.scheduledToday}</span>
                                <span className="text-[10px] text-slate-400 font-bold">جلسة مجدولة</span>
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <ClockIcon className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-4 border border-slate-700/60 flex items-center justify-between">
                        <div>
                            <span className="text-slate-400 text-xs font-bold block mb-1">🗓️ جلسات الأسبوع</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-amber-400">{kpis.scheduledThisWeek}</span>
                                <span className="text-[10px] text-slate-400 font-bold">جلسة خلال الأسبوع</span>
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                            <CalendarDaysIcon className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-4 border border-slate-700/60 flex items-center justify-between">
                        <div>
                            <span className="text-slate-400 text-xs font-bold block mb-1">⚖️ القضايا بانتظار القرار</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-indigo-400">
                                    {hearings.filter(h => h.status === 'Scheduled' || h.status === 'Postponed').length}
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold">قضية قيد المتابعة</span>
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <GavelIcon className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN NAVIGATION & TAB SYSTEM */}
            <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-wrap gap-1">
                <button 
                    onClick={() => setActiveTab('roll')}
                    className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black rounded-xl transition-all ${activeTab === 'roll' ? 'bg-slate-900 text-white shadow-sm dark:bg-emerald-500 dark:text-slate-950' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                    <GavelIcon className="w-4 h-4" /> الرول اليومي وجدول الجلسات
                </button>
                <button 
                    onClick={() => setActiveTab('roadmap')}
                    className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black rounded-xl transition-all ${activeTab === 'roadmap' ? 'bg-slate-900 text-white shadow-sm dark:bg-emerald-500 dark:text-slate-950' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                    <ScaleIcon className="w-4 h-4 text-emerald-400" /> الدليل الإجرائي الذكي للتقاضي (Roadmap)
                </button>
                <button 
                    onClick={() => setActiveTab('experts')}
                    className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black rounded-xl transition-all ${activeTab === 'experts' ? 'bg-slate-900 text-white shadow-sm dark:bg-emerald-500 dark:text-slate-950' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                    <UsersIcon className="w-4 h-4" /> جلسات الخبراء ولجان التحقيق ({expertMeetings.length})
                </button>
                <button 
                    onClick={() => setActiveTab('deadlines')}
                    className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black rounded-xl transition-all ${activeTab === 'deadlines' ? 'bg-slate-900 text-white shadow-sm dark:bg-emerald-500 dark:text-slate-950' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                    <CalculatorIcon className="w-4 h-4" /> حاسبة المواعيد الإجرائية
                </button>
                <button 
                    onClick={() => setActiveTab('audit_rbac')}
                    className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black rounded-xl transition-all ${activeTab === 'audit_rbac' ? 'bg-slate-900 text-white shadow-sm dark:bg-emerald-500 dark:text-slate-950' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                    <ShieldCheckIcon className="w-4 h-4" /> سجل التعديلات والرقابة
                </button>
                <button 
                    onClick={() => setActiveTab('moj_connector')}
                    className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black rounded-xl transition-all ${activeTab === 'moj_connector' ? 'bg-amber-600 text-white shadow-sm' : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30'}`}
                >
                    <ArrowPathIcon className="w-4 h-4 animate-pulse" /> بوابة ربط وزارة العدل (API MOJ)
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
                        className="space-y-5 text-right"
                    >
                        {/* AI TASK BAR FOR NATURAL LANGUAGE DOCKETING */}
                        <AiTaskBar 
                            onParseAndFill={(parsed) => {
                                setHearingForm(prev => ({ ...prev, ...parsed }));
                                setIsHearingModalOpen(true);
                            }} 
                        />

                        {/* AUDIO ALERTS CONTROL & STATUS DROP TARGETS BAR */}
                        <div className="bg-slate-900 text-white dark:bg-slate-800/90 p-3.5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border border-slate-800 shadow-xs">
                            {/* Audio Alerts Toggle & Chime Test Button */}
                            <div className="flex flex-wrap items-center gap-3">
                                <label className="flex items-center gap-2 cursor-pointer bg-slate-800/80 dark:bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700">
                                    <input 
                                        type="checkbox" 
                                        checked={audioAlertsEnabled}
                                        onChange={(e) => {
                                            setAudioAlertsEnabled(e.target.checked);
                                            if (e.target.checked) playDocketChime();
                                            addToast({
                                                type: 'info',
                                                title: e.target.checked ? 'تم تفعيل التنبيهات الصوتية 🔊' : 'تم تعطيل التنبيهات الصوتية 🔇',
                                                message: e.target.checked ? 'سيتم إصدار تنبيه صوتي قبل موعد الجلسة بـ 15 دقيقة.' : 'تنبيهات الصوت متوقفة حالياً.'
                                            });
                                        }}
                                        className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                                    />
                                    <span className="text-xs font-black text-slate-200">
                                        {audioAlertsEnabled ? '🔊 تنبيهات الجلسات الصوتية (قبل 15 دقيقة): مفعّلة' : '🔇 تنبيهات الصوت: معطلة'}
                                    </span>
                                </label>

                                <Button 
                                    variant="secondary" 
                                    size="sm" 
                                    onClick={() => {
                                        playDocketChime();
                                        addToast({ type: 'success', title: '🔊 تجربة الصوت', message: 'تم تشغيل التنبيه الصوتي بنجاح!' });
                                    }}
                                    className="text-[11px] font-bold py-1 px-3 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30"
                                >
                                    🔔 تجربة النغمة
                                </Button>

                                <Button 
                                    variant="secondary" 
                                    size="sm" 
                                    onClick={() => setIsAudioSettingsOpen(true)}
                                    className="text-[11px] font-bold py-1 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                >
                                    ⚙️ إعدادات نغمة التنبيه
                                </Button>
                            </div>

                            {/* Drag & Drop Quick Status Zones */}
                            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                                <span className="text-[10px] text-slate-400 font-bold shrink-0">🎯 منطقة سحب وإسقاط الجلسات:</span>
                                <div 
                                    onDragOver={(e) => { e.preventDefault(); setDropZoneHighlight('Scheduled'); }}
                                    onDragLeave={() => setDropZoneHighlight(null)}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        const id = e.dataTransfer.getData('text/plain') || draggedHearingId;
                                        if (id) {
                                            handleDragAndDropStatusChange(id, 'Scheduled');
                                        }
                                        setDropZoneHighlight(null);
                                    }}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border ${dropZoneHighlight === 'Scheduled' ? 'bg-emerald-500 text-slate-950 border-emerald-400 scale-105 shadow-md' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}
                                >
                                    🟢 جاهز للمرافعة
                                </div>

                                <div 
                                    onDragOver={(e) => { e.preventDefault(); setDropZoneHighlight('Postponed'); }}
                                    onDragLeave={() => setDropZoneHighlight(null)}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        const id = e.dataTransfer.getData('text/plain') || draggedHearingId;
                                        if (id) {
                                            handleDragAndDropStatusChange(id, 'Postponed');
                                        }
                                        setDropZoneHighlight(null);
                                    }}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border ${dropZoneHighlight === 'Postponed' ? 'bg-amber-500 text-slate-950 border-amber-400 scale-105 shadow-md' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}
                                >
                                    🟡 مؤجلة
                                </div>

                                <div 
                                    onDragOver={(e) => { e.preventDefault(); setDropZoneHighlight('Completed'); }}
                                    onDragLeave={() => setDropZoneHighlight(null)}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        const id = e.dataTransfer.getData('text/plain') || draggedHearingId;
                                        if (id) {
                                            handleDragAndDropStatusChange(id, 'Completed');
                                        }
                                        setDropZoneHighlight(null);
                                    }}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border ${dropZoneHighlight === 'Completed' ? 'bg-blue-500 text-white border-blue-400 scale-105 shadow-md' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'}`}
                                >
                                    🔵 تم الحضور
                                </div>
                            </div>
                        </div>
                        
                        {/* QUICK TIMEFRAME & ROLL SWITCHER HEADER */}
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                            
                            {/* TOP BAR: TIMEFRAMES & ROLL TYPES */}
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                                
                                {/* Timeframe Switcher (النطاق الزمني) */}
                                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl overflow-x-auto w-full lg:w-auto">
                                    <span className="text-[10px] text-slate-500 font-black px-2.5 shrink-0">النطاق الزمني:</span>
                                    <button 
                                        onClick={() => { setViewMode('day'); addAuditLog('استعراض رول اليوم'); }}
                                        className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 ${viewMode === 'day' ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}`}
                                    >
                                        📅 رول اليوم
                                    </button>
                                    <button 
                                        onClick={() => { setViewMode('week'); addAuditLog('استعراض رول الأسبوع'); }}
                                        className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 ${viewMode === 'week' ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}`}
                                    >
                                        🗓️ رول الأسبوع
                                    </button>
                                    <button 
                                        onClick={() => { setViewMode('month'); addAuditLog('استعراض رول الشهر'); }}
                                        className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 ${viewMode === 'month' ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}`}
                                    >
                                        📆 رول الشهر
                                    </button>
                                    <button 
                                        onClick={() => { setViewMode('date-range'); addAuditLog('تصفح نطاق زمني مخصص'); }}
                                        className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 ${viewMode === 'date-range' ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}`}
                                    >
                                        ⏱️ نطاق مخصص
                                    </button>
                                </div>

                                {/* Roll Category Tabs (أنواع الرول) */}
                                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/60 p-1 rounded-2xl overflow-x-auto w-full lg:w-auto border border-slate-200 dark:border-slate-700">
                                    <button
                                        onClick={() => setSelectedCategory('sessions')}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 ${selectedCategory === 'sessions' || selectedCategory === 'all' ? 'bg-emerald-500 text-slate-950 shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60'}`}
                                    >
                                        ⚖️ رول الجلسات
                                    </button>
                                    <button
                                        onClick={() => setSelectedCategory('experts')}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 ${selectedCategory === 'experts' ? 'bg-emerald-500 text-slate-950 shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60'}`}
                                    >
                                        👥 رول الخبراء
                                    </button>
                                    <button
                                        onClick={() => setSelectedCategory('announcements')}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 ${selectedCategory === 'announcements' ? 'bg-emerald-500 text-slate-950 shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60'}`}
                                    >
                                        📋 رول القرارات والإعلانات
                                    </button>
                                    <button
                                        onClick={() => setSelectedCategory('execution')}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 ${selectedCategory === 'execution' ? 'bg-emerald-500 text-slate-950 shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60'}`}
                                    >
                                        🏛️ رول التنفيذ
                                    </button>
                                </div>

                            </div>

                            {/* CUSTOM DATE RANGE SELECTOR POPUP IF SELECTED */}
                            {viewMode === 'date-range' && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs"
                                >
                                    <div>
                                        <label className="text-[10px] text-slate-500 font-black block mb-1">من تاريخ:</label>
                                        <input 
                                            type="date" 
                                            value={customRangeStart}
                                            onChange={(e) => setCustomRangeStart(e.target.value)}
                                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2 w-full font-bold outline-none text-slate-800 dark:text-slate-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-500 font-black block mb-1">إلى تاريخ:</label>
                                        <input 
                                            type="date" 
                                            value={customRangeEnd}
                                            onChange={(e) => setCustomRangeEnd(e.target.value)}
                                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2 w-full font-bold outline-none text-slate-800 dark:text-slate-200"
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {/* SMART UNIFIED SEARCH & ESSENTIAL FILTERS BAR */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                                
                                {/* Unified Search Bar */}
                                <div className="md:col-span-5 relative">
                                    <input 
                                        type="text"
                                        placeholder="🔍 بحث موحد: رقم القضية، الموكل، الخصم، المحكمة، المحامي..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pr-3 pl-8 font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/40"
                                    />
                                    {searchQuery && (
                                        <button 
                                            onClick={() => setSearchQuery('')}
                                            className="absolute left-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>

                                {/* Court Dropdown */}
                                <div className="md:col-span-3">
                                    <select 
                                        value={courtFilter} 
                                        onChange={(e) => setCourtFilter(e.target.value)}
                                        className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold outline-none rounded-xl py-2.5 px-3"
                                    >
                                        <option value="all">كل المحاكم</option>
                                        <option value="قصر العدل">قصر العدل (العاصمة)</option>
                                        <option value="الرقعي">مجمع محاكم الرقعي</option>
                                        <option value="حولي">مجمع محاكم حولي</option>
                                        <option value="الفروانية">مجمع محاكم الفروانية</option>
                                        <option value="الأحمدي">مجمع محاكم الأحمدي</option>
                                        <option value="المكتب">المكتب الرئيسي</option>
                                    </select>
                                </div>

                                {/* Lawyer Dropdown */}
                                <div className="md:col-span-2">
                                    <select
                                        value={lawyerFilter}
                                        onChange={(e) => setLawyerFilter(e.target.value)}
                                        className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold outline-none rounded-xl py-2.5 px-3"
                                    >
                                        <option value="all">كل المحامين</option>
                                        <option value="شطا">أ. صبري شطا</option>
                                        <option value="الأنصاري">أ. أحمد الأنصاري</option>
                                        <option value="الكندري">أ. فاطمة الكندري</option>
                                        <option value="العتيبي">أ. مريم العتيبي</option>
                                    </select>
                                </div>

                                {/* Session Status Dropdown */}
                                <div className="md:col-span-2">
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold outline-none rounded-xl py-2.5 px-3"
                                    >
                                        <option value="all">كل الحالات</option>
                                        <option value="Scheduled">مجدولة / جاهز</option>
                                        <option value="Completed">منتهية / مكتملة</option>
                                        <option value="Postponed">مؤجلة</option>
                                        <option value="Cancelled">ملغاة</option>
                                    </select>
                                </div>

                            </div>
                        </div>

                        {/* CLEAN SLATE SESSION CARDS & ACCORDION TABLE VIEW */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-right">
                            
                            {/* Bar Controls Header */}
                            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-slate-50/60 dark:bg-slate-800/40">
                                <div>
                                    <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                        <span>جدول الرول الكرونولوجي الجاري</span>
                                        <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold px-2 py-0.5 rounded-full">
                                            {filteredEvents.length} جلسة
                                        </span>
                                    </h3>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button 
                                        type="button"
                                        onClick={expandAllRows}
                                        className="text-[10px] bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-xl font-bold transition-all"
                                    >
                                        توسيع الكل ↓
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={collapseAllRows}
                                        className="text-[10px] bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-xl font-bold transition-all"
                                    >
                                        طي الكل ↑
                                    </button>
                                </div>
                            </div>

                            {/* LIST CONTENT */}
                            {filteredEvents.length === 0 ? (
                                <div className="text-center py-16 px-4">
                                    <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <GavelIcon className="w-7 h-7 text-slate-400" />
                                    </div>
                                    <h4 className="text-xs font-black text-slate-700 dark:text-slate-300">لا توجد جلسات مطابقة لخيارات البحث</h4>
                                    <p className="text-[10px] text-slate-400 mt-1">جرب تغيير الفلاتر أو تحديد نطاق زمني مختلف.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {filteredEvents.map((event) => {
                                        const isExpanded = expandedRow === event.id || !!expandedRows[event.id];
                                        return (
                                            <div 
                                                key={event.id} 
                                                draggable={true}
                                                onDragStart={(e) => {
                                                    e.dataTransfer.setData('text/plain', event.id);
                                                    setDraggedHearingId(event.id);
                                                }}
                                                className={`transition-all hover:bg-slate-50/80 dark:hover:bg-slate-800/50 ${draggedHearingId === event.id ? 'opacity-50 border-2 border-dashed border-emerald-500 bg-emerald-50/30' : ''}`}
                                            >
                                                
                                                {/* ROW ITEM HEADER SUMMARY */}
                                                <div 
                                                    className="p-4 md:p-5 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 cursor-pointer"
                                                    onClick={() => {
                                                        setExpandedRow(isExpanded ? null : event.id);
                                                        setExpandedRows(prev => ({ ...prev, [event.id]: !isExpanded }));
                                                    }}
                                                >
                                                    {/* Left/Right Main Info */}
                                                    <div className="flex items-start gap-3">
                                                        
                                                        {/* Drag Handle & Time/Room Badge */}
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-slate-400 hover:text-slate-600 font-mono text-xs cursor-grab active:cursor-grabbing px-1" title="اسحب الجلسة لتغيير حالتها">
                                                                ⋮⋮
                                                            </span>
                                                            <div className="text-center py-2 px-3 bg-slate-900 text-white dark:bg-slate-800 dark:text-emerald-400 rounded-2xl shrink-0 min-w-[90px]">
                                                                <span className="block text-xs font-black font-mono">{event.time}</span>
                                                                <span className="text-[9px] text-slate-300 dark:text-slate-400 block mt-0.5 font-bold">
                                                                    {event.location.includes('قاعة') ? event.location.split('قاعة')[1] ? `قاعة ${event.location.split('قاعة')[1]}` : event.location : event.location}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Details Stack */}
                                                        <div className="space-y-1">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                {/* Case Number & Circuit */}
                                                                <span className="text-xs font-black text-slate-900 dark:text-white">
                                                                    {event.title}
                                                                </span>
                                                                {event.circuit && (
                                                                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold px-2 py-0.5 rounded-md">
                                                                        {event.circuit}
                                                                    </span>
                                                                )}
                                                                
                                                                {/* Court Location Interactive Map Trigger */}
                                                                <button 
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setSelectedCourtNameModal(event.location);
                                                                        setIsCourtMapModalOpen(true);
                                                                    }}
                                                                    className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-lg transition-all"
                                                                    title="عرض موقع المحكمة والتوجيه الملاحي على الخريطة التفاعلية"
                                                                >
                                                                    <MapPinIcon className="w-3 h-3 text-emerald-500" />
                                                                    <span>📍 الخريطة والوصول ({event.location.split(' ')[0]})</span>
                                                                </button>
                                                            </div>

                                                            {/* Parties: Client vs Opponent */}
                                                            <div className="text-xs text-slate-600 dark:text-slate-400 font-bold flex flex-wrap items-center gap-2">
                                                                <span>👤 الموكل: <strong className="text-slate-800 dark:text-slate-200">{event.subtitle || 'غير محدد'}</strong></span>
                                                                {event.opponents && (
                                                                    <span>• الخصم: <strong className="text-slate-700 dark:text-slate-300">{event.opponents}</strong></span>
                                                                )}
                                                            </div>

                                                            {/* Required Action / Previous Decision */}
                                                            {event.notes && (
                                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium line-clamp-1 mt-1">
                                                                    📌 <strong className="text-slate-700 dark:text-slate-300">الإجراء المطلوب / قرار الجلسة:</strong> {event.notes}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Right Side Info: Lawyer, Status & Actions */}
                                                    <div className="flex flex-wrap items-center gap-3 xl:ms-auto shrink-0" onClick={(e) => e.stopPropagation()}>
                                                        
                                                        {/* Lawyer Badge */}
                                                        <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-xl text-right">
                                                            <span className="text-[9px] text-slate-400 block font-bold">المحامي المكلف</span>
                                                            <span className="text-[11px] font-black text-slate-800 dark:text-slate-200">
                                                                👨‍⚖️ {event.lawyer || 'أ. صبري شطا'}
                                                            </span>
                                                        </div>

                                                        {/* Status Badge */}
                                                        <div>
                                                            <span className={`inline-block text-xs font-extrabold px-3 py-1.5 rounded-xl ${
                                                                event.status === 'Completed' || event.status === 'منتهية' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400' :
                                                                event.status === 'Postponed' || event.status === 'مؤجلة' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400' :
                                                                'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                                                            }`}>
                                                                {event.status === 'Scheduled' ? 'جاهز للمرافعة' : event.status === 'Completed' ? 'تم الحضور' : event.status === 'Postponed' ? 'مؤجل' : event.status}
                                                            </span>
                                                        </div>

                                                        {/* Accordion Expand Arrow Toggle */}
                                                        <button 
                                                            onClick={() => {
                                                                setExpandedRow(isExpanded ? null : event.id);
                                                                setExpandedRows(prev => ({ ...prev, [event.id]: !isExpanded }));
                                                            }}
                                                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition-colors"
                                                            title={isExpanded ? 'طي التفاصيل' : 'توسيع التفاصيل'}
                                                        >
                                                            <svg className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </button>

                                                    </div>

                                                </div>

                                                {/* ACCORDION EXPANDED PANEL IN-PLACE */}
                                                <AnimatePresence>
                                                    {isExpanded && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="overflow-hidden bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800"
                                                        >
                                                            <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-5 text-xs text-right">
                                                                
                                                                {/* Col 1: File Status, Client Info & Court Level */}
                                                                <div className="space-y-3">
                                                                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5 text-slate-700 dark:text-slate-300">
                                                                        <div className="flex justify-between items-center border-b pb-2">
                                                                            <h5 className="font-black text-slate-900 dark:text-white text-xs">تفاصيل الملف والموكل</h5>
                                                                            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black px-2 py-0.5 rounded-full border border-emerald-500/20">
                                                                                حالة الملف: جاري المتابعة
                                                                            </span>
                                                                        </div>
                                                                        <p className="flex items-center justify-between">
                                                                            <span><strong>👤 اسم الموكل:</strong> {event.subtitle || 'غير محدد'}</span>
                                                                            <span className="text-[10px] font-mono font-bold text-slate-500">📱 +965 9988 7766</span>
                                                                        </p>
                                                                        <p><strong>🏛️ المقر والمحكمة:</strong> {event.location}</p>
                                                                        <p><strong>⚖️ الدائرة والدرجة:</strong> {event.circuit || 'المحكمة الكلية'} - {event.caseType || 'مدني وتجاري'}</p>
                                                                        <p><strong>👤 الخصم وممثلوه:</strong> {event.opponents || 'لا يوجد بيانات مضافة'}</p>
                                                                        <p><strong>📅 موعد الجلسة:</strong> {event.date} الساعة {event.time}</p>
                                                                    </div>

                                                                    <div className="flex flex-wrap gap-2">
                                                                        {event.type === 'Hearing' && event.status !== 'Completed' && (
                                                                            <Button 
                                                                                size="sm" 
                                                                                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black"
                                                                                onClick={() => {
                                                                                    updateHearingStatus(event.id, 'Completed');
                                                                                    addAuditLog(`تحديث حالة حضور جلسة #${event.id} إلى مكتملة`);
                                                                                    addToast({ type: 'success', title: 'تم التحديث', message: 'اكتملت الجلسة وصدر إشعار الأتمتة الإجرائي.' });
                                                                                }}
                                                                            >
                                                                                تأكيد الحضور وانقضاء الجلسة
                                                                            </Button>
                                                                        )}
                                                                        <Button 
                                                                            size="sm" 
                                                                            variant="outline"
                                                                            className="border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200"
                                                                            onClick={() => handleExportCalendar(event)}
                                                                        >
                                                                            <CalendarDaysIcon className="w-3.5 h-3.5" /> تصدير للتقويم
                                                                        </Button>
                                                                        <Button 
                                                                            size="sm" 
                                                                            variant="outline"
                                                                            className="border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200"
                                                                            onClick={() => handleCopyEventContent(event)}
                                                                        >
                                                                            📋 نسخ المحتوى
                                                                        </Button>
                                                                        <Button 
                                                                            size="sm" 
                                                                            variant="outline"
                                                                            className="border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-400"
                                                                            onClick={() => {
                                                                                if (event.type === 'Hearing') {
                                                                                    setEditingHearing(event.rawSource as Hearing);
                                                                                    setHearingForm({ ...event.rawSource } as any);
                                                                                    setIsHearingModalOpen(true);
                                                                                }
                                                                            }}
                                                                        >
                                                                            تعديل
                                                                        </Button>
                                                                    </div>
                                                                </div>

                                                                {/* Col 2: Lawyer Notes & Defense Memorandum Editor */}
                                                                <div className="space-y-3">
                                                                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                                                                        <div className="flex justify-between items-center mb-1">
                                                                            <h5 className="font-black text-slate-800 dark:text-white flex items-center gap-1.5 text-xs">
                                                                                <ScaleIcon className="w-4 h-4 text-emerald-500" /> ملاحظات المحامي والدفوع الإجرائية
                                                                            </h5>
                                                                            <span className="text-[10px] text-emerald-600 font-bold">تحديث فوري</span>
                                                                        </div>
                                                                        <textarea 
                                                                            value={memos[event.id] !== undefined ? memos[event.id] : event.notes || ''}
                                                                            onChange={(e) => setMemos({ ...memos, [event.id]: e.target.value })}
                                                                            placeholder="سجل هنا ملاحظات المحامي، الطلبات الختامية وملاحظات المرافعة الشفهية..."
                                                                            rows={4}
                                                                            className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500"
                                                                        />
                                                                        <div className="flex justify-end gap-2 mt-2">
                                                                            <Button 
                                                                                size="sm" 
                                                                                onClick={() => handleSaveMemoText(event.id, memos[event.id] || '')}
                                                                                className="bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 font-bold text-xs"
                                                                            >
                                                                                حفظ ملاحظات المحامي
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Col 3: Session Attachments / Files */}
                                                                <div className="space-y-3">
                                                                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                                                                        <h5 className="font-black text-slate-800 dark:text-white mb-2 flex items-center justify-between text-xs">
                                                                            <span>الأرشيف والمستندات المرفقة</span>
                                                                            <span className="text-[9px] text-slate-400">سعة سحابية مؤمنة</span>
                                                                        </h5>
                                                                        
                                                                        <div className="space-y-2 max-h-[110px] overflow-y-auto">
                                                                            {(attachments[event.id] || []).length === 0 ? (
                                                                                <span className="text-[10px] text-slate-400 italic block text-center py-4">لا توجد وثائق معلنة بالجلسة حتى الآن</span>
                                                                            ) : (
                                                                                (attachments[event.id] || []).map((file, fIdx) => (
                                                                                    <div key={fIdx} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-between text-xs">
                                                                                        <span className="truncate max-w-[150px] font-bold text-slate-700 dark:text-slate-300">{file.title}</span>
                                                                                        <span className="text-[9px] text-emerald-600 font-mono font-bold">{file.size}</span>
                                                                                    </div>
                                                                                ))
                                                                            )}
                                                                        </div>

                                                                        <div 
                                                                            onClick={() => handleAddMockFile(event.id, event.type === 'Hearing' ? 'مذكرة' : 'مستمسك')}
                                                                            className="mt-3 py-2.5 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-center cursor-pointer hover:border-emerald-500 transition-all bg-slate-50/50 dark:bg-slate-800/50"
                                                                        >
                                                                            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 block">+ إضافة وثيقة / محضر للجلسة</span>
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

                    </motion.div>
                )}

                {/* TAB 2: SMART PROCEDURAL ROADMAP */}
                {activeTab === 'roadmap' && (
                    <motion.div
                        key="roadmap"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                    >
                        <SmartProceduralRoadmap />
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

                {/* TAB 5: KUWAIT MINISTRY OF JUSTICE AUTOMATED API CONNECTOR */}
                {activeTab === 'moj_connector' && (
                    <motion.div 
                        key="moj_connector"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="space-y-6 text-right"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            
                            {/* Connector Configuration Panel */}
                            <div className="lg:col-span-4 bg-white dark:bg-dm-card p-6 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm space-y-4">
                                <div className="border-b pb-3 flex items-center gap-2">
                                    <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
                                        <ArrowPathIcon className="w-5 h-5 animate-spin-slow" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-sm text-slate-800 dark:text-gray-200">إعدادات أداة المزامنة والربط القضائي</h3>
                                        <p className="text-[10px] text-gray-400 font-bold">بوابة الخدمات الإلكترونية الموحدة - وزارة العدل بدولة الكويت</p>
                                    </div>
                                </div>

                                <div className="space-y-3 text-xs font-bold">
                                    <div>
                                        <label className="text-[10px] text-slate-500 block mb-1 font-sans">الرقم الآلي الموحد للقضية (Automated No)*</label>
                                        <input 
                                            type="text" 
                                            value={mojAutomatedNo}
                                            onChange={(e) => setMojAutomatedNo(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-850 dark:border-slate-750 rounded-xl p-3 font-mono font-bold"
                                            placeholder="أدخل الرقم الآلي المكون من 8 أرقام"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] text-slate-500 block mb-1 font-sans">رقم القضية في الجدول (Case Number)</label>
                                        <input 
                                            type="text" 
                                            value={mojCaseNo}
                                            onChange={(e) => setMojCaseNo(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-850 dark:border-slate-750 rounded-xl p-3 font-mono font-bold"
                                            placeholder="مثال: 1192/2026"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] text-slate-500 block mb-1">سنة تسجيل الدعوى</label>
                                            <select 
                                                value={mojYear}
                                                onChange={(e) => setMojYear(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-850 dark:border-slate-750 rounded-xl p-3 font-bold"
                                            >
                                                <option value="2026">2026</option>
                                                <option value="2025">2025</option>
                                                <option value="2024">2024</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-slate-500 block mb-1">المحكمة المختصة</label>
                                            <select 
                                                value={mojCourt}
                                                onChange={(e) => setMojCourt(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-850 dark:border-slate-750 rounded-xl p-3 font-bold"
                                            >
                                                <option value="capital-total">العاصمة الكلية</option>
                                                <option value="appeal">محكمة الاستئناف</option>
                                                <option value="hawalli">حولي الكلية</option>
                                                <option value="farwaniya">الفروانية</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl space-y-1 border border-slate-100 text-slate-500 text-[10px] leading-relaxed">
                                        <span className="font-extrabold text-slate-800 dark:text-gray-200 block">بروتوكول الربط الأمني الآمن:</span>
                                        <p>• يتم الاتصال عبر واجهة برمجية مشفرة ببروتوكول HTTPS وتخطي جدران الحماية لوزارة العدل الكويتية.</p>
                                        <p>• مطابقة ذكية للخصوم لضمان عدم حدوث تشابه أسماء أو تكرار بالرول.</p>
                                    </div>

                                    <Button 
                                        fullWidth 
                                        onClick={handleMojQuery}
                                        disabled={isMojQuerying}
                                        className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold py-3.5 rounded-xl text-xs gap-2 shadow-lg shadow-amber-600/10"
                                    >
                                        {isMojQuerying ? 'جاري الاتصال وسحب البيانات...' : 'تشغيل استعلام والربط بالبوابة'}
                                    </Button>
                                </div>
                            </div>

                            {/* Main Gateway Status & Query Results */}
                            <div className="lg:col-span-8 space-y-6">
                                
                                {/* Live fetch steps simulator */}
                                {isMojQuerying && (
                                    <div className="bg-white dark:bg-dm-card p-6 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm space-y-4 text-xs font-bold">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-black text-amber-600 flex items-center gap-2">
                                                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                                جاري المزامنة النشطة مع بوابة وزارة العدل...
                                            </span>
                                            <span className="font-mono text-xs text-gray-400">الخطوة {mojQueryStep + 1} من 4</span>
                                        </div>

                                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                                            <div 
                                                className="bg-amber-600 h-full transition-all duration-500" 
                                                style={{ width: `${(mojQueryStep + 1) * 25}%` }}
                                            />
                                        </div>

                                        <div className="space-y-2 text-xs font-bold font-sans">
                                            <div className={`flex items-center gap-2.5 p-2.5 rounded-xl transition-all ${mojQueryStep >= 0 ? 'text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/10' : 'text-slate-400'}`}>
                                                <span className="w-2 h-2 rounded-full bg-current" />
                                                <span>جاري تأمين ممر البيانات مع البوابة الإلكترونية لوزارة العدل الكويتية (Kuwait MOJ Gateway)...</span>
                                            </div>
                                            <div className={`flex items-center gap-2.5 p-2.5 rounded-xl transition-all ${mojQueryStep >= 1 ? 'text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/10' : 'text-slate-400'}`}>
                                                <span className="w-2 h-2 rounded-full bg-current" />
                                                <span>التحقق من صحة الرقم الآلي وتخطي بروتوكول حماية البوابة الحكومية المانعة للروبوتات...</span>
                                            </div>
                                            <div className={`flex items-center gap-2.5 p-2.5 rounded-xl transition-all ${mojQueryStep >= 2 ? 'text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/10' : 'text-slate-400'}`}>
                                                <span className="w-2 h-2 rounded-full bg-current" />
                                                <span>مطابقة رول الجلسات المنعقدة وسحب محاضر القرار والدائرة القضائية الحالية...</span>
                                            </div>
                                            <div className={`flex items-center gap-2.5 p-2.5 rounded-xl transition-all ${mojQueryStep >= 3 ? 'text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/10' : 'text-slate-400'}`}>
                                                <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                                                <span>نجاح الاتصال! تم جلب وتصفية البيانات بخصوص الدعاوى القضائية المستعلمة.</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Results Showcase */}
                                {!isMojQuerying && fetchedResults.length === 0 && (
                                    <div className="bg-slate-50 dark:bg-dm-card/30 rounded-3xl p-12 border-2 border-dashed border-gray-200 dark:border-gray-800 text-center flex flex-col items-center justify-center space-y-3">
                                        <div className="p-4 bg-amber-500/10 text-amber-600 rounded-full">
                                            <ArrowPathIcon className="w-8 h-8" />
                                        </div>
                                        <h3 className="font-black text-base text-slate-800 dark:text-gray-200">جاهز لبدء ربط البيانات الآلي بوزارة العدل</h3>
                                        <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                                            أدخل الرقم الآلي أو رقم القضية للقضايا المسجلة بدولة الكويت واضغط على تشغيل الاستعلام لجلب الجلسات والمواعيد والقرارات الصادرة فورياً من بوابة العدل.
                                        </p>
                                    </div>
                                )}

                                {!isMojQuerying && fetchedResults.length > 0 && (
                                    <div className="space-y-4">
                                        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 rounded-2xl p-4 flex justify-between items-center text-xs">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                                                <span className="font-black text-emerald-800 dark:text-emerald-300">تم جلب تحديثات رسمية جديدة ومتطابقة للدعاوى المستعلمة بنجاح!</span>
                                            </div>
                                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100/50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-md">موثق ومطابق للبوابة</span>
                                        </div>

                                        <div className="space-y-3">
                                            {fetchedResults.map((res, idx) => (
                                                <div key={idx} className="bg-white dark:bg-dm-card rounded-2xl border p-5 shadow-xs space-y-4">
                                                    <div className="flex justify-between items-start flex-wrap gap-2">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 font-extrabold px-2.5 py-0.5 rounded font-sans">رقم آلي: {res.automatedNo}</span>
                                                                <span className="text-[10px] bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 font-bold px-2.5 py-0.5 rounded font-sans">رقم القضية: {res.caseNumber}</span>
                                                            </div>
                                                            <h4 className="font-black text-sm text-slate-900 dark:text-gray-200">{res.title}</h4>
                                                            <p className="text-[10px] text-gray-400 font-bold mt-1">المحكمة: {res.courtName} | الدائرة القضائية: {res.circuit}</p>
                                                        </div>
                                                        <div className="text-left font-sans">
                                                            <span className="text-[10px] text-gray-400 block mb-1">الحالة بالوزارة</span>
                                                            <span className="text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1 rounded-full">{res.mojStatus}</span>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-850 p-4 rounded-xl text-xs font-bold font-sans">
                                                        <div className="space-y-1 text-right">
                                                            <span className="text-[10px] text-slate-400 block">الجلسة المسجلة حالياً بالمكتب:</span>
                                                            <span className="text-slate-600 dark:text-slate-300 block">{res.localHearing || 'لا توجد جلسات مجدولة'}</span>
                                                        </div>
                                                        <div className="space-y-1 border-r md:pr-4 text-right">
                                                            <span className="text-[10px] text-amber-600 block flex items-center gap-1 justify-end">
                                                                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                                                                التحديث الفوري من بوابة وزارة العدل:
                                                            </span>
                                                            <span className="text-slate-900 dark:text-gray-100 block">{res.mojHearing}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-end gap-2 text-xs flex-wrap">
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={() => {
                                                                addToast({ type: 'info', title: 'سحب تفاصيل الخصوم', message: 'جاري جلب الأسماء والأرقام المدنية للخصوم من الهيئة العامة للمعلومات المدنية.' });
                                                            }}
                                                        >
                                                            سحب تفاصيل الدعاوى والخصوم
                                                        </Button>
                                                        <Button 
                                                            size="sm"
                                                            onClick={() => {
                                                                // Apply synchronization to the local system/docket!
                                                                const newHearing: Hearing = {
                                                                    id: `h-moj-${res.automatedNo}`,
                                                                    caseId: `c-${res.automatedNo}`,
                                                                    caseTitle: res.title,
                                                                    date: res.mojDate,
                                                                    time: '09:00',
                                                                    type: 'مرافعة',
                                                                    room: 'قاعة 102',
                                                                    notes: 'تم جلبها وتحديثها تلقائياً من بوابة وزارة العدل الكويتية',
                                                                    status: 'Scheduled'
                                                                };
                                                                addHearing(newHearing);
                                                                addAuditLog(`مزامنة تلقائية من وزارة العدل لقضية آلي رقم [${res.automatedNo}]: إدراج جلسة بتاريخ ${res.mojDate}`);
                                                                addToast({ type: 'success', title: 'تمت المزامنة وحفظ الجلسة', message: `تم إدراج الجلسة الجديدة بتاريخ ${res.mojDate} بنجاح بالرول المؤتمت!` });
                                                            }}
                                                            className="bg-[#00796B] hover:bg-[#004D40] text-white"
                                                        >
                                                            تطبيق المزامنة وحفظ الجلسة بالرول
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                    </motion.div>
                )}

            </AnimatePresence>

            {/* AUTOMATED DOCKET ACTIVITY LOG & UNDO ENGINE */}
            <DocketActivityLog 
                logs={activityLogs}
                onUndoLast={handleUndoLastDrag}
                onUndoSpecific={handleUndoSpecificLog}
                onClearLogs={() => setActivityLogs([])}
            />

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
                            <Button 
                                variant="outline" 
                                className="border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100 flex items-center gap-1.5"
                                onClick={() => handleExportCalendar(viewEvent)}
                            >
                                <CalendarDaysIcon className="w-4 h-4 text-indigo-600" />
                                تصدير للتقويم (.ics)
                            </Button>
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

            {/* MODAL 4: ADD & EDIT COURT HEARING */}
            <Modal
                isOpen={isHearingModalOpen}
                onClose={() => {
                    setIsHearingModalOpen(false);
                    setEditingHearing(null);
                }}
                title={editingHearing ? 'تعديل وتحديث بيانات الجلسة القضائية' : 'إضافة وجدولة جلسة رول قضائي جديدة'}
                size="md"
            >
                <form onSubmit={handleSubmitHearing} className="space-y-4 text-xs font-sans text-right">
                    <Select
                        label="ربط القضية المرفوعة بالمكتب"
                        value={hearingForm.caseId || '1'}
                        onChange={(e) => {
                            const selectedId = e.target.value;
                            const activeC = initialCases.find(c => c.id === selectedId) || initialCases[0];
                            setHearingForm({
                                ...hearingForm,
                                caseId: selectedId,
                                caseTitle: activeC.title,
                                clientName: activeC.clientName
                            });
                        }}
                        options={initialCases.map(c => ({
                            value: c.id,
                            label: `${c.title} (الموكل: ${c.clientName})`
                        }))}
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <Input 
                            label="تاريخ حضور الجلسة"
                            type="date"
                            value={hearingForm.date || ''}
                            onChange={(e) => setHearingForm({ ...hearingForm, date: e.target.value })}
                            required
                        />
                        <Input 
                            label="ساعة الجلسة وتوقيتها"
                            type="time"
                            value={hearingForm.time || ''}
                            onChange={(e) => setHearingForm({ ...hearingForm, time: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Input 
                            label="المقر والمحكمة والقاعة"
                            value={hearingForm.courtRoomOrLocation || ''}
                            onChange={(e) => setHearingForm({ ...hearingForm, courtRoomOrLocation: e.target.value })}
                            required
                            placeholder="مثال: قصر العدل، قاعة 5 تجاري"
                        />
                        <Select
                            label="نوع وشكل الجلسة"
                            value={hearingForm.type || 'جلسة مرافعة كتابية'}
                            onChange={(e) => setHearingForm({ ...hearingForm, type: e.target.value })}
                            options={[
                                { value: 'جلسة مرافعة كتابية', label: 'جلسة مرافعة كتابية' },
                                { value: 'جلسة تقديم مذكرات لجان الخبراء', label: 'جلسة تقديم مذكرات لجان الخبراء' },
                                { value: 'جلسة مرافعة شفهية', label: 'جلسة مرافعة شفهية' },
                                { value: 'جلسة استجواب شهود الإثبات', label: 'جلسة استجواب شهود الإثبات' },
                                { value: 'جلسة نطق بالحكم التمهيدي', label: 'جلسة نطق بالحكم التمهيدي' }
                            ]}
                        />
                    </div>

                    {editingHearing && (
                        <div className="grid grid-cols-2 gap-3">
                            <Select
                                label="الحالة القضائية الحالية"
                                value={hearingForm.status || 'Scheduled'}
                                onChange={(e) => setHearingForm({ ...hearingForm, status: e.target.value as any })}
                                options={[
                                    { value: 'Scheduled', label: 'قيد الانتظار لموعد الجلسة' },
                                    { value: 'Completed', label: 'منتهية ومحسوم المرافعة' },
                                    { value: 'Postponed', label: 'مؤجلة لجلسة قادمة' }
                                ]}
                            />
                            <Input 
                                label="الدائرة القضائية (اختياري)"
                                value={hearingForm.circuit || ''}
                                onChange={(e) => setHearingForm({ ...hearingForm, circuit: e.target.value })}
                                placeholder="مثال: الدائرة 12 كلي"
                            />
                        </div>
                    )}

                    <TextArea 
                        label="ملاحظات الدفاع والدفوع الجوهرية للجلسة"
                        value={hearingForm.notes || ''}
                        onChange={(e) => setHearingForm({ ...hearingForm, notes: e.target.value })}
                        rows={3}
                        placeholder="أدخل المسودة الأولية للدفع القانوني أو طلبات التأجيل الحسابية..."
                    />

                    {hearingForm.status === 'Completed' && (
                        <TextArea 
                            label="قرار المحكمة الصادر بالجلسة (المنطوق القانوني)"
                            value={hearingForm.courtDecision || ''}
                            onChange={(e) => setHearingForm({ ...hearingForm, courtDecision: e.target.value })}
                            rows={2}
                            placeholder="مثال: قررت المحكمة حجز القضية للحكم مع تمكين مذكرات دفاع ختامية..."
                        />
                    )}

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => {
                                setIsHearingModalOpen(false);
                                setEditingHearing(null);
                            }}
                        >
                            إلغاء وتراجع
                        </Button>
                        <Button type="submit">
                            {editingHearing ? 'حفظ وتعديل الجلسة' : 'إدراج القضية لجدول الرول'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* MODAL 5: DELETE CONFIRMATION MODAL */}
            <Modal
                isOpen={isDeleteConfirmOpen}
                onClose={() => {
                    setIsDeleteConfirmOpen(false);
                    setSelectedHearingForDelete(null);
                }}
                title="تأكيد الحذف وحقن التطهير"
                size="sm"
            >
                <div className="text-right space-y-4 text-xs font-sans">
                    <div className="p-4 bg-red-50 text-red-700 rounded-2xl flex items-start gap-3">
                        <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-extrabold text-sm mb-1">هل أنت متأكد من الحذف تماماً؟</h4>
                            <p className="leading-relaxed">سيؤدي هذا الخيار إلى إزالة الجلسة/الموعد بصورة نهائية وتطهير كافة المستندات المرفقة بنظام السجلات الآلي للمحكمة دون رجعة.</p>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t">
                        <Button 
                            variant="outline" 
                            onClick={() => {
                                setIsDeleteConfirmOpen(false);
                                setSelectedHearingForDelete(null);
                            }}
                        >
                            إلغاء الأمر
                        </Button>
                        <Button 
                            onClick={handleConfirmDelete}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold"
                        >
                            نعم، تأكيد الحذف النهائي
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* MODAL 6: INTERACTIVE COURT LOCATION MAP & TRAFFIC MODAL */}
            <CourtLocationMapModal 
                isOpen={isCourtMapModalOpen} 
                onClose={() => setIsCourtMapModalOpen(false)} 
                courtName={selectedCourtNameModal} 
            />

            {/* MODAL 7: AUDIO ALERT CUSTOMIZATION & SOUND TONE LIBRARY */}
            <DocketAudioSettingsModal
                isOpen={isAudioSettingsOpen}
                onClose={() => setIsAudioSettingsOpen(false)}
                audioEnabled={audioAlertsEnabled}
                onAudioEnabledChange={setAudioAlertsEnabled}
                selectedTone={selectedTone}
                onSelectedToneChange={setSelectedTone}
                volume={audioVolume}
                onVolumeChange={setAudioVolume}
                alertLeadMinutes={alertLeadMinutes}
                onAlertLeadMinutesChange={setAlertLeadMinutes}
                playTone={playDocketChime}
            />

        </div>
    );
};

export default AutomatedDocketPage;
