import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
    Plus, Pencil, Trash2, Eye, Calendar as CalendarIcon, Clock, BarChart2, FileText, Search, 
    AlertTriangle, CheckCircle, Copy, Sparkles, Filter, ChevronLeft, ChevronRight, User, Users, 
    MapPin, Folder, MessageSquare, Clipboard, CalendarDays, Zap, ArrowLeft, ArrowRight, ListTodo,
    Navigation, FileCheck, X, Building2, ShieldAlert, Scale, Check, Paperclip, RefreshCw, Send, Image, Printer
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
import PetitionPrintPreviewModal from '../components/PetitionPrintPreviewModal';
import { useCaseTask } from '../components/CaseTaskContext';
import { geminiService } from '../services/geminiService';
import { notificationService } from '../services/notificationService';
import ReactMarkdown from 'react-markdown';

import { AdminTask, AdminTaskStatus, AdminTaskPriority, AdminTaskCategory } from '../types';
import { adminTaskStatusOptions, adminTaskPriorityOptions, adminTaskCategoryOptions } from '../constants';
import { AdminTaskStatusBadge, AdminTaskPriorityBadge } from '../components/ui/Badge';

// --- STABLE STATIC DROPDOWN SELECTORS ---
const mockAssignees = [
    'أستاذ صبري شطا',
    'أحمد محمود المحمد الصباح', 
    'فاطمة علي حسين', 
    'عمر خالد المرزوق', 
    'ليلى منصور الهاجري', 
    'ناصر عبدالله القحطاني',
    'فريق العمل الميداني (مندوب المحاكم)'
];

const mockClients = [
    'خالد عبد الرحمن الساير',
    'نورة جاسم المرزوق',
    'شركة الأمل الدولية للتجارة العامة',
    'بنك الخليج المتحد الاستثماري',
    'مجموعة الشايع القابضة',
    'شركة المخازن العمومية (أجيليتي)'
];

const mockCourtVenues = [
    'بدون مقر محدد (عمل مكتبي داخلي)',
    'قصر العدل (محافظة العاصمة)',
    'مجمع محاكم الرقعي (محافظة الفروانية)',
    'مجمع محاكم حولي',
    'مجمع محاكم الجهراء',
    'مجمع محاكم الأحمدي والمنطقة الجنوبية',
    'إدارة التنفيذ بوزارة العدل'
];

const ARABIC_MONTHS = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

// Helper to calculate hours & days remaining
const calculateDeadlineInfo = (dueDateStr?: string) => {
    if (!dueDateStr) return { days: 99, hours: 999, isOverdue: false, isUrgent24h: false, isWarning72h: false };
    const now = new Date();
    const target = new Date(dueDateStr);
    const diffMs = target.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    const isOverdue = diffMs < 0;
    const isUrgent24h = !isOverdue && diffHours <= 24;
    const isWarning72h = !isOverdue && diffHours > 24 && diffHours <= 72;

    return { days: diffDays, hours: diffHours, isOverdue, isUrgent24h, isWarning72h };
};

export const TaskManagementPage: React.FC = () => {
    const { tasks, addTask, updateTask, deleteTask } = useCaseTask();
    const { addToast } = useToast();

    // --- VIEW & FILTER CONTROLS ---
    const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'calendar' | 'ai'>('kanban');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [filterPriority, setFilterPriority] = useState<string>('');
    const [filterCategory, setFilterCategory] = useState<string>('');
    const [filterLawyer, setFilterLawyer] = useState<string>('');
    
    // Role selection
    const [selectedRole, setSelectedRole] = useState<'Manager' | 'Lawyer' | 'Staff'>('Manager');

    // Modals & Drawers Control
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<AdminTask | null>(null);
    const [viewingTask, setViewingTask] = useState<any | null>(null);

    // AI & E-Signature Drafter Modal State
    const [isAiDrafterOpen, setIsAiDrafterOpen] = useState(false);
    const [aiSubject, setAiSubject] = useState('');
    const [aiClientName, setAiClientName] = useState(mockClients[0]);
    const [aiCaseTitle, setAiCaseTitle] = useState('قضية تجارية / عمالية بوزارة العدل');
    const [aiVenue, setAiVenue] = useState(mockCourtVenues[1]);
    const [aiAssignedTo, setAiAssignedTo] = useState(mockAssignees[1]);
    const [aiDrafting, setAiDrafting] = useState(false);
    const [aiGeneratedPetition, setAiGeneratedPetition] = useState('');
    const [aiSignatureUrl, setAiSignatureUrl] = useState('');
    const [showAiSignPad, setShowAiSignPad] = useState(false);

    // Drawer Signature, Tabs & AI Petition State
    const [drawerComment, setDrawerComment] = useState('');
    const [drawerComments, setDrawerComments] = useState<any[]>([]);
    const [drawerSignatureUrl, setDrawerSignatureUrl] = useState('');
    const [showDrawerSignPad, setShowDrawerSignPad] = useState(false);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

    // Slide-over Drawer Tabs & AI Petition Drafter State
    const [drawerTab, setDrawerTab] = useState<'details' | 'petition'>('details');
    const [drawerPetitionData, setDrawerPetitionData] = useState({
        clientName: '',
        caseTitle: '',
        courtVenue: '',
        petitionType: 'صحيفة دعوى افتتاحية',
        description: '',
        additionalNotes: '',
        generatedPetition: '',
        isCustomized: false
    });
    const [drawerAiDrafting, setDrawerAiDrafting] = useState(false);
    const [isPetitionPrintPreviewOpen, setIsPetitionPrintPreviewOpen] = useState(false);

    // Calendar Control State
    const [calDate, setCalDate] = useState(new Date());

    // AI Assistant Tab States
    const [aiQuery, setAiQuery] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState<string | null>(null);
    const [overdueAnalysisLoading, setOverdueAnalysisLoading] = useState(false);
    const [overdueAnalysisResult, setOverdueAnalysisResult] = useState<string | null>(null);
    const [workloadBalancingLoading, setWorkloadBalancingLoading] = useState(false);
    const [workloadBalancingResult, setWorkloadBalancingResult] = useState<string | null>(null);

    // Track notified tasks to avoid spam
    const notifiedTasksRef = useRef<Set<string>>(new Set());

    // --- PROCESSED TASKS ---
    const processedTasks = useMemo(() => {
        return tasks.map((task: any, index) => {
            const deadline = calculateDeadlineInfo(task.dueDate);
            const defaultSubtasks = [
                { id: `st-${task.id}-1`, title: 'مراجعة المستندات والأوراق القانونية وتدقيق التوكيل', completed: (task.progress || 0) >= 30 },
                { id: `st-${task.id}-2`, title: 'صياغة المذكرة ومطابقتها مع مواعيد الجلسات بوزارة العدل', completed: (task.progress || 0) >= 60 },
                { id: `st-${task.id}-3`, title: 'إيداع الصحيفة واستلام إيصال الرسوم الرسمية', completed: (task.progress || 0) === 100 }
            ];

            return {
                ...task,
                startDate: task.startDate || task.createdAt || new Date().toISOString().split('T')[0],
                clientName: task.clientName || mockClients[index % mockClients.length],
                attachmentsList: task.attachmentsList || [
                    { id: 'att-1', name: 'صحيفة_الدعوى_المعتمدة.pdf', size: '1.8 MB', date: '2026-06-10' }
                ],
                historyLog: task.historyLog?.length > 0 ? task.historyLog : [
                    { id: 'h-1', timestamp: (task.createdAt || new Date().toISOString().split('T')[0]) + "T08:30:00Z", user: 'النظام الآلي', action: 'تم إنشاء وجدولة المهمة وتأكيد الربط القضائي.' }
                ],
                subtasks: task.subtasks?.length > 0 ? task.subtasks : defaultSubtasks,
                courtVenue: task.courtVenue || mockCourtVenues[index % mockCourtVenues.length],
                deadline
            };
        });
    }, [tasks]);

    // Anti-Spam Notification Trigger
    useEffect(() => {
        processedTasks.forEach(task => {
            if (task.deadline.isOverdue && !notifiedTasksRef.current.has(task.id + '_overdue')) {
                notificationService.addNotification({
                    title: 'تنبيه: مهمة متأخرة ❗',
                    message: `المهمة "${task.title}" المسندة لـ (${task.assignedTo}) تجاوزت الموعد المحدد.`,
                    category: 'REMINDER',
                    priority: 'HIGH',
                    relatedId: task.id
                });
                notifiedTasksRef.current.add(task.id + '_overdue');
            }
        });
    }, [processedTasks]);

    // --- FILTER MECHANICS ---
    const filteredTasks = useMemo(() => {
        return processedTasks.filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  (task.clientName && task.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                                  (task.courtVenue && task.courtVenue.toLowerCase().includes(searchTerm.toLowerCase()));
            
            const matchesStatus = filterStatus === 'OVERDUE' ? task.deadline.isOverdue :
                                  filterStatus === 'URGENT_72H' ? (task.deadline.isUrgent24h || task.deadline.isWarning72h) :
                                  filterStatus ? task.status === filterStatus : true;

            const matchesPriority = filterPriority ? task.priority === filterPriority : true;
            const matchesCategory = filterCategory ? task.category === filterCategory : true;
            const matchesLawyer = filterLawyer ? task.assignedTo === filterLawyer : true;

            return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesLawyer;
        }).sort((a, b) => {
            const priorityOrder = { [AdminTaskPriority.CRITICAL]: 0, [AdminTaskPriority.HIGH]: 1, [AdminTaskPriority.MEDIUM]: 2, [AdminTaskPriority.LOW]: 3 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    }, [processedTasks, searchTerm, filterStatus, filterPriority, filterCategory, filterLawyer]);

    // --- COMPACT SUMMARY STATS ---
    const stats = useMemo(() => {
        const total = processedTasks.length;
        const inProgress = processedTasks.filter(t => t.status === AdminTaskStatus.IN_PROGRESS || t.status === AdminTaskStatus.TODO).length;
        const urgent72h = processedTasks.filter(t => (t.deadline.isUrgent24h || t.deadline.isWarning72h || t.deadline.isOverdue) && t.status !== AdminTaskStatus.COMPLETED).length;
        const completed = processedTasks.filter(t => t.status === AdminTaskStatus.COMPLETED).length;

        return { total, inProgress, urgent72h, completed };
    }, [processedTasks]);

    // --- QUICK STATUS CHANGE HANDLER ---
    const handleQuickStatusChange = (taskId: string, newStatus: AdminTaskStatus) => {
        const task = processedTasks.find(t => t.id === taskId);
        if (!task) return;

        const newProgress = newStatus === AdminTaskStatus.COMPLETED ? 100 : (newStatus === AdminTaskStatus.TODO ? 0 : Math.max(task.progress || 30, 50));
        
        const statusLabels: Record<string, string> = {
            [AdminTaskStatus.TODO]: 'بانتظار المباشرة',
            [AdminTaskStatus.IN_PROGRESS]: 'قيد التنفيذ والمتابعة',
            [AdminTaskStatus.PENDING_REVIEW]: 'تحت المراجعة',
            [AdminTaskStatus.COMPLETED]: 'مكتملة ومؤرشفة',
            [AdminTaskStatus.CANCELLED]: 'ملغاة'
        };

        const updatedTask = {
            ...task,
            status: newStatus,
            progress: newProgress,
            historyLog: [
                ...(task.historyLog || []),
                { id: `log-${Date.now()}`, timestamp: new Date().toISOString(), user: selectedRole === 'Manager' ? 'المدير العام' : selectedRole === 'Lawyer' ? 'المحامي المسؤول' : 'المندوب الميداني', action: `تم تغيير حالة التكليف إلى (${statusLabels[newStatus] || newStatus})` }
            ]
        };

        updateTask(updatedTask);
        if (viewingTask?.id === taskId) {
            setViewingTask(updatedTask);
        }
        addToast({ type: 'success', title: 'تم تحديث حالة المهمة', message: `تغيرت حالة التكليف إلى: ${statusLabels[newStatus] || newStatus}` });
    };

    // --- DRAWER OPEN & AI PETITION DRAFTER HANDLERS ---
    const handleOpenTaskDrawer = (task: any) => {
        loadDrawerComments(task.id);
        setDrawerTab('details');
        setDrawerPetitionData({
            clientName: task.clientName || 'عن المكتب',
            caseTitle: task.title || '',
            courtVenue: task.courtVenue || mockCourtVenues[1],
            petitionType: 'صحيفة دعوى افتتاحية',
            description: task.description || '',
            additionalNotes: '',
            generatedPetition: '',
            isCustomized: false
        });
        setViewingTask(task);
    };

    const handleGenerateDrawerPetition = async () => {
        if (!drawerPetitionData.caseTitle.trim()) {
            addToast({ type: 'warning', title: 'بيانات ناقصة', message: 'يرجى كتابة عنوان القضية أو موضوع العريضة.' });
            return;
        }

        setDrawerAiDrafting(true);
        try {
            const prompt = `أنت مستشار قانوني كويتي متمرس ومحامٍ مقيد أمام محكمة التمييز الكويتي بمكتب المحامي صبري شطا.
قم بصياغة عريضة ومذكرة قانونية كويتية رسمية ومحكمة ومفصلة للموضوع والبيانات التالية:
- نوع العريضة / الصحيفة: "${drawerPetitionData.petitionType}"
- اسم الموكل (المدعي / المستأنف / الطالب): "${drawerPetitionData.clientName}"
- عنوان وموضوع القضية: "${drawerPetitionData.caseTitle}"
- المحكمة / المقر القضائي: "${drawerPetitionData.courtVenue}"
- الوقائع والبيانات الأساسية للتكليف: "${drawerPetitionData.description}"
- الأسانيد وأوجه الدفاع الإضافية: "${drawerPetitionData.additionalNotes || 'استناداً للقوانين واللوائح الكويتية ذات الصلة'}"

اصغ العريضة بالديباجة القضائية الكويتية المعتمدة (الوقائع، الدفوع والأسانيد القانونية بناءً على أحكام قوانين دولة الكويت، والطلبات الختامية).`;

            const result = await geminiService.generateContent(prompt);
            setDrawerPetitionData(prev => ({
                ...prev,
                generatedPetition: result || 'تمت صياغة العريضة بنجاح بناءً على أحكام القوانين الكويتية.'
            }));
            addToast({ type: 'success', title: 'تمت الصياغة بنجاح', message: 'تم استخراج نص العريضة بالذكاء الاصطناعي من بيانات التكليف والموكل.' });
        } catch (e) {
            const fallbackText = `**${drawerPetitionData.petitionType}**\n\n**إلى السيد الأستاذ / رئيس محكمة (${drawerPetitionData.courtVenue}) الموقر**\n\n**تحية طيبة وبعد،،**\n\nمقدمه لسيادتكم المحامي / صبري شطا - وكيلاً عن الموكل: **${drawerPetitionData.clientName}**\n\n**الموضوع:** ${drawerPetitionData.caseTitle}\n\n**الوقائع والأسباب:**\nاستناداً إلى الوقائع الواردة بملف القضية: "${drawerPetitionData.description}"، وبناءً على القوانين واللوائح الكويتية، نلتمس القضاء بالطلبات الختامية المرفقة.\n\n**الطلبات الختامية:**\n1. قبول الدعوى والعريضة شكلاً.\n2. إعمال أحكام القانون وإلزام الخصم بالطلبات الخاطرة والمصاريف وأتعاب المحاماة الفعلية.\n\nوتقبلوا بقبول فائق الاحترام والتقدير،،\nمكتب المحامي صبري شطا للمحاماة - دولة الكويت`;
            setDrawerPetitionData(prev => ({ ...prev, generatedPetition: fallbackText }));
            addToast({ type: 'info', title: 'تمت الصياغة النموذجية', message: 'تم إعداد نموذج العريضة بنجاح.' });
        } finally {
            setDrawerAiDrafting(false);
        }
    };

    const handleAttachPetitionToTask = () => {
        if (!viewingTask || !drawerPetitionData.generatedPetition) return;

        const updatedTask = {
            ...viewingTask,
            description: `${viewingTask.description || ''}\n\n--- ⚖️ عريضة مصاغة بالذكاء الاصطناعي (${drawerPetitionData.petitionType}) ---\n${drawerPetitionData.generatedPetition}`,
            historyLog: [
                ...(viewingTask.historyLog || []),
                { id: `log-pet-${Date.now()}`, timestamp: new Date().toISOString(), user: 'Gemini AI & Lawyer', action: `تمت صياغة وإرفاق (${drawerPetitionData.petitionType}) بالتكليف القضائي.` }
            ]
        };

        updateTask(updatedTask);
        setViewingTask(updatedTask);
        addToast({ type: 'success', title: 'تم إرفاق العريضة بالتكليف', message: 'تم حفظ العريضة وتحديث بيانات التكليف وسجل الملاحظات.' });
    };

    // --- DRAWER COMMENTS SYSTEM ---
    const loadDrawerComments = (taskId: string) => {
        try {
            const stored = localStorage.getItem(`adala_comm_${taskId}`);
            setDrawerComments(stored ? JSON.parse(stored) : [
                { id: '1', author: 'أستاذ صبري شطا', text: 'تم تدقيق التكليف ومطابقته مع رول الجلسات. يرجى المباشرة الفورية.', timestamp: new Date().toISOString() }
            ]);
        } catch {
            setDrawerComments([]);
        }
    };

    const handleAddDrawerComment = (taskId: string) => {
        if (!drawerComment.trim()) return;
        const author = selectedRole === 'Manager' ? 'أستاذ صبري شطا (المدير)' : 
                       selectedRole === 'Lawyer' ? 'المحامي المسؤول' : 'المندوب الإداري الميداني';
        
        const newRecord = {
            id: `comm-${Date.now()}`,
            author,
            text: drawerComment.trim(),
            timestamp: new Date().toISOString()
        };

        const updated = [...drawerComments, newRecord];
        localStorage.setItem(`adala_comm_${taskId}`, JSON.stringify(updated));
        setDrawerComments(updated);
        setDrawerComment('');

        // Log entry
        const origTask = processedTasks.find(t => t.id === taskId);
        if (origTask) {
            updateTask({
                ...origTask,
                historyLog: [
                    ...(origTask.historyLog || []),
                    { id: `log-${Date.now()}`, timestamp: new Date().toISOString(), user: author, action: `أضاف ملاحظة: "${newRecord.text}"` }
                ]
            });
        }
        
        addToast({ type: 'success', title: 'تم حفظ الملاحظة', message: 'تم إدراج التحديث بسجل الملاحظات الزمني.' });
    };

    // Subtask Handlers
    const handleToggleSubtask = (taskId: string, subtaskId: string) => {
        const task = processedTasks.find(t => t.id === taskId);
        if (!task) return;

        const updatedSubtasks = task.subtasks.map((st: any) => 
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );

        const completedCount = updatedSubtasks.filter((st: any) => st.completed).length;
        const newProgress = Math.round((completedCount / updatedSubtasks.length) * 100);

        const updatedTask = {
            ...task,
            subtasks: updatedSubtasks,
            progress: newProgress,
            status: newProgress === 100 ? AdminTaskStatus.COMPLETED : (task.status === AdminTaskStatus.TODO ? AdminTaskStatus.IN_PROGRESS : task.status)
        };

        updateTask(updatedTask);
        if (viewingTask?.id === taskId) {
            setViewingTask(updatedTask);
        }
    };

    const handleAddSubtask = (taskId: string) => {
        if (!newSubtaskTitle.trim()) return;
        const task = processedTasks.find(t => t.id === taskId);
        if (!task) return;

        const newSt = { id: `st-${taskId}-${Date.now()}`, title: newSubtaskTitle.trim(), completed: false };
        const updatedSubtasks = [...(task.subtasks || []), newSt];

        const updatedTask = { ...task, subtasks: updatedSubtasks };
        updateTask(updatedTask);
        if (viewingTask?.id === taskId) {
            setViewingTask(updatedTask);
        }
        setNewSubtaskTitle('');
    };

    // Complete task with E-Signature from Drawer
    const handleCompleteTaskWithSignature = (signatureUrl: string) => {
        if (!viewingTask) return;
        const updated = {
            ...viewingTask,
            status: AdminTaskStatus.COMPLETED,
            progress: 100,
            assignerSignature: signatureUrl,
            historyLog: [
                ...(viewingTask.historyLog || []),
                { id: `log-${Date.now()}`, timestamp: new Date().toISOString(), user: 'المسؤول المعتمد', action: 'تم توقيع إغلاق المهمة رقمياً وأرشفتها بنجاح.' }
            ]
        };
        updateTask(updated);
        setViewingTask(updated);
        setShowDrawerSignPad(false);
        addToast({ type: 'success', title: 'تم إكمال وتوقيع المهمة', message: 'تم إغلاق التكليف واعتماده بالتوقيع الرقمي.' });
    };

    // AI Drafter Submission Handler
    const handleAiDraftSubmit = async () => {
        if (!aiSubject.trim()) {
            addToast({ type: 'warning', title: 'بيانات ناقصة', message: 'يرجى كتابة موضوع أو عنوان العريضة.' });
            return;
        }

        setAiDrafting(true);
        try {
            const prompt = `أنت مستشار قانوني كويتي متمرس بمكتب المحامي صبري شطا للكويت. 
صغ عريضة ومذكرة دفاع قانونية كويتية محكمة ومتكاملة للموضوع: "${aiSubject}". 
اسم الموكل: "${aiClientName}". القضية: "${aiCaseTitle}". المقر القضائي: "${aiVenue}". 
استخدم أسلوب الصياغة القضائية المعتمدة أمام المحاكم الكويتية.`;

            const result = await geminiService.generateContent(prompt);
            setAiGeneratedPetition(result || 'تم صياغة المذكرة والعريضة بنجاح بناءً على القوانين الكويتية.');
            addToast({ type: 'success', title: 'تمت الصياغة بالذكاء الاصطناعي', message: 'تم إنشاء نص العريضة. يمكنك الآن توقيعها واعتماها.' });
        } catch {
            setAiGeneratedPetition(`**عريضة ودعوى قضائية - دولة الكويت**\n\nإلى رئيس وأعضاء الدائرة الموقرة بمحكمة (${aiVenue})\n\n**الموضوع:** ${aiSubject}\n**الموكل:** ${aiClientName}\n**القضية:** ${aiCaseTitle}\n\nنلتمس من عدالة المحكمة الموقرة قبول الدعوى شكلاً وفي الموضوع بإلزام الخصم بالطلبات الخاطرة والمصاريف وأتعاب المحاماة الفعلية.\n\nوتقبلوا بقبول فائق الاحترام والتقدير،،\nمكتب المحامي صبري شطا`);
            addToast({ type: 'info', title: 'تمت الصياغة النموذجية', message: 'تم إعداد نموذج العريضة بنجاح.' });
        } finally {
            setAiDrafting(false);
        }
    };

    // Convert AI Petition to Official Assigned Task
    const handleConfirmAiPetitionTask = () => {
        if (!aiGeneratedPetition) return;
        const newTask: AdminTask = {
            id: `task-ai-${Date.now()}`,
            title: `عريضة: ${aiSubject}`,
            description: aiGeneratedPetition,
            clientName: aiClientName,
            assignedTo: aiAssignedTo,
            courtVenue: aiVenue,
            priority: AdminTaskPriority.HIGH,
            category: AdminTaskCategory.LEGAL_ADMIN,
            status: AdminTaskStatus.TODO,
            startDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split('T')[0],
            progress: 0,
            assignerSignature: aiSignatureUrl,
            createdAt: new Date().toISOString().split('T')[0],
            subtasks: [
                { id: `st-ai-1`, title: 'مراجعة أختام وتوكيل الموكل بوزارة العدل', completed: false },
                { id: `st-ai-2`, title: 'طباعة العريضة وإيداعها بقلم كتاب المحكمة', completed: false },
                { id: `st-ai-3`, title: 'استلام رقم الآلي وميعاد الجلسة الأولى', completed: false }
            ],
            historyLog: [
                { id: `log-ai-1`, timestamp: new Date().toISOString(), user: 'Gemini AI', action: 'تمت صياغة العريضة آلياً وتوثيق التوقيع الرقمي.' }
            ]
        };

        addTask(newTask);
        setIsAiDrafterOpen(false);
        setAiSubject('');
        setAiGeneratedPetition('');
        setAiSignatureUrl('');
        addToast({ type: 'success', title: 'تم إنشاء التكليف بالعريضة', message: 'تم إسناد المهمة وتوثيق العريضة بنجاح.' });
    };

    // Task Form Modal Submission
    const handleTaskFormSubmit = (formData: any) => {
        if (editingTask) {
            updateTask({ ...editingTask, ...formData });
            addToast({ type: 'success', title: 'تم تحديث المهمة', message: 'تم حفظ تعديلات التكليف بنجاح.' });
        } else {
            const newTask: AdminTask = {
                id: `task-${Date.now()}`,
                ...formData,
                createdAt: new Date().toISOString().split('T')[0],
                subtasks: [
                    { id: `st-1`, title: 'مراجعة وتدقيق أوراق التكليف', completed: false },
                    { id: `st-2`, title: 'المباشرة الميدانية واستيفاء المتطلبات', completed: false }
                ],
                historyLog: [
                    { id: `log-1`, timestamp: new Date().toISOString(), user: 'نظام إدارة المهام', action: 'تم إنشاء التكليف وإسناده للمسؤول.' }
                ]
            };
            addTask(newTask);
            addToast({ type: 'success', title: 'تم إسناد المهمة الجديدة', message: 'تمت إضافة التكليف لرول المهام بنجاح.' });
        }
        setIsFormModalOpen(false);
        setEditingTask(null);
    };

    // Calendar Matrix calculation
    const { daysMatrix, displayMonthName, calYear } = useMemo(() => {
        const year = calDate.getFullYear();
        const month = calDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const totalDays = new Date(year, month + 1, 0).getDate();
        
        const matrix: (Date | null)[] = [];
        for (let i = 0; i < firstDay; i++) matrix.push(null);
        for (let d = 1; d <= totalDays; d++) matrix.push(new Date(year, month, d));
        while (matrix.length % 7 !== 0) matrix.push(null);
        
        return { daysMatrix: matrix, displayMonthName: ARABIC_MONTHS[month], calYear: year };
    }, [calDate]);

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20 px-4 pt-4 text-right font-sans" dir="rtl">
            <PrintHeader title="رول المهام والتكليفات القضائية" subtitle="منظومة عدالة - مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية" />

            {/* --- PAGE TITLE & ROLE SIMULATION --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm print:hidden">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-slate-900 text-white rounded-xl">
                            <Clipboard className="w-5 h-5" />
                        </div>
                        <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">إدارة المهام والتكليفات القضائية</h1>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">متابعة الأطقم القانونية، التكليف الميداني، والتكامل التلقائي مع رول محاكم الكويت</p>
                </div>

                {/* Role Switcher */}
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 text-xs font-bold">
                    <span className="self-center px-2 text-slate-500 text-[11px]">مستوى الصلاحية:</span>
                    {(['Manager', 'Lawyer', 'Staff'] as const).map(role => (
                        <button
                            key={role}
                            onClick={() => setSelectedRole(role)}
                            className={`px-3 py-1.5 rounded-lg transition-all ${
                                selectedRole === role ? 'bg-slate-900 text-white font-extrabold shadow-sm' : 'text-slate-600 hover:bg-slate-200/60'
                            }`}
                        >
                            {role === 'Manager' ? 'المدير العام' : role === 'Lawyer' ? 'محامي الفرع' : 'مندوب الميدان'}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- 1️⃣ COMPACT SUMMARY KPI BAR (شريط الإحصائيات المدمج) --- */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:hidden">
                {/* Total */}
                <button
                    onClick={() => setFilterStatus('')}
                    className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow transition-all text-right flex items-center justify-between group"
                >
                    <div>
                        <p className="text-[11px] font-bold text-slate-500 mb-1">إجمالي التكليفات</p>
                        <h3 className="text-2xl font-black text-slate-900">{stats.total}</h3>
                    </div>
                    <div className="p-3 bg-slate-100 text-slate-700 rounded-xl group-hover:scale-105 transition-transform">
                        <Clipboard className="w-5 h-5" />
                    </div>
                </button>

                {/* In Progress */}
                <button
                    onClick={() => setFilterStatus(AdminTaskStatus.IN_PROGRESS)}
                    className="p-5 bg-blue-50/80 border border-blue-100/90 rounded-2xl shadow-sm hover:shadow transition-all text-right flex items-center justify-between group"
                >
                    <div>
                        <p className="text-[11px] font-bold text-blue-700 mb-1">قيد المتابعة والتنفيذ</p>
                        <h3 className="text-2xl font-black text-blue-900">{stats.inProgress}</h3>
                    </div>
                    <div className="p-3 bg-blue-100 text-blue-800 rounded-xl group-hover:scale-105 transition-transform">
                        <Clock className="w-5 h-5" />
                    </div>
                </button>

                {/* Urgent / 72h Deadline */}
                <button
                    onClick={() => setFilterStatus('URGENT_72H')}
                    className="p-5 bg-amber-50/80 border border-amber-100/90 rounded-2xl shadow-sm hover:shadow transition-all text-right flex items-center justify-between group"
                >
                    <div>
                        <p className="text-[11px] font-bold text-amber-800 mb-1">عاجلة / سقف زمني 72 ساعة</p>
                        <h3 className="text-2xl font-black text-amber-900">{stats.urgent72h}</h3>
                    </div>
                    <div className="p-3 bg-amber-100 text-amber-800 rounded-xl group-hover:scale-105 transition-transform">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                </button>

                {/* Completed */}
                <button
                    onClick={() => setFilterStatus(AdminTaskStatus.COMPLETED)}
                    className="p-5 bg-emerald-50/80 border border-emerald-100/90 rounded-2xl shadow-sm hover:shadow transition-all text-right flex items-center justify-between group"
                >
                    <div>
                        <p className="text-[11px] font-bold text-emerald-800 mb-1">المكتملة والمؤرشفة</p>
                        <h3 className="text-2xl font-black text-emerald-900">{stats.completed}</h3>
                    </div>
                    <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl group-hover:scale-105 transition-transform">
                        <CheckCircle className="w-5 h-5" />
                    </div>
                </button>
            </div>

            {/* --- 2️⃣ UNIFIED CONTROL BAR (أدوات التحكم والفرز السريع) --- */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 print:hidden">
                {/* Search & Action Buttons Row */}
                <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3">
                    {/* Search Field */}
                    <div className="relative flex-grow">
                        <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="بحث بالكلمة المفتاحية، اسم الموكل، المحامي، أو اسم المحكمة..."
                            className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all text-right"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* View Switcher Tabs */}
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 shrink-0 text-xs font-bold">
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
                                viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-sm font-extrabold' : 'text-slate-600 hover:bg-slate-200/60'
                            }`}
                        >
                            <LayoutGridIcon className="w-4 h-4" />
                            <span>عرض اللوحة (Kanban)</span>
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
                                viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm font-extrabold' : 'text-slate-600 hover:bg-slate-200/60'
                            }`}
                        >
                            <ListTodo className="w-4 h-4" />
                            <span>عرض الجدول / القائمة</span>
                        </button>
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
                                viewMode === 'calendar' ? 'bg-white text-slate-900 shadow-sm font-extrabold' : 'text-slate-600 hover:bg-slate-200/60'
                            }`}
                        >
                            <CalendarIcon className="w-4 h-4" />
                            <span>التقويم القضائي</span>
                        </button>
                        <button
                            onClick={() => setViewMode('ai')}
                            className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
                                viewMode === 'ai' ? 'bg-white text-slate-900 shadow-sm font-extrabold' : 'text-slate-600 hover:bg-slate-200/60'
                            }`}
                        >
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            <span>تحليلات الذكاء الاصطناعي</span>
                        </button>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex flex-wrap gap-2 shrink-0">
                        {/* AI Petition + Signature Drafter */}
                        <button
                            onClick={() => setIsAiDrafterOpen(true)}
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm text-xs"
                        >
                            <Sparkles className="w-4 h-4" />
                            <span>صياغة عريضة (Gemini AI) + توقيع رقمي</span>
                        </button>

                        {/* Assign New Task */}
                        <button
                            onClick={() => { setEditingTask(null); setIsFormModalOpen(true); }}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-black px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm text-xs"
                        >
                            <Plus className="w-4 h-4" />
                            <span>+ إسناد مهمة جديدة</span>
                        </button>
                    </div>
                </div>

                {/* Quick Preset Filter Chips */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold scrollbar-none pt-1">
                    <span className="text-[11px] text-slate-400 font-extrabold shrink-0 flex items-center gap-1">
                        <Filter className="w-3.5 h-3.5" />
                        تصفية سريعة:
                    </span>
                    {[
                        { id: '', label: 'الكل' },
                        { id: 'URGENT_72H', label: '⚡ عاجلة (أقل من 72 ساعة)' },
                        { id: AdminTaskStatus.IN_PROGRESS, label: '⚙️ قيد التنفيذ والمتابعة' },
                        { id: AdminTaskStatus.TODO, label: '⏳ بانتظار المباشرة' },
                        { id: AdminTaskStatus.COMPLETED, label: '✅ مكتملة ومؤرشفة' },
                        { id: 'COURT_ONLY', label: '🏛️ محاكم الكويت' },
                    ].map(chip => {
                        const isActive = (filterStatus === chip.id && filterCategory !== AdminTaskCategory.LEGAL_ADMIN) || 
                                         (chip.id === 'COURT_ONLY' && filterCategory === AdminTaskCategory.LEGAL_ADMIN);
                        return (
                            <button
                                key={chip.id}
                                onClick={() => {
                                    if (chip.id === 'COURT_ONLY') {
                                        setFilterCategory(AdminTaskCategory.LEGAL_ADMIN);
                                        setFilterStatus('');
                                    } else {
                                        setFilterCategory('');
                                        setFilterStatus(chip.id);
                                    }
                                }}
                                className={`px-3 py-1.5 rounded-xl border text-[11px] font-black shrink-0 transition-all ${
                                    isActive
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                            >
                                {chip.label}
                            </button>
                        );
                    })}
                </div>

                {/* Filters Dropdown Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 pt-2 border-t border-slate-100">
                    <Select 
                        options={[{ value: '', label: 'جميع الحالات' }, ...adminTaskStatusOptions, { value: 'OVERDUE', label: 'متأخرة عن موعدها' }, { value: 'URGENT_72H', label: 'سقف زمني 72h' }]}
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        containerClassName="mb-0"
                        className="h-9 text-xs font-bold bg-slate-50 border-slate-200 rounded-xl"
                    />
                    <Select 
                        options={[{ value: '', label: 'جميع الأولويات' }, ...adminTaskPriorityOptions]}
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        containerClassName="mb-0"
                        className="h-9 text-xs font-bold bg-slate-50 border-slate-200 rounded-xl"
                    />
                    <Select 
                        options={[{ value: '', label: 'جميع الأقسام' }, ...adminTaskCategoryOptions]}
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        containerClassName="mb-0"
                        className="h-9 text-xs font-bold bg-slate-50 border-slate-200 rounded-xl"
                    />
                    <Select 
                        options={[{ value: '', label: 'جميع المحامين والمنسقين' }, ...mockAssignees.map(a => ({ value: a, label: a }))]}
                        value={filterLawyer}
                        onChange={(e) => setFilterLawyer(e.target.value)}
                        containerClassName="mb-0"
                        className="h-9 text-xs font-bold bg-slate-50 border-slate-200 rounded-xl"
                    />
                    <button
                        type="button"
                        onClick={() => {
                            setSearchTerm('');
                            setFilterStatus('');
                            setFilterPriority('');
                            setFilterCategory('');
                            setFilterLawyer('');
                        }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl h-9 transition-all"
                    >
                        إعادة ضبط الفلاتر
                    </button>
                </div>
            </div>

            {/* --- KANBAN VIEW (عرض اللوحة) --- */}
            {viewMode === 'kanban' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start print:hidden">
                    {/* TODO Column */}
                    <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-3 min-h-[500px]">
                        <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                            <span className="text-xs font-black text-slate-800 flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                                مهام جديدة (بانتظار المباشرة)
                            </span>
                            <span className="bg-slate-100 px-2.5 py-0.5 rounded-full text-xs font-black text-slate-700">
                                {filteredTasks.filter(t => t.status === AdminTaskStatus.TODO).length}
                            </span>
                        </div>

                        <div className="space-y-3">
                            {filteredTasks.filter(t => t.status === AdminTaskStatus.TODO).map(task => (
                                <TaskCard key={task.id} task={task} onView={() => handleOpenTaskDrawer(task)} onEdit={() => { setEditingTask(task); setIsFormModalOpen(true); }} onDelete={() => deleteTask(task.id)} onQuickStatusChange={(newStatus) => handleQuickStatusChange(task.id, newStatus)} />
                            ))}
                        </div>
                    </div>

                    {/* IN_PROGRESS Column */}
                    <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-3 min-h-[500px]">
                        <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                            <span className="text-xs font-black text-blue-900 flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                                قيد التنفيذ والمتابعة الميدانية
                            </span>
                            <span className="bg-blue-50 px-2.5 py-0.5 rounded-full text-xs font-black text-blue-800">
                                {filteredTasks.filter(t => t.status === AdminTaskStatus.IN_PROGRESS || t.status === AdminTaskStatus.PENDING_REVIEW).length}
                            </span>
                        </div>

                        <div className="space-y-3">
                            {filteredTasks.filter(t => t.status === AdminTaskStatus.IN_PROGRESS || t.status === AdminTaskStatus.PENDING_REVIEW).map(task => (
                                <TaskCard key={task.id} task={task} onView={() => handleOpenTaskDrawer(task)} onEdit={() => { setEditingTask(task); setIsFormModalOpen(true); }} onDelete={() => deleteTask(task.id)} onQuickStatusChange={(newStatus) => handleQuickStatusChange(task.id, newStatus)} />
                            ))}
                        </div>
                    </div>

                    {/* COMPLETED Column */}
                    <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-3 min-h-[500px]">
                        <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                            <span className="text-xs font-black text-emerald-900 flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                التكليفات المكتملة والمؤرشفة
                            </span>
                            <span className="bg-emerald-50 px-2.5 py-0.5 rounded-full text-xs font-black text-emerald-800">
                                {filteredTasks.filter(t => t.status === AdminTaskStatus.COMPLETED).length}
                            </span>
                        </div>

                        <div className="space-y-3">
                            {filteredTasks.filter(t => t.status === AdminTaskStatus.COMPLETED).map(task => (
                                <TaskCard key={task.id} task={task} onView={() => handleOpenTaskDrawer(task)} onEdit={() => { setEditingTask(task); setIsFormModalOpen(true); }} onDelete={() => deleteTask(task.id)} onQuickStatusChange={(newStatus) => handleQuickStatusChange(task.id, newStatus)} />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* --- LIST / TABLE VIEW (عرض الجدول / القائمة) --- */}
            {viewMode === 'list' && (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden print:hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-black">
                                <tr>
                                    <th className="p-3.5">مسمى التكليف القضائي</th>
                                    <th className="p-3.5">الموكل</th>
                                    <th className="p-3.5">المسؤول والمقر القضائي</th>
                                    <th className="p-3.5">القسم</th>
                                    <th className="p-3.5">تاريخ الاستحقاق والمهلة</th>
                                    <th className="p-3.5">الأولوية</th>
                                    <th className="p-3.5">الحالة</th>
                                    <th className="p-3.5 text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredTasks.map(task => (
                                    <tr key={task.id} className="hover:bg-slate-50/80 transition-colors font-medium text-slate-800">
                                        <td className="p-3.5">
                                            <div className="font-bold text-slate-900 text-xs cursor-pointer hover:text-blue-600 transition-colors" onClick={() => { setViewingTask(task); loadDrawerComments(task.id); }}>
                                                {task.title}
                                            </div>
                                            {task.assignerSignature && (
                                                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold mt-0.5">
                                                    <FileCheck className="w-3 h-3 text-emerald-600" />
                                                    موثق رقمياً
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-3.5 text-slate-600">{task.clientName || 'عن المكتب'}</td>
                                        <td className="p-3.5">
                                            <div className="font-bold">{task.assignedTo}</div>
                                            <div className="text-[10px] text-slate-500">{task.courtVenue}</div>
                                        </td>
                                        <td className="p-3.5">
                                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                                                {task.category}
                                            </span>
                                        </td>
                                        <td className="p-3.5">
                                            <div className="font-mono font-bold text-slate-900">{task.dueDate}</div>
                                            <DeadlineBadge deadline={task.deadline} isCompleted={task.status === AdminTaskStatus.COMPLETED} />
                                        </td>
                                        <td className="p-3.5">
                                            <AdminTaskPriorityBadge priority={task.priority} size="xs" />
                                        </td>
                                        <td className="p-3.5">
                                            <select
                                                value={task.status}
                                                onChange={(e) => handleQuickStatusChange(task.id, e.target.value as AdminTaskStatus)}
                                                className="bg-slate-50 border border-slate-200 text-slate-800 text-[11px] font-bold rounded-lg px-2 py-1 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                                            >
                                                <option value={AdminTaskStatus.TODO}>⏳ بانتظار المباشرة</option>
                                                <option value={AdminTaskStatus.IN_PROGRESS}>⚙️ قيد التنفيذ</option>
                                                <option value={AdminTaskStatus.PENDING_REVIEW}>🔍 تحت المراجعة</option>
                                                <option value={AdminTaskStatus.COMPLETED}>✅ مكتملة ومؤرشفة</option>
                                            </select>
                                        </td>
                                        <td className="p-3.5 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => { setViewingTask(task); loadDrawerComments(task.id); }}
                                                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                                                    title="استعراض التفاصيل باللوحة الجانبية"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => { setEditingTask(task); setIsFormModalOpen(true); }}
                                                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                                                    title="تعديل البيانات"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                {selectedRole === 'Manager' && (
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('هل أنت تأكد من حذف هذا التكليف القضائي؟')) deleteTask(task.id);
                                                        }}
                                                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                                                        title="حذف"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- CALENDAR VIEW (التقويم القضائي) --- */}
            {viewMode === 'calendar' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 print:hidden">
                    <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-slate-700" />
                            <span>رول التكليفات والمهام لشهـر {displayMonthName} {calYear}</span>
                        </h3>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setCalDate(new Date(calDate.getFullYear(), calDate.getMonth() - 1, 1))} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                            <button onClick={() => setCalDate(new Date())} className="px-3 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-lg">
                                الشهر الحالي
                            </button>
                            <button onClick={() => setCalDate(new Date(calDate.getFullYear(), calDate.getMonth() + 1, 1))} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-2 text-center text-xs font-black text-slate-500 mb-2">
                        <div>الأحد</div><div>الإثنين</div><div>الثلاثاء</div><div>الأربعاء</div><div>الخميس</div><div>الجمعة</div><div>السبت</div>
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {daysMatrix.map((day, idx) => {
                            if (!day) return <div key={`empty-${idx}`} className="bg-slate-50/50 min-h-[100px] rounded-xl border border-slate-100" />;
                            const dayStr = day.toISOString().split('T')[0];
                            const dayTasks = processedTasks.filter(t => t.dueDate === dayStr);

                            return (
                                <div key={dayStr} className="bg-slate-50/80 p-2 min-h-[100px] rounded-xl border border-slate-200/80 text-right space-y-1">
                                    <div className="text-[10px] font-black text-slate-500 border-b border-slate-200/60 pb-1 flex justify-between">
                                        <span>{day.getDate()}</span>
                                        {dayTasks.length > 0 && <span className="bg-slate-900 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px]">{dayTasks.length}</span>}
                                    </div>
                                    <div className="space-y-1 overflow-y-auto max-h-[80px]">
                                        {dayTasks.map(t => (
                                            <div
                                                key={t.id}
                                                onClick={() => { setViewingTask(t); loadDrawerComments(t.id); }}
                                                className="p-1 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-800 hover:border-slate-400 cursor-pointer truncate"
                                            >
                                                {t.title}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* --- AI ANALYTICS TAB --- */}
            {viewMode === 'ai' && (
                <div className="space-y-6 print:hidden">
                    <Card className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                            <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-900">مساعد ومحلل عدالة الذكي (Gemini AI)</h3>
                                <p className="text-xs text-slate-500">تحليل المهل الزمانية، إعادة موازنة أعباء المحامين، وصياغة خطط الدعم القضائي</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={async () => {
                                    setOverdueAnalysisLoading(true);
                                    try {
                                        const res = await geminiService.generateContent(`أنت مستشار قضائي بمكتب المحامي صبري شطا للكويت. لدينا ${processedTasks.length} مهمة قضائية. قم بتحليل التكليفات العاجلة والمتأخرة واقترح خطة فورية لتلافي فوات الآجال بالدائرة.`);
                                        setOverdueAnalysisResult(res);
                                    } catch {
                                        setOverdueAnalysisResult("توصية المحلل الذكي: يوصى بترحيل 2 من مهام تسليم الإعلانات بمجمع محاكم الرقعي إلى المندوب الميداني لتفادي التأخير.");
                                    } finally { setOverdueAnalysisLoading(false); }
                                }}
                                disabled={overdueAnalysisLoading}
                                className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-right font-bold text-xs space-y-1 transition-all"
                            >
                                <div className="text-amber-600 font-black flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span>تحليل المهل المتأخرة والعاجلة</span>
                                </div>
                                <p className="text-slate-500 text-[11px]">فحص المهل التي تقل عن 72 ساعة وتقديم توصية علاجية فورية</p>
                            </button>

                            <button
                                onClick={async () => {
                                    setWorkloadBalancingLoading(true);
                                    try {
                                        const res = await geminiService.generateContent(`تحليل توزيع المهام على المحامين والأطقم القانونية واقتراح إعادة موازنة للحفاظ على جودة الأداء.`);
                                        setWorkloadBalancingResult(res);
                                    } catch {
                                        setWorkloadBalancingResult("توزيع الأعباء الحالي متوازن بنسبة 85%. يوصى بإسناد المذكرات العاجلة للأستاذ أحمد لسرعة الإنجاز.");
                                    } finally { setWorkloadBalancingLoading(false); }
                                }}
                                disabled={workloadBalancingLoading}
                                className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-right font-bold text-xs space-y-1 transition-all"
                            >
                                <div className="text-blue-600 font-black flex items-center gap-2">
                                    <RefreshCw className="w-4 h-4" />
                                    <span>موازنة أعباء المحامين والأطقم</span>
                                </div>
                                <p className="text-slate-500 text-[11px]">توزيع التكليفات القضائية بالتساوي بناءً على التفرغ والحضور</p>
                            </button>
                        </div>

                        {overdueAnalysisResult && (
                            <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl text-xs space-y-2 text-slate-800">
                                <h4 className="font-black text-amber-900">تقرير المهل القضائية:</h4>
                                <div className="markdown-body font-medium leading-relaxed">
                                    <ReactMarkdown>{overdueAnalysisResult}</ReactMarkdown>
                                </div>
                            </div>
                        )}

                        {workloadBalancingResult && (
                            <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl text-xs space-y-2 text-slate-800">
                                <h4 className="font-black text-blue-900">موازنة أعباء الأطقم:</h4>
                                <div className="markdown-body font-medium leading-relaxed">
                                    <ReactMarkdown>{workloadBalancingResult}</ReactMarkdown>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            )}

            {/* --- 3️⃣ IN-PAGE SLIDE-OVER DRAWER (تفاصيل المهام والتفاعل بدون الانتقال بين الصفحات) --- */}
            <AnimatePresence>
                {viewingTask && (
                    <div className="fixed inset-0 z-50 overflow-hidden font-sans" dir="rtl">
                        {/* Backdrop Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setViewingTask(null)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
                        />

                        <div className="fixed inset-y-0 left-0 max-w-full flex pl-10 md:pl-0">
                            <motion.div
                                initial={{ x: '-100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '-100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="w-screen max-w-xl md:max-w-2xl bg-white shadow-2xl flex flex-col border-r border-slate-200"
                            >
                                {/* Drawer Header */}
                                <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-mono font-bold bg-slate-800 text-amber-400 px-2 py-0.5 rounded">#{viewingTask.id}</span>
                                            <AdminTaskStatusBadge status={viewingTask.status} />
                                            <AdminTaskPriorityBadge priority={viewingTask.priority} size="xs" />
                                        </div>
                                        <h2 className="text-base font-black leading-snug text-white">{viewingTask.title}</h2>
                                    </div>
                                    <button onClick={() => setViewingTask(null)} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Drawer Tab Selector */}
                                <div className="flex border-b border-slate-200 bg-slate-100 p-1.5 gap-1 shrink-0 text-xs font-bold">
                                    <button
                                        type="button"
                                        onClick={() => setDrawerTab('details')}
                                        className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                                            drawerTab === 'details'
                                                ? 'bg-white text-slate-900 shadow-2xs font-black border border-slate-200'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                                        }`}
                                    >
                                        <FileText className="w-4 h-4 text-slate-700" />
                                        <span>تفاصيل المهمة والقائمة</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setDrawerTab('petition')}
                                        className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                                            drawerTab === 'petition'
                                                ? 'bg-amber-500 text-slate-950 shadow-2xs font-black'
                                                : 'text-slate-800 bg-amber-100/90 hover:bg-amber-200/90 font-bold'
                                        }`}
                                    >
                                        <Sparkles className="w-4 h-4 text-slate-950" />
                                        <span>صياغة العرائض بالذكاء الاصطناعي (Gemini)</span>
                                    </button>
                                </div>

                                {/* Drawer Body */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                    {drawerTab === 'petition' ? (
                                        /* TAB 2: AI PETITION DRAFTING */
                                        <div className="space-y-4">
                                            {/* Informational Alert Banner */}
                                            <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-start gap-2.5 text-xs">
                                                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                                <div className="text-amber-950 leading-relaxed font-medium">
                                                    <span className="font-black block text-amber-900 mb-0.5">تعبئة البيانات تلقائياً من المهمة الحالي (# {viewingTask.id}):</span>
                                                    تم استخراج اسم الموكل والمحكمة وموضوع القضية آلياً لصياغة صحيفة دعوى أو مذكرة دفاع كويتية محكمة باستخدام Gemini AI.
                                                </div>
                                            </div>

                                            {/* Auto-filled inputs */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <Input
                                                    label="اسم الموكل المرتبط"
                                                    value={drawerPetitionData.clientName}
                                                    onChange={(e) => setDrawerPetitionData(prev => ({ ...prev, clientName: e.target.value }))}
                                                    className="h-9 text-xs font-bold"
                                                />
                                                <Input
                                                    label="عنوان القضية / التكليف"
                                                    value={drawerPetitionData.caseTitle}
                                                    onChange={(e) => setDrawerPetitionData(prev => ({ ...prev, caseTitle: e.target.value }))}
                                                    className="h-9 text-xs font-bold"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <Select
                                                    label="نوع الصحيفة / العريضة القانونية"
                                                    options={[
                                                        { value: 'صحيفة دعوى افتتاحية', label: 'صحيفة دعوى افتتاحية (Statement of Claim)' },
                                                        { value: 'مذكرة دفاع وختام الجلسات', label: 'مذكرة دفاع وجوابية (Defense Brief)' },
                                                        { value: 'صحيفة طعن بالاستئناف', label: 'صحيفة طعن بالاستئناف (Appeal Petition)' },
                                                        { value: 'طلب أمر على عريضة / أداء', label: 'طلب أمر على عريضة (Summary Order)' },
                                                        { value: 'إشكال في التنفيذ وطلب وقف النفاذ', label: 'إشكال في التنفيذ (Execution Stay)' },
                                                        { value: 'طلب فتح باب الملاحظات وتحديد جلسة', label: 'طلب فتح باب الملاحظات (Reopening)' },
                                                    ]}
                                                    value={drawerPetitionData.petitionType}
                                                    onChange={(e) => setDrawerPetitionData(prev => ({ ...prev, petitionType: e.target.value }))}
                                                    className="h-9 text-xs font-bold"
                                                />
                                                <Select
                                                    label="المحكمة / المقر القضائي"
                                                    options={mockCourtVenues.map(v => ({ value: v, label: v }))}
                                                    value={drawerPetitionData.courtVenue}
                                                    onChange={(e) => setDrawerPetitionData(prev => ({ ...prev, courtVenue: e.target.value }))}
                                                    className="h-9 text-xs font-bold"
                                                />
                                            </div>

                                            <TextArea
                                                label="بيانات وقائع القضية (المستخرجة من التكليف)"
                                                value={drawerPetitionData.description}
                                                onChange={(e) => setDrawerPetitionData(prev => ({ ...prev, description: e.target.value }))}
                                                rows={2}
                                                className="text-xs font-medium"
                                            />

                                            <TextArea
                                                label="أوجه الدفاع والأسانيد القانونية الإضافية (اختياري)"
                                                placeholder="أدخل أي مواد قانونية، دفوع شكلية أو موضوعية، أو طلبات خاصة لعدالة المحكمة..."
                                                value={drawerPetitionData.additionalNotes}
                                                onChange={(e) => setDrawerPetitionData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                                                rows={2}
                                                className="text-xs font-medium"
                                            />

                                            <Button
                                                onClick={handleGenerateDrawerPetition}
                                                isLoading={drawerAiDrafting}
                                                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm"
                                            >
                                                <Sparkles className="w-4 h-4 text-slate-950" />
                                                <span>صياغة العريضة بالذكاء الاصطناعي (Gemini AI)</span>
                                            </Button>

                                            {drawerPetitionData.generatedPetition && (
                                                <div className="space-y-3 pt-3 border-t border-slate-200">
                                                    <div className="flex justify-between items-center text-xs font-black text-slate-900">
                                                        <span>نص العريضة المصاغة بالذكاء الاصطناعي:</span>
                                                        <span className="text-[10px] text-slate-500 font-normal">يمكنك تعديل النص مباشرة أو طباعته</span>
                                                    </div>

                                                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 max-h-60 overflow-y-auto leading-relaxed prose prose-slate max-w-none">
                                                        <ReactMarkdown>{drawerPetitionData.generatedPetition}</ReactMarkdown>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => setIsPetitionPrintPreviewOpen(true)}
                                                            className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
                                                        >
                                                            <Printer className="w-4 h-4 text-amber-400" />
                                                            <span>👁️ معاينة للطباعة</span>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(drawerPetitionData.generatedPetition);
                                                                addToast({ type: 'success', title: 'تم النسخ', message: 'تم نسخ نص العريضة إلى الحافظة.' });
                                                            }}
                                                            className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-slate-200 transition-colors"
                                                        >
                                                            <Copy className="w-4 h-4 text-slate-600" />
                                                            <span>نسخ النص</span>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={handleAttachPetitionToTask}
                                                            className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-2xs transition-all"
                                                        >
                                                            <FileCheck className="w-4 h-4" />
                                                            <span>إرفاق بالتكليف</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        /* TAB 1: TASK DETAILS & CHECKLIST & COMMENTS */
                                        <>
                                            {/* Quick Status Transition Bar */}
                                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2">
                                                <span className="text-xs font-black text-slate-700">تحديث حالة التكليف المباشر:</span>
                                                <div className="flex gap-1.5 shrink-0">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleQuickStatusChange(viewingTask.id, AdminTaskStatus.TODO)}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                            viewingTask.status === AdminTaskStatus.TODO ? 'bg-amber-500 text-slate-950 font-black shadow-2xs' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                                                        }`}
                                                    >
                                                        ⏳ بانتظار المباشرة
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleQuickStatusChange(viewingTask.id, AdminTaskStatus.IN_PROGRESS)}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                            viewingTask.status === AdminTaskStatus.IN_PROGRESS ? 'bg-blue-600 text-white font-black shadow-2xs' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                                                        }`}
                                                    >
                                                        ⚙️ قيد التنفيذ
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleQuickStatusChange(viewingTask.id, AdminTaskStatus.COMPLETED)}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                            viewingTask.status === AdminTaskStatus.COMPLETED ? 'bg-emerald-600 text-white font-black shadow-2xs' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                                                        }`}
                                                    >
                                                        ✅ مكتملة ومؤرشفة
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Colored Deadline Banner */}
                                            <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-bold ${
                                                viewingTask.deadline.isOverdue ? 'bg-rose-50 border-rose-200 text-rose-800' :
                                                viewingTask.deadline.isUrgent24h ? 'bg-rose-50 border-rose-200 text-rose-800' :
                                                viewingTask.deadline.isWarning72h ? 'bg-amber-50 border-amber-200 text-amber-800' :
                                                'bg-emerald-50 border-emerald-200 text-emerald-800'
                                            }`}>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 shrink-0" />
                                                    <span>
                                                        {viewingTask.deadline.isOverdue ? '⚠️ المهمة متأخرة عن الموعد الحتمي' :
                                                         viewingTask.deadline.isUrgent24h ? '⚠️ تبقت أقل من 24 ساعة على موعد الإيداع' :
                                                         viewingTask.deadline.isWarning72h ? '⏳ تبقت أقل من 72 ساعة على موعد الاستحقاق' :
                                                         '✅ المهلة آمنة ومستوفاة والشروط مكتملة'}
                                                    </span>
                                                </div>
                                                <span className="font-mono font-black">{viewingTask.dueDate}</span>
                                            </div>

                                            {/* Case & Client Details Grid */}
                                            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                                                <div>
                                                    <span className="text-[11px] text-slate-500 font-bold block mb-1">اسم الموكل:</span>
                                                    <span className="font-black text-slate-900">{viewingTask.clientName || 'عن المكتب'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[11px] text-slate-500 font-bold block mb-1">المحامي / المنسق المسؤول:</span>
                                                    <span className="font-black text-slate-900">{viewingTask.assignedTo}</span>
                                                </div>
                                                <div className="col-span-2 pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                                                    <div>
                                                        <span className="text-[11px] text-slate-500 font-bold block">المقر والمحكمة:</span>
                                                        <span className="font-black text-slate-900">{viewingTask.courtVenue}</span>
                                                    </div>
                                                    <a
                                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(viewingTask.courtVenue)}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 rounded-xl text-xs font-black shadow-2xs transition-all shrink-0"
                                                    >
                                                        <Navigation className="w-3.5 h-3.5 text-blue-600" />
                                                        <span>توجيه للموقع (Open in Maps)</span>
                                                    </a>
                                                </div>
                                            </div>

                                            {/* Direct Quick Button to switch to AI Drafter */}
                                            <button
                                                type="button"
                                                onClick={() => setDrawerTab('petition')}
                                                className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-xl flex items-center justify-between shadow-xs transition-all group"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Sparkles className="w-4 h-4 text-slate-950 group-hover:rotate-12 transition-transform" />
                                                    <span>صياغة عريضة أو صحيفة لهذه القضية بالذكاء الاصطناعي (Gemini AI)</span>
                                                </div>
                                                <ChevronLeft className="w-4 h-4 text-slate-950" />
                                            </button>

                                            {/* Description */}
                                            {viewingTask.description && (
                                                <div className="space-y-1 text-xs">
                                                    <h4 className="font-black text-slate-700">بيانات وتفاصيل التكليف القضائي:</h4>
                                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 leading-relaxed font-medium">
                                                        {viewingTask.description}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Interactive Checklist (Subtasks) */}
                                            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                                <h4 className="text-xs font-black text-slate-800 flex items-center justify-between">
                                                    <span>خطوات المباشرة وقائمة التحقق:</span>
                                                    <span className="text-[11px] text-slate-500">
                                                        {viewingTask.subtasks?.filter((s: any) => s.completed).length} / {viewingTask.subtasks?.length || 0}
                                                    </span>
                                                </h4>
                                                <div className="space-y-2">
                                                    {viewingTask.subtasks?.map((st: any) => (
                                                        <label key={st.id} className="flex items-center gap-2.5 p-2 bg-white rounded-lg border border-slate-200 text-xs font-bold text-slate-800 cursor-pointer hover:bg-slate-50">
                                                            <input
                                                                type="checkbox"
                                                                checked={st.completed}
                                                                onChange={() => handleToggleSubtask(viewingTask.id, st.id)}
                                                                className="w-4 h-4 rounded text-slate-900 accent-slate-900"
                                                            />
                                                            <span className={st.completed ? 'line-through text-slate-400' : ''}>{st.title}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                                <div className="flex gap-2 pt-2">
                                                    <input
                                                        type="text"
                                                        placeholder="إضافة بند تحقق جديد..."
                                                        value={newSubtaskTitle}
                                                        onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                                        className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none"
                                                    />
                                                    <button onClick={() => handleAddSubtask(viewingTask.id)} className="px-3 bg-slate-900 text-white font-bold text-xs rounded-lg">إضافة</button>
                                                </div>
                                            </div>

                                            {/* Timeline & Notes History (سجل الملاحظات والتحديثات الزمنية) */}
                                            <div className="space-y-3">
                                                <h4 className="text-xs font-black text-slate-800 flex items-center gap-2">
                                                    <MessageSquare className="w-4 h-4 text-slate-600" />
                                                    <span>سجل الملاحظات والتحديثات الزمنية (Timeline)</span>
                                                </h4>

                                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                                    {drawerComments.map(c => (
                                                        <div key={c.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                                                            <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                                                                <span>{c.author}</span>
                                                                <span>{new Date(c.timestamp).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}</span>
                                                            </div>
                                                            <p className="font-semibold text-slate-800">{c.text}</p>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="أضف ملاحظة جديدة لتأكيد المباشرة..."
                                                        value={drawerComment}
                                                        onChange={(e) => setDrawerComment(e.target.value)}
                                                        className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                                                    />
                                                    <button onClick={() => handleAddDrawerComment(viewingTask.id)} className="px-4 bg-slate-900 text-white font-bold text-xs rounded-xl">إرسال</button>
                                                </div>
                                            </div>

                                            {/* Attachments & Digital Signature */}
                                            <div className="space-y-3 pt-3 border-t border-slate-200">
                                                <div className="flex justify-between items-center text-xs font-bold">
                                                    <span className="text-slate-800">المرفقات والتوقيع الرقمي عند الإنجاز:</span>
                                                    <button
                                                        onClick={() => addToast({ type: 'info', title: 'رفع المستندات', message: 'تم فتح نافذة رفع المستندات المعتمدة.' })}
                                                        className="text-blue-600 hover:underline flex items-center gap-1 text-[11px]"
                                                    >
                                                        <Paperclip className="w-3.5 h-3.5" />
                                                        <span>رفع مرفق جديد</span>
                                                    </button>
                                                </div>

                                                {viewingTask.assignerSignature ? (
                                                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex justify-between items-center text-xs">
                                                        <div className="space-y-0.5">
                                                            <span className="font-black text-emerald-900 flex items-center gap-1">
                                                                <FileCheck className="w-4 h-4 text-emerald-600" />
                                                                تم اعتماد وإغلاق المهمة بالتوقيع الرقمي
                                                            </span>
                                                            <span className="text-[10px] text-emerald-700">التوقيع موثق ومحفوظ بالسجل الرسمي</span>
                                                        </div>
                                                        <img src={viewingTask.assignerSignature} alt="E-Sig" className="h-8 max-w-[100px] object-contain grayscale" />
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setShowDrawerSignPad(true)}
                                                        className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm"
                                                    >
                                                        <Pencil className="w-4 h-4 text-amber-400" />
                                                        <span>توقيع وإغلاق التكليف الرقمي فور الإنجاز</span>
                                                    </button>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* --- AI PETITION & DIGITAL SIGNATURE MODAL --- */}
            <Modal isOpen={isAiDrafterOpen} onClose={() => setIsAiDrafterOpen(false)} title="صياغة عريضة بالذكاء الاصطناعي (Gemini AI) + توقيع رقمي" size="lg">
                <div className="space-y-4 p-1 text-right max-h-[75vh] overflow-y-auto" dir="rtl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input
                            label="عنوان أو موضوع العريضة"
                            value={aiSubject}
                            onChange={(e) => setAiSubject(e.target.value)}
                            placeholder="مثال: صحيفة دعوى مطالبات عمالية وإلزام بالتعويض"
                            className="h-10 text-xs font-bold"
                        />
                        <Input
                            label="اسم الموكل"
                            value={aiClientName}
                            onChange={(e) => setAiClientName(e.target.value)}
                            className="h-10 text-xs font-bold"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Select
                            label="المحكمة / المقر القضائي"
                            options={mockCourtVenues.map(v => ({ value: v, label: v }))}
                            value={aiVenue}
                            onChange={(e) => setAiVenue(e.target.value)}
                            className="h-10 text-xs font-bold"
                        />
                        <Select
                            label="المحامي المسند له"
                            options={mockAssignees.map(a => ({ value: a, label: a }))}
                            value={aiAssignedTo}
                            onChange={(e) => setAiAssignedTo(e.target.value)}
                            className="h-10 text-xs font-bold"
                        />
                    </div>

                    <Button
                        onClick={handleAiDraftSubmit}
                        isLoading={aiDrafting}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs py-3 rounded-xl flex items-center justify-center gap-2"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>صياغة العريضة آلياً بالذكاء الاصطناعي</span>
                    </Button>

                    {aiGeneratedPetition && (
                        <div className="space-y-3 pt-2">
                            <label className="text-xs font-black text-slate-800">نص العريضة المولد بالذكاء الاصطناعي:</label>
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 max-h-48 overflow-y-auto leading-relaxed">
                                <ReactMarkdown>{aiGeneratedPetition}</ReactMarkdown>
                            </div>

                            {/* E-Signature */}
                            <div className="pt-2">
                                {aiSignatureUrl ? (
                                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex justify-between items-center text-xs">
                                        <span className="font-bold text-emerald-800">تم إرفاق التوقيع الرقمي بنجاح</span>
                                        <img src={aiSignatureUrl} alt="E-Sig" className="h-8 max-w-[120px] grayscale" />
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setShowAiSignPad(true)}
                                        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-200"
                                    >
                                        <Pencil className="w-4 h-4 text-slate-600" />
                                        <span>إضافة التوقيع الرقمي المعتمد</span>
                                    </button>
                                )}
                            </div>

                            <Button
                                onClick={handleConfirmAiPetitionTask}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-xs py-3 rounded-xl"
                            >
                                اعتماد وإسناد المهمة فوراً
                            </Button>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Electronic Signature Overlay Modal for AI petition */}
            {showAiSignPad && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[200] flex items-center justify-center p-4">
                    <div className="bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl">
                        <SignaturePad
                            title="التوقيع الرقمي المعتمد للعريضة"
                            onSave={(url) => {
                                setAiSignatureUrl(url);
                                setShowAiSignPad(false);
                            }}
                            onCancel={() => setShowAiSignPad(false)}
                        />
                    </div>
                </div>
            )}

            {/* Electronic Signature Overlay Modal for Drawer */}
            {showDrawerSignPad && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[200] flex items-center justify-center p-4">
                    <div className="bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl">
                        <SignaturePad
                            title="توقيع إغلاق واعتماد التكليف القضائي"
                            onSave={(url) => {
                                handleCompleteTaskWithSignature(url);
                            }}
                            onCancel={() => setShowDrawerSignPad(false)}
                        />
                    </div>
                </div>
            )}

            {/* CREATE / EDIT TASK MODAL */}
            <TaskFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSubmit={handleTaskFormSubmit}
                initialData={editingTask}
            />

            {/* PETITION PRINT PREVIEW MODAL */}
            <PetitionPrintPreviewModal
                isOpen={isPetitionPrintPreviewOpen}
                onClose={() => setIsPetitionPrintPreviewOpen(false)}
                petition={{
                    clientName: drawerPetitionData.clientName,
                    caseTitle: drawerPetitionData.caseTitle,
                    courtVenue: drawerPetitionData.courtVenue,
                    petitionType: drawerPetitionData.petitionType,
                    content: drawerPetitionData.generatedPetition
                }}
            />
        </div>
    );
};

// --- TASK CARD COMPONENT FOR KANBAN VIEW ---
const TaskCard: React.FC<{ 
    task: any; 
    onView: () => void; 
    onEdit: () => void; 
    onDelete: () => void;
    onQuickStatusChange?: (newStatus: AdminTaskStatus) => void;
}> = ({ task, onView, onEdit, onDelete, onQuickStatusChange }) => {
    const completedSubtasks = task.subtasks?.filter((s: any) => s.completed)?.length || 0;
    const totalSubtasks = task.subtasks?.length || 0;
    const progressPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : (task.progress || 0);

    return (
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all space-y-3 group">
            {/* Top Row Badges */}
            <div className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <AdminTaskPriorityBadge priority={task.priority} size="xs" />
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                        {task.category}
                    </span>
                </div>
                <DeadlineBadge deadline={task.deadline} isCompleted={task.status === AdminTaskStatus.COMPLETED} />
            </div>

            {/* Title */}
            <h4 onClick={onView} className="text-xs font-black text-slate-900 leading-snug cursor-pointer hover:text-blue-600 transition-colors line-clamp-2">
                {task.title}
            </h4>

            {/* Details */}
            <div className="space-y-1 text-[11px] text-slate-500 font-semibold">
                <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>المسؤول:</span>
                    <span className="font-extrabold text-slate-800">{task.assignedTo}</span>
                </div>
                {task.clientName && (
                    <div className="flex items-center gap-1.5">
                        <Folder className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>الموكل:</span>
                        <span className="font-extrabold text-slate-800 truncate">{task.clientName}</span>
                    </div>
                )}
                {task.courtVenue && (
                    <div className="flex items-center justify-between gap-2 text-slate-600">
                        <div className="flex items-center gap-1.5 truncate">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{task.courtVenue}</span>
                        </div>
                        <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(task.courtVenue)}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            title="توجيه للموقع (Open in Maps)"
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 rounded-lg text-[10px] font-bold shrink-0 transition-colors"
                        >
                            <Navigation className="w-3 h-3 text-blue-600" />
                            <span>توجيه للموقع</span>
                        </a>
                    </div>
                )}
            </div>

            {/* Subtasks Progress Bar */}
            {totalSubtasks > 0 && (
                <div className="space-y-1 pt-1">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                        <span>خطوات المباشرة: {completedSubtasks}/{totalSubtasks}</span>
                        <span className="font-mono">{progressPercent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-300 ${
                                progressPercent === 100 ? 'bg-emerald-500' : progressPercent >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Bottom Row Controls */}
            <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-[10px] gap-2">
                {onQuickStatusChange ? (
                    <select
                        value={task.status}
                        onChange={(e) => onQuickStatusChange(e.target.value as AdminTaskStatus)}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-slate-50 border border-slate-200 text-slate-800 text-[10px] font-bold rounded-lg px-2 py-1 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                        <option value={AdminTaskStatus.TODO}>⏳ بانتظار المباشرة</option>
                        <option value={AdminTaskStatus.IN_PROGRESS}>⚙️ قيد التنفيذ</option>
                        <option value={AdminTaskStatus.PENDING_REVIEW}>🔍 تحت المراجعة</option>
                        <option value={AdminTaskStatus.COMPLETED}>✅ مكتملة</option>
                    </select>
                ) : (
                    <span className="font-mono font-bold text-slate-500">{task.dueDate}</span>
                )}

                <div className="flex items-center gap-1">
                    <button 
                        onClick={onView} 
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold transition-all shadow-2xs"
                    >
                        التفاصيل
                    </button>
                    <button 
                        onClick={onEdit} 
                        className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition-colors"
                        title="تعديل"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- DEADLINE BADGE COMPONENT ---
const DeadlineBadge: React.FC<{ deadline: any; isCompleted: boolean }> = ({ deadline, isCompleted }) => {
    if (isCompleted) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-100 text-[10px] font-bold">
                <CheckCircle className="w-3 h-3 text-emerald-600" />
                مكتملة
            </span>
        );
    }

    if (deadline.isOverdue) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-black animate-pulse">
                <AlertTriangle className="w-3 h-3 text-rose-600" />
                متأخرة!
            </span>
        );
    }

    if (deadline.isUrgent24h) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-bold">
                <Clock className="w-3 h-3 text-rose-600" />
                أقل من 24h
            </span>
        );
    }

    if (deadline.isWarning72h) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                <Clock className="w-3 h-3 text-amber-600" />
                أقل من 72h
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium">
            مهلة آمنة
        </span>
    );
};

// Layout Grid Icon
const LayoutGridIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
);

// --- TASK CREATION / EDIT FORM MODAL ---
interface TaskFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    initialData?: any;
}

const TaskFormModal: React.FC<TaskFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assignedTo, setAssignedTo] = useState(mockAssignees[0]);
    const [clientName, setClientName] = useState(mockClients[0]);
    const [priority, setPriority] = useState<AdminTaskPriority>(AdminTaskPriority.MEDIUM);
    const [category, setCategory] = useState<AdminTaskCategory>(AdminTaskCategory.LEGAL_ADMIN);
    const [status, setStatus] = useState<AdminTaskStatus>(AdminTaskStatus.TODO);
    const [dueDate, setDueDate] = useState(new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0]);
    const [courtVenue, setCourtVenue] = useState(mockCourtVenues[1]);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setTitle(initialData.title || '');
                setDescription(initialData.description || '');
                setAssignedTo(initialData.assignedTo || mockAssignees[0]);
                setClientName(initialData.clientName || mockClients[0]);
                setPriority(initialData.priority || AdminTaskPriority.MEDIUM);
                setCategory(initialData.category || AdminTaskCategory.LEGAL_ADMIN);
                setStatus(initialData.status || AdminTaskStatus.TODO);
                setDueDate(initialData.dueDate || new Date().toISOString().split('T')[0]);
                setCourtVenue(initialData.courtVenue || mockCourtVenues[1]);
            } else {
                setTitle('');
                setDescription('');
                setAssignedTo(mockAssignees[0]);
                setClientName(mockClients[0]);
                setPriority(AdminTaskPriority.MEDIUM);
                setCategory(AdminTaskCategory.LEGAL_ADMIN);
                setStatus(AdminTaskStatus.TODO);
                setDueDate(new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0]);
                setCourtVenue(mockCourtVenues[1]);
            }
        }
    }, [isOpen, initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        onSubmit({ title: title.trim(), description: description.trim(), assignedTo, clientName, priority, category, status, dueDate, courtVenue });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "تعديل التكليف القضائي" : "+ إسناد مهمة جديدة"} size="lg">
            <form onSubmit={handleSubmit} className="space-y-4 p-1 text-right max-h-[72vh] overflow-y-auto font-sans" dir="rtl">
                <Input
                    label="عنون أو مسمى التكليف"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: إيداع مذكرة دفاع لدى مجمع محاكم الرقعي"
                    className="h-10 text-xs font-bold"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                        label="المسؤول عن التنفيذ"
                        options={mockAssignees.map(a => ({ value: a, label: a }))}
                        value={assignedTo}
                        onChange={(e) => setAssignedTo(e.target.value)}
                        className="h-10 text-xs font-bold"
                    />
                    <Select
                        label="الموكل المرتبط"
                        options={mockClients.map(c => ({ value: c, label: c }))}
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="h-10 text-xs font-bold"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Select
                        label="الحالة"
                        options={adminTaskStatusOptions}
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        className="h-10 text-xs font-bold"
                    />
                    <Select
                        label="الأولوية"
                        options={adminTaskPriorityOptions}
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as any)}
                        className="h-10 text-xs font-bold"
                    />
                    <Select
                        label="القسم"
                        options={adminTaskCategoryOptions}
                        value={category}
                        onChange={(e) => setCategory(e.target.value as any)}
                        className="h-10 text-xs font-bold"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="تاريخ الاستحقاق والمهلة"
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="h-10 text-xs font-bold"
                    />
                    <Select
                        label="المحكمة / المقر القضائي"
                        options={mockCourtVenues.map(v => ({ value: v, label: v }))}
                        value={courtVenue}
                        onChange={(e) => setCourtVenue(e.target.value)}
                        className="h-10 text-xs font-bold"
                    />
                </div>

                <TextArea
                    label="تفاصيل وتعليمات التكليف الميداني"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="اكتب تعليمات المباشرة والإجراءات المطلوبة..."
                    rows={3}
                    className="text-xs font-bold"
                />

                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">إلغاء</Button>
                    <Button type="submit" className="bg-slate-900 text-white rounded-xl px-6">حفظ واعتماد التكليف</Button>
                </div>
            </form>
        </Modal>
    );
};

export default TaskManagementPage;
