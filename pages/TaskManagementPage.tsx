import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend,
    LineChart, Line, CartesianGrid
} from 'recharts';
import Card from '../components/ui/Card';
import { 
    ClipboardDocumentListIcon, PlusCircleIcon, EyeIcon, PencilIcon, TrashIcon, 
    FolderIcon, ClockIcon, ListBulletIcon, ViewColumnsIcon, ChartBarIcon, CheckCircleIcon,
    PrinterIcon, UserCircleIcon, SparklesIcon, TagIcon, ArrowPathIcon, ChevronRightIcon,
    ExclamationTriangleIcon, CalendarDaysIcon, Squares2X2Icon, FunnelIcon, MagnifyingGlassIcon,
    ArrowDownTrayIcon, ArchiveBoxIcon, CheckIcon, PaperClipIcon
} from '../constants';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import SignaturePad from '../components/ui/SignaturePad';
import { AdminTask, AdminTaskStatus, AdminTaskPriority, AdminTaskCategory } from '../types';
import { adminTaskStatusOptions, adminTaskPriorityOptions, adminTaskCategoryOptions } from '../constants';
import { AdminTaskStatusBadge, AdminTaskPriorityBadge } from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';
import PrintHeader from '../components/ui/PrintHeader';
import { useCaseTask } from '../components/CaseTaskContext';
import { initialCases } from '../data/caseData';
import { geminiService } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

// Mock assignees & lawyers for dropdown selections
const mockAssignees = [
    'أحمد محمود المحمد الصباح', 
    'فاطمة علي حسين', 
    'عمر خالد', 
    'ليلى منصور الهاجري', 
    'فريق العمل القانوني', 
    'ناصر عبدالله القحطاني'
];

const mockClients = [
    'شركة الأمل الدولية للتجارة العامة',
    'بنك الخليج المتحد الاستثماري',
    'مجموعة الشايع القابضة',
    'شركة المخازن العمومية (أجيليتي)',
    'خالد عبد الرحمن الساير',
    'نورة جاسم المرزوق'
];

const mockLegalActionTypes = [
    'إيداع صحيفة دعوى',
    'حضور جلسة خبرة',
    'تقديم مذكرة دفاع ختامية',
    'استعلام عن ملف تنفيذ',
    'عمل منع سفر ضد مدين',
    'دراسة عقد استثماري',
    'أرشفة مستندات حكم قطعي'
];

const mockCourtVenues = [
    'بدون مقر محدد (عمل من المكتب)',
    'قصر العدل (محافظة العاصمة)',
    'مجمع محاكم الرقعي (محافظة الفروانية)',
    'مجمع محاكم حولي',
    'مجمع محاكم الجهراء',
    'مجمع محاكم الأحمدي والمنطقة الجنوبية',
    'مقر جمعية المحامين الكويتية',
    'إدارة التنفيذ بوزارة العدل'
];

// Progress Ring Helper Component
const ProgressRing: React.FC<{ progress: number; size?: number; strokeWidth?: number }> = ({ progress, size = 32, strokeWidth = 3 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;
    
    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size}>
                <circle
                    className="text-gray-100 dark:text-gray-800"
                    strokeWidth={strokeWidth}
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                <circle
                    className="text-primary transition-all duration-500 ease-out"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
            </svg>
            <span className="absolute text-[9px] font-bold text-gray-700 dark:text-gray-200">{progress}%</span>
        </div>
    );
};

// Mini Stat Card Component
const TaskStatMini: React.FC<{ label: string; value: number | string; icon: React.ReactNode; color: string }> = ({ label, value, icon, color }) => (
    <div className="p-4 rounded-2xl bg-white dark:bg-dm-card border border-gray-100 dark:border-gray-850 shadow-sm flex items-center gap-4">
        <div className={`p-3 rounded-xl ${color} bg-opacity-10 ${color.replace('bg-', 'text-')}`}>
            {icon}
        </div>
        <div>
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{label}</p>
            <p className="text-xl font-black text-gray-900 dark:text-white">{value}</p>
        </div>
    </div>
);

// Form Modal Props
interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: AdminTask & { startDate?: string; clientName?: string; legalActionType?: string; attachmentsList?: any[]; historyLog?: any[] }) => void;
  initialData?: Partial<AdminTask & { startDate?: string; clientName?: string; legalActionType?: string; attachmentsList?: any[]; historyLog?: any[] }> | null;
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const { addToast } = useToast();
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [assignerSignature, setAssignerSignature] = useState(initialData?.assignerSignature || '');
  const [formData, setFormData] = useState<any>({
      title: '',
      status: AdminTaskStatus.TODO,
      priority: AdminTaskPriority.MEDIUM,
      category: AdminTaskCategory.LEGAL_ADMIN,
      progress: 0,
      createdAt: new Date().toISOString().split('T')[0],
      description: '',
      assignedTo: '',
      dueDate: '',
      relatedCaseId: '',
      projectOrModule: '',
      notes: '',
      startDate: new Date().toISOString().split('T')[0],
      clientName: '',
      legalActionType: '',
      attachmentsList: [],
      historyLog: [],
      courtVenue: 'بدون مقر محدد (عمل من المكتب)',
      subtasks: []
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          ...formData,
          ...initialData,
          progress: initialData.progress || 0,
          startDate: initialData.startDate || new Date().toISOString().split('T')[0],
          courtVenue: initialData.courtVenue || 'بدون مقر محدد (عمل من المكتب)',
          subtasks: initialData.subtasks || []
        });
        setAssignerSignature(initialData.assignerSignature || '');
      } else {
        setFormData({
          title: '',
          status: AdminTaskStatus.TODO,
          priority: AdminTaskPriority.MEDIUM,
          category: AdminTaskCategory.LEGAL_ADMIN,
          progress: 0,
          createdAt: new Date().toISOString().split('T')[0],
          description: '',
          assignedTo: mockAssignees[0],
          dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
          relatedCaseId: '',
          projectOrModule: '',
          notes: '',
          startDate: new Date().toISOString().split('T')[0],
          clientName: mockClients[0],
          legalActionType: mockLegalActionTypes[0],
          attachmentsList: [],
          historyLog: [],
          courtVenue: 'بدون مقر محدد (عمل من المكتب)',
          subtasks: []
        });
        setAssignerSignature('');
      }
    }
  }, [isOpen, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev: any) => ({ ...prev, progress: parseInt(e.target.value) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.assignedTo) {
      addToast({
        type: 'warning',
        title: 'بيانات ناقصة',
        message: 'يرجى إدخال عنوان المهمة والموظف المسؤول.'
      });
      return;
    }

    if (!assignerSignature) {
      setShowSignaturePad(true);
      return;
    }

    const currentUserName = 'أستاذ صبري شطا (مدير النظام)';
    const newLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: currentUserName,
        action: formData.id ? 'تعديل تفاصيل المهمة وتحديث بيانات الربط' : 'إنشاء المهمة وربطها واعتمادها بالتوقيع الإلكتروني'
    };

    const updatedHistory = [...(formData.historyLog || []), newLog];

    onSubmit({
      ...formData,
      id: formData.id || `task-${Date.now()}`,
      updatedAt: new Date().toISOString().split('T')[0],
      assignerSignature,
      historyLog: updatedHistory,
      progress: formData.status === AdminTaskStatus.COMPLETED ? 100 : formData.progress
    });
  };
  
  const assigneeOptions = mockAssignees.map(assignee => ({value: assignee, label: assignee}));
  const clientOptions = mockClients.map(client => ({value: client, label: client}));
  const actionTypeOptions = mockLegalActionTypes.map(act => ({value: act, label: act}));
  const venueOptions = mockCourtVenues.map(venue => ({ value: venue, label: venue }));
  const caseOptions = [
      { value: '', label: 'بدون ارتباط بقضية' },
      ...initialCases.map(c => ({ value: c.id, label: `القضية رقم ${c.caseNumber} - ${c.title}` }))
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={formData.id ? "تعديل وحوكمة المهمة القانونية" : "إسناد واعتماد مهمة قانونية ذكية"} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4 p-1 max-h-[75vh] overflow-y-auto">
        <Input name="title" label="عنوان المهمة والمستهدف" value={formData.title || ''} onChange={handleChange} required placeholder="مثال: تقديم صحيفة دعوى بطلان عقد عقاري لدى محكمة الفروانية" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input name="startDate" label="تاريخ البدء المعتمد" type="date" value={formData.startDate || ''} onChange={handleChange} />
          <Input name="dueDate" label="تاريخ الاستحقاق والتسليم" type="date" value={formData.dueDate || ''} onChange={handleChange} required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select name="assignedTo" label="المحامي / الموظف المسؤول" value={formData.assignedTo || ''} options={assigneeOptions} onChange={handleChange} required />
          <Select name="clientName" label="الموكل المرتبط" value={formData.clientName || ''} options={clientOptions} onChange={handleChange} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select name="status" label="حالة التقدم" value={formData.status} options={adminTaskStatusOptions} onChange={handleChange} required />
          <Select name="priority" label="الخطورة والأولوية" value={formData.priority} options={adminTaskPriorityOptions} onChange={handleChange} required />
          <Select name="category" label="التصنيف القضائي" value={formData.category} options={adminTaskCategoryOptions} onChange={handleChange} required />
        </div>
        
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400">نسبة الإنجاز المحققة</label>
                <span className="text-xs font-black text-primary">{formData.progress}%</span>
            </div>
            <input 
                type="range" 
                min="0" 
                max="100" 
                step="5" 
                value={formData.progress || 0} 
                onChange={handleRangeChange}
                className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-primary"
            />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select 
                name="relatedCaseId" 
                label="الارتباط القضائي بملف دعوى" 
                value={formData.relatedCaseId || ''} 
                options={caseOptions} 
                onChange={handleChange} 
            />
            <Select 
                name="legalActionType" 
                label="نوع الإجراء الميداني" 
                value={formData.legalActionType || ''} 
                options={actionTypeOptions} 
                onChange={handleChange} 
            />
        </div>
        
        <div className="grid grid-cols-1 gap-4">
            <Select 
                name="courtVenue" 
                label="المقر / الدائرة / المحكمة المستهدفة للتنفيذ" 
                value={formData.courtVenue || 'بدون مقر محدد (عمل من المكتب)'} 
                options={venueOptions} 
                onChange={handleChange} 
            />
        </div>
        
        <TextArea name="description" label="وصف المهمة وخارطة الطريق للتنفيذ" value={formData.description || ''} onChange={handleChange} rows={3} placeholder="يرجى كتابة خطوات العمل الواجب اتخاذها بالتفصيل..." />
        <TextArea name="notes" label="ملاحظات وتوجيهات المدير الخاص" value={formData.notes || ''} onChange={handleChange} rows={2} placeholder="تنبيهات عاجلة للالتزام بها..." />
        
        <div className="flex justify-end space-x-3 space-x-reverse pt-4 border-t dark:border-gray-800 mt-6">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">إلغاء</Button>
          <Button type="submit" className="rounded-xl px-8 shadow-lg shadow-primary/20">
            {assignerSignature ? "اعتماد حفظ التعديلات" : "التوقيع والاعتماد النهائي"}
          </Button>
        </div>
      </form>

      {showSignaturePad && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-white dark:bg-dm-card p-6 rounded-3xl shadow-2xl max-w-lg w-full">
                  <SignaturePad 
                      title="توقيع المدير العام لاعتماد التكليف"
                      onSave={(sig) => {
                          setAssignerSignature(sig);
                          setShowSignaturePad(false);
                      }}
                      onCancel={() => setShowSignaturePad(false)}
                  />
              </div>
          </div>
      )}
    </Modal>
  );
};

// --- Main Page Component ---
export const TaskManagementPage: React.FC = () => {
    const { tasks, setTasks, addTask, updateTask, deleteTask } = useCaseTask();
    const { addToast } = useToast();
    
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

    const handleToggleSubtask = (taskId: string, subtaskId: string) => {
        const taskObj = processedTasks.find(t => t.id === taskId);
        if (!taskObj) return;

        const updatedSubtasks = (taskObj.subtasks || []).map(st => {
            if (st.id === subtaskId) {
                return { ...st, completed: !st.completed };
            }
            return st;
        });

        const completedCount = updatedSubtasks.filter(s => s.completed).length;
        const totalCount = updatedSubtasks.length;
        const newProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : taskObj.progress;

        const currentUserName = 'أستاذ صبري شطا (مدير ومقيّم)';
        const toggledSubtask = updatedSubtasks.find(s => s.id === subtaskId);
        const logAction = `تعديل بند المهام الفرعية ليكون [${toggledSubtask?.completed ? 'مكتمل' : 'قيد المباشرة'}]: "${toggledSubtask?.title}" - نسبة إنجاز كلية ${newProgress}%`;

        const newLog = {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            user: currentUserName,
            action: logAction
        };

        const updatedTask = {
            ...taskObj,
            subtasks: updatedSubtasks,
            progress: newProgress,
            status: newProgress === 100 ? AdminTaskStatus.COMPLETED : taskObj.status,
            historyLog: [...(taskObj.historyLog || []), newLog],
            updatedAt: new Date().toISOString().split('T')[0]
        };

        updateTask(updatedTask);
        setViewingTask(updatedTask);
        addToast({
            type: 'success',
            title: 'تم تحديث جزء المهمة',
            message: logAction
        });
    };

    const handleAddSubtask = (taskId: string) => {
        if (!newSubtaskTitle.trim()) return;
        const taskObj = processedTasks.find(t => t.id === taskId);
        if (!taskObj) return;

        const newSub = {
            id: `st-${Date.now()}`,
            title: newSubtaskTitle.trim(),
            completed: false
        };

        const updatedSubtasks = [...(taskObj.subtasks || []), newSub];
        
        const completedCount = updatedSubtasks.filter(s => s.completed).length;
        const totalCount = updatedSubtasks.length;
        const newProgress = Math.round((completedCount / totalCount) * 100);

        const currentUserName = 'أستاذ صبري شطا (المدير الإداري)';
        const newLog = {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            user: currentUserName,
            action: `إضافة بند فرعي جديد: "${newSub.title}"`
        };

        const updatedTask = {
            ...taskObj,
            subtasks: updatedSubtasks,
            progress: newProgress,
            historyLog: [...(taskObj.historyLog || []), newLog],
            updatedAt: new Date().toISOString().split('T')[0]
        };

        updateTask(updatedTask);
        setViewingTask(updatedTask);
        setNewSubtaskTitle('');
        addToast({
            type: 'success',
            title: 'تم إضافة البند',
            message: 'تم جدولته ضمن المسار الفعلي التكتيكي للمهمة.'
        });
    };

    const handleDeleteSubtask = (taskId: string, subtaskId: string) => {
        const taskObj = processedTasks.find(t => t.id === taskId);
        if (!taskObj) return;

        const updatedSubtasks = (taskObj.subtasks || []).filter(s => s.id !== subtaskId);
        
        const totalCount = updatedSubtasks.length;
        const completedCount = updatedSubtasks.filter(s => s.completed).length;
        const newProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        const currentUserName = 'أستاذ صبري شطا';
        const newLog = {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            user: currentUserName,
            action: `حذف بند مهام فرعي من أرشيف التكليف`
        };

        const updatedTask = {
            ...taskObj,
            subtasks: updatedSubtasks,
            progress: newProgress,
            historyLog: [...(taskObj.historyLog || []), newLog],
            updatedAt: new Date().toISOString().split('T')[0]
        };

        updateTask(updatedTask);
        setViewingTask(updatedTask);
        addToast({
            type: 'info',
            title: 'تم مسح البند الفرعي',
            message: 'تم تصفية وإعادة حساب نسبة الإنجاز الشاملة.'
        });
    };

    // UI state
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<AdminTaskStatus | 'OVERDUE' | ''>('');
    const [filterPriority, setFilterPriority] = useState<AdminTaskPriority | ''>('');
    const [filterCategory, setFilterCategory] = useState<AdminTaskCategory | ''>('');
    const [filterLawyer, setFilterLawyer] = useState<string>('');
    const [filterClient, setFilterClient] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'current' | 'analytics' | 'reports_tab' | 'ai'>('current');
    const [viewMode, setViewMode] = useState<'grid' | 'board' | 'list'>('grid');
    
    // Selected role access filter (Lawyer, Admin, Manager, Staff)
    const [selectedRole, setSelectedRole] = useState<'Lawyer' | 'Admin' | 'Manager' | 'Staff'>('Manager');

    // Modals control
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<any | null>(null);
    const [viewingTask, setViewingTask] = useState<any | null>(null);

    // Simulated Document uploaded state
    const [uploadingDoc, setUploadingDoc] = useState(false);
    const [uploadedFilesList, setUploadedFilesList] = useState<any[]>([]);

    // Print setup
    const [printingReportData, setPrintingReportData] = useState<any[] | null>(null);

    // AI Section State
    const [aiQuery, setAiQuery] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState<string | null>(null);

    // Process tasks to make sure all properties are gracefully initialized on mount
    const processedTasks = useMemo(() => {
        return tasks.map((task: any, index) => {
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== AdminTaskStatus.COMPLETED;
            
            // Build fallback subtasks based on category if empty
            const defaultSubtasks = [
                { id: `st-${task.id}-1`, title: 'صياغة المسودة والدراسة الفنية للملف الإداري لقضية العمل', completed: (task.progress || 0) >= 25 },
                { id: `st-${task.id}-2`, title: 'مراجعة الملاحظات واعتمادها مع المستشار المسؤول ورئيس القسم بالمكتب', completed: (task.progress || 0) >= 50 },
                { id: `st-${task.id}-3`, title: 'الطباعة والتدقيق الثنائي والمطابقة مع متطلبات محاكم الكويت', completed: (task.progress || 0) >= 75 },
                { id: `st-${task.id}-4`, title: 'المثول وتقديم الطلب / المستند في الدائرة وتسجيله في السجل العام ورقي وإلكتروني الكلي', completed: (task.progress || 0) === 100 }
            ];

            const taskCourtVenue = task.courtVenue || (
                index % 6 === 0 ? 'قصر العدل (محافظة العاصمة)' :
                index % 6 === 1 ? 'مجمع محاكم الرقعي (محافظة الفروانية)' :
                index % 6 === 2 ? 'مجمع محاكم حولي' :
                index % 6 === 3 ? 'مجمع محاكم الجهراء' :
                index % 6 === 4 ? 'مجمع محاكم الأحمدي والمنطقة الجنوبية' : 'بدون مقر محدد (عمل من المكتب)'
            );

            return {
                ...task,
                startDate: task.startDate || task.createdAt || new Date().toISOString().split('T')[0],
                clientName: task.clientName || mockClients[index % mockClients.length],
                legalActionType: task.legalActionType || mockLegalActionTypes[index % mockLegalActionTypes.length],
                attachmentsList: task.attachmentsList || [
                    { id: 'att-1', name: 'صحيفة_الدعوى_المعتمدة.pdf', size: '1.4 MB', date: '2024-05-10' }
                ],
                historyLog: task.historyLog && task.historyLog.length > 0 ? task.historyLog : [
                    { id: 'h-1', timestamp: task.createdAt + "T09:00:00Z", user: 'صبري شطا (المدير)', action: 'إنشاء التكليف الإداري والربط بالملف القضائي' },
                    { id: 'h-2', timestamp: task.updatedAt ? task.updatedAt + "T11:45:00Z" : task.createdAt + "T11:00:00Z", user: task.assignedTo, action: `تحديث نسبة التقدم وتأكيد المباشرة` }
                ],
                subtasks: task.subtasks && task.subtasks.length > 0 ? task.subtasks : defaultSubtasks,
                courtVenue: taskCourtVenue,
                isOverdue
            };
        });
    }, [tasks]);

    // Deadlines Alerts System inside local state
    const deadlineAlerts = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        const today = new Date();
        const overdue = processedTasks.filter(t => t.isOverdue);
        
        // Due soon (within next 3 days) and not completed
        const dueSoon = processedTasks.filter(t => {
            if (t.status === AdminTaskStatus.COMPLETED) return false;
            const diffTime = new Date(t.dueDate).getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays >= 0 && diffDays <= 3;
        });

        return { overdue, dueSoon };
    }, [processedTasks]);

    // Handle Quick Move Status inside Kanban / Dashboard
    const handleQuickMoveStatus = useCallback((taskId: string, currentStatus: AdminTaskStatus, direction: 'forward' | 'backward' | 'complete' | 'block') => {
        const taskObj = processedTasks.find(t => t.id === taskId);
        if (!taskObj) return;

        let nextStatus = currentStatus;
        if (direction === 'forward') {
            if (currentStatus === AdminTaskStatus.TODO) nextStatus = AdminTaskStatus.IN_PROGRESS;
            else if (currentStatus === AdminTaskStatus.IN_PROGRESS) nextStatus = AdminTaskStatus.PENDING_REVIEW;
        } else if (direction === 'backward') {
            if (currentStatus === AdminTaskStatus.IN_PROGRESS) nextStatus = AdminTaskStatus.TODO;
            else if (currentStatus === AdminTaskStatus.PENDING_REVIEW) nextStatus = AdminTaskStatus.IN_PROGRESS;
        } else if (direction === 'complete') {
            nextStatus = AdminTaskStatus.COMPLETED;
        } else if (direction === 'block') {
            nextStatus = AdminTaskStatus.BLOCKED;
        }

        const currentUserName = 'أستاذ صبري شطا (المدير العام)';
        const statusLog = {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            user: currentUserName,
            action: `تغيير الحالة السريعة من [${currentStatus}] إلى [${nextStatus}]`
        };

        const updatedTask = {
            ...taskObj,
            status: nextStatus,
            progress: nextStatus === AdminTaskStatus.COMPLETED ? 100 : taskObj.progress,
            historyLog: [...(taskObj.historyLog || []), statusLog],
            updatedAt: new Date().toISOString().split('T')[0]
        };

        updateTask(updatedTask);
        addToast({
            type: 'success',
            title: 'تم تحديث حالة المهمة',
            message: `تم نقل الحالة إلى "${nextStatus}" بنجاح.`
        });
    }, [processedTasks, updateTask, addToast]);

    // Simulated Document Upload handler
    const handleSimulatedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        setUploadingDoc(true);

        setTimeout(() => {
            const newFileRecord = {
                id: `att-${Date.now()}`,
                name: file.name,
                size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                date: new Date().toISOString().split('T')[0]
            };

            setUploadedFilesList(prev => [...prev, newFileRecord]);
            
            // Add to currently viewed task if viewing
            if (viewingTask) {
                const updatedObj = {
                    ...viewingTask,
                    attachmentsList: [...(viewingTask.attachmentsList || []), newFileRecord]
                };
                updateTask(updatedObj);
                setViewingTask(updatedObj);
            }

            setUploadingDoc(false);
            addToast({
                type: 'success',
                title: 'تم رفع الملف بنجاح',
                message: `تم تسجيل وأرشفة المستند: "${file.name}".`
            });
        }, 800);
    };

    const filteredTasks = useMemo(() => {
        return processedTasks.filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  (task.clientName && task.clientName.toLowerCase().includes(searchTerm.toLowerCase()));
            
            let matchesStatus = true;
            if (filterStatus === 'OVERDUE') {
                matchesStatus = task.isOverdue;
            } else if (filterStatus) {
                matchesStatus = task.status === filterStatus;
            }

            const matchesPriority = filterPriority ? task.priority === filterPriority : true;
            const matchesCategory = filterCategory ? task.category === filterCategory : true;
            const matchesLawyer = filterLawyer ? task.assignedTo === filterLawyer : true;
            const matchesClient = filterClient ? task.clientName === filterClient : true;

            return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesLawyer && matchesClient;
        }).sort((a, b) => {
            const priorityOrder = { [AdminTaskPriority.CRITICAL]: 0, [AdminTaskPriority.HIGH]: 1, [AdminTaskPriority.MEDIUM]: 2, [AdminTaskPriority.LOW]: 3 };
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
    }, [processedTasks, searchTerm, filterStatus, filterPriority, filterCategory, filterLawyer, filterClient]);

    const stats = useMemo(() => {
        const total = processedTasks.length;
        const completed = processedTasks.filter(t => t.status === AdminTaskStatus.COMPLETED).length;
        const inProgress = processedTasks.filter(t => t.status === AdminTaskStatus.IN_PROGRESS).length;
        const critical = processedTasks.filter(t => t.priority === AdminTaskPriority.CRITICAL && t.status !== AdminTaskStatus.COMPLETED).length;
        const blocked = processedTasks.filter(t => t.status === AdminTaskStatus.BLOCKED).length;
        const overdue = processedTasks.filter(t => t.isOverdue).length;

        // Categorized count for charts
        const byCategory = Object.values(AdminTaskCategory).map(cat => ({
            name: cat,
            count: processedTasks.filter(t => t.category === cat).length
        }));

        // Status counts
        const byStatus = Object.values(AdminTaskStatus).map(status => ({
            name: status,
            count: processedTasks.filter(t => t.status === status).length
        }));

        // Priority breakdown
        const byPriority = Object.values(AdminTaskPriority).map(prio => ({
            name: prio,
            count: processedTasks.filter(t => t.priority === prio).length
        }));

        return { total, completed, inProgress, critical, blocked, overdue, byCategory, byStatus, byPriority };
    }, [processedTasks]);

    const handleTaskSubmit = (data: any) => {
        if (editingTask?.id) {
            updateTask(data);
            addToast({ type: 'success', title: 'تحديث ناجح', message: 'تم تعديل بيانات المهمة وتدوينها بسلسلة الحوكمة.' });
        } else {
            addTask(data);
            addToast({ type: 'success', title: 'تكليف ناجح', message: 'تم إسناد المهمة للموظف وتسجيل التوقيع الإلكتروني.' });
        }
        setIsFormModalOpen(false);
    };

    const handleDeleteTask = (id: string) => {
        // Safe check for Manager permissions
        if (selectedRole !== 'Manager' && selectedRole !== 'Admin') {
            addToast({
                type: 'error',
                title: 'صلاحيات غير كافية',
                message: 'عذراً، يسمح فقط لمدراء الفروع أو المسؤولين بحذف المهام.'
            });
            return;
        }

        if (confirm('هل أنت متأكد من رغبتك في حذف هذا التكليف نهائياً وتصفية الأرشيف المرتبط به؟')) {
            deleteTask(id);
            addToast({ type: 'success', title: 'تم الحذف', message: 'تم تصفية المهمة من سجلات العمل بنجاح.' });
        }
    };

    // AI task execution plan generator
    const handlePlanWithAI = async () => {
        if (!aiQuery.trim()) return;
        setAiLoading(true);
        try {
            const prompt = `أنت الخبير القانوني في مكتب صبري شطا للمحاماة في الكويت. قم بوضع خطة عمل قانونية شاملة ومتناسقة للمهمة التالية بأسلوب مهني دقيق: "${aiQuery}".
            تأكد من تقسيم التكليف إلى أربعة مراحل تنظيمية واذكر المواد القانونية الكويتية المناسبة إن وجدت، واذكر المخاطر وكيفية تلافيها والمنتج الورقي المعتمد للتسليم.`;
            const response = await geminiService.getChatbotResponse(prompt);
            setAiResponse(response);
        } catch (e) {
            setAiResponse("عذراً، حدث عطل مؤقت في الاتصال بنظام الاستشراف القانوني الذكي. يرجى مراجعة الاتصال وإعادة المحاولة.");
        } finally {
            setAiLoading(false);
        }
    };

    const handleConvertPlanToTask = () => {
        if (!aiQuery.trim() || !aiResponse) return;
        
        const newAIId = `task-ai-${Date.now()}`;
        
        const generatedTask: AdminTask = {
            id: newAIId,
            title: `خطة مستنبطة ذاتياً: ${aiQuery.trim()}`,
            description: `الخطة القانونية المعتمدة بواسطة التحليل الميداني الاصطناعي للملف:\n\n${aiResponse}`,
            dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
            assignedTo: 'أحمد محمود المحمد الصباح', // Default to leading lawyer
            status: AdminTaskStatus.TODO,
            priority: AdminTaskPriority.HIGH,
            category: AdminTaskCategory.LEGAL_ADMIN,
            progress: 0,
            createdAt: new Date().toISOString().split('T')[0],
            courtVenue: aiQuery.includes('الرقعي') ? 'مجمع محاكم الرقعي (محافظة الفروانية)' :
                        aiQuery.includes('حولي') ? 'مجمع محاكم حولي' :
                        aiQuery.includes('العدل') ? 'قصر العدل (محافظة العاصمة)' :
                        aiQuery.includes('الأحمدي') ? 'مجمع محاكم الأحمدي والمنطقة الجنوبية' :
                        aiQuery.includes('الجهراء') ? 'مجمع محاكم الجهراء' : 'بدون مقر محدد (عمل من المكتب)',
            subtasks: [
                { id: `${newAIId}-st-1`, title: 'المرحلة 1: دراسة وصياغة البنود والدفوع الاستشارية الفنية', completed: false },
                { id: `${newAIId}-st-2`, title: 'المرحلة 2: المراجعة الثنائية للملف مع المستشار وتوقيع المسؤول', completed: false },
                { id: `${newAIId}-st-3`, title: 'المرحلة 3: الطباعة وتوجه وتوطيد وتجهيز الحافظة والمستندات الورقية والطلب', completed: false },
                { id: `${newAIId}-st-4`, title: 'المرحلة 4: المثول وتسجيل الإيداع رسمياً بالمقر القضائي المعني بالكويت', completed: false }
            ]
        };

        addTask(generatedTask);
        
        addToast({
            type: 'success',
            title: 'تم تشييد التكليف الذكي',
            message: 'تم توليد المهمة الميدانية وحقنها بجدول القضايا قيد المباشرة بنجاح!'
        });

        // Switch back to "current" tab
        setActiveTab('current');
    };

    const handlePrintAction = () => {
        window.print();
    };

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1', '#ec4899'];

    // Render lists of smart report parameters
    const handleGenerateReportType = (type: 'daily' | 'weekly' | 'monthly') => {
        const todayStr = new Date().toISOString().split('T')[0];
        let reportDataFiltered = [];

        if (type === 'daily') {
            reportDataFiltered = processedTasks.filter(t => t.startDate === todayStr || t.dueDate === todayStr);
        } else if (type === 'weekly') {
            const oneWeekAgo = new Date(new Date().setDate(new Date().getDate() - 7));
            reportDataFiltered = processedTasks.filter(t => new Date(t.createdAt) >= oneWeekAgo);
        } else {
            const oneMonthAgo = new Date(new Date().setMonth(new Date().getMonth() - 1));
            reportDataFiltered = processedTasks.filter(t => new Date(t.createdAt) >= oneMonthAgo);
        }

        setPrintingReportData(reportDataFiltered);
        addToast({
            type: 'info',
            title: 'تم توليد التقرير',
            message: `تم تجهيز كشف التقرير المطبوع بنجاح. انقر على طباعة للمتابعة.`
        });
    };

    const renderListView = () => (
        <Card className="p-0 overflow-hidden border-none shadow-xl rounded-[2.5rem] bg-white dark:bg-dm-card">
            <div className="overflow-x-auto">
                <table className="min-w-full text-right text-sm">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-dm-background border-b border-gray-100 dark:border-gray-800">
                            <th className="p-5 font-black text-gray-400 dark:text-gray-500 uppercase text-[10px] tracking-widest px-8">المهمة القانونية المرتبطة</th>
                            <th className="p-5 font-black text-gray-400 dark:text-gray-500 uppercase text-[10px] tracking-widest text-center">خطورة الأولوية</th>
                            <th className="p-5 font-black text-gray-400 dark:text-gray-500 uppercase text-[10px] tracking-widest text-center">أطراف القضية / الموكل</th>
                            <th className="p-5 font-black text-gray-400 dark:text-gray-500 uppercase text-[10px] tracking-widest text-center font-mono">الحالة الفنية</th>
                            <th className="p-5 font-black text-gray-400 dark:text-gray-500 uppercase text-[10px] tracking-widest">مسؤول التنفيذ</th>
                            <th className="p-5 font-black text-gray-400 dark:text-gray-500 uppercase text-[10px] tracking-widest">تاريخ الاستحقاق</th>
                            <th className="p-5 font-black text-gray-400 dark:text-gray-500 uppercase text-[10px] tracking-widest text-center">التحكم الحوكمي</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                        {filteredTasks.map(task => (
                            <tr key={task.id} className="hover:bg-gray-50/50 dark:hover:bg-dm-background/50 transition-colors group">
                                <td className="p-5 px-8">
                                    <div className="flex flex-col">
                                        <span className="font-black text-gray-900 dark:text-white group-hover:text-primary transition-colors cursor-pointer" onClick={() => setViewingTask(task)}>{task.title}</span>
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500">{task.category}</span>
                                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                                            <span className="text-[10px] font-bold text-primary">{task.legalActionType}</span>
                                            {task.courtVenue && task.courtVenue !== 'بدون مقر محدد (عمل من المكتب)' && (
                                                <>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                                                    <span className="text-[10px] font-black text-violet-650 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/20 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                                        <MapPin className="w-3 h-3 text-violet-55" />
                                                        {task.courtVenue}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="p-5 text-center">
                                    <AdminTaskPriorityBadge priority={task.priority} size="xs" />
                                </td>
                                <td className="p-5 text-center font-bold text-gray-650 dark:text-gray-300 text-xs">
                                    {task.clientName || 'بدون ارتباط مباشر'}
                                </td>
                                <td className="p-5 text-center">
                                    <AdminTaskStatusBadge status={task.status} size="xs" />
                                </td>
                                <td className="p-5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                                            {task.assignedTo.charAt(0)}
                                        </div>
                                        <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{task.assignedTo}</span>
                                    </div>
                                </td>
                                <td className="p-5">
                                    <span className={`text-xs font-mono font-bold ${task.isOverdue ? 'text-rose-500 animate-pulse' : 'text-gray-500'}`}>{task.dueDate || '-'}</span>
                                </td>
                                <td className="p-5">
                                    <div className="flex justify-center gap-2">
                                        <button onClick={() => setViewingTask(task)} className="p-2 text-gray-400 hover:text-primary transition-colors" title="استعراض وسجل النشاط"><EyeIcon className="w-4 h-4" /></button>
                                        <button onClick={() => { setEditingTask(task); setIsFormModalOpen(true); }} className="p-2 text-gray-400 hover:text-amber-500 transition-colors" title="تحرير"><PencilIcon className="w-4 h-4" /></button>
                                        <button onClick={() => handleDeleteTask(task.id)} className="p-2 text-gray-400 hover:text-rose-500 transition-colors" title="حذف ومسح"><TrashIcon className="w-4 h-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );

    const renderBoardView = () => {
        const columns = [
            { id: AdminTaskStatus.TODO, label: 'بانتظار البدء والمباشرة', color: 'bg-gray-100 border-gray-300 dark:bg-gray-900 dark:border-gray-800' },
            { id: AdminTaskStatus.IN_PROGRESS, label: 'مباشرة العمل (قيد التنفيذ)', color: 'bg-blue-55 border-blue-200 dark:bg-blue-950/40 dark:border-blue-900' },
            { id: AdminTaskStatus.PENDING_REVIEW, label: 'مراجعة المخرجات والدفوع', color: 'bg-purple-55 border-purple-200 dark:bg-purple-950/40 dark:border-purple-900' },
            { id: AdminTaskStatus.BLOCKED, label: 'متوقفة / موانع شكلية وموضوعية', color: 'bg-rose-55 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900' },
            { id: AdminTaskStatus.COMPLETED, label: 'تم الإنجاز والأرشفة', color: 'bg-green-55 border-green-200 dark:bg-green-950/40 dark:border-green-900' },
        ];

        return (
            <div className="flex gap-6 overflow-x-auto pb-8 min-h-[550px] custom-scrollbar">
                {columns.map(col => (
                    <div key={col.id} className="flex-shrink-0 w-80 flex flex-col">
                        <div className={`p-4 rounded-t-2xl border-b-0 border-2 ${col.color} flex justify-between items-center bg-white dark:bg-dm-card`}>
                            <h3 className="font-black text-xs text-gray-700 dark:text-gray-250">{col.label}</h3>
                            <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm">{filteredTasks.filter(t => t.status === col.id).length}</span>
                        </div>
                        <div className="flex-grow bg-gray-50 dark:bg-dm-background/60 rounded-b-2xl border-2 border-t-0 dark:border-gray-800 p-3 space-y-3 overflow-y-auto">
                            {filteredTasks.filter(t => t.status === col.id).map(task => {
                                return (
                                    <div key={task.id} className="bg-white dark:bg-dm-card p-4 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-850 transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <AdminTaskPriorityBadge priority={task.priority} size="xs" />
                                            <ProgressRing progress={task.progress || 0} size={24} strokeWidth={2.3} />
                                        </div>
                                        <h4 className="text-xs font-black leading-relaxed line-clamp-2 dark:text-white cursor-pointer hover:text-primary mb-3" onClick={() => setViewingTask(task)}>{task.title}</h4>
                                        
                                        <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-2">
                                            <UserCircleIcon className="w-3.5 h-3.5" />
                                            <span className="font-bold truncate">{task.assignedTo}</span>
                                        </div>

                                        {task.courtVenue && task.courtVenue !== 'بدون مقر محدد (عمل من المكتب)' && (
                                            <div className="flex items-center gap-1 text-[10px] text-violet-600 dark:text-violet-400 mb-2">
                                                <MapPin className="w-3.5 h-3.5 shrink-0 text-violet-500 opacity-80" />
                                                <span className="font-black truncate" title={task.courtVenue}>{task.courtVenue}</span>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-gray-850 mt-3 text-[10px] text-gray-500">
                                            <span className="font-medium font-mono">{task.dueDate}</span>
                                            
                                            {/* Advanced Fast Status Transition Helpers */}
                                            <div className="flex items-center gap-1.5">
                                                {col.id !== AdminTaskStatus.COMPLETED && (
                                                    <button 
                                                        onClick={() => handleQuickMoveStatus(task.id, col.id, 'complete')}
                                                        className="p-1.5 bg-green-50 dark:bg-green-900/20 text-green-605 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40"
                                                        title="إنجاز المهمة نهائياً"
                                                    >
                                                        <CheckIcon className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                                {col.id === AdminTaskStatus.TODO && (
                                                    <button 
                                                        onClick={() => handleQuickMoveStatus(task.id, col.id, 'forward')}
                                                        className="px-2 py-1 bg-primary/10 text-primary rounded-lg font-bold"
                                                        title="مباشرة التنفيذ"
                                                    >
                                                        البدء
                                                    </button>
                                                )}
                                                {col.id !== AdminTaskStatus.BLOCKED && col.id !== AdminTaskStatus.COMPLETED && (
                                                    <button 
                                                        onClick={() => handleQuickMoveStatus(task.id, col.id, 'block')}
                                                        className="p-1.5 bg-rose-50 dark:bg-rose-900/20 text-rose-605 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/40"
                                                        title="وضع تحت طائلة العوائق"
                                                    >
                                                        <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {filteredTasks.filter(t => t.status === col.id).length === 0 && (
                                <div className="text-center py-10 text-gray-350 text-[11px] font-bold">لا توجد مهام حية بهذه الحالة</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-32">
            <PrintHeader title="سجلات الحوكمة وتقارير التكليفات القانونية" subtitle="مكتب الأستاذ صبري شطا للمحاماة والاستشارات القانونية والشركات" />
            
            {/* Critical Deadline Alert Banners */}
            {(deadlineAlerts.overdue.length > 0 || deadlineAlerts.dueSoon.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in print:hidden">
                    {deadlineAlerts.overdue.length > 0 && (
                        <div className="flex items-center justify-between p-4.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-3xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-650 dark:text-rose-400">
                                    <ExclamationTriangleIcon className="w-5 h-5 animate-pulse" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-black text-rose-900 dark:text-rose-300">أمن تكليفات متجاوزة موعد الحلول ({deadlineAlerts.overdue.length})</h4>
                                    <p className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">تكليفات هامة لم تكتمل وتجاوزت التاريخ المعين</p>
                                </div>
                            </div>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-rose-300 text-rose-700 bg-white dark:bg-rose-900/10 rounded-xl"
                                onClick={() => { setFilterStatus('OVERDUE'); setFilterPriority(''); }}
                            >
                                فرز التجاوزات
                            </Button>
                        </div>
                    )}
                    
                    {deadlineAlerts.dueSoon.length > 0 && (
                        <div className="flex items-center justify-between p-4.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-3xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-650 dark:text-amber-400">
                                    <ClockIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-black text-amber-900 dark:text-amber-300">تكليفات استحقاق خلال 48 ساعة ({deadlineAlerts.dueSoon.length})</h4>
                                    <p className="text-[10px] text-amber-650 dark:text-amber-400 font-medium">خطوات قضائية ينبغي إيداعها وتصفية مخرجاتها فوراً</p>
                                </div>
                            </div>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-amber-300 text-amber-700 bg-white dark:bg-amber-900/10 rounded-xl"
                                onClick={() => { setFilterStatus(AdminTaskStatus.IN_PROGRESS); setFilterPriority(AdminTaskPriority.HIGH); }}
                            >
                                مراجعة سريعة
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* --- Premium Header --- */}
            <div className="relative overflow-hidden bg-primary-dark rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl print:hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-light/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-400/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl" />
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-6 text-center md:text-right">
                        <div className="p-5 bg-white/10 backdrop-blur-xl rounded-3xl shadow-inner border border-white/20">
                            <ClipboardDocumentListIcon className="w-12 h-12 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tighter mb-2">إدارة المهام والتكليفات الذكية</h1>
                            <p className="text-primary-light/85 text-xs md:text-sm font-bold">حوكمة ومتابعة جودة أعمال محامي الحقل والمندوبين بمكتب الأستاذ صبري شطا</p>
                        </div>
                    </div>
                    
                    {/* Role Permission Display and Actions */}
                    <div className="flex flex-col md:flex-row gap-3 items-center">
                        <div className="flex bg-white/10 p-1.5 rounded-2xl border border-white/10 gap-1 text-[11px] font-bold">
                            <span className="self-center px-1.5 text-white/60">الصلاحيات:</span>
                            {(['Manager', 'Lawyer', 'Staff'] as const).map(role => (
                                <button
                                    key={role}
                                    onClick={() => setSelectedRole(role as any)}
                                    className={`px-3 py-1.5 rounded-xl transition-all ${selectedRole === role ? 'bg-amber-400 text-slate-900 font-extrabold shadow-md' : 'text-white hover:bg-white/5'}`}
                                >
                                    {role === 'Manager' ? 'المدير' : role === 'Lawyer' ? 'المحامي' : 'الموظف'}
                                </button>
                            ))}
                        </div>

                        {selectedRole === 'Manager' && (
                            <Button 
                                variant="secondary" 
                                size="md" 
                                className="rounded-2xl px-6 shadow-xl shadow-amber-900/40 transform hover:scale-105 transition-all text-sm font-black"
                                onClick={() => { setEditingTask(null); setIsFormModalOpen(true); }}
                            >
                                <PlusCircleIcon className="w-5 h-5 me-2" />
                                إسناد وتكليف معتمد
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* --- Stats Cards --- */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 print:hidden">
                <TaskStatMini label="إجمالي تكليفات الحقل" value={stats.total} icon={<Squares2X2Icon className="w-6 h-6" />} color="bg-blue-500" />
                <TaskStatMini label="تكليفات جارية" value={stats.inProgress} icon={<ClockIcon className="w-6 h-6" />} color="bg-amber-500" />
                <TaskStatMini label="تمت أرشفتها" value={stats.completed} icon={<CheckCircleIcon className="w-6 h-6" />} color="bg-emerald-500" />
                <TaskStatMini label="حرجة جداً" value={stats.critical} icon={<ExclamationTriangleIcon className="w-6 h-6" />} color="bg-red-500" />
                <TaskStatMini label="معضلة / عوائق" value={stats.blocked} icon={<ArchiveBoxIcon className="w-6 h-6" />} color="bg-purple-55" />
            </div>

            {/* --- Main Navigation Tabs --- */}
            <div className="flex items-center gap-1 bg-white dark:bg-dm-card p-1.5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 w-fit print:hidden">
                {[
                    { id: 'current', label: 'المهام الحية والجارية', icon: ListBulletIcon },
                    { id: 'reports_tab', label: 'كشوف ومنصة تقارير الطباعة', icon: PrinterIcon },
                    { id: 'analytics', label: 'كفاءة وتحليلات الأقسام', icon: ChartBarIcon },
                    { id: 'ai', label: 'استشراف المهام بذكاء صبري', icon: SparklesIcon },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all duration-300 ${activeTab === tab.id ? 'bg-primary text-white shadow-md' : 'text-gray-400 dark:text-gray-300 hover:text-gray-600 hover:bg-gray-50'}`}
                    >
                        <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : 'text-gray-300'}`} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'current' && (
                    <motion.div 
                        key="current" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        <div className="bg-white dark:bg-dm-card p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 print:hidden">
                            
                            {/* Smart Multi-filter Advanced Drawer Panels */}
                            <div className="flex flex-col gap-4 mb-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="relative group">
                                        <MagnifyingGlassIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                        <input 
                                            type="text" 
                                            placeholder="بحث بالعنوان، الموكل، الموظف..."
                                            className="w-full pr-10 pl-4 py-3 bg-gray-50 dark:bg-dm-background border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>

                                    <Select 
                                        options={[
                                            { value: '', label: 'جميع الحالات والتراتيب' }, 
                                            { value: 'OVERDUE', label: 'المتجاوزة للموعد الحتمي' }, 
                                            ...adminTaskStatusOptions
                                        ]}
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value as any)}
                                        containerClassName="mb-0 w-full"
                                        className="h-10 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-dm-background rounded-xl text-xs font-bold"
                                    />

                                    <Select 
                                        options={[{ value: '', label: 'كافة الأقسام' }, ...adminTaskCategoryOptions]}
                                        value={filterCategory}
                                        onChange={(e) => setFilterCategory(e.target.value as any)}
                                        containerClassName="mb-0 w-full"
                                        className="h-10 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-dm-background rounded-xl text-xs font-bold"
                                    />

                                    <div className="flex items-center justify-end gap-2">
                                        <div className="flex bg-gray-100 dark:bg-dm-background p-1 rounded-xl shadow-inner gap-1">
                                            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-gray-400 hover:text-gray-650'}`} title="عرض البطاقات"><Squares2X2Icon className="w-4 h-4"/></button>
                                            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-gray-400 hover:text-gray-650'}`} title="عرض الجدول الذكي"><ListBulletIcon className="w-4 h-4"/></button>
                                            <button onClick={() => setViewMode('board')} className={`p-2 rounded-lg transition-all ${viewMode === 'board' ? 'bg-white shadow-sm text-primary' : 'text-gray-400 hover:text-gray-650'}`} title="عرض لوحة كانبان للتقدم الميداني"><ViewColumnsIcon className="w-4 h-4"/></button>
                                        </div>
                                    </div>
                                </div>

                                {/* Row 2: Deep Link Filtering for Case Managers */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-t pt-4 dark:border-gray-800">
                                    <Select 
                                        options={[
                                            { value: '', label: 'تصفية حسب مسؤول الفيلد' },
                                            ...mockAssignees.map(a => ({ value: a, label: a }))
                                        ]}
                                        value={filterLawyer}
                                        onChange={(e) => setFilterLawyer(e.target.value)}
                                        containerClassName="mb-0"
                                        className="h-10 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-dm-background rounded-xl text-xs font-bold"
                                    />

                                    <Select 
                                        options={[
                                            { value: '', label: 'تصفية حسب الموكلين المشتركين' },
                                            ...mockClients.map(c => ({ value: c, label: c }))
                                        ]}
                                        value={filterClient}
                                        onChange={(e) => setFilterClient(e.target.value)}
                                        containerClassName="mb-0"
                                        className="h-10 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-dm-background rounded-xl text-xs font-bold"
                                    />

                                    <Button 
                                        variant="ghost" 
                                        className="text-primary hover:text-primary-dark font-bold text-xs place-self-end mt-2 md:mt-0"
                                        onClick={() => {
                                            setSearchTerm('');
                                            setFilterStatus('');
                                            setFilterPriority('');
                                            setFilterCategory('');
                                            setFilterLawyer('');
                                            setFilterClient('');
                                        }}
                                    >
                                        إلغاء كافة فلاتر البحث والفرز وعرض الشامل
                                    </Button>
                                </div>
                            </div>

                            {filteredTasks.length > 0 ? (
                                viewMode === 'board' ? renderBoardView() : 
                                viewMode === 'list' ? renderListView() : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredTasks.map((task, i) => {
                                            const relatedCase = initialCases.find(c => c.id === task.relatedCaseId);
                                            
                                            return (
                                                <motion.div 
                                                    key={task.id}
                                                    initial={{ opacity: 0, y: 15 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.04 }}
                                                    className={`group relative bg-white dark:bg-dm-card rounded-3xl border-2 transition-all duration-300 p-6 shadow-sm hover:shadow-2xl flex flex-col ${task.isOverdue ? 'border-rose-100 ring-4 ring-rose-50/20 shadow-rose-100/5 dark:border-rose-950 dark:ring-rose-950/20' : 'border-gray-50 dark:border-gray-800 hover:border-primary/20'}`}
                                                >
                                                    {/* Task Priority Ribbon */}
                                                    <div className={`absolute -left-1 top-6 h-6 w-1 rounded-r-full ${
                                                        task.priority === AdminTaskPriority.CRITICAL ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' :
                                                        task.priority === AdminTaskPriority.HIGH ? 'bg-amber-500' :
                                                        task.priority === AdminTaskPriority.MEDIUM ? 'bg-blue-500' : 'bg-emerald-500'
                                                    }`} />

                                                    <div className="flex-grow">
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div className="flex flex-wrap gap-1.5 focus:outline-none">
                                                                <AdminTaskStatusBadge status={task.status} size="xs" />
                                                                <AdminTaskPriorityBadge priority={task.priority} size="xs" />
                                                                <span className="px-2 py-0.5 bg-gray-50 dark:bg-dm-background text-[9px] font-black text-gray-400 rounded-lg uppercase tracking-wider border border-gray-100 dark:border-gray-800">{task.category}</span>
                                                            </div>
                                                            <ProgressRing progress={task.progress || 0} size={36} />
                                                        </div>

                                                        <h3 className="text-sm font-black text-gray-900 dark:text-white line-clamp-2 leading-tight group-hover:text-primary transition-colors cursor-pointer mb-5" onClick={() => setViewingTask(task)}>{task.title}</h3>
                                                        
                                                        <div className="space-y-3 mb-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
                                                                    <UserCircleIcon className="w-5 h-5 text-primary opacity-60" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">الموظف القائم بالميدان</p>
                                                                    <p className="text-xs font-black text-gray-700 dark:text-gray-300">{task.assignedTo}</p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-xl bg-amber-500/5 flex items-center justify-center border border-amber-500/10">
                                                                    <TagIcon className="w-5 h-5 text-amber-500 opacity-60" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">سجل الخصوم والعملاء</p>
                                                                    <p className="text-xs font-black text-gray-700 dark:text-gray-300">{task.clientName || 'غير مرتبط'}</p>
                                                                </div>
                                                            </div>

                                                            {task.courtVenue && task.courtVenue !== 'بدون مقر محدد (عمل من المكتب)' && (
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-xl bg-violet-505/5 flex items-center justify-center border border-violet-500/10 animate-pulse">
                                                                        <MapPin className="w-4 h-4 text-violet-500 opacity-75" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">المحكمة ومقر تنفيذ الإجراء</p>
                                                                        <p className="text-xs font-black text-violet-750 dark:text-violet-400 truncate max-w-[180px]" title={task.courtVenue}>{task.courtVenue}</p>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${task.isOverdue ? 'bg-rose-50 border-rose-100' : 'bg-gray-50 dark:bg-dm-background border-gray-100 dark:border-gray-800'}`}>
                                                                    <CalendarDaysIcon className={`w-5 h-5 ${task.isOverdue ? 'text-rose-55' : 'text-gray-400'}`} />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">المعد المستهدف للحكم والمثول</p>
                                                                    <p className={`text-xs font-black ${task.isOverdue ? 'text-rose-600' : 'text-gray-700 dark:text-gray-300'}`}>{task.dueDate || 'غير متضمن'}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        {task.relatedCaseId && (
                                                            <div className="bg-primary/5 p-3 rounded-2xl border border-primary/10 flex items-center gap-2 group/case">
                                                                <FolderIcon className="w-4 h-4 text-primary" />
                                                                <span className="text-[10px] font-black text-primary-dark truncate">قضية: {relatedCase ? relatedCase?.title : `كود القضية ${task.relatedCaseId}`}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="mt-8 pt-5 border-t border-gray-50 dark:border-gray-850 flex justify-end gap-2">
                                                        <button 
                                                            onClick={() => setViewingTask(task)} 
                                                            className="p-2 bg-gray-50 dark:bg-dm-background text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                                                            title="عرض التفاصيل العميقة"
                                                        >
                                                            <EyeIcon className="w-4.5 h-4.5" />
                                                        </button>
                                                        {selectedRole === 'Manager' && (
                                                            <>
                                                                <button 
                                                                    onClick={() => { setEditingTask(task); setIsFormModalOpen(true); }} 
                                                                    className="p-2 bg-gray-50 dark:bg-dm-background text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                                                                    title="تعديل في التكليف"
                                                                >
                                                                    <PencilIcon className="w-4.5 h-4.5" />
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDeleteTask(task.id)} 
                                                                    className="p-2 bg-gray-50 dark:bg-dm-background text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                                    title="شطب وإلغاء"
                                                                >
                                                                    <TrashIcon className="w-4.5 h-4.5" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )
                            ) : (
                                <div className="text-center py-24 bg-gray-50 dark:bg-dm-background rounded-[2.5rem] border-3 border-dashed border-gray-200 dark:border-gray-800">
                                    <div className="bg-white dark:bg-dm-card w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                                        <FunnelIcon className="w-10 h-10 text-gray-300" />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-400 dark:text-gray-305 tracking-tighter">لا توجد تكليفات مطابقة للتصفية</h3>
                                    <p className="text-xs text-gray-400 mt-2 font-medium">حاول تعديل فلاتر المحامي، الموكل أو تصفية الحالة المستهدفة</p>
                                    <Button variant="ghost" className="mt-6 text-primary font-black text-xs" onClick={() => { setSearchTerm(''); setFilterStatus(''); setFilterPriority(''); setFilterLawyer(''); setFilterClient(''); }}>تهيئة الفلاتر بالكامل</Button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* --- DAILY/WEEKLY/MONTHLY PRINTABLE REPORTS PANEL --- */}
                {activeTab === 'reports_tab' && (
                    <motion.div 
                        key="reports_tab" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                        className="space-y-6"
                    >
                        <Card className="p-8 rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-dm-card print:hidden">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                                <div>
                                    <h3 className="text-xl font-black flex items-center gap-2">
                                        <div className="w-2.5 h-7 bg-primary rounded-full" />
                                        توليد وإصدار كشوف التكليفات القانونية
                                    </h3>
                                    <p className="text-xs text-gray-400 font-bold mt-1">أدوات إدارية لإعداد المستندات المختومة لتقديمها لرؤساء الأقسام بالمكتب</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={() => handleGenerateReportType('daily')} variant="outline" className="rounded-xl font-bold text-xs">اليومي الحاضر</Button>
                                    <Button onClick={() => handleGenerateReportType('weekly')} variant="outline" className="rounded-xl font-bold text-xs bg-primary/10 text-primary">الأسبوعي الشامل</Button>
                                    <Button onClick={() => handleGenerateReportType('monthly')} variant="outline" className="rounded-xl font-bold text-xs bg-emerald-500/10 text-emerald-505">الشهري التفصيلي</Button>
                                </div>
                            </div>

                            {printingReportData ? (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-dm-background rounded-2xl">
                                        <span className="text-xs font-bold text-gray-500">تم حصر دعاوى بعدد ({printingReportData.length}) تكليف متواجد بالتقرير المقترح</span>
                                        <Button onClick={handlePrintAction} className="rounded-xl bg-slate-900 text-white font-black text-xs flex items-center gap-2">
                                            <PrinterIcon className="w-4 h-4" />
                                            مباشرة الطباعة الفعلية وتصدير ورق ورسمي
                                        </Button>
                                    </div>

                                    {/* Real printable report container */}
                                    <div className="p-10 border border-gray-200 dark:border-gray-800 rounded-3xl bg-white dark:bg-slate-950 font-sans shadow-lg max-w-4xl mx-auto" id="printable-area-container">
                                        {/* Office Logo & Header */}
                                        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
                                            <div className="text-right">
                                                <h1 className="text-xl font-black text-slate-900">مكتب المحامي صبري شطا</h1>
                                                <p className="text-xs font-bold text-slate-500 mt-1">للمحاماة والاستشارات القانونية والشركات</p>
                                                <p className="text-[10px] text-slate-400 font-medium mt-0.5">الكويت - العاصمة - شارع فهد السالم</p>
                                            </div>
                                            <div className="text-center">
                                                <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center border-2 border-slate-900 mx-auto mb-1">
                                                    <span className="font-serif text-xl font-extrabold tracking-widest text-slate-900">⚖</span>
                                                </div>
                                                <span className="text-[10px] font-black text-slate-900 uppercase">قانوني حوكمة</span>
                                            </div>
                                            <div className="text-left font-mono text-[9px] text-slate-500">
                                                <p>تاريخ الاستخراج: {new Date().toLocaleDateString('ar-EG')}</p>
                                                <p>رقم التوثيق: SEC-{Date.now().toString().slice(-6)}</p>
                                                <p>صلاحية: غير محدودة للإدارة</p>
                                            </div>
                                        </div>

                                        <div className="text-center mb-8">
                                            <h2 className="text-lg font-black text-slate-900 underline underline-offset-8">كشف بيان التكليفات والمهام القانونية الدورية</h2>
                                            <p className="text-[11px] text-slate-500 mt-2 font-bold">ملف إحصائي للأطقم المسؤولية والمندوبين بمحاكم دولة الكويت</p>
                                        </div>

                                        {/* Detailed summary counts of the report */}
                                        <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                                            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                                <p className="text-[10px] text-slate-400 font-bold">مهام قيد المباشرة</p>
                                                <p className="text-lg font-black text-slate-800">{printingReportData.filter(t=>t.status !== AdminTaskStatus.COMPLETED).length}</p>
                                            </div>
                                            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                                <p className="text-[10px] text-slate-400 font-bold">تكليفات تم تسويتها وإنجازها</p>
                                                <p className="text-lg font-black text-slate-800">{printingReportData.filter(t=>t.status === AdminTaskStatus.COMPLETED).length}</p>
                                            </div>
                                            <div className="p-3 bg-red-50/50 border border-red-100 rounded-xl">
                                                <p className="text-[10px] text-red-500 font-bold animate-pulse">متأخرين عن السقف الزمني</p>
                                                <p className="text-lg font-black text-red-700">{printingReportData.filter(t=>t.isOverdue).length}</p>
                                            </div>
                                        </div>

                                        {/* Main reporting table */}
                                        <table className="w-full text-right text-[11px] border-collapse">
                                            <thead>
                                                <tr className="border-b border-t border-slate-300 bg-slate-50 text-slate-600">
                                                    <th className="p-2 py-3 font-black">الوصف والهدف من التكليف والقضية</th>
                                                    <th className="p-2 py-3 font-black text-center">الموكل المرتبط</th>
                                                    <th className="p-2 py-3 font-black">الموظف المعين</th>
                                                    <th className="p-2 py-3 font-black text-center">تاريخ الأجل</th>
                                                    <th className="p-2 py-3 font-black text-center">الحالة الإدارية</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200">
                                                {printingReportData.map(t => (
                                                    <tr key={t.id} className="text-slate-700">
                                                        <td className="p-2 py-3.5">
                                                            <div className="font-bold">{t.title}</div>
                                                            {t.relatedCaseId && <div className="text-[9px] text-slate-400 mt-1">الربط القضائي: القضية {t.relatedCaseId}</div>}
                                                        </td>
                                                        <td className="p-2 text-center text-slate-600 font-bold">
                                                            {t.clientName || 'غير مدرج'}
                                                        </td>
                                                        <td className="p-2 font-bold">{t.assignedTo}</td>
                                                        <td className="p-2 text-center font-mono font-bold text-slate-500">{t.dueDate}</td>
                                                        <td className="p-2 text-center">
                                                            <span className="font-extrabold text-[10px]">{t.status}</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        {/* Footer signature and stamp areas */}
                                        <div className="grid grid-cols-2 gap-8 border-t border-slate-300 pt-10 mt-12 text-center">
                                            <div>
                                                <p className="text-xs font-black text-slate-800">ختم المكتب واعتماده ورسمي</p>
                                                <div className="w-24 h-24 border-2 border-dashed border-red-400 rounded-full flex items-center justify-center mx-auto mt-3 text-red-400 font-serif font-black text-xs opacity-40 rotate-12">
                                                    مكتب صبري شطا⚖
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-800">المدير العام والمدقق القانوني</p>
                                                <div className="h-12 flex items-center justify-center mt-3">
                                                    <div className="font-serif italic font-extrabold text-slate-800 border-b border-slate-400 pb-2 px-6">
                                                        أ. صبري شطا
                                                    </div>
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-bold mt-1">توقيع تسليم دورية الملفات</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-20 border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl bg-gray-50 dark:bg-dm-background">
                                    <PrinterIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <h4 className="text-sm font-black text-gray-400">يرجى الاختيار من الأعلى لتوليد الكشوف الرسمية</h4>
                                    <p className="text-[11px] text-gray-400/80 mt-1">سيقوم النظام بتجميع ملفات الحقل وأرشفة كشوفها في كشف الطباعة المعتمد</p>
                                </div>
                            )}

                        </Card>
                    </motion.div>
                )}

                {activeTab === 'analytics' && (
                    <motion.div 
                        key="analytics" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:hidden"
                    >
                        <Card className="p-8 rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-dm-card">
                            <h3 className="text-lg font-black mb-8 flex items-center gap-3">
                                <div className="w-2 h-8 bg-blue-500 rounded-full" />
                                توزيع تكليفات الحقل حسب القسم
                            </h3>
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={stats.byCategory} innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="count">
                                            {stats.byCategory.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                        </Pie>
                                        <RechartsTooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        <Card className="p-8 rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-dm-card">
                            <h3 className="text-lg font-black mb-8 flex items-center gap-3">
                                <div className="w-2 h-8 bg-amber-500 rounded-full" />
                                تقدم التكليفات حسب الحالة الفنية لمكتب صبري شطا
                            </h3>
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.byStatus}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#9ca3af' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#9ca3af' }} />
                                        <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                                        <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        <Card className="p-8 rounded-[2.5rem] border-none shadow-xl lg:col-span-2 bg-white dark:bg-dm-card">
                            <h3 className="text-lg font-black mb-8 flex items-center gap-3">
                                <div className="w-2 h-8 bg-primary rounded-full" />
                                مؤشرات الاستحقاق ومخاطر فوات الأوان للدعاوى
                            </h3>
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={stats.byPriority}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold' }} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <RechartsTooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                                        <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={4} dot={{ r: 6, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </motion.div>
                )}

                {activeTab === 'ai' && (
                    <motion.div 
                        key="ai" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="space-y-6 print:hidden"
                    >
                        <Card className="p-10 rounded-[2.5rem] border-none shadow-2xl bg-gradient-to-br from-indigo-50/50 via-white to-white dark:from-dm-card dark:to-dm-card">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-4 bg-indigo-600 rounded-3xl shadow-lg shadow-indigo-600/20">
                                    <SparklesIcon className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-indigo-900 dark:text-indigo-400 tracking-tighter">المخطط الجنائي والمدني الاصطناعي</h3>
                                    <p className="text-sm text-indigo-700/60 dark:text-indigo-500 font-semibold">حلل وقم بفرز المهام المعقدة لخطوات تنفيذية متوائمة مع محاكم الكويت</p>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4 mb-10">
                                <TextArea 
                                    placeholder="اكتب التكليف أو الخطوة المرغوبة هنا (مثال: تقديم مرافعة شفهية في قضية تزوير أوراق بنكية لدى محكمة الجنايات بالرقعي، أو تقديم شكوى لدى حماية المستهلك)"
                                    value={aiQuery}
                                    onChange={(e) => setAiQuery(e.target.value)}
                                    containerClassName="flex-grow"
                                    rows={3}
                                    className="p-5 text-base border-2 border-indigo-150 focus:border-indigo-400 rounded-3xl bg-white dark:bg-dm-background"
                                />
                                <Button 
                                    className="h-auto px-10 rounded-3xl text-lg font-black bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/30 w-full md:w-auto text-white"
                                    onClick={handlePlanWithAI}
                                    isLoading={aiLoading}
                                >
                                    تحليل وتوليد الخطة
                                </Button>
                            </div>

                            {aiResponse && (
                                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="p-8 bg-indigo-50/30 dark:bg-dm-background/50 rounded-3xl border border-indigo-100 dark:border-indigo-900/40">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b dark:border-indigo-900/20">
                                        <span className="flex items-center gap-2 text-indigo-900 dark:text-indigo-400 font-extrabold text-sm tracking-wide">
                                            <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-ping" />
                                            دراسة التخطيط المقترحة للمستشار صبري شطا
                                        </span>
                                        <div className="flex flex-wrap gap-2">
                                            <Button 
                                                size="sm" 
                                                onClick={handleConvertPlanToTask}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-lg shadow-indigo-600/10 rounded-xl"
                                            >
                                                تحويل الخطة لمهمة رسمية مميكنة وبنود فرعية
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => setAiResponse(null)} className="text-gray-400 hover:text-rose-500 rounded-xl text-xs">حذف كلي</Button>
                                        </div>
                                    </div>
                                    <div className="markdown-body text-indigo-950 dark:text-gray-200 leading-relaxed text-sm max-w-none">
                                        <ReactMarkdown>{aiResponse}</ReactMarkdown>
                                    </div>
                                </motion.div>
                            )}
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modals */}
            <TaskFormModal 
                isOpen={isFormModalOpen} 
                onClose={() => setIsFormModalOpen(false)} 
                onSubmit={handleTaskSubmit} 
                initialData={editingTask} 
            />
            
            {/* View Modal with Enhanced Details */}
            <Modal isOpen={!!viewingTask} onClose={() => setViewingTask(null)} title={`أرشيف تفاصيل التكليف: ${viewingTask?.id}`} size="lg">
                {viewingTask && (
                    <div className="space-y-6">
                        <div className="bg-gray-50 dark:bg-dm-background p-6 rounded-3xl border dark:border-gray-800">
                            <h2 className="text-xl font-black mb-4 leading-tight dark:text-white">{viewingTask.title}</h2>
                            <div className="flex flex-wrap gap-2">
                                <AdminTaskStatusBadge status={viewingTask.status} />
                                <AdminTaskPriorityBadge priority={viewingTask.priority} />
                                <span className="px-3 py-1 bg-white dark:bg-dm-card dark:text-gray-300 rounded-xl text-xs font-bold border dark:border-gray-800">{viewingTask.category}</span>
                            </div>
                        </div>

                        {/* Profiles / Linking Information Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-white dark:bg-dm-card border dark:border-gray-800 rounded-2xl flex items-center gap-3">
                                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl"><UserCircleIcon className="w-5 h-5 text-blue-600" /></div>
                                <div>
                                    <p className="text-[9px] text-gray-400 font-bold uppercase">قائم بالتنفيذ والنزول</p>
                                    <p className="text-xs font-black dark:text-gray-250">{viewingTask.assignedTo}</p>
                                </div>
                            </div>
                            <div className="p-4 bg-white dark:bg-dm-card border dark:border-gray-800 rounded-2xl flex items-center gap-3">
                                <div className="p-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-xl"><TagIcon className="w-5 h-5 text-amber-500" /></div>
                                <div>
                                    <p className="text-[9px] text-gray-400 font-bold uppercase">الموكل المرتبط</p>
                                    <p className="text-xs font-black dark:text-gray-250 text-amber-600">{viewingTask.clientName || 'غير مرتبط مباشرة'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Dates & Milestones */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-white dark:bg-dm-card border dark:border-gray-800 rounded-2xl flex items-center gap-3">
                                <div className="p-2.5 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl"><CalendarDaysIcon className="w-5 h-5 text-cyan-600" /></div>
                                <div>
                                    <p className="text-[9px] text-gray-400 font-bold uppercase">تاريخ المباشرة والتكليف</p>
                                    <p className="text-xs font-black dark:text-gray-200 font-mono">{viewingTask.startDate || viewingTask.createdAt}</p>
                                </div>
                            </div>
                            <div className="p-4 bg-white dark:bg-dm-card border dark:border-gray-800 rounded-2xl flex items-center gap-3">
                                <div className="p-2.5 bg-red-50 dark:bg-red-900/20 rounded-xl"><ClockIcon className="w-5 h-5 text-red-650" /></div>
                                <div>
                                    <p className="text-[9px] text-gray-400 font-bold uppercase">تاريخ الاستحقاق والموعد الأقصى</p>
                                    <p className="text-xs font-black text-red-600 dark:text-red-400 font-mono">{viewingTask.dueDate}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                                وصف العمل الاستباقي والمخرجات المطلوبة
                            </h4>
                            <div className="p-5 bg-gray-50 dark:bg-dm-background rounded-2xl border dark:border-gray-800 text-xs leading-8 min-h-[80px] text-gray-700 dark:text-gray-300">
                                {viewingTask.description || 'لا يوجد وصف تفصيلي خارطة طريق لتنفيذ التكليف الإداري.'}
                            </div>
                        </div>

                        {viewingTask.notes && (
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                                    تنبيهات وتوجيهات الإدارة العامة
                                </h4>
                                <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10 text-xs leading-7 text-amber-700 dark:text-amber-300">
                                    {viewingTask.notes}
                                </div>
                            </div>
                        )}

                        {/* Subtasks Section */}
                        <div className="space-y-3 p-5 bg-gray-50 dark:bg-dm-background rounded-3xl border dark:border-gray-800">
                            <h4 className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <ListBulletIcon className="w-4.5 h-4.5 text-primary" />
                                    بنود المهام الفرعية وقائمة التحقق الحقلية ({viewingTask.subtasks?.length || 0})
                                </span>
                                <span className="text-[10px] font-bold text-primary">تحكم تفاعلي مباشر</span>
                            </h4>

                            {/* Checklist */}
                            <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
                                {viewingTask.subtasks && viewingTask.subtasks.map((st: any) => (
                                    <div key={st.id} className="flex justify-between items-center bg-white dark:bg-dm-card p-2.5 rounded-xl border dark:border-gray-850 hover:bg-gray-50/50 dark:hover:bg-dm-background/50 transition-all select-none group">
                                        <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold w-full">
                                            <input 
                                                type="checkbox" 
                                                checked={st.completed} 
                                                onChange={() => handleToggleSubtask(viewingTask.id, st.id)}
                                                className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
                                            />
                                            <span className={`${st.completed ? 'line-through text-gray-400 dark:text-gray-505 font-medium' : 'text-gray-700 dark:text-gray-200'}`}>
                                                {st.title}
                                            </span>
                                        </label>
                                        <button 
                                            onClick={() => handleDeleteSubtask(viewingTask.id, st.id)} 
                                            className="p-1 text-gray-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                            title="حذف البند الفرعي"
                                        >
                                            <TrashIcon className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}

                                {(!viewingTask.subtasks || viewingTask.subtasks.length === 0) && (
                                    <p className="text-center py-4 text-[11px] text-gray-400 font-bold">لا يوجد قائمة بنود فرعية مسجلة حالياً لهذه المهمة.</p>
                                )}
                            </div>

                            {/* Add new subtask form */}
                            <div className="flex gap-2 items-center mt-3 pt-2 border-t dark:border-gray-800">
                                <input 
                                    type="text" 
                                    value={newSubtaskTitle}
                                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                    placeholder="إضافة بند فرعي لتتبع الإنجاز..."
                                    className="flex-grow text-xs font-bold p-2.5 px-4 bg-white dark:bg-dm-card border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                />
                                <Button 
                                    size="sm" 
                                    onClick={() => handleAddSubtask(viewingTask.id)}
                                    className="rounded-xl font-bold px-4 hover:scale-105 transform transition-all text-xs"
                                >
                                    إضافة بند
                                </Button>
                            </div>
                        </div>

                        {/* PDF Printable & Documents Section with Simulated upload */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <PaperClipIcon className="w-4 h-4 text-gray-400" />
                                    المستندات والأدلة والأوراق المرفقة
                                </h4>
                                
                                <label className="cursor-pointer bg-primary/10 hover:bg-primary/25 text-primary text-[11px] font-black px-3 py-1.5 rounded-xl transition-all">
                                    {uploadingDoc ? 'جاري الرفع والأرشفة...' : 'إرفاق مستند جديد +'}
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        onChange={handleSimulatedFileUpload} 
                                        disabled={uploadingDoc}
                                    />
                                </label>
                            </div>

                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {viewingTask.attachmentsList && viewingTask.attachmentsList.map((file: any) => (
                                    <div key={file.id} className="flex justify-between items-center p-3.5 bg-gray-50 dark:bg-dm-background rounded-xl border dark:border-gray-850">
                                        <div className="flex items-center gap-2 text-xs font-bold truncate">
                                            <PaperClipIcon className="w-4 h-4 text-gray-400" />
                                            <span className="truncate max-w-[200px]">{file.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold">
                                            <span>{file.size}</span>
                                            <span>|</span>
                                            <span>{file.date}</span>
                                            <button className="text-primary hover:underline ml-2" onClick={() => alert(`تنزيل مستند المحاكاة المعتمد: ${file.name}`)}>
                                                تحميل
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {uploadedFilesList.map((file) => (
                                    <div key={file.id} className="flex justify-between items-center p-3.5 bg-indigo-50/20 dark:bg-dm-background rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                                        <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-400 truncate">
                                            <CheckCircleIcon className="w-4 h-4 text-indigo-500" />
                                            <span className="truncate max-w-[200px]">{file.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-indigo-400 font-bold">
                                            <span>{file.size}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Audit Log Timeline Trail for Legal Compliance */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <ArrowPathIcon className="w-4 h-4 text-gray-400" />
                                سلسلة حوكمة التكليفات والتدقيق (Audit Trail)
                            </h4>
                            <div className="p-4 bg-gray-50 dark:bg-dm-background rounded-2xl space-y-3.5 border dark:border-gray-850 text-[11px] max-h-44 overflow-y-auto font-mono">
                                {viewingTask.historyLog && viewingTask.historyLog.map((log: any, index: number) => (
                                    <div key={log.id || index} className="flex items-start gap-2.5">
                                        <span className="w-2.5 h-2.5 rounded-full bg-primary/20 flex items-center justify-center text-[7px] font-black text-primary mt-0.5">•</span>
                                        <div>
                                            <p className="text-gray-900 dark:text-gray-300 font-bold leading-relaxed">{log.action}</p>
                                            <div className="flex gap-2 text-[9px] text-gray-400 font-medium mt-0.5">
                                                <span>بواسطة: {log.user}</span>
                                                <span>•</span>
                                                <span>{new Date(log.timestamp).toLocaleString('ar-EG')}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Signature area */}
                        <div className="flex items-center justify-between p-5 bg-primary/5 rounded-3xl border border-primary/10">
                            <div className="flex items-center gap-3">
                                <ProgressRing progress={viewingTask.progress || 0} size={50} strokeWidth={4.5} />
                                <div>
                                    <h4 className="text-xs font-black text-primary-dark dark:text-white">المؤشر الحالي للإتمام</h4>
                                    <p className="text-[10px] text-primary/60 font-bold uppercase tracking-tighter">يتم مراقبته من لوحة كفاءة المكاتب</p>
                                </div>
                            </div>
                            {viewingTask.assignerSignature && (
                                <div className="text-center">
                                    <img src={viewingTask.assignerSignature} alt="Manager Signature" className="h-10 mx-auto grayscale opacity-60 dark:invert" />
                                    <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">توقيع المسؤول المعتمد</p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-2.5 pt-6 border-t dark:border-gray-800">
                            <Button variant="outline" className="rounded-xl px-6 text-xs" onClick={() => setViewingTask(null)}>إغلاق النافذة</Button>
                            {selectedRole === 'Manager' && (
                                <Button className="rounded-xl px-6 text-xs" onClick={() => { setEditingTask(viewingTask); setIsFormModalOpen(true); setViewingTask(null); }}>تعديل وحفظ بالتوقيع</Button>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default TaskManagementPage;
