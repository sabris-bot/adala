
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
    ExclamationTriangleIcon, CalendarDaysIcon, Squares2X2Icon, FunnelIcon, MagnifyingGlassIcon
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
import PrintHeader from '../components/ui/PrintHeader';
import { useCaseTask } from '../components/CaseTaskContext';
import { initialCases } from '../data/caseData';
import { geminiService } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

const mockAssignees = ['أحمد محمود المحمد الصباح', 'فاطمة علي حسين', 'عمر خالد', 'ليلى منصور الهاجري', 'فريق العمل القانوني', 'ناصر عبدالله القحطاني'];

// --- Helper Components ---

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
            <span className="absolute text-[9px] font-bold text-gray-700 dark:text-dm-text">{progress}%</span>
        </div>
    );
};

const TaskStatMini: React.FC<{ label: string; value: number | string; icon: React.ReactNode; color: string }> = ({ label, value, icon, color }) => (
    <div className={`p-4 rounded-2xl bg-white dark:bg-dm-card border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4`}>
        <div className={`p-3 rounded-xl ${color} bg-opacity-10 ${color.replace('bg-', 'text-')}`}>
            {icon}
        </div>
        <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
            <p className="text-xl font-black text-gray-900 dark:text-dm-text">{value}</p>
        </div>
    </div>
);

// --- Modals ---

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: AdminTask) => void;
  initialData?: Partial<AdminTask> | null;
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [assignerSignature, setAssignerSignature] = useState(initialData?.assignerSignature || '');
  const [formData, setFormData] = useState<Partial<AdminTask>>(
    initialData || {
      title: '',
      status: AdminTaskStatus.TODO,
      priority: AdminTaskPriority.MEDIUM,
      category: AdminTaskCategory.OTHER,
      progress: 0,
      createdAt: new Date().toISOString().split('T')[0],
    }
  );

  useEffect(() => {
    if (isOpen) {
      setFormData(
        initialData || {
          title: '',
          status: AdminTaskStatus.TODO,
          priority: AdminTaskPriority.MEDIUM,
          category: AdminTaskCategory.OTHER,
          progress: 0,
          createdAt: new Date().toISOString().split('T')[0],
        }
      );
    }
  }, [isOpen, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({ ...prev, progress: parseInt(e.target.value) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.assignedTo) {
      alert("يرجى إدخال عنوان المهمة والشخص المسؤول.");
      return;
    }

    if (!assignerSignature) {
      setShowSignaturePad(true);
      return;
    }

    onSubmit({
      ...formData,
      id: formData.id || `task-${Date.now()}`,
      updatedAt: new Date().toISOString().split('T')[0],
      assignerSignature,
      progress: formData.status === AdminTaskStatus.COMPLETED ? 100 : formData.progress
    } as AdminTask);
  };
  
  const assigneeOptions = mockAssignees.map(assignee => ({value: assignee, label: assignee}));
  const caseOptions = [
      { value: '', label: 'غير مرتبطة بقضية' },
      ...initialCases.map(c => ({ value: c.id, label: `${c.caseNumber} - ${c.title}` }))
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData?.id ? "تعديل المهمة الإدارية" : "إسناد مهمة إدارية جديدة"} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input name="title" label="عنوان المهمة" value={formData.title || ''} onChange={handleChange} required placeholder="مثال: مراجعة كشف الرواتب لشهر مايو" />
        <TextArea name="description" label="وصف المهمة التفصيلي" value={formData.description || ''} onChange={handleChange} rows={3} placeholder="أضف تفاصيل وخطوات العمل المطلوبة..."/>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select name="assignedTo" label="الموظف المسؤول" value={formData.assignedTo || ''} options={assigneeOptions} onChange={handleChange} required placeholder="اختر المسؤول من الفريق"/>
          <Input name="dueDate" label="تاريخ الاستحقاق النهائي" type="date" value={formData.dueDate || ''} onChange={handleChange} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select name="status" label="حالة التنفيذ" value={formData.status} options={adminTaskStatusOptions} onChange={handleChange} required />
          <Select name="priority" label="درجة الأولوية" value={formData.priority} options={adminTaskPriorityOptions} onChange={handleChange} required />
          <Select name="category" label="تصنيف القسم" value={formData.category} options={adminTaskCategoryOptions} onChange={handleChange} required />
        </div>
        
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-500">نسبة الإنجاز الفعلية</label>
                <span className="text-xs font-black text-primary">{formData.progress}%</span>
            </div>
            <input 
                type="range" 
                min="0" 
                max="100" 
                step="5" 
                value={formData.progress || 0} 
                onChange={handleRangeChange}
                className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary"
            />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select 
                name="relatedCaseId" 
                label="ارتباط بقضية (إن وجد)" 
                value={formData.relatedCaseId || ''} 
                options={caseOptions} 
                onChange={handleChange} 
            />
            <Input name="projectOrModule" label="المشروع المرتبط" value={formData.projectOrModule || ''} onChange={handleChange} placeholder="مثال: وحدة التنفيذ العقاري"/>
        </div>
        
        <TextArea name="notes" label="ملاحظات توجيهية إضافية" value={formData.notes || ''} onChange={handleChange} rows={2} />
        
        <div className="flex justify-end space-x-3 space-x-reverse pt-4 border-t dark:border-gray-800 mt-6">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">إلغاء</Button>
          <Button type="submit" className="rounded-xl px-8 shadow-lg shadow-primary/20">
            {assignerSignature ? (initialData?.id ? "حفظ التحديث بالتوقيع" : "اعتماد المهمة الموقعة") : "التوقيع والاعتماد النهائي"}
          </Button>
        </div>
      </form>

      {showSignaturePad && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
              <div className="bg-white dark:bg-dm-card p-6 rounded-3xl shadow-2xl max-w-lg w-full">
                  <SignaturePad 
                      title="اعتماد المدير / رئيس القسم"
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

const TaskManagementPage: React.FC = () => {
    const { tasks, setTasks, addTask, updateTask, deleteTask } = useCaseTask();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<AdminTaskStatus | ''>('');
    const [filterPriority, setFilterPriority] = useState<AdminTaskPriority | ''>('');
    const [filterCategory, setFilterCategory] = useState<AdminTaskCategory | ''>('');
    const [activeTab, setActiveTab] = useState<'current' | 'analytics' | 'ai'>('current');
    const [viewMode, setViewMode] = useState<'grid' | 'board' | 'list'>('grid');
    
    // UI Modals
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Partial<AdminTask> | null>(null);
    const [viewingTask, setViewingTask] = useState<AdminTask | null>(null);

    // AI Section State
    const [aiQuery, setAiQuery] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState<string | null>(null);

    const filteredTasks = useMemo(() => {
        return tasks.filter(task =>
            (task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
             task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (filterStatus ? task.status === filterStatus : true) &&
            (filterPriority ? task.priority === filterPriority : true) &&
            (filterCategory ? task.category === filterCategory : true)
        ).sort((a,b) => {
            // Sort by priority first (Critical > High > Medium > Low)
            const priorityOrder = { [AdminTaskPriority.CRITICAL]: 0, [AdminTaskPriority.HIGH]: 1, [AdminTaskPriority.MEDIUM]: 2, [AdminTaskPriority.LOW]: 3 };
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
    }, [tasks, searchTerm, filterStatus, filterPriority, filterCategory]);

    const stats = useMemo(() => {
        const total = tasks.length;
        const completed = tasks.filter(t => t.status === AdminTaskStatus.COMPLETED).length;
        const inProgress = tasks.filter(t => t.status === AdminTaskStatus.IN_PROGRESS).length;
        const critical = tasks.filter(t => t.priority === AdminTaskPriority.CRITICAL && t.status !== AdminTaskStatus.COMPLETED).length;
        
        // Group by category for charts
        const byCategory = Object.values(AdminTaskCategory).map(cat => ({
            name: cat,
            count: tasks.filter(t => t.category === cat).length
        }));

        // Group by status
        const byStatus = Object.values(AdminTaskStatus).map(status => ({
            name: status,
            count: tasks.filter(t => t.status === status).length
        }));

        // Priority breakdown
        const byPriority = Object.values(AdminTaskPriority).map(prio => ({
            name: prio,
            count: tasks.filter(t => t.priority === prio).length
        }));

        return { total, completed, inProgress, critical, byCategory, byStatus, byPriority };
    }, [tasks]);

    const handleTaskSubmit = (data: AdminTask) => {
        if (editingTask?.id) {
            updateTask(data);
        } else {
            addTask(data);
        }
        setIsFormModalOpen(false);
    };

    const handleDeleteTask = (id: string) => {
        if (confirm('هل أنت متأكد من حذف هذه المهمة نهائياً؟')) {
            deleteTask(id);
        }
    };

    const handlePlanWithAI = async () => {
        if (!aiQuery.trim()) return;
        setAiLoading(true);
        try {
            const prompt = `أنت مخطط مهام قانوني خبير. قدم خطة عمل مفصلة ومقسمة لخطوات تنفيذية للمهمة التالية: "${aiQuery}".
            اجعل الخطة تشمل: المتطلبات، خطوات التنفيذ، المخاطر المحتملة، والوقت التقديري المتوقع لكل خطوة. اتبع تنسيق مهني بليغ.`;
            const response = await geminiService.getChatbotResponse(prompt);
            setAiResponse(response);
        } catch (e) {
            setAiResponse("عذراً، فشل المساعد الذكي في توفير الخطة حالياً.");
        } finally {
            setAiLoading(false);
        }
    };

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1', '#ec4899'];

    const renderListView = () => (
        <Card className="p-0 overflow-hidden border-none shadow-xl rounded-[2.5rem]">
            <div className="overflow-x-auto">
                <table className="min-w-full text-right text-sm">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-dm-card border-b border-gray-100 dark:border-gray-800">
                            <th className="p-5 font-black text-gray-400 uppercase text-[10px] tracking-widest px-8">المهمة</th>
                            <th className="p-5 font-black text-gray-400 uppercase text-[10px] tracking-widest text-center">الأولوية</th>
                            <th className="p-5 font-black text-gray-400 uppercase text-[10px] tracking-widest text-center">الحالة</th>
                            <th className="p-5 font-black text-gray-400 uppercase text-[10px] tracking-widest">المسؤول</th>
                            <th className="p-5 font-black text-gray-400 uppercase text-[10px] tracking-widest">الموعد</th>
                            <th className="p-5 font-black text-gray-400 uppercase text-[10px] tracking-widest text-center italic">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                        {filteredTasks.map(task => (
                            <tr key={task.id} className="hover:bg-gray-50/50 dark:hover:bg-dm-card/50 transition-colors group">
                                <td className="p-5 px-8">
                                    <div className="flex flex-col">
                                        <span className="font-black text-gray-900 dark:text-dm-text group-hover:text-primary transition-colors cursor-pointer" onClick={() => setViewingTask(task)}>{task.title}</span>
                                        <span className="text-[10px] font-bold text-gray-400 mt-0.5">{task.category}</span>
                                    </div>
                                </td>
                                <td className="p-5 text-center">
                                    <AdminTaskPriorityBadge priority={task.priority} size="xs" />
                                </td>
                                <td className="p-5 text-center">
                                    <AdminTaskStatusBadge status={task.status} size="xs" />
                                </td>
                                <td className="p-5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                                            {task.assignedTo.charAt(0)}
                                        </div>
                                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{task.assignedTo}</span>
                                    </div>
                                </td>
                                <td className="p-5">
                                    <span className="text-xs font-mono font-bold text-gray-500">{task.dueDate || '-'}</span>
                                </td>
                                <td className="p-5">
                                    <div className="flex justify-center gap-2">
                                        <button onClick={() => setViewingTask(task)} className="p-2 text-gray-400 hover:text-primary"><EyeIcon className="w-4 h-4" /></button>
                                        <button onClick={() => { setEditingTask(task); setIsFormModalOpen(true); }} className="p-2 text-gray-400 hover:text-amber-500"><PencilIcon className="w-4 h-4" /></button>
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
            { id: AdminTaskStatus.TODO, label: 'بانتظار البدء', color: 'bg-gray-100 border-gray-300' },
            { id: AdminTaskStatus.IN_PROGRESS, label: 'قيد التنفيذ', color: 'bg-blue-50 border-blue-200' },
            { id: AdminTaskStatus.BLOCKED, label: 'متوقفة/معلقة', color: 'bg-red-50 border-red-200' },
            { id: AdminTaskStatus.COMPLETED, label: 'تم الإنجاز', color: 'bg-green-50 border-green-200' },
        ];

        return (
            <div className="flex gap-6 overflow-x-auto pb-8 h-[calc(100vh-400px)] custom-scrollbar">
                {columns.map(col => (
                    <div key={col.id} className="flex-shrink-0 w-80 flex flex-col">
                        <div className={`p-4 rounded-t-2xl border-b-0 border-2 ${col.color} flex justify-between items-center`}>
                            <h3 className="font-black text-sm text-gray-700">{col.label}</h3>
                            <span className="bg-white px-2 py-0.5 rounded-lg text-[10px] font-bold shadow-sm">{filteredTasks.filter(t => t.status === col.id).length}</span>
                        </div>
                        <div className="flex-grow bg-gray-50/50 dark:bg-dm-card/30 rounded-b-2xl border-2 border-t-0 dark:border-gray-800 p-3 space-y-3 overflow-y-auto vertical-scrollbar">
                            {filteredTasks.filter(t => t.status === col.id).map(task => (
                                <Card key={task.id} className="p-4 cursor-pointer hover:shadow-lg transition-all border-none shadow-sm" onClick={() => setViewingTask(task)}>
                                    <div className="flex flex-col gap-2">
                                        <AdminTaskPriorityBadge priority={task.priority} size="xs" />
                                        <h4 className="text-sm font-bold leading-snug line-clamp-2">{task.title}</h4>
                                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-50 dark:border-gray-800">
                                            <div className="flex items-center gap-1.5 grayscale opacity-60">
                                                <UserCircleIcon className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-bold">{task.assignedTo.split(' ')[0]}</span>
                                            </div>
                                            <ProgressRing progress={task.progress || 0} size={24} strokeWidth={2} />
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-32">
            <PrintHeader title="إدارة المهام الإدارية والقانونية" subtitle="تقرير تفصيلي بإنتاجية ومهام فريق العمل" />
            
            {/* --- Premium Header --- */}
            <div className="relative overflow-hidden bg-primary-dark rounded-[2.5rem] p-10 text-white shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-light/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-400/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl" />
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-6 text-center md:text-right">
                        <div className="p-5 bg-white/10 backdrop-blur-xl rounded-3xl shadow-inner border border-white/20">
                            <ClipboardDocumentListIcon className="w-12 h-12 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter mb-2">إدارة المهام الإدارية</h1>
                            <p className="text-primary-light/80 text-sm font-medium">المركز اللوجستي المتطور لمتابعة كفاءة العمل القانوني</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Button 
                            variant="secondary" 
                            size="lg" 
                            className="rounded-2xl px-8 shadow-xl shadow-amber-900/40 transform hover:scale-105 transition-all"
                            onClick={() => { setEditingTask(null); setIsFormModalOpen(true); }}
                        >
                            <PlusCircleIcon className="w-6 h-6 me-2" />
                            إسناد مهمة جديدة
                        </Button>
                    </div>
                </div>
            </div>

            {/* --- Stats Cards --- */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <TaskStatMini label="إجمالي المهام" value={stats.total} icon={<Squares2X2Icon className="w-6 h-6" />} color="bg-blue-500" />
                <TaskStatMini label="قيد التنفيذ" value={stats.inProgress} icon={<ClockIcon className="w-6 h-6" />} color="bg-amber-500" />
                <TaskStatMini label="مهمة مكتملة" value={stats.completed} icon={<CheckCircleIcon className="w-6 h-6" />} color="bg-emerald-500" />
                <TaskStatMini label="أولوية قصوى" value={stats.critical} icon={<ExclamationTriangleIcon className="w-6 h-6" />} color="bg-rose-500" />
            </div>

            {/* --- Main Navigation Tabs --- */}
            <div className="flex items-center gap-1 bg-white dark:bg-dm-card p-1.5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 w-fit">
                {[
                    { id: 'current', label: 'المهام الجارية', icon: ListBulletIcon },
                    { id: 'analytics', label: 'إحصائيات الإنجاز', icon: ChartBarIcon },
                    { id: 'ai', label: 'المخطط الذكي (AI)', icon: SparklesIcon },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all duration-300 ${activeTab === tab.id ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
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
                        <div className="bg-white dark:bg-dm-card p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                                <div className="relative w-full md:max-w-md group">
                                    <MagnifyingGlassIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                    <input 
                                        type="text" 
                                        placeholder="بحث برقم المهمة، العنوان، أو اسم الموظف..."
                                        className="w-full pr-12 pl-4 py-3.5 bg-gray-50 dark:bg-dm-background border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-3 w-full md:w-auto">
                                    <div className="flex bg-gray-100 dark:bg-dm-background p-1.5 rounded-2xl shadow-inner gap-1">
                                        <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white shadow-md text-primary scale-105' : 'text-gray-400 hover:text-gray-600'}`} title="عرض البطاقات"><Squares2X2Icon className="w-5 h-5"/></button>
                                        <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white shadow-md text-primary scale-105' : 'text-gray-400 hover:text-gray-600'}`} title="عرض الجدول"><ListBulletIcon className="w-5 h-5"/></button>
                                        <button onClick={() => setViewMode('board')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'board' ? 'bg-white shadow-md text-primary scale-105' : 'text-gray-400 hover:text-gray-600'}`} title="عرض اللوحة"><ViewColumnsIcon className="w-5 h-5"/></button>
                                    </div>
                                    <div className="h-10 w-px bg-gray-100 dark:bg-gray-800 mx-1 hidden md:block" />
                                    <Select 
                                        options={[{ value: '', label: 'كافة الحالات' }, ...adminTaskStatusOptions]}
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value as any)}
                                        containerClassName="mb-0 w-full md:w-40"
                                        className="h-12 border-gray-200 rounded-2xl"
                                    />
                                    <Select 
                                        options={[{ value: '', label: 'كافة الأقسام' }, ...adminTaskCategoryOptions]}
                                        value={filterCategory}
                                        onChange={(e) => setFilterCategory(e.target.value as any)}
                                        containerClassName="mb-0 w-full md:w-40"
                                        className="h-12 border-gray-200 rounded-2xl"
                                    />
                                </div>
                            </div>

                            {filteredTasks.length > 0 ? (
                                viewMode === 'board' ? renderBoardView() : 
                                viewMode === 'list' ? renderListView() : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredTasks.map((task, i) => {
                                            const relatedCase = initialCases.find(c => c.id === task.relatedCaseId);
                                            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== AdminTaskStatus.COMPLETED;
                                            
                                            return (
                                                <motion.div 
                                                    key={task.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    className={`group relative bg-white dark:bg-dm-card rounded-3xl border-2 transition-all duration-300 p-6 shadow-sm hover:shadow-2xl border-gray-50 dark:border-gray-800 flex flex-col ${isOverdue ? 'border-rose-100 ring-4 ring-rose-50 shadow-rose-100' : 'hover:border-primary/20'}`}
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

                                                        <h3 className="text-lg font-black text-gray-900 dark:text-dm-text line-clamp-2 leading-tight group-hover:text-primary transition-colors cursor-pointer mb-5" onClick={() => setViewingTask(task)}>{task.title}</h3>
                                                        
                                                        <div className="space-y-3 mb-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
                                                                    <UserCircleIcon className="w-5 h-5 text-primary opacity-60" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">الموظف المسؤول</p>
                                                                    <p className="text-xs font-black text-gray-700 dark:text-gray-300">{task.assignedTo}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${isOverdue ? 'bg-rose-50 border-rose-100' : 'bg-gray-50 dark:bg-dm-background border-gray-100 dark:border-gray-800'}`}>
                                                                    <CalendarDaysIcon className={`w-5 h-5 ${isOverdue ? 'text-rose-500' : 'text-gray-400'}`} />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">تاريخ الاستحقاق</p>
                                                                    <p className={`text-xs font-black ${isOverdue ? 'text-rose-600' : 'text-gray-700 dark:text-gray-300'}`}>{task.dueDate || 'غير محدد'}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        {task.relatedCaseId && (
                                                            <div className="bg-primary/5 p-3 rounded-2xl border border-primary/10 flex items-center gap-2 group/case">
                                                                <FolderIcon className="w-4 h-4 text-primary" />
                                                                <span className="text-[10px] font-black text-primary-dark truncate">قضية: {relatedCase ? relatedCase.caseNumber : task.relatedCaseId}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="mt-8 pt-6 border-t border-gray-50 dark:border-gray-800 flex justify-end gap-2">
                                                        <button 
                                                            onClick={() => setViewingTask(task)} 
                                                            className="p-2.5 bg-gray-50 dark:bg-dm-background text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                                                            title="عرض التفاصيل"
                                                        >
                                                            <EyeIcon className="w-5 h-5" />
                                                        </button>
                                                        <button 
                                                            onClick={() => { setEditingTask(task); setIsFormModalOpen(true); }} 
                                                            className="p-2.5 bg-gray-50 dark:bg-dm-background text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                                                            title="تعديل"
                                                        >
                                                            <PencilIcon className="w-5 h-5" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteTask(task.id)} 
                                                            className="p-2.5 bg-gray-50 dark:bg-dm-background text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                            title="حذف"
                                                        >
                                                            <TrashIcon className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )
                            ) : (
                                <div className="text-center py-32 bg-gray-50 dark:bg-dm-background rounded-[2.5rem] border-3 border-dashed border-gray-200 dark:border-gray-800">
                                    <div className="bg-white dark:bg-dm-card w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-gray-200/50">
                                        <FunnelIcon className="w-12 h-12 text-gray-300" />
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-400 tracking-tighter">لا توجد مهام مطابقة</h3>
                                    <p className="text-sm text-gray-400 mt-2 font-medium">حاول تغيير معايير التصفية أو إسناد مهمة جديدة للفريق</p>
                                    <Button variant="ghost" className="mt-8 text-primary font-black" onClick={() => { setSearchTerm(''); setFilterStatus(''); setFilterPriority(''); }}>إعادة ضبط الفلاتر</Button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'analytics' && (
                    <motion.div 
                        key="analytics" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                    >
                        <Card className="p-8 rounded-[2.5rem] border-none shadow-xl">
                            <h3 className="text-lg font-black mb-8 flex items-center gap-3">
                                <div className="w-2 h-8 bg-blue-500 rounded-full" />
                                توزيع المهام حسب القسم
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

                        <Card className="p-8 rounded-[2.5rem] border-none shadow-xl">
                            <h3 className="text-lg font-black mb-8 flex items-center gap-3">
                                <div className="w-2 h-8 bg-amber-500 rounded-full" />
                                التقدم حسب الحالة الفنية
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

                        <Card className="p-8 rounded-[2.5rem] border-none shadow-xl lg:col-span-2">
                            <h3 className="text-lg font-black mb-8 flex items-center gap-3">
                                <div className="w-2 h-8 bg-primary rounded-full" />
                                مؤشرات الأولوية والإلحاح
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
                        className="space-y-6"
                    >
                        <Card className="p-10 rounded-[2.5rem] border-none shadow-2xl bg-gradient-to-br from-indigo-50/50 via-white to-white dark:from-dm-card dark:to-dm-card">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-4 bg-indigo-600 rounded-3xl shadow-lg shadow-indigo-600/20">
                                    <SparklesIcon className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-indigo-900 dark:text-indigo-400 tracking-tighter">المخطط الذكي المتقدم</h3>
                                    <p className="text-sm text-indigo-700/60 font-medium">حوّل المهام المعقدة إلى خطوات تنفيذية مدروسة بالذكاء الاصطناعي</p>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4 mb-10">
                                <TextArea 
                                    placeholder="أدخل عنوان أو وصف المهمة المعقدة هنا (مثال: تنظيم أرشيف مكتبنا القانوني القديم، أو التحضير لسلسلة تعيينات جديدة)..."
                                    value={aiQuery}
                                    onChange={(e) => setAiQuery(e.target.value)}
                                    containerClassName="flex-grow"
                                    rows={3}
                                    className="p-5 text-base border-2 border-indigo-100 focus:border-indigo-400 rounded-3xl bg-white/50 backdrop-blur-sm"
                                />
                                <Button 
                                    className="h-auto px-10 rounded-3xl text-lg font-black bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/30 w-full md:w-auto"
                                    onClick={handlePlanWithAI}
                                    isLoading={aiLoading}
                                >
                                    توليد الخطة
                                </Button>
                            </div>

                            {aiResponse && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 bg-indigo-50/30 dark:bg-dm-background rounded-3xl border border-indigo-100 dark:border-indigo-900/30">
                                    <div className="flex justify-between items-center mb-6">
                                        <span className="flex items-center gap-2 text-indigo-900 dark:text-indigo-400 font-black text-sm uppercase tracking-widest">
                                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-ping" />
                                            الخطة المقترحة
                                        </span>
                                        <Button variant="ghost" size="sm" onClick={() => setAiResponse(null)} className="text-gray-400 hover:text-rose-500">مسح النتائج</Button>
                                    </div>
                                    <div className="markdown-body text-indigo-950 dark:text-gray-300 leading-relaxed max-w-none">
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
            <Modal isOpen={!!viewingTask} onClose={() => setViewingTask(null)} title={`مراجعة المهمة: ${viewingTask?.id}`} size="lg">
                {viewingTask && (
                    <div className="space-y-6">
                        <div className="bg-gray-50 dark:bg-dm-background p-6 rounded-3xl border dark:border-gray-800">
                            <h2 className="text-2xl font-black mb-4 leading-tight">{viewingTask.title}</h2>
                            <div className="flex flex-wrap gap-2">
                                <AdminTaskStatusBadge status={viewingTask.status} />
                                <AdminTaskPriorityBadge priority={viewingTask.priority} />
                                <span className="px-3 py-1 bg-white dark:bg-dm-card rounded-xl text-xs font-bold border dark:border-gray-800">{viewingTask.category}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-5 bg-white dark:bg-dm-card border dark:border-gray-800 rounded-2xl flex items-center gap-4">
                                <div className="p-3 bg-primary/5 rounded-xl"><UserCircleIcon className="w-6 h-6 text-primary" /></div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">الموظف القائم بالتنفيذ</p>
                                    <p className="text-sm font-black">{viewingTask.assignedTo}</p>
                                </div>
                            </div>
                            <div className="p-5 bg-white dark:bg-dm-card border dark:border-gray-800 rounded-2xl flex items-center gap-4">
                                <div className="p-3 bg-amber-50 rounded-xl"><ClockIcon className="w-6 h-6 text-amber-500" /></div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">المعد المستهدف للإنجاز</p>
                                    <p className="text-sm font-black">{viewingTask.dueDate || 'غير محدد'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                                التفاصيل والوصف
                            </h4>
                            <div className="p-5 bg-gray-50 dark:bg-dm-background rounded-3xl border dark:border-gray-800 text-sm leading-8 min-h-[100px]">
                                {viewingTask.description || 'لا يوجد وصف تفصيلي لهذه المهمة.'}
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-6 bg-primary/5 rounded-[2rem] border border-primary/10">
                            <div className="flex items-center gap-4">
                                <ProgressRing progress={viewingTask.progress || 0} size={54} strokeWidth={5} />
                                <div>
                                    <h4 className="text-sm font-black text-primary-dark">مؤشر الإنجاز الحالي</h4>
                                    <p className="text-[10px] text-primary/60 font-bold uppercase tracking-tighter">جاري تحديث التقدم دورياً</p>
                                </div>
                            </div>
                            {viewingTask.assignerSignature && (
                                <div className="text-center">
                                    <img src={viewingTask.assignerSignature} alt="Manager Signature" className="h-12 mx-auto grayscale hover:grayscale-0 transition-all opacity-60" />
                                    <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">المسؤول المعتمد</p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t dark:border-gray-800">
                            <Button variant="outline" className="rounded-xl px-8" onClick={() => setViewingTask(null)}>إغلاق</Button>
                            <Button className="rounded-xl px-8" onClick={() => { setEditingTask(viewingTask); setIsFormModalOpen(true); setViewingTask(null); }}>تحديث الحالة</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default TaskManagementPage;
