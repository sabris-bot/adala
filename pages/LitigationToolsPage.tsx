import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Gavel, Scale, Calendar, Users, FileText, CheckCircle, Clock, 
    Printer, Plus, Search, Trash2, Edit, ChevronDown, ChevronRight, 
    SlidersHorizontal, Shield, Bell, AlertTriangle, Briefcase, 
    MapPin, Share2, DollarSign, FileCheck, Landmark, Compass, 
    Award, Building2, History, Check, X, Info, Download, ArrowUpRight, Brain,
    Mic, Volume2
} from 'lucide-react';

import { useToast } from '../components/ui/Toast';
import { CaseStatus, RiskLevel, CaseMainType, CasePriority, CourtLevel } from '../types';

import {
    LitigationCase, LitigationHearing, EnforcementAction, JudgmentEntry,
    AppealEntry, CassationEntry, MemoEntry, FollowupTask, CourtEntry,
    CircuitEntry, ClientProfile, OpposingParty, LawyerEntry, NotificationNotice,
    LegalReport, DocumentAttachment, ScheduleAppointment, LegalTask,
    initialCases, initialHearings, initialEnforcements, initialJudgments,
    initialAppeals, initialCassations, initialMemos, initialFollowups,
    initialCourts, initialCircuits, initialClients, initialOpponents,
    initialLawyers, initialNotifications, initialReports, initialDocuments,
    initialAppointments, initialTasks
} from './litigationData';

import { LegalPrintSystem } from './litigationPrintSystem';
import { LitigationSimulatorPanel } from './components/LitigationSimulatorPanel';
import { CourtHearingSimulatorPanel } from './components/CourtHearingSimulatorPanel';

// Organize modules logical groupings (8 organized categories as requested)
interface ModuleGroup {
    id: string;
    title: string;
    icon: any;
    tabs: { id: string; label: string; icon: any }[];
}

const MODULE_GROUPS: ModuleGroup[] = [
    {
        id: 'case_mgmt',
        title: 'إدارة القضايا والتداول',
        icon: Briefcase,
        tabs: [
            { id: 'cases', label: 'ملفات القضايا', icon: Briefcase },
            { id: 'clients', label: 'شؤون الموكلين', icon: Users },
            { id: 'opponents', label: 'سجل الخصوم', icon: Compass }
        ]
    },
    {
        id: 'hearing_mgmt',
        title: 'إدارة الجلسات والأجندة',
        icon: Calendar,
        tabs: [
            { id: 'hearings', label: 'رول الجلسات اليومي', icon: Gavel },
            { id: 'court_hearing_simulator', label: 'محاكي الجلسات القضائية', icon: Mic },
            { id: 'appointments', label: 'الأجندة والمواعيد', icon: Calendar }
        ]
    },
    {
        id: 'enforce_mgmt',
        title: 'إدارة التنفيذ والتعويضات',
        icon: Scale,
        tabs: [
            { id: 'enforce', label: 'التنفيذ الجبري والمالي', icon: Land_Indicator_Icon_Mapper('Scale') },
            { id: 'judgments', label: 'الأحكام والقرارات', icon: Award }
        ]
    },
    {
        id: 'memo_mgmt',
        title: 'صياغة المذكرات والدفاع',
        icon: FileText,
        tabs: [
            { id: 'memos', label: 'المذكرات القانونية', icon: FileText },
            { id: 'documents', label: 'المستندات والمرفقات', icon: FileCheck }
        ]
    },
    {
        id: 'appeal_mgmt',
        title: 'إدارة الطعون والدرجات',
        icon: Shield,
        tabs: [
            { id: 'appeals', label: 'الطعن بالاستئناف', icon: Shield },
            { id: 'cassations', label: 'الطعن بالتمييز', icon: Landmark }
        ]
    },
    {
        id: 'followups_mgmt',
        title: 'إدارة المتابعات والمهام',
        icon: History,
        tabs: [
            { id: 'followups', label: 'المتابعات الإدارية والمندوبين', icon: MapPin },
            { id: 'tasks', label: 'التكليفات والمهام القانونية', icon: CheckCircle }
        ]
    },
    {
        id: 'reports_mgmt',
        title: 'إدارة التقارير والتحليلات',
        icon: Bar_Indicator_Icon_Mapper('AlertTriangle'), 
        tabs: [
            { id: 'reports', label: 'التقارير الإحصائية والقضائية', icon: FileText }
        ]
    },
    {
        id: 'notice_mgmt',
        title: 'إدارة الإخطارات والإعلان',
        icon: Bell,
        tabs: [
            { id: 'notifications', label: 'سجل الإعلانات القضائية', icon: Bell },
            { id: 'courts', label: 'سجل المحاكم الكويتية', icon: Building2 },
            { id: 'circuits', label: 'الدوائر الدستورية والقضائية', icon: Land_Indicator_Icon_Mapper('Scale') }
        ]
    },
    {
        id: 'litigation_simulator_group',
        title: 'محاكاة الجلسات والتنبؤ القضائي',
        icon: Brain,
        tabs: [
            { id: 'court_hearing_simulator', label: 'محاكي الجلسات والمرافعة الشفهية', icon: Mic },
            { id: 'litigation_simulator', label: 'محاكي التقاضي والتمييز', icon: Scale }
        ]
    }
];

// Helper to map dynamic icons gracefully
function Land_Indicator_Icon_Mapper(name: string) {
    if (name === 'Scale') return Scale;
    return Compass;
}
function Bar_Indicator_Icon_Mapper(name: string) {
    return AlertTriangle;
}

interface LitigationToolsPageProps {
    initialTab?: string;
}

const LitigationToolsPage: React.FC<LitigationToolsPageProps> = ({ initialTab = 'dashboard' }) => {
    const { addToast } = useToast();

    // --- Core 18 Collections State ---
    const [cases, setCases] = useState<LitigationCase[]>(initialCases);
    const [hearings, setHearings] = useState<LitigationHearing[]>(initialHearings);
    const [enforcements, setEnforcements] = useState<EnforcementAction[]>(initialEnforcements);
    const [judgments, setJudgments] = useState<JudgmentEntry[]>(initialJudgments);
    const [appeals, setAppeals] = useState<AppealEntry[]>(initialAppeals);
    const [cassations, setCassations] = useState<CassationEntry[]>(initialCassations);
    const [memos, setMemos] = useState<MemoEntry[]>(initialMemos);
    const [followups, setFollowups] = useState<FollowupTask[]>(initialFollowups);
    const [courts, setCourts] = useState<CourtEntry[]>(initialCourts);
    const [circuits, setCircuits] = useState<CircuitEntry[]>(initialCircuits);
    const [clients, setClients] = useState<ClientProfile[]>(initialClients);
    const [opponents, setOpponents] = useState<OpposingParty[]>(initialOpponents);
    const [lawyers, setLawyers] = useState<LawyerEntry[]>(initialLawyers);
    const [notifications, setNotifications] = useState<NotificationNotice[]>(initialNotifications);
    const [reports, setReports] = useState<LegalReport[]>(initialReports);
    const [documents, setDocuments] = useState<DocumentAttachment[]>(initialDocuments);
    const [appointments, setAppointments] = useState<ScheduleAppointment[]>(initialAppointments);
    const [tasks, setTasks] = useState<LegalTask[]>(initialTasks);

    // --- Active Tab State ---
    const [activeTab, setActiveTab] = useState<string>(initialTab);

    // Collapse state of sidebar categories
    const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

    // Sidebar text search filter for finding modules
    const [sidebarSearchText, setSidebarSearchText] = useState('');

    // Global in-tab search term
    const [tabFilterText, setTabFilterText] = useState('');

    // --- Dialog form handling state ---
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [formMode, setFormMode] = useState<'add' | 'edit' | 'view'>('view');
    const [activeId, setActiveId] = useState<string | null>(null);
    const [formData, setFormData] = useState<any>({});

    // --- Official legal print system state ---
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [printDoc, setPrintDoc] = useState<{ title: string; refNo: string; metadata: Record<string, string>; content: string } | null>(null);

    // Bootstrap specific preset tab if routing requests it
    useEffect(() => {
        if (initialTab) {
            setActiveTab(initialTab);
        }
    }, [initialTab]);

    // Format currencies
    const formatCurrency = (amount: number) => {
        return `${amount.toLocaleString('ar-KW')} د.ك`;
    };

    // Calculate core analytical metrics for Litigation Dashboard (The Cockpit)
    const dashboardStats = useMemo(() => {
        const totalCasesCount = cases.length;
        const activeCasesCount = cases.filter(c => c.status !== CaseStatus.CLOSED).length;
        const upcomingHearingsCount = hearings.filter(h => h.status === 'Scheduled').length;
        const recentJudgmentsCount = judgments.length;
        const openEnforcementVal = enforcements.reduce((sum, e) => sum + (e.awardedAmount - e.paidAmount), 0);
        const alertAppeals = appeals.filter(a => a.remainingDays > 0 && a.remainingDays <= 15).length;

        return {
            totalCasesCount,
            activeCasesCount,
            upcomingHearingsCount,
            recentJudgmentsCount,
            openEnforcementVal,
            alertAppeals
        };
    }, [cases, hearings, judgments, enforcements, appeals]);

    const handleToggleGroup = (groupId: string) => {
        setCollapsedGroups(prev => ({
            ...prev,
            [groupId]: !prev[groupId]
        }));
    };

    // Filtered sidebar modules based on search input
    const filteredSidebarGroups = useMemo(() => {
        const cleanSearch = sidebarSearchText.trim();
        if (!cleanSearch) return MODULE_GROUPS;

        return MODULE_GROUPS.map(group => {
            const matchedTabs = group.tabs.filter(tab => 
                tab.label.includes(cleanSearch) || 
                group.title.includes(cleanSearch)
            );
            if (matchedTabs.length > 0) {
                return { ...group, tabs: matchedTabs };
            }
            return null;
        }).filter(g => g !== null) as ModuleGroup[];
    }, [sidebarSearchText]);

    // -- CRUD Action Handlers --
    const handleViewItem = (item: any) => {
        setFormMode('view');
        setFormData({ ...item });
        setIsFormModalOpen(true);
    };

    const handleAddItem = () => {
        setFormMode('add');
        setActiveId(null);
        
        let initialForm: any = {};
        if (activeTab === 'cases') {
            initialForm = { status: CaseStatus.OPEN, priority: CasePriority.NORMAL, risk: RiskLevel.LOW, financials: { totalFees: 0, paid: 0, remaining: 0 }, filingDate: new Date().toISOString().split('T')[0] };
        } else if (activeTab === 'hearings') {
            initialForm = { status: 'Scheduled', date: new Date().toISOString().split('T')[0], time: '09:00' };
        } else if (activeTab === 'enforce') {
            initialForm = { status: 'Open', awardedAmount: 0, paidAmount: 0, actionsTaken: [], lastUpdateDate: new Date().toISOString().split('T')[0] };
        } else if (activeTab === 'judgments') {
            initialForm = { courtLevel: CourtLevel.FIRST_INSTANCE, status: 'Final', issueDate: new Date().toISOString().split('T')[0] };
        } else if (activeTab === 'appeals') {
            initialForm = { status: 'Drafting', remainingDays: 30, originalJudgmentDate: new Date().toISOString().split('T')[0], deadlineDate: new Date().toISOString().split('T')[0] };
        } else if (activeTab === 'cassations') {
            initialForm = { status: 'Preparing', remainingDays: 60, appealJudgmentDate: new Date().toISOString().split('T')[0], deadlineDate: new Date().toISOString().split('T')[0] };
        } else if (activeTab === 'memos') {
            initialForm = { category: 'جوابية دفاعية', lastModified: new Date().toISOString().split('T')[0], tags: [] };
        } else if (activeTab === 'followups') {
            initialForm = { status: 'PREPARING' };
        } else if (activeTab === 'courts') {
            initialForm = { activeStatus: 'Active' };
        } else if (activeTab === 'circuits') {
            initialForm = { sessionDay: 'الأحد تداول' };
        } else if (activeTab === 'clients') {
            initialForm = { type: 'Corporate', trustScore: 'Excellent', activeCasesCount: 0 };
        } else if (activeTab === 'opponents') {
            initialForm = { riskStatus: 'Cooperative', activeCasesCount: 0 };
        } else if (activeTab === 'notifications') {
            initialForm = { type: 'صحيفة دعوى', deliveryMethod: 'سهل الحكومي', status: 'Pending', sentDate: new Date().toISOString().split('T')[0] };
        } else if (activeTab === 'documents') {
            initialForm = { fileType: 'PDF', category: 'صحيفة دعوى', fileSize: '500 KB', uploadedAt: new Date().toISOString().split('T')[0] };
        } else if (activeTab === 'appointments') {
            initialForm = { category: 'اجتماع موكل', date: new Date().toISOString().split('T')[0], time: '10:00' };
        } else if (activeTab === 'tasks') {
            initialForm = { priority: 'Medium', status: 'Pending', dueDate: new Date().toISOString().split('T')[0] };
        }

        setFormData(initialForm);
        setIsFormModalOpen(true);
    };

    const handleEditItem = (item: any) => {
        setFormMode('edit');
        setActiveId(item.id);
        setFormData({ ...item });
        setIsFormModalOpen(true);
    };

    const handleDeleteItem = (id: string) => {
        if (confirm('هل أنت متأكد من رغبتك في حذف هذا السجل وملحقاته نهائياً؟')) {
            switch (activeTab) {
                case 'cases': setCases(cases.filter(c => c.id !== id)); break;
                case 'hearings': setHearings(hearings.filter(h => h.id !== id)); break;
                case 'enforce': setEnforcements(enforcements.filter(e => e.id !== id)); break;
                case 'judgments': setJudgments(judgments.filter(j => j.id !== id)); break;
                case 'appeals': setAppeals(appeals.filter(a => a.id !== id)); break;
                case 'cassations': setCassations(cassations.filter(c => c.id !== id)); break;
                case 'memos': setMemos(memos.filter(m => m.id !== id)); break;
                case 'followups': setFollowups(followups.filter(f => f.id !== id)); break;
                case 'courts': setCourts(courts.filter(c => c.id !== id)); break;
                case 'circuits': setCircuits(circuits.filter(c => c.id !== id)); break;
                case 'clients': setClients(clients.filter(c => c.id !== id)); break;
                case 'opponents': setOpponents(opponents.filter(o => o.id !== id)); break;
                case 'notifications': setNotifications(notifications.filter(n => n.id !== id)); break;
                case 'documents': setDocuments(documents.filter(d => d.id !== id)); break;
                case 'appointments': setAppointments(appointments.filter(a => a.id !== id)); break;
                case 'tasks': setTasks(tasks.filter(t => t.id !== id)); break;
            }
            addToast({
                type: 'success',
                title: 'تم الحذف',
                message: 'تم شطب وإزالة السجل من قاعدة بيانات التقاضي بنجاح.'
            });
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (formMode === 'add') {
            const generatedId = `${activeTab}-${Date.now()}`;
            const newRecord = { ...formData, id: generatedId };

            switch (activeTab) {
                case 'cases': setCases([newRecord as LitigationCase, ...cases]); break;
                case 'hearings': setHearings([newRecord as LitigationHearing, ...hearings]); break;
                case 'enforce': setEnforcements([newRecord as EnforcementAction, ...enforcements]); break;
                case 'judgments': setJudgments([newRecord as JudgmentEntry, ...judgments]); break;
                case 'appeals': setAppeals([newRecord as AppealEntry, ...appeals]); break;
                case 'cassations': setCassations([newRecord as CassationEntry, ...cassations]); break;
                case 'memos': setMemos([newRecord as MemoEntry, ...memos]); break;
                case 'followups': setFollowups([newRecord as FollowupTask, ...followups]); break;
                case 'courts': setCourts([newRecord as CourtEntry, ...courts]); break;
                case 'circuits': setCircuits([newRecord as CircuitEntry, ...circuits]); break;
                case 'clients': setClients([newRecord as ClientProfile, ...clients]); break;
                case 'opponents': setOpponents([newRecord as OpposingParty, ...opponents]); break;
                case 'notifications': setNotifications([newRecord as NotificationNotice, ...notifications]); break;
                case 'documents': setDocuments([newRecord as DocumentAttachment, ...documents]); break;
                case 'appointments': setAppointments([newRecord as ScheduleAppointment, ...appointments]); break;
                case 'tasks': setTasks([newRecord as LegalTask, ...tasks]); break;
            }
            addToast({ type: 'success', title: 'إضافة ناجحة', message: 'تم إدراج وحفظ السجل الجديد في منظومة عدالة.' });
        } else {
            // Edit mode
            switch (activeTab) {
                case 'cases': setCases(cases.map(c => c.id === activeId ? formData : c)); break;
                case 'hearings': setHearings(hearings.map(h => h.id === activeId ? formData : h)); break;
                case 'enforce': setEnforcements(enforcements.map(e => e.id === activeId ? formData : e)); break;
                case 'judgments': setJudgments(judgments.map(j => j.id === activeId ? formData : j)); break;
                case 'appeals': setAppeals(appeals.map(a => a.id === activeId ? formData : a)); break;
                case 'cassations': setCassations(cassations.map(c => c.id === activeId ? formData : c)); break;
                case 'memos': setMemos(memos.map(m => m.id === activeId ? formData : m)); break;
                case 'followups': setFollowups(followups.map(f => f.id === activeId ? formData : f)); break;
                case 'courts': setCourts(courts.map(c => c.id === activeId ? formData : c)); break;
                case 'circuits': setCircuits(circuits.map(c => c.id === activeId ? formData : c)); break;
                case 'clients': setClients(clients.map(c => c.id === activeId ? formData : c)); break;
                case 'opponents': setOpponents(opponents.map(o => o.id === activeId ? formData : o)); break;
                case 'notifications': setNotifications(notifications.map(n => n.id === activeId ? formData : n)); break;
                case 'documents': setDocuments(documents.map(d => d.id === activeId ? formData : d)); break;
                case 'appointments': setAppointments(appointments.map(a => a.id === activeId ? formData : a)); break;
                case 'tasks': setTasks(tasks.map(t => t.id === activeId ? formData : t)); break;
            }
            addToast({ type: 'success', title: 'تم التحديث', message: 'تمت مزامنة وتسجيل التغييرات بنجاح.' });
        }

        setIsFormModalOpen(false);
    };

    // --- Formal Legal Printing System Integration ---
    const handleTriggerPrint = (title: string, metadata: Record<string, string>, content: string) => {
        setPrintDoc({
            title,
            refNo: `ADL-${Math.floor(100000 + Math.random() * 900000)}`,
            metadata,
            content
        });
        setIsPrintModalOpen(true);
    };

    // --- Universal Tab Filtering Box ---
    const tabFilteredData = useMemo(() => {
        const text = tabFilterText.trim().toLowerCase();
        if (!text) {
            return {
                cases, hearings, enforcements, judgments, appeals, cassations, memos,
                followups, courts, circuits, clients, opponents, notifications, documents,
                appointments, tasks
            };
        }

        return {
            cases: cases.filter(c => c.title.toLowerCase().includes(text) || c.caseNumber.includes(text) || c.clientName.toLowerCase().includes(text)),
            hearings: hearings.filter(h => h.caseTitle.toLowerCase().includes(text) || h.caseNumber.includes(text) || h.assignedLawyer.toLowerCase().includes(text)),
            enforcements: enforcements.filter(e => e.executionNo.includes(text) || e.clientName.toLowerCase().includes(text) || e.debtorName.toLowerCase().includes(text)),
            judgments: judgments.filter(j => j.verdictSummary.toLowerCase().includes(text) || j.caseNumber.includes(text)),
            appeals: appeals.filter(a => a.caseNumber.includes(text) || a.appealGrounds.toLowerCase().includes(text)),
            cassations: cassations.filter(c => c.caseNumber.includes(text) || c.grounds.toLowerCase().includes(text)),
            memos: memos.filter(m => m.title.toLowerCase().includes(text) || m.content.toLowerCase().includes(text)),
            followups: followups.filter(f => f.delegateName.toLowerCase().includes(text) || f.caseNumber.includes(text)),
            courts: courts.filter(c => c.name.toLowerCase().includes(text) || c.location.toLowerCase().includes(text)),
            circuits: circuits.filter(c => c.name.toLowerCase().includes(text) || c.headJudge.toLowerCase().includes(text)),
            clients: clients.filter(c => c.name.toLowerCase().includes(text) || c.civilOrRegId.includes(text)),
            opponents: opponents.filter(o => o.name.toLowerCase().includes(text)),
            notifications: notifications.filter(n => n.recipientName.toLowerCase().includes(text) || n.caseNumber.includes(text)),
            documents: documents.filter(d => d.title.toLowerCase().includes(text) || d.caseNumber.includes(text)),
            appointments: appointments.filter(a => a.title.toLowerCase().includes(text) || a.category.toLowerCase().includes(text)),
            tasks: tasks.filter(t => t.title.toLowerCase().includes(text) || t.assignedTo.toLowerCase().includes(text))
        };
    }, [cases, hearings, enforcements, judgments, appeals, cassations, memos, followups, courts, circuits, clients, opponents, notifications, documents, appointments, tasks, tabFilterText]);

    return (
        <div className="flex flex-col md:flex-row min-h-[92vh] bg-slate-100 text-slate-800 antialiased font-sans text-right leading-relaxed select-none" dir="rtl">
            
            {/* COLLAPSIBLE SIDEBAR SEARCH LOOPS */}
            <aside className="w-full md:w-72 bg-gradient-to-b from-teal-900 to-teal-950 text-white flex flex-col border-l border-teal-850 p-4 shrink-0 shadow-lg">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center space-x-2 space-x-reverse">
                        <div className="p-2 bg-amber-400 text-teal-950 rounded-xl shadow-xs">
                            <Scale className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-black text-[15px] tracking-tight">منصة التقاضي الرقمية</h2>
                            <p className="text-[10px] text-teal-200 mt-0.5">منظومة عدالة للمحاماة</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar Tab Finder (Fast Search) */}
                <div className="relative mb-5">
                    <input
                        type="text"
                        placeholder="ابحث عن قسم أو وحدة..."
                        value={sidebarSearchText}
                        onChange={(e) => setSidebarSearchText(e.target.value)}
                        className="w-full bg-teal-950/50 border border-teal-700/60 rounded-xl py-2 px-3 pl-8 text-xs font-bold text-white placeholder-teal-300 focus:outline-hidden focus:border-amber-400 placeholder:opacity-73"
                    />
                    <Search className="w-3.5 h-3.5 text-teal-300 absolute left-3 top-3" />
                </div>

                {/* Navigation Menu List */}
                <div className="flex-grow overflow-y-auto space-y-4 max-h-[60vh] md:max-h-[70vh] scrollbar-none pr-1">
                    
                    {/* Master Dashboard Tab Entry */}
                    <button
                        onClick={() => { setActiveTab('dashboard'); setTabFilterText(''); }}
                        className={`w-full text-right flex items-center justify-between p-3 rounded-lg text-xs font-bold transition-all ${activeTab === 'dashboard' ? 'bg-amber-400 text-teal-950 shadow-md transform hover:scale-[1.01]' : 'hover:bg-teal-800 text-teal-100'}`}
                    >
                        <div className="flex items-center gap-2">
                            <SlidersHorizontal className="w-4 h-4" />
                            <span>لوحة مؤشرات التقاضي الشاملة</span>
                        </div>
                        {activeTab === 'dashboard' && <div className="w-1.5 h-1.5 bg-teal-950 rounded-full" />}
                    </button>

                    {/* Collapsible groups map */}
                    {filteredSidebarGroups.map(group => {
                        const isCollapsed = collapsedGroups[group.id];
                        return (
                            <div key={group.id} className="space-y-1">
                                <button
                                    onClick={() => handleToggleGroup(group.id)}
                                    className="w-full text-right flex items-center justify-between py-1 px-2 text-[10px] font-black uppercase text-teal-300 tracking-wider hover:text-white transition-colors"
                                >
                                    <span className="flex items-center gap-1.5">
                                        <group.icon className="w-3 h-3 text-amber-400" />
                                        {group.title}
                                    </span>
                                    {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                </button>

                                {!isCollapsed && (
                                    <div className="ps-2 space-y-0.5 border-r border-teal-800/60 mr-1">
                                        {group.tabs.map(tab => {
                                            const isActive = activeTab === tab.id;
                                            return (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => { setActiveTab(tab.id); setTabFilterText(''); }}
                                                    className={`w-full text-right flex items-center gap-2 px-3 py-2 rounded-md text-[11px] font-bold transition-all ${isActive ? 'bg-teal-850 text-amber-400 border-l-2 border-amber-400 shadow-sm' : 'text-teal-100 hover:bg-teal-900/40 hover:text-white'}`}
                                                >
                                                    <tab.icon className="w-3.5 h-3.5" />
                                                    <span>{tab.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </aside>

            {/* MAIN WORKING LAYOUT VIEWPORTS */}
            <main className="flex-1 p-6 flex flex-col gap-6 max-h-[92vh] overflow-y-auto">
                
                {/* GLOBAL WORKSPACE HEADER (Screen only) */}
                <header className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-4">
                    <div>
                        <h1 className="text-xl font-black text-slate-800">
                            {activeTab === 'dashboard' ? 'المركز التنظيمي والقيادة التقاضية (The Dashboard)' : MODULE_GROUPS.flatMap(g => g.tabs).find(t => t.id === activeTab)?.label || 'المصنف الشامل'}
                        </h1>
                        <p className="text-xs text-slate-500 font-bold mt-1">بوابة رصد تداول القضايا وأروقة المحاكم بدولة الكويت - المستشار صبري شطا</p>
                    </div>

                    {/* Universal Filters inside layout */}
                    {activeTab !== 'dashboard' && (
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="تصفية سريعة هنا..."
                                    value={tabFilterText}
                                    onChange={(e) => setTabFilterText(e.target.value)}
                                    className="bg-white border text-xs font-bold border-slate-300 rounded-lg py-1.5 px-3 pl-8 focus:outline-hidden focus:border-teal-600 sm:w-56"
                                />
                                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                            </div>

                            <button
                                onClick={handleAddItem}
                                className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-shadow shadow-xs"
                            >
                                <Plus className="w-4 h-4" />
                                إضافة سجل
                            </button>
                        </div>
                    )}
                </header>

                {/* ANIMATED TRANSITION VIEWPORTS CONTAINER */}
                <div className="flex-grow relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.15 }}
                            className="space-y-6"
                        >
                            
                            {/* --- TAB VIEW 0: MASTER DOCKPIT DASHBOARD --- */}
                            {activeTab === 'dashboard' && (
                                <div className="space-y-6">
                                    
                                    {/* Stat cards bento-grid */}
                                    <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                                        <div className="bg-white border rounded-2xl p-4 shadow-xs flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] text-slate-500 font-extrabold uppercase">إجمالي الدعاوى</p>
                                                <h3 className="text-2xl font-black text-slate-900 mt-1">{dashboardStats.totalCasesCount}</h3>
                                            </div>
                                            <div className="p-3 bg-teal-50 text-teal-700 rounded-xl"><Briefcase className="w-5 h-5" /></div>
                                        </div>

                                        <div className="bg-white border rounded-2xl p-4 shadow-xs flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] text-slate-500 font-extrabold uppercase">القضايا المتداولة</p>
                                                <h3 className="text-2xl font-black text-teal-700 mt-1">{dashboardStats.activeCasesCount}</h3>
                                            </div>
                                            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl"><Compass className="w-5 h-5" /></div>
                                        </div>

                                        <div className="bg-white border rounded-2xl p-4 shadow-xs flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] text-slate-500 font-extrabold uppercase">جداول الجلسات المعينة</p>
                                                <h3 className="text-2xl font-black text-amber-500 mt-1">{dashboardStats.upcomingHearingsCount}</h3>
                                            </div>
                                            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Gavel className="w-5 h-5" /></div>
                                        </div>

                                        <div className="bg-white border rounded-2xl p-4 shadow-xs flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] text-slate-500 font-extrabold uppercase">الأحكام النهائية</p>
                                                <h3 className="text-2xl font-black text-sky-600 mt-1">{dashboardStats.recentJudgmentsCount}</h3>
                                            </div>
                                            <div className="p-3 bg-sky-50 text-sky-600 rounded-xl"><Award className="w-5 h-5" /></div>
                                        </div>

                                        <div className="bg-white border rounded-2xl p-4 shadow-xs flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] text-slate-500 font-extrabold uppercase">قيد التعويضات المعلقة</p>
                                                <h4 className="text-[15px] font-black text-red-600 mt-1">{formatCurrency(dashboardStats.openEnforcementVal)}</h4>
                                            </div>
                                            <div className="p-2 bg-red-50 text-red-600 rounded-xl"><DollarSign className="w-4 h-4" /></div>
                                        </div>

                                        <div className="bg-white border rounded-2xl p-4 shadow-xs flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] text-slate-500 font-extrabold uppercase">طعون تقارب الأجل</p>
                                                <h3 className="text-2xl font-black text-rose-600 mt-1">{dashboardStats.alertAppeals}</h3>
                                            </div>
                                            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl"><Clock className="w-5 h-5" /></div>
                                        </div>
                                    </div>

                                    {/* Quick Actions Shortcuts */}
                                    <div className="bg-white border rounded-2xl p-5 shadow-xs">
                                        <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4">لوحة الإيعاز والإجراءات السريعة</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                            <button 
                                                onClick={() => { setActiveTab('cases'); handleAddItem(); }}
                                                className="p-3 border border-dashed border-teal-300 hover:border-teal-600 bg-teal-50/20 hover:bg-teal-50 rounded-xl text-right transition-colors cursor-pointer"
                                            >
                                                <h4 className="font-extrabold text-xs text-teal-800 flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> قيد دعوى جديدة</h4>
                                                <p className="text-[10px] text-slate-500 mt-1 font-bold">تسجيل صحيفة ادعاء أول درجة ومحكمة كلي</p>
                                            </button>

                                            <button 
                                                onClick={() => { setActiveTab('hearings'); handleAddItem(); }}
                                                className="p-3 border border-dashed border-amber-300 hover:border-amber-600 bg-amber-50/20 hover:bg-amber-50 rounded-xl text-right transition-colors cursor-pointer"
                                            >
                                                <h4 className="font-extrabold text-xs text-amber-800 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> جدولة جلسة رول</h4>
                                                <p className="text-[10px] text-slate-500 mt-1 font-bold">مأسسة مواعيد الحضور وتناوب الخبراء</p>
                                            </button>

                                            <button 
                                                onClick={() => { setActiveTab('memos'); handleAddItem(); }}
                                                className="p-3 border border-dashed border-sky-300 hover:border-sky-600 bg-sky-50/20 hover:bg-sky-50 rounded-xl text-right transition-colors cursor-pointer"
                                            >
                                                <h4 className="font-extrabold text-xs text-sky-800 flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> إنشاء مذكرة دفاعية</h4>
                                                <p className="text-[10px] text-slate-500 mt-1 font-bold">صياغة لجانب المحكمة الكلية والاستئناف</p>
                                            </button>

                                            <button 
                                                onClick={() => { setActiveTab('enforce'); handleAddItem(); }}
                                                className="p-3 border border-dashed border-purple-300 hover:border-purple-600 bg-purple-50/20 hover:bg-purple-50 rounded-xl text-right transition-colors cursor-pointer"
                                            >
                                                <h4 className="font-extrabold text-xs text-purple-800 flex items-center gap-1"><Scale className="w-3.5 h-3.5" /> فتح ملف تنفيذي</h4>
                                                <p className="text-[10px] text-slate-500 mt-1 font-bold">متابعة صيغ الإعلان والأحكام الصادرة</p>
                                            </button>

                                            <button 
                                                onClick={() => setActiveTab('court_hearing_simulator')}
                                                className="p-3.5 border border-dashed border-amber-400 hover:border-amber-600 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-teal-500/10 hover:bg-amber-100/50 rounded-xl text-right transition-all cursor-pointer sm:col-span-4 flex items-center justify-between shadow-xs"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-sm">
                                                        <Mic className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                                                            محاكي الجلسات القضائية والمرافعة الشفهية
                                                            <span className="px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-800 text-[9px] font-black">أداة تفاعلية جديدة</span>
                                                        </h4>
                                                        <p className="text-[10px] text-slate-600 mt-0.5 font-bold">
                                                            تجهيز المرافعة، تجربة الإلقاء شفهياً مع مؤقت وميكروفون، تقييم نقاط القوة والضعف، ومباغتات القضاة
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-black text-amber-700 hover:underline flex items-center gap-1">
                                                    دخول المحاكي
                                                    <ArrowUpRight className="w-3.5 h-3.5 rtl:rotate-[-90deg]" />
                                                </span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Splitted Lists Layout: Upcoming Hearings vs Recent Activities */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        
                                        {/* Row 1: Upcoming schedule hearings */}
                                        <div className="bg-white border rounded-2xl p-5 shadow-xs flex flex-col">
                                            <div className="flex items-center justify-between mb-4 pb-2 border-b">
                                                <h3 className="font-black text-sm text-slate-800 flex items-center gap-2">
                                                    <Gavel className="w-4 h-4 text-amber-500" />
                                                    الجلسات القادمة اليوم وغداً
                                                </h3>
                                                <button onClick={() => setActiveTab('hearings')} className="text-[10px] font-bold text-teal-600 hover:underline">عرض الكل</button>
                                            </div>

                                            <div className="space-y-3 flex-grow max-h-[290px] overflow-y-auto pr-1">
                                                {hearings.slice(0, 3).map(h => (
                                                    <div key={h.id} className="p-3 bg-slate-50 rounded-xl border border-slate-150 relative hover:bg-slate-100 transition-colors">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <span className="text-[11px] font-extrabold text-slate-800 max-w-[70%] truncate">{h.caseTitle}</span>
                                                            <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                                                                {h.date} | {h.time}
                                                            </span>
                                                        </div>
                                                        <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                                                            <Landmark className="w-3 h-3" /> {h.court} - {h.room}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400 font-extrabold mt-1">المحامي المعين: {h.assignedLawyer}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Row 2: Recent Judicial Activities Log */}
                                        <div className="bg-white border rounded-2xl p-5 shadow-xs flex flex-col">
                                            <div className="flex items-center justify-between mb-4 pb-2 border-b">
                                                <h3 className="font-black text-sm text-slate-800 flex items-center gap-2">
                                                    <History className="w-4 h-4 text-teal-600" />
                                                    سجل الأحداث والنشاطات القضائية
                                                </h3>
                                                <button className="text-[10px] font-bold text-slate-400 cursor-not-allowed">محدث فوري</button>
                                            </div>

                                            <div className="space-y-3.5 flex-grow max-h-[290px] overflow-y-auto pr-1 text-xs">
                                                <div className="flex gap-3 items-start relative">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 flex-shrink-0" />
                                                    <div>
                                                        <p className="font-bold text-slate-800">إتمام مباشرة الخبير الحسابي لقضية العجمي</p>
                                                        <p className="text-[9px] text-slate-400 font-bold mt-0.5">قبل ساعتين | بمقر الرقعي</p>
                                                    </div>
                                                </div>

                                                <div className="flex gap-3 items-start relative">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                                                    <div>
                                                        <p className="font-bold text-slate-800">تجهيز ومراجعة صحيفة طعن الاستئناف لشركة الأمل</p>
                                                        <p className="text-[9px] text-slate-400 font-bold mt-0.5">قبل ٥ ساعات | المستشار صبري شطا</p>
                                                    </div>
                                                </div>

                                                <div className="flex gap-3 items-start relative">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 flex-shrink-0" />
                                                    <div>
                                                        <p className="font-bold text-slate-800">إصدار قرار منع السفر تجاه المنفذ ضده خالد جاسم</p>
                                                        <p className="text-[9px] text-slate-400 font-bold mt-0.5">أمس مساء | شعبة محكمة حولي</p>
                                                    </div>
                                                </div>

                                                <div className="flex gap-3 items-start relative">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0" />
                                                    <div>
                                                        <p className="font-bold text-slate-800">تحصيل شيك سداد مالي نهائي بقيمة ١٨,٥٠٠ د.ك</p>
                                                        <p className="text-[9px] text-slate-400 font-bold mt-0.5">يومين مضيا | بموجب حكم مصنع الخليج</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>

                                </div>
                            )}

                            {/* --- TAB VIEW 1: CASES (ملفات القضايا) --- */}
                            {activeTab === 'cases' && (
                                <div className="bg-white border rounded-2xl p-5 shadow-xs overflow-hidden">
                                    <div className="table-responsive">
                                        <table className="w-full text-right border-collapse text-xs">
                                            <thead>
                                                <tr className="bg-slate-50 border-b border-slate-200">
                                                    <th className="p-3 font-extrabold text-slate-700">رقم القضية</th>
                                                    <th className="p-3 font-extrabold text-slate-700">عنوان القضية</th>
                                                    <th className="p-3 font-extrabold text-slate-700">الموكل</th>
                                                    <th className="p-3 font-extrabold text-slate-700">الخصم</th>
                                                    <th className="p-3 font-extrabold text-slate-700">المحكمة / الدائرة</th>
                                                    <th className="p-3 font-extrabold text-slate-700">الحالة</th>
                                                    <th className="p-3 font-extrabold text-slate-700">المالية المتبقية</th>
                                                    <th className="p-3 font-extrabold text-slate-700 w-28 text-center">أدوات التحكم</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {tabFilteredData.cases.map(c => (
                                                    <tr key={c.id} className="border-b hover:bg-slate-50 transition-colors">
                                                        <td className="p-3 font-mono font-bold text-teal-850">
                                                            {c.caseNumber}
                                                            {c.automatedNo && <p className="text-[9px] text-slate-400 font-bold mt-0.5">آلي: {c.automatedNo}</p>}
                                                        </td>
                                                        <td className="p-3 font-bold max-w-[200px] truncate" title={c.title}>{c.title}</td>
                                                        <td className="p-3 font-bold">{c.clientName}</td>
                                                        <td className="p-3 text-slate-500 font-bold">{c.opponentName}</td>
                                                        <td className="p-3 text-slate-600 font-bold">
                                                            {c.court}
                                                            <p className="text-[9px] text-teal-700 mt-0.5 font-bold">{c.circuit}</p>
                                                        </td>
                                                        <td className="p-3 font-bold">
                                                            <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-[9px] border">
                                                                {c.status}
                                                            </span>
                                                        </td>
                                                        <td className="p-3 font-bold text-red-600 font-mono">{formatCurrency(c.financials.remaining)}</td>
                                                        <td className="p-3 flex justify-center gap-1">
                                                            <button onClick={() => handleViewItem(c)} className="p-1 hover:bg-slate-200 rounded text-slate-500 cursor-pointer" title="معاينة وتفاصيل وملخص"><Info className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleEditItem(c)} className="p-1 hover:bg-slate-200 rounded text-teal-600 cursor-pointer" title="تعديل"><Edit className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleDeleteItem(c.id)} className="p-1 hover:bg-slate-200 rounded text-red-600 cursor-pointer" title="حذف"><Trash2 className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleTriggerPrint('بطاقة قيد قضية رسمية', { 'عنوان الملف': c.title, 'رقم القضية المنظور': c.caseNumber, 'الموكل المندوب': c.clientName, 'الخصم المحدد': c.opponentName, 'المحكمة الدستورية': c.court, 'موعد الجلسة المجدولة': c.nextHearingDate || 'غير محدد' }, `أهلاً بك الموكل الكريم\nيرجى العلم بأنه تم رصد الدعوى وطلباتكم المتمثلة في:\n${c.notes || 'لا يوجد ملاحظات مدونة'}\nالمال الفيدرالي المقدر للمحاماة: ${formatCurrency(c.financials.totalFees)}.`)} className="p-1 hover:bg-slate-200 rounded text-amber-600 cursor-pointer" title="طباعة"><Printer className="w-3.5 h-3.5" /></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* --- TAB VIEW 2: HEARINGS (رول الجلسات اليومي) --- */}
                            {activeTab === 'hearings' && (
                                <div className="bg-white border rounded-2xl p-5 shadow-xs">
                                    <div className="table-responsive">
                                        <table className="w-full text-right border-collapse text-xs">
                                            <thead>
                                                <tr className="bg-slate-50 border-b border-slate-200">
                                                    <th className="p-3 font-extrabold text-slate-700">رقم القضية</th>
                                                    <th className="p-3 font-extrabold text-slate-700">القضية</th>
                                                    <th className="p-3 font-extrabold text-slate-700">الموعد والتوقيت</th>
                                                    <th className="p-3 font-extrabold text-slate-700">المحكمة وقاعة الحضور</th>
                                                    <th className="p-3 font-extrabold text-slate-700">نوع وهدف الجلسة</th>
                                                    <th className="p-3 font-extrabold text-slate-700">المستشار المعين</th>
                                                    <th className="p-3 font-extrabold text-slate-700">محصلة الجلسة</th>
                                                    <th className="p-3 font-extrabold text-slate-700 text-center w-28">الخيارات</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {tabFilteredData.hearings.map(h => (
                                                    <tr key={h.id} className="border-b hover:bg-slate-50 transition-colors">
                                                        <td className="p-3 font-mono font-bold text-teal-850">{h.caseNumber}</td>
                                                        <td className="p-3 font-bold max-w-[200px] truncate">{h.caseTitle}</td>
                                                        <td className="p-3 font-bold">
                                                            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-mono text-[9px] border border-amber-200">
                                                                {h.date} | {h.time}
                                                            </span>
                                                        </td>
                                                        <td className="p-3 font-bold text-slate-600">
                                                            {h.court}
                                                            <p className="text-[9px] text-slate-400 mt-0.5 font-bold">{h.room}</p>
                                                        </td>
                                                        <td className="p-3 text-slate-700 font-bold">{h.type}</td>
                                                        <td className="p-3 text-slate-500 font-bold">{h.assignedLawyer}</td>
                                                        <td className="p-3 font-extrabold text-slate-700 max-w-[150px] truncate" title={h.outcome}>{h.outcome || 'بانتظار اتمام الجلسة'}</td>
                                                        <td className="p-3 flex justify-center gap-1">
                                                            <button onClick={() => handleViewItem(h)} className="p-1 hover:bg-slate-200 rounded text-slate-500 cursor-pointer"><Info className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleEditItem(h)} className="p-1 hover:bg-slate-200 rounded text-teal-600 cursor-pointer"><Edit className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleDeleteItem(h.id)} className="p-1 hover:bg-slate-200 rounded text-red-600 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleTriggerPrint('قرارات ومحضر رول جلسة', { 'المحكمة': h.court, 'رقم القضية': h.caseNumber, 'التاريخ والجلسة': h.date, 'غرفة الجلسة': h.room, 'القضية المنسوبة': h.caseTitle }, `موضوع الجلسة وطلبات الدفاع:\n- حضور المحامي الموكل لتقديم المرافعة الشفهية.\nالمخرجات والمحصلة المفرزة عن الجلسة:\n ${h.outcome || 'جلسة متداولة ومحجوزة لاستئناف تداول رول الجلسات بالصياغة.'}`)} className="p-1 hover:bg-slate-200 rounded text-amber-600 cursor-pointer"><Printer className="w-3.5 h-3.5" /></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* --- TAB VIEW 3: ENFORCEMENT (التنفيذ الجبري) --- */}
                            {activeTab === 'enforce' && (
                                <div className="bg-white border rounded-2xl p-5 shadow-xs">
                                    <div className="table-responsive">
                                        <table className="w-full text-right border-collapse text-xs">
                                            <thead>
                                                <tr className="bg-slate-50 border-b border-slate-200">
                                                    <th className="p-3 font-extrabold text-slate-700">رقم التنفيذ / المرجع</th>
                                                    <th className="p-3 font-extrabold text-slate-700">رقم القضية</th>
                                                    <th className="p-3 font-extrabold text-slate-700">طالب التنفيذ (الموكل)</th>
                                                    <th className="p-3 font-extrabold text-slate-700">المنفذ ضده (المدين)</th>
                                                    <th className="p-3 font-extrabold text-slate-700">المبلغ الإجمالي المحكوم به</th>
                                                    <th className="p-3 font-extrabold text-slate-700">المسدد فورا</th>
                                                    <th className="p-3 font-extrabold text-slate-700">حالة الملف</th>
                                                    <th className="p-3 font-extrabold text-slate-700 text-center w-28">أدوات التحكم</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {tabFilteredData.enforcements.map(e => (
                                                    <tr key={e.id} className="border-b hover:bg-slate-50 transition-colors">
                                                        <td className="p-3 font-mono font-bold text-amber-600">{e.executionNo}</td>
                                                        <td className="p-3 font-mono font-bold">{e.caseNumber}</td>
                                                        <td className="p-3 font-bold">{e.clientName}</td>
                                                        <td className="p-3 text-slate-500 font-bold">{e.debtorName}</td>
                                                        <td className="p-3 font-bold font-mono text-slate-900">{formatCurrency(e.awardedAmount)}</td>
                                                        <td className="p-3 font-bold font-mono text-emerald-600">{formatCurrency(e.paidAmount)}</td>
                                                        <td className="p-3 font-bold">
                                                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[9px] border">
                                                                {e.status}
                                                            </span>
                                                        </td>
                                                        <td className="p-3 flex justify-center gap-1">
                                                            <button onClick={() => handleViewItem(e)} className="p-1 hover:bg-slate-200 rounded text-slate-500 cursor-pointer"><Info className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleEditItem(e)} className="p-1 hover:bg-slate-200 rounded text-teal-600 cursor-pointer"><Edit className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleDeleteItem(e.id)} className="p-1 hover:bg-slate-200 rounded text-red-600 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleTriggerPrint('إشعار مالي وسند تنفيذ جبري', { 'رقم الملف التنفيذي': e.executionNo, 'صاحب الدعوى': e.clientName, 'الخصم المدين': e.debtorName, 'مبلغ الإلزام': formatCurrency(e.awardedAmount), 'المبلغ المحصل': formatCurrency(e.paidAmount) }, `تفاصيل الإجراءات التي بوشرت تجاه المدين:\n- ${e.actionsTaken.join('\n- ')}\nملاحظة المستشار:\n${e.notes || 'لا يوجد ملاحظات إضافية'}`)} className="p-1 hover:bg-slate-200 rounded text-amber-600 cursor-pointer"><Printer className="w-3.5 h-3.5" /></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* --- FALLBACKS MAP RENDER TABLES FOR ALL OTHER TAB DESIGNS (Modules 4 to 18) --- */}
                            {activeTab !== 'dashboard' && activeTab !== 'cases' && activeTab !== 'hearings' && activeTab !== 'enforce' && activeTab !== 'litigation_simulator' && (
                                <div className="bg-white border rounded-2xl p-5 shadow-xs">
                                    <div className="flex items-center justify-between mb-4 pb-2 border-b">
                                        <h3 className="font-extrabold text-sm text-teal-900">سجلات وجدول العمل المصنف بقاعدة التقاضي</h3>
                                        <span className="text-[10px] text-slate-400 font-bold">بانتظار إيماء أو فلترة</span>
                                    </div>
                                    
                                    {/* Table with headers and columns generated on demand dynamically */}
                                    <div className="table-responsive">
                                        <table className="w-full text-right border-collapse text-xs">
                                            <thead>
                                                <tr className="bg-slate-50 border-b">
                                                    <th className="p-3 font-extrabold text-slate-700">الرمز / المعرف</th>
                                                    <th className="p-3 font-extrabold text-slate-700">المسمى / العنوان الرئيسي</th>
                                                    <th className="p-3 font-extrabold text-slate-700">التاريخ / الموعد الأصيل</th>
                                                    <th className="p-3 font-extrabold text-slate-700">التصنيف الوظيفي</th>
                                                    <th className="p-3 font-extrabold text-slate-700">حالة السجل</th>
                                                    <th className="p-3 font-extrabold text-slate-700 text-center w-28">الخيارات</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {/* Map lists according to activeTab dynamically */}
                                                {activeTab === 'judgments' && tabFilteredData.judgments.map(j => (
                                                    <tr key={j.id} className="border-b hover:bg-slate-50 transition-colors">
                                                        <td className="p-3 font-mono font-bold text-teal-850">{j.caseNumber}</td>
                                                        <td className="p-3 font-bold max-w-[250px] truncate">{j.caseTitle}</td>
                                                        <td className="p-3 font-bold">{j.issueDate}</td>
                                                        <td className="p-3 text-slate-600 font-bold">{j.courtLevel}</td>
                                                        <td className="p-3 font-bold"><span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[9px] border">{j.status}</span></td>
                                                        <td className="p-3 flex justify-center gap-1">
                                                            <button onClick={() => handleViewItem(j)} className="p-1 hover:bg-slate-200 rounded text-slate-500 cursor-pointer"><Info className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleEditItem(j)} className="p-1 hover:bg-slate-200 rounded text-teal-600 cursor-pointer"><Edit className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleDeleteItem(j.id)} className="p-1 hover:bg-slate-200 rounded text-red-600 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleTriggerPrint('صيغة حكم وقرار قضائي', { 'رقم القضية': j.caseNumber, 'الهيئة المصدرة': j.courtLevel, 'تاريخ صدور الحكم': j.issueDate, 'رئيس الجلسة': j.judgeName }, `خلاصة منطوق الحكم:\n${j.verdictSummary}\nالدعامة القانونية والشرعية للحكم:\n${j.legalGrounds}`)} className="p-1 hover:bg-slate-200 rounded text-amber-600 cursor-pointer"><Printer className="w-3.5 h-3.5" /></button>
                                                        </td>
                                                    </tr>
                                                ))}

                                                {activeTab === 'appeals' && tabFilteredData.appeals.map(a => (
                                                    <tr key={a.id} className="border-b hover:bg-slate-50 transition-colors">
                                                        <td className="p-3 font-mono font-bold text-teal-850">{a.caseNumber}</td>
                                                        <td className="p-3 font-bold max-w-[250px] truncate">{a.courtBranch}</td>
                                                        <td className="p-3 font-bold">ميعاد أقصى {a.deadlineDate}</td>
                                                        <td className="p-3 text-slate-600 font-bold">باقي للطعن {a.remainingDays} يوم</td>
                                                        <td className="p-3 font-bold"><span className="bg-rose-50 text-rose-800 px-2 py-0.5 rounded-md text-[9px] border border-rose-200">{a.status}</span></td>
                                                        <td className="p-3 flex justify-center gap-1">
                                                            <button onClick={() => handleViewItem(a)} className="p-1 hover:bg-slate-200 rounded text-slate-500 cursor-pointer"><Info className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleEditItem(a)} className="p-1 hover:bg-slate-200 rounded text-teal-600 cursor-pointer"><Edit className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleDeleteItem(a.id)} className="p-1 hover:bg-slate-200 rounded text-red-600 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleTriggerPrint('صحيفة طعن وقيد استئناف رسمي', { 'رقم القضية': a.caseNumber, 'الدائرة الاستئنافية': a.courtBranch, 'أجل القيد': a.deadlineDate }, `الأسباب الوجيزة المؤدية للاستئناف:\n${a.appealGrounds}`)} className="p-1 hover:bg-slate-200 rounded text-amber-600 cursor-pointer"><Printer className="w-3.5 h-3.5" /></button>
                                                        </td>
                                                    </tr>
                                                ))}

                                                {activeTab === 'cassations' && tabFilteredData.cassations.map(c => (
                                                    <tr key={c.id} className="border-b hover:bg-slate-50 transition-colors">
                                                        <td className="p-3 font-mono font-bold text-teal-850">{c.cassationNo}</td>
                                                        <td className="p-3 font-bold max-w-[250px] truncate">{c.caseNumber}</td>
                                                        <td className="p-3 font-bold">ميعاد أقصى {c.deadlineDate}</td>
                                                        <td className="p-3 text-slate-600 font-bold">باقي {c.remainingDays} يوم</td>
                                                        <td className="p-3 font-bold"><span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded-md text-[9px] border border-blue-200">{c.status}</span></td>
                                                        <td className="p-3 flex justify-center gap-1">
                                                            <button onClick={() => handleViewItem(c)} className="p-1 hover:bg-slate-200 rounded text-slate-500 cursor-pointer"><Info className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleEditItem(c)} className="p-1 hover:bg-slate-200 rounded text-teal-600 cursor-pointer"><Edit className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleDeleteItem(c.id)} className="p-1 hover:bg-slate-200 rounded text-red-600 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleTriggerPrint('صحيفة تمييز أمام محكمة التمييز', { 'رقم الطعن': c.cassationNo, 'القضية المستأنفة': c.caseNumber, 'الأجل الأقصى للتمييز': c.deadlineDate }, `أسباب الطعن بالتمييز والطعن على صحة الحكم الاستئنافي:\n${c.grounds}`)} className="p-1 hover:bg-slate-200 rounded text-amber-600 cursor-pointer"><Printer className="w-3.5 h-3.5" /></button>
                                                        </td>
                                                    </tr>
                                                ))}

                                                {activeTab === 'memos' && tabFilteredData.memos.map(m => (
                                                    <tr key={m.id} className="border-b hover:bg-slate-50 transition-colors">
                                                        <td className="p-3 font-mono font-bold text-teal-850">MEM-{m.id.substring(0,6)}</td>
                                                        <td className="p-3 font-bold max-w-[250px] truncate">{m.title}</td>
                                                        <td className="p-3 font-bold">محدث: {m.lastModified}</td>
                                                        <td className="p-3 text-slate-600 font-bold">{m.category}</td>
                                                        <td className="p-3 font-bold"><span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[9px] border">{m.authorName}</span></td>
                                                        <td className="p-3 flex justify-center gap-1">
                                                            <button onClick={() => handleViewItem(m)} className="p-1 hover:bg-slate-200 rounded text-slate-500 cursor-pointer"><Info className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleEditItem(m)} className="p-1 hover:bg-slate-200 rounded text-teal-600 cursor-pointer"><Edit className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleDeleteItem(m.id)} className="p-1 hover:bg-slate-200 rounded text-red-600 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleTriggerPrint('مذكرة دفاع ولوائح ختامية', { 'عنوان المذكرة': m.title, 'نوع اللائحة': m.category, 'المنشئ والمستشار': m.authorName, 'تاريخ التعديل': m.lastModified }, m.content)} className="p-1 hover:bg-slate-200 rounded text-amber-600 cursor-pointer"><Printer className="w-3.5 h-3.5" /></button>
                                                        </td>
                                                    </tr>
                                                ))}

                                                {activeTab === 'documents' && tabFilteredData.documents.map(d => (
                                                    <tr key={d.id} className="border-b hover:bg-slate-50 transition-colors">
                                                        <td className="p-3 font-mono font-bold text-teal-850">DOC-{d.id.substring(0,6)}</td>
                                                        <td className="p-3 font-bold max-w-[250px] truncate">{d.title}</td>
                                                        <td className="p-3 font-bold">{d.uploadedAt}</td>
                                                        <td className="p-3 text-slate-600 font-bold">{d.category} ({d.fileSize})</td>
                                                        <td className="p-3 font-bold"><span className="bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded-md text-[9px] border border-indigo-200">{d.fileType}</span></td>
                                                        <td className="p-3 flex justify-center gap-1">
                                                            <button onClick={() => handleViewItem(d)} className="p-1 hover:bg-slate-200 rounded text-slate-500 cursor-pointer"><Info className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleEditItem(d)} className="p-1 hover:bg-slate-200 rounded text-teal-600 cursor-pointer"><Edit className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleDeleteItem(d.id)} className="p-1 hover:bg-slate-200 rounded text-red-600 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleTriggerPrint('بيان مستند ومرفق قضائي', { 'عنوان المرفق': d.title, 'رقم القضية المرتبطة': d.caseNumber, 'نوع المستند': d.category, 'حجم الملف الفعلي': d.fileSize }, `المستند القضائي المرفق يمثل وثيقة موثقة:\n- تم إيداعه بتاريخ: ${d.uploadedAt}\nهو ملزم لأطراف الدعوى كبينة قانونية معتمدة.`)} className="p-1 hover:bg-slate-200 rounded text-amber-600 cursor-pointer"><Printer className="w-3.5 h-3.5" /></button>
                                                        </td>
                                                    </tr>
                                                ))}

                                                {activeTab === 'followups' && tabFilteredData.followups.map(f => (
                                                    <tr key={f.id} className="border-b hover:bg-slate-50 transition-colors">
                                                        <td className="p-3 font-mono font-bold text-teal-850">SEQ-{f.id.substring(0,6)}</td>
                                                        <td className="p-3 font-bold max-w-[250px] truncate">{f.description}</td>
                                                        <td className="p-3 font-bold">{f.category}</td>
                                                        <td className="p-3 text-slate-600 font-bold">المندوب/ {f.delegateName}</td>
                                                        <td className="p-3 font-bold"><span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[9px] border">{f.status}</span></td>
                                                        <td className="p-3 flex justify-center gap-1">
                                                            <button onClick={() => handleViewItem(f)} className="p-1 hover:bg-slate-200 rounded text-slate-500 cursor-pointer"><Info className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleEditItem(f)} className="p-1 hover:bg-slate-200 rounded text-teal-600 cursor-pointer"><Edit className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleDeleteItem(f.id)} className="p-1 hover:bg-slate-200 rounded text-red-600 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleTriggerPrint('مهمة ومتابعة مندوب قضائي', { 'اسم مندوب المحكمة': f.delegateName, 'رقم القضية': f.caseNumber, 'موقع المحكمة': f.court, 'التصنيف': f.category }, `التكليف الإداري لصحيفة الإعلانات:\n${f.description}\nتقرير المندوب بالمرائي:\n${f.notes || 'لا يوجد تقرير كشف.'}`)} className="p-1 hover:bg-slate-200 rounded text-amber-600 cursor-pointer"><Printer className="w-3.5 h-3.5" /></button>
                                                        </td>
                                                    </tr>
                                                ))}

                                                {activeTab === 'tasks' && tabFilteredData.tasks.map(t => (
                                                    <tr key={t.id} className="border-b hover:bg-slate-50 transition-colors">
                                                        <td className="p-3 font-mono font-bold text-teal-850">TSK-{t.id.substring(0,6)}</td>
                                                        <td className="p-3 font-bold max-w-[250px] truncate">{t.title}</td>
                                                        <td className="p-3 font-bold">أجل: {t.dueDate}</td>
                                                        <td className="p-3 text-slate-600 font-bold">المعين/ {t.assignedTo}</td>
                                                        <td className="p-3 font-bold"><span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[9px] border">{t.status}</span></td>
                                                        <td className="p-3 flex justify-center gap-1">
                                                            <button onClick={() => handleViewItem(t)} className="p-1 hover:bg-slate-200 rounded text-slate-500 cursor-pointer"><Info className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleEditItem(t)} className="p-1 hover:bg-slate-200 rounded text-teal-600 cursor-pointer"><Edit className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleDeleteItem(t.id)} className="p-1 hover:bg-slate-200 rounded text-red-600 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleTriggerPrint('تكليف مهمة عمل قانونية داخلية', { 'عنوان التكليف': t.title, 'رقم القضية المرجعية': t.caseNumber, 'المحامي أو الباحث': t.assignedTo, 'تاريخ الاستحقاق': t.dueDate, 'مستوى الأهمية': t.priority }, `مضمون وهدف تكليف مكتب عدالة:\nيرجى العمل على إنفاذ المهمة المحددة بموعدها لتجنب تفويت الجلسة.`)} className="p-1 hover:bg-slate-200 rounded text-amber-600 cursor-pointer"><Printer className="w-3.5 h-3.5" /></button>
                                                        </td>
                                                    </tr>
                                                ))}

                                                {activeTab === 'courts' && tabFilteredData.courts.map(crt => (
                                                    <tr key={crt.id} className="border-b hover:bg-slate-50 transition-colors">
                                                        <td className="p-3 font-mono font-bold text-teal-850">{crt.id}</td>
                                                        <td className="p-3 font-bold max-w-[250px] truncate">{crt.name}</td>
                                                        <td className="p-3 font-bold">{crt.workingHours}</td>
                                                        <td className="p-3 text-slate-600 font-bold">{crt.location}</td>
                                                        <td className="p-3 font-bold"><span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md text-[9px] border border-emerald-200">{crt.activeStatus}</span></td>
                                                        <td className="p-3 flex justify-center gap-1">
                                                            <button onClick={() => handleViewItem(crt)} className="p-1 hover:bg-slate-200 rounded text-slate-500 cursor-pointer"><Info className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleEditItem(crt)} className="p-1 hover:bg-slate-200 rounded text-teal-600 cursor-pointer"><Edit className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleDeleteItem(crt.id)} className="p-1 hover:bg-slate-200 rounded text-red-600 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleTriggerPrint('بيان كشف محكمة وقصر عدل كويتي', { 'اسم قصر العدل': crt.name, 'مقر العنوان': crt.location, 'الخطوط والبدالة': crt.phone, 'أوقات العمل الرسمية': crt.workingHours }, `معلومات الإرشاد والمتابعة:\nيرجى التنسيق المسبق مع مندوب الدائرة القضائية المعين لكل قصر عدل خلال ساعات العمل.`)} className="p-1 hover:bg-slate-200 rounded text-amber-600 cursor-pointer"><Printer className="w-3.5 h-3.5" /></button>
                                                        </td>
                                                    </tr>
                                                ))}

                                                {activeTab === 'circuits' && tabFilteredData.circuits.map(cir => (
                                                    <tr key={cir.id} className="border-b hover:bg-slate-50 transition-colors">
                                                        <td className="p-3 font-mono font-bold text-teal-850">{cir.id}</td>
                                                        <td className="p-3 font-bold max-w-[250px] truncate">{cir.name}</td>
                                                        <td className="p-3 font-bold">{cir.sessionDay}</td>
                                                        <td className="p-3 text-slate-600 font-bold">المستشار/ {cir.headJudge}</td>
                                                        <td className="p-3 font-bold"><span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[9px] border">{cir.type}</span></td>
                                                        <td className="p-3 flex justify-center gap-1">
                                                            <button onClick={() => handleViewItem(cir)} className="p-1 hover:bg-slate-200 rounded text-slate-500 cursor-pointer"><Info className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleEditItem(cir)} className="p-1 hover:bg-slate-200 rounded text-teal-600 cursor-pointer"><Edit className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleDeleteItem(cir.id)} className="p-1 hover:bg-slate-200 rounded text-red-600 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleTriggerPrint('تقرير الدائرة والقرارات الصادرة', { 'الدائرة القضائية': cir.name, 'الرئيس المستشار': cir.headJudge, 'يوم الانعقاد والجدول': cir.sessionDay, 'المحكمة المنتسبة': cir.courtName }, `نوع الاختصاص:\n${cir.type}`)} className="p-1 hover:bg-slate-200 rounded text-amber-600 cursor-pointer"><Printer className="w-3.5 h-3.5" /></button>
                                                        </td>
                                                    </tr>
                                                ))}

                                                {activeTab === 'clients' && tabFilteredData.clients.map(cli => (
                                                    <tr key={cli.id} className="border-b hover:bg-slate-50 transition-colors">
                                                        <td className="p-3 font-mono font-bold text-teal-850">{cli.civilOrRegId}</td>
                                                        <td className="p-3 font-bold max-w-[250px] truncate">{cli.name}</td>
                                                        <td className="p-3 font-bold">هاتف: {cli.phone}</td>
                                                        <td className="p-3 text-slate-600 font-bold">ملفات نشطة ({cli.activeCasesCount})</td>
                                                        <td className="p-3 font-bold"><span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md text-[9px] border border-emerald-200">{cli.trustScore}</span></td>
                                                        <td className="p-3 flex justify-center gap-1">
                                                            <button onClick={() => handleViewItem(cli)} className="p-1 hover:bg-slate-200 rounded text-slate-500 cursor-pointer"><Info className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleEditItem(cli)} className="p-1 hover:bg-slate-200 rounded text-teal-600 cursor-pointer"><Edit className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleDeleteItem(cli.id)} className="p-1 hover:bg-slate-200 rounded text-red-600 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleTriggerPrint('بطاقة كشف موكل بمكتب المحاماة', { 'الاسم الكامل': cli.name, 'الرقم المدني/التجاري': cli.civilOrRegId, 'الهاتف': cli.phone, 'البريد الإلكتروني': cli.email }, `تقرير الجوانب الائتمانية والتعاقدية للموكل:\n- مستوى الالتزام والدفع المالي: ${cli.trustScore}\n- عدد القضايا القانونية المرفوعة لحصته: ${cli.activeCasesCount}.`)} className="p-1 hover:bg-slate-200 rounded text-amber-600 cursor-pointer"><Printer className="w-3.5 h-3.5" /></button>
                                                        </td>
                                                    </tr>
                                                ))}

                                                {activeTab === 'opponents' && tabFilteredData.opponents.map(opp => (
                                                    <tr key={opp.id} className="border-b hover:bg-slate-50 transition-colors">
                                                        <td className="p-3 font-mono font-bold text-teal-850">{opp.id}</td>
                                                        <td className="p-3 font-bold max-w-[250px] truncate">{opp.name}</td>
                                                        <td className="p-3 font-bold">الوكيل القانوني: {opp.legalRepName}</td>
                                                        <td className="p-3 text-slate-600 font-bold">شؤون المنازعة ({opp.activeCasesCount})</td>
                                                        <td className="p-3 font-bold"><span className="bg-linear-to-r from-red-50 to-orange-50 text-red-800 px-2 py-0.5 rounded-md text-[9px] border border-red-200">{opp.riskStatus}</span></td>
                                                        <td className="p-3 flex justify-center gap-1">
                                                            <button onClick={() => handleViewItem(opp)} className="p-1 hover:bg-slate-200 rounded text-slate-500 cursor-pointer"><Info className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleEditItem(opp)} className="p-1 hover:bg-slate-200 rounded text-teal-600 cursor-pointer"><Edit className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleDeleteItem(opp.id)} className="p-1 hover:bg-slate-200 rounded text-red-600 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleTriggerPrint('صحيفة بيانات وبيان خصومة', { 'الخصم المحدد': opp.name, 'التمثيل والدفاع المقابل': opp.legalRepName, 'هاتف المكتب': opp.phone }, `تقدير سلوك الدفاع الخارجي ومستوى التعنت العقدي والحلول الودية المتاحة:\n- سلوك الخصم المصنف: ${opp.riskStatus}`)} className="p-1 hover:bg-slate-200 rounded text-amber-600 cursor-pointer"><Printer className="w-3.5 h-3.5" /></button>
                                                        </td>
                                                    </tr>
                                                ))}

                                                {activeTab === 'notifications' && tabFilteredData.notifications.map(n => (
                                                    <tr key={n.id} className="border-b hover:bg-slate-50 transition-colors">
                                                        <td className="p-3 font-mono font-bold text-teal-850">NOT-{n.id.substring(0,6)}</td>
                                                        <td className="p-3 font-bold max-w-[250px] truncate">{n.recipientName}</td>
                                                        <td className="p-3 font-bold">صادر بتاريخ {n.sentDate}</td>
                                                        <td className="p-3 text-slate-600 font-bold">{n.type} ({n.deliveryMethod})</td>
                                                        <td className="p-3 font-bold"><span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md text-[9px] border border-emerald-200">{n.status}</span></td>
                                                        <td className="p-3 flex justify-center gap-1">
                                                            <button onClick={() => handleViewItem(n)} className="p-1 hover:bg-slate-200 rounded text-slate-500 cursor-pointer"><Info className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleEditItem(n)} className="p-1 hover:bg-slate-200 rounded text-teal-600 cursor-pointer"><Edit className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleDeleteItem(n.id)} className="p-1 hover:bg-slate-200 rounded text-red-600 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleTriggerPrint('محضر إعلان رسمي وتوجيه', { 'وجه الإعلان إلى': n.recipientName, 'رقم القضية': n.caseNumber, 'نوع المحضر': n.type, 'تاريخ وتصدر': n.sentDate, 'طريقة الإرسال': n.deliveryMethod }, `نشهد بموجب هذا بأن الإعلان القضائي قد سلك الطرق المحددة بموجب الحالة: ${n.status}`)} className="p-1 hover:bg-slate-200 rounded text-amber-600 cursor-pointer"><Printer className="w-3.5 h-3.5" /></button>
                                                        </td>
                                                    </tr>
                                                ))}

                                                {activeTab === 'appointments' && tabFilteredData.appointments.map(a => (
                                                    <tr key={a.id} className="border-b hover:bg-slate-50 transition-colors">
                                                        <td className="p-3 font-mono font-bold text-teal-850">APT-{a.id.substring(0,6)}</td>
                                                        <td className="p-3 font-bold max-w-[250px] truncate">{a.title}</td>
                                                        <td className="p-3 font-bold">{a.date} | {a.time}</td>
                                                        <td className="p-3 text-slate-600 font-bold">{a.category}</td>
                                                        <td className="p-3 font-bold"><span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[9px] border">{a.location}</span></td>
                                                        <td className="p-3 flex justify-center gap-1">
                                                            <button onClick={() => handleViewItem(a)} className="p-1 hover:bg-slate-200 rounded text-slate-500 cursor-pointer"><Info className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleEditItem(a)} className="p-1 hover:bg-slate-200 rounded text-teal-600 cursor-pointer"><Edit className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleDeleteItem(a.id)} className="p-1 hover:bg-slate-200 rounded text-red-600 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleTriggerPrint('جدول موعد وتكليف', { 'العنوان والمسمى': a.title, 'موعد الجدولة': `${a.date} في ${a.time}`, 'الموقع والمقر': a.location, 'التصنيف': a.category }, `المحامي الموكل بالحضور لتغطية الحيثيات:\n- ${a.assignedLawyer}`)} className="p-1 hover:bg-slate-200 rounded text-amber-600 cursor-pointer"><Printer className="w-3.5 h-3.5" /></button>
                                                        </td>
                                                    </tr>
                                                ))}

                                                {activeTab === 'reports' && reports.map(rep => (
                                                    <tr key={rep.id} className="border-b hover:bg-slate-50 transition-colors">
                                                        <td className="p-3 font-mono font-bold text-teal-850">{rep.id}</td>
                                                        <td className="p-3 font-bold max-w-[250px] truncate">{rep.title}</td>
                                                        <td className="p-3 font-bold">{rep.period}</td>
                                                        <td className="p-3 text-slate-600 font-bold">نسبة الكسب: {rep.winRatio}%</td>
                                                        <td className="p-3 font-bold"><span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md text-[9px] border border-emerald-200">التحصيل {formatCurrency(rep.collectedAmounts)}</span></td>
                                                        <td className="p-3 flex justify-center gap-1">
                                                            <button onClick={() => handleViewItem(rep)} className="p-1 hover:bg-slate-200 rounded text-slate-500 cursor-pointer"><Info className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleEditItem(rep)} className="p-1 hover:bg-slate-200 rounded text-teal-600 cursor-pointer"><Edit className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleDeleteItem(rep.id)} className="p-1 hover:bg-slate-200 rounded text-red-600 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleTriggerPrint('تقرير إحصائي ومؤشر كسب القضايا الربع سنوي', { 'عنوان التقرير': rep.title, 'الفترة والمدار': rep.period, 'صاحب التقرير': rep.creator, 'تاريخ الإنشاء': rep.generatedAt }, `النسب والمؤشرات القضائية:\n- معدل كسب الدعاوى: ${rep.winRatio}%\n- إجمالي المبالغ المستخلصة بموجب أحكام التنفيذ الجبري لملفاتنا: ${formatCurrency(rep.collectedAmounts)}\n- عدد القضايا القانونية النشطة المشمولة بالرصد: ${rep.activeCasesCount}.`)} className="p-1 hover:bg-slate-200 rounded text-amber-600 cursor-pointer"><Printer className="w-3.5 h-3.5" /></button>
                                                        </td>
                                                    </tr>
                                                ))}

                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'litigation_simulator' && (
                                <LitigationSimulatorPanel 
                                    handleTriggerPrint={handleTriggerPrint}
                                    addToast={addToast}
                                />
                            )}

                            {activeTab === 'court_hearing_simulator' && (
                                <CourtHearingSimulatorPanel 
                                    handleTriggerPrint={handleTriggerPrint}
                                    addToast={addToast}
                                    cases={cases}
                                />
                            )}

                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* --- CORE FORM ADD/EDIT/VIEW MODAL OVERLAY --- */}
            <AnimatePresence>
                {isFormModalOpen && (
                    <div className="fixed inset-0 z-45 flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-xs select-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl text-right font-sans overflow-hidden flex flex-col max-h-[85vh]"
                        >
                            <div className="bg-teal-800 text-white px-6 py-4 flex items-center justify-between">
                                <h3 className="font-black text-sm">
                                    {formMode === 'view' ? 'تفاصيل السجل القانوني الكامل والأولويات' : formMode === 'add' ? 'إضافة سجل جديد للنظام الأساسي' : 'تعديل وتدقيق بيانات السجل القضائي الكويتي'}
                                </h3>
                                <button onClick={() => setIsFormModalOpen(false)} className="text-white hover:text-amber-400">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-4 flex-grow text-xs">
                                
                                {/* Dynamic generic form inputs based on the selected tab */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    
                                    {/* Handle Render form elements depending on the sub-workspace */}
                                    {activeTab === 'cases' && (
                                        <>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-500 mb-1">الرقم المدني / القضية (*)</label>
                                                <input required type="text" value={formData.caseNumber || ''} onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })} className="w-full border rounded-lg p-2 focus:outline-hidden focus:border-teal-700 font-bold" disabled={formMode === 'view'} />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-500 mb-1">اسم الموكل بالكامل (*)</label>
                                                <input required type="text" value={formData.clientName || ''} onChange={(e) => setFormData({ ...formData, clientName: e.target.value })} className="w-full border rounded-lg p-2 focus:outline-hidden focus:border-teal-700 font-bold" disabled={formMode === 'view'} />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-500 mb-1">اسم الخصم المقابل (*)</label>
                                                <input required type="text" value={formData.opponentName || ''} onChange={(e) => setFormData({ ...formData, opponentName: e.target.value })} className="w-full border rounded-lg p-2 focus:outline-hidden focus:border-teal-700 font-bold" disabled={formMode === 'view'} />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-500 mb-1">المحكمة المعنية (*)</label>
                                                <input required type="text" value={formData.court || ''} onChange={(e) => setFormData({ ...formData, court: e.target.value })} className="w-full border rounded-lg p-2 focus:outline-hidden focus:border-teal-700 font-bold" disabled={formMode === 'view'} />
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className="block text-[10px] font-black text-slate-500 mb-1">عنوان وملخص لائحة الادعاء (*)</label>
                                                <textarea required value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full border rounded-lg p-2 focus:outline-hidden focus:border-teal-700 font-bold" rows={2} disabled={formMode === 'view'} />
                                            </div>
                                        </>
                                    )}

                                    {activeTab === 'hearings' && (
                                        <>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-500 mb-1">رقم القضية (*)</label>
                                                <input required type="text" value={formData.caseNumber || ''} onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })} className="w-full border rounded-lg p-2 focus:outline-hidden focus:border-teal-700 font-bold" disabled={formMode === 'view'} />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-500 mb-1">عنوان ملف الجلسة (*)</label>
                                                <input required type="text" value={formData.caseTitle || ''} onChange={(e) => setFormData({ ...formData, caseTitle: e.target.value })} className="w-full border rounded-lg p-2 focus:outline-hidden focus:border-teal-700 font-bold" disabled={formMode === 'view'} />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-500 mb-1">تاريخ الجلسة المقررة (*)</label>
                                                <input required type="date" value={formData.date || ''} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full border rounded-lg p-2 focus:outline-hidden focus:border-teal-700 font-bold" disabled={formMode === 'view'} />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-500 mb-1">توقيت الانعقاد والآجال (*)</label>
                                                <input required type="time" value={formData.time || ''} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className="w-full border rounded-lg p-2 focus:outline-hidden focus:border-teal-700 font-bold" disabled={formMode === 'view'} />
                                            </div>
                                        </>
                                    )}

                                    {/* Fallback simplified form layout for other generic tabs */}
                                    {activeTab !== 'cases' && activeTab !== 'hearings' && (
                                        <>
                                            <div className="sm:col-span-2">
                                                <p className="p-3 bg-amber-50 text-teal-950 rounded-xl border border-amber-200">
                                                    <strong>إرشاد عدالة:</strong> يرجى تعبئة الحقلين أدناه ببيانات تفصيلية لاعتماد السند وملفات الاستئناف والطعن والدفع والتحصيل بصفة معتمدة.
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-500 mb-1">المعرف / رقم السجل الرئيسي (*)</label>
                                                <input required type="text" value={formData.caseNumber || formData.id || ''} onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })} className="w-full border rounded-lg p-2 focus:outline-hidden focus:border-teal-700 font-bold" disabled={formMode === 'view'} />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-500 mb-1">العنوان أو الوجهة المنظورة (*)</label>
                                                <input required type="text" value={formData.caseTitle || formData.title || formData.name || ''} onChange={(e) => setFormData({ ...formData, caseTitle: e.target.value, title: e.target.value, name: e.target.value })} className="w-full border rounded-lg p-2 focus:outline-hidden focus:border-teal-700 font-bold" disabled={formMode === 'view'} />
                                            </div>
                                        </>
                                    )}

                                </div>

                                <div className="border-t pt-4 flex justify-end gap-2 text-xs font-bold font-sans">
                                    <button
                                        type="button"
                                        onClick={() => setIsFormModalOpen(false)}
                                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-lg cursor-pointer"
                                    >
                                        إغلاق
                                    </button>
                                    {formMode !== 'view' && (
                                        <button
                                            type="submit"
                                            className="bg-teal-700 hover:bg-teal-800 text-white px-5 py-2 rounded-lg cursor-pointer"
                                        >
                                            حفظ السجل
                                        </button>
                                    )}
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* --- LEGAL PRINT SYSTEM OVERLAY MODULE --- */}
            {isPrintModalOpen && printDoc && (
                <LegalPrintSystem
                    isOpen={isPrintModalOpen}
                    onClose={() => setIsPrintModalOpen(false)}
                    title={printDoc.title}
                    refNo={printDoc.refNo || 'ADL-129402'}
                    metadata={printDoc.metadata || {}}
                    content={printDoc.content || ''}
                    showStamp={true}
                />
            )}

        </div>
    );
};

export default LitigationToolsPage;
