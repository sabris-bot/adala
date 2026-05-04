
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import { 
    ClipboardDocumentListIcon, PlusCircleIcon, EyeIcon, PencilIcon, TrashIcon, 
    FolderIcon, ClockIcon, ListBulletIcon, ViewColumnsIcon, ChartBarIcon, CheckCircleIcon,
    PrinterIcon
} from '../constants';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import { AdminTask, AdminTaskStatus, AdminTaskPriority, AdminTaskCategory } from '../types';
import { adminTaskStatusOptions, adminTaskPriorityOptions, adminTaskCategoryOptions } from '../constants';
import { AdminTaskStatusBadge, AdminTaskPriorityBadge } from '../components/ui/Badge';
import { initialCases } from '../data/caseData';

const mockAssignees = ['أحمد محمود المحمد الصباح', 'فاطمة علي حسين', 'عمر خالد', 'ليلى منصور الهاجري', 'فريق العمل القانوني', 'ناصر عبدالله القحطاني'];

const initialMockTasks: AdminTask[] = [
  { 
    id: 'task-001', 
    title: 'مراجعة شاملة لعقد توريد مع شركة الأمل (قضية CML-2024-101)', 
    description: 'التأكد من مطابقة جميع بنود العقد لسياسات الشركة والقوانين المعمول بها، ورفع تقرير بالملاحظات قبل جلسة المحكمة الكلية (مجمع محاكم الرقعي) - الدائرة التجارية الخامسة.',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
    assignedTo: 'أحمد محمود المحمد الصباح', 
    status: AdminTaskStatus.IN_PROGRESS, 
    priority: AdminTaskPriority.HIGH, 
    category: AdminTaskCategory.LEGAL_ADMIN,
    progress: 45,
    relatedCaseId: '1',
    createdAt: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
  },
  { 
    id: 'task-002', 
    title: 'تحضير مذكرة دفاع أولية لقضية النزاع العمالي (LAB-2024-055)', 
    description: 'جمع المستندات وصياغة المسودة الأولى لمذكرة الدفاع في القضية رقم LAB-2024-055 المنظورة أمام المحكمة الكلية (مجمع محاكم حولي) - الدائرة العمالية الأولى.',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split('T')[0],
    assignedTo: 'فاطمة علي حسين', 
    status: AdminTaskStatus.TODO, 
    priority: AdminTaskPriority.MEDIUM, 
    category: AdminTaskCategory.LEGAL_ADMIN,
    progress: 0,
    relatedCaseId: '2',
    createdAt: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0],
  },
  { 
    id: 'task-003', 
    title: 'متابعة تنفيذ الحكم الصادر في استئناف قضية الإخلاء (RE-APP-2024-088)', 
    description: 'التنسيق مع إدارة التنفيذ بوزارة العدل (بمجمع محاكم الرقعي) لمتابعة إجراءات تنفيذ الحكم الصادر من محكمة الاستئناف - الدائرة الإيجارية الثانية.',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split('T')[0],
    assignedTo: 'عمر خالد', 
    status: AdminTaskStatus.IN_PROGRESS, 
    priority: AdminTaskPriority.HIGH, 
    category: AdminTaskCategory.SECRETARIAL,
    progress: 20,
    relatedCaseId: '3',
    createdAt: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString().split('T')[0],
  },
  { 
    id: 'task-004', 
    title: 'أرشفة مستندات قضية جنحة شيك بدون رصيد (CRIM-2024-789)', 
    description: 'أرشفة جميع المستندات والمراسلات المتعلقة بالقضية رقم CRIM-2024-789 بعد صدور الحكم النهائي من محكمة الجنح (مجمع محاكم الفروانية).',
    dueDate: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString().split('T')[0],
    assignedTo: 'ليلى منصور الهاجري', 
    status: AdminTaskStatus.COMPLETED, 
    priority: AdminTaskPriority.LOW, 
    category: AdminTaskCategory.SECRETARIAL,
    progress: 100,
    relatedCaseId: 'CRIM-2024-789',
    createdAt: new Date(new Date().setDate(new Date().getDate() - 20)).toISOString().split('T')[0],
    completedAt: new Date(new Date().setDate(new Date().getDate() - 8)).toISOString().split('T')[0],
  },
  {
    id: 'task-006',
    title: 'التنسيق لاجتماع مع الخبراء في قضية البيئة (ENV-012)',
    description: 'تحديد موعد مناسب وتنظيم اجتماع مع الخبراء الفنيين لمناقشة تقريرهم في القضية البيئية المنظورة أمام المحكمة الإدارية (بمجمع محاكم العاصمة).',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split('T')[0],
    assignedTo: 'أحمد محمود المحمد الصباح',
    status: AdminTaskStatus.IN_PROGRESS,
    priority: AdminTaskPriority.CRITICAL,
    category: AdminTaskCategory.LEGAL_ADMIN,
    progress: 60,
    relatedCaseId: 'ENV-012', 
    createdAt: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
  },
  {
    id: 'task-008',
    title: 'تقديم طلب تجديد رخصة المحاماة للمحامي/ عمر خالد',
    description: 'تجهيز وتقديم المستندات اللازمة لتجديد رخصة المحاماة السنوية للمحامي عمر خالد لدى جمعية المحامين الكويتية (بمقرها في بنيد القار).',
    dueDate: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString().split('T')[0],
    assignedTo: 'عمر خالد',
    status: AdminTaskStatus.BLOCKED,
    priority: AdminTaskPriority.HIGH,
    category: AdminTaskCategory.HR,
    progress: 25,
    projectOrModule: 'الشؤون الإدارية للمكتب (جمعية المحامين)',
    createdAt: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    notes: 'معلقة بسبب انتظار شهادة حسن سير وسلوك من وزارة الداخلية. تم التواصل مع الوزارة.',
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString().split('T')[0],
  },
  {
      id: 'task-010',
      title: 'إصدار الفواتير الشهرية لعملاء عقود الاستشارات',
      description: 'تجهيز وإرسال فواتير الخدمات القانونية لجميع كبار العملاء المرتبطين بعقود استشارات سنوية ومتابعة التحصيل.',
      dueDate: new Date().toISOString().split('T')[0],
      assignedTo: 'أحمد محمود المحمد الصباح',
      status: AdminTaskStatus.IN_PROGRESS,
      priority: AdminTaskPriority.HIGH,
      category: AdminTaskCategory.FINANCE,
      progress: 30,
      recurring: true,
      recurrenceInterval: 'monthly',
      createdAt: new Date().toISOString().split('T')[0],
  }
];

// --- Local Components ---

const TaskStatCard: React.FC<{ title: string; count: number; colorClass: string; icon: React.ReactNode }> = ({ title, count, colorClass, icon }) => (
    <div className={`p-4 rounded-lg border-s-4 ${colorClass} bg-white dark:bg-dm-card shadow-sm flex items-center justify-between`}>
        <div>
            <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase">{title}</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-dm-text mt-1">{count}</p>
        </div>
        <div className={`p-2 rounded-full bg-opacity-20 dark:bg-opacity-10 ${colorClass.replace('border-', 'bg-').replace('-500', '-100')} ${colorClass.replace('border-', 'text-').replace('-500', '-600')}`}>
            {icon}
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
  const [formData, setFormData] = useState<Partial<AdminTask>>(
    initialData || {
      title: '',
      status: AdminTaskStatus.TODO,
      priority: AdminTaskPriority.MEDIUM,
      category: AdminTaskCategory.OTHER,
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
          createdAt: new Date().toISOString().split('T')[0],
        }
      );
    }
  }, [isOpen, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.assignedTo) {
      alert("يرجى إدخال عنوان المهمة والشخص المسؤول.");
      return;
    }
    onSubmit({
      ...formData,
      id: formData.id || `task-${Date.now()}`,
      updatedAt: new Date().toISOString().split('T')[0],
    } as AdminTask);
  };
  
  const assigneeOptions = mockAssignees.map(assignee => ({value: assignee, label: assignee}));
  
  const caseOptions = [
      { value: '', label: 'غير مرتبطة بقضية' },
      ...initialCases.map(c => ({ value: c.id, label: `${c.caseNumber} - ${c.title}` }))
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData?.id ? "تعديل المهمة" : "إضافة مهمة جديدة"} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input name="title" label="عنوان المهمة" value={formData.title || ''} onChange={handleChange} required />
        <TextArea name="description" label="وصف المهمة (اختياري)" value={formData.description || ''} onChange={handleChange} rows={3} placeholder="أضف تفاصيل حول المهمة..."/>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select name="assignedTo" label="الشخص المسؤول" value={formData.assignedTo || ''} options={assigneeOptions} onChange={handleChange} required placeholder="اختر المسؤول"/>
          <Input name="dueDate" label="تاريخ الاستحقاق (اختياري)" type="date" value={formData.dueDate || ''} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select name="status" label="الحالة" value={formData.status} options={adminTaskStatusOptions} onChange={handleChange} required />
          <Select name="priority" label="الأولوية" value={formData.priority} options={adminTaskPriorityOptions} onChange={handleChange} required />
          <Select name="category" label="التصنيف" value={formData.category} options={adminTaskCategoryOptions} onChange={handleChange} required />
        </div>
        
        <Select 
            name="relatedCaseId" 
            label="القضية المرتبطة (اختياري)" 
            value={formData.relatedCaseId || ''} 
            options={caseOptions} 
            onChange={handleChange} 
        />
        
        <Input name="projectOrModule" label="المشروع/الوحدة المرتبطة (اختياري)" value={formData.projectOrModule || ''} onChange={handleChange} placeholder="مثال: تطوير الموقع الإلكتروني"/>
        <TextArea name="notes" label="ملاحظات إضافية (اختياري)" value={formData.notes || ''} onChange={handleChange} rows={2} />
        <div className="flex justify-end space-x-3 space-x-reverse pt-3">
          <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
          <Button type="submit">{initialData?.id ? "حفظ التعديلات" : "إضافة المهمة"}</Button>
        </div>
      </form>
    </Modal>
  );
};

interface ViewTaskModalProps {
  task: AdminTask | null;
  onClose: () => void;
  onEdit: (task: AdminTask) => void;
}
const ViewTaskModal: React.FC<ViewTaskModalProps> = ({ task, onClose, onEdit }) => {
  if (!task) return null;

  const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'غير محدد';
  
  const relatedCase = initialCases.find(c => c.id === task.relatedCaseId);
  const displayCase = relatedCase ? `${relatedCase.caseNumber} - ${relatedCase.title}` : task.relatedCaseId;

  return (
    <Modal isOpen={!!task} onClose={onClose} title={`تفاصيل المهمة: ${task.title}`} size="lg">
      <div className="space-y-4 text-sm">
        <div>
            <span className="block text-gray-500 mb-1 font-bold">الوصف:</span>
            <pre className="whitespace-pre-wrap font-sans bg-gray-50 dark:bg-dm-background p-3 rounded-lg border dark:border-gray-700 leading-relaxed">{task.description || 'لا يوجد وصف'}</pre>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <p><strong>الشخص المسؤول:</strong> {task.assignedTo}</p>
            <p><strong>تاريخ الاستحقاق:</strong> {task.dueDate ? formatDate(task.dueDate) : 'غير محدد'}</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
            <p><strong>الحالة:</strong> <AdminTaskStatusBadge status={task.status} size="sm" /></p>
            <p><strong>الأولوية:</strong> <AdminTaskPriorityBadge priority={task.priority} size="sm" /></p>
            <p><strong>التصنيف:</strong> <span className="px-2 py-1 bg-gray-100 rounded text-xs">{task.category}</span></p>
        </div>
        {task.relatedCaseId && <p><strong>مرتبطة بالقضية:</strong> <Link to={`/cases`} className="text-primary hover:underline font-medium">{displayCase}</Link></p>}
        {task.projectOrModule && <p><strong>المشروع/الوحدة:</strong> {task.projectOrModule}</p>}
        {task.notes && (
            <div>
                <span className="block text-gray-500 mb-1 font-bold">ملاحظات:</span>
                <pre className="whitespace-pre-wrap font-sans bg-gray-50 dark:bg-dm-background p-2 rounded border dark:border-gray-700">{task.notes}</pre>
            </div>
        )}
        <hr className="my-2 dark:border-gray-700" />
        <div className="flex justify-between text-[11px] text-gray-400">
            <span>تاريخ الإنشاء: {formatDate(task.createdAt)}</span>
            {task.updatedAt && <span>آخر تحديث: {formatDate(task.updatedAt)}</span>}
        </div>
      </div>
      <div className="mt-6 flex justify-end space-x-2 space-x-reverse">
        <Button variant="outline" onClick={() => { onClose(); onEdit(task); }}>تعديل المهمة</Button>
        <Button variant="primary" onClick={onClose}>إغلاق</Button>
      </div>
    </Modal>
  );
};


const PrintableTaskListModal: React.FC<{ tasks: AdminTask[]; isOpen: boolean; onClose: () => void }> = ({ tasks, isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="معاينة طباعة قائمة المهام" size="xl">
            <div className="p-8 bg-white text-black min-h-[70vh] font-sans" dir="rtl">
                <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">تقرير قائمة المهام الإدارية والقانونية</h1>
                        <p className="text-sm text-gray-600">تاريخ التقرير: {new Date().toLocaleDateString('ar-EG')}</p>
                    </div>
                </div>

                <table className="w-full border-collapse border border-black text-[12px]">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-black px-2 py-2 text-right">المهمة</th>
                            <th className="border border-black px-2 py-2 text-right">المسؤول</th>
                            <th className="border border-black px-2 py-2 text-center">الاستحقاق</th>
                            <th className="border border-black px-2 py-2 text-center">الحالة</th>
                            <th className="border border-black px-2 py-2 text-center">الأولوية</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map(task => (
                            <tr key={task.id}>
                                <td className="border border-black px-2 py-2">
                                    <p className="font-bold">{task.title}</p>
                                    <p className="text-[10px] text-gray-700 line-clamp-1">{task.description}</p>
                                </td>
                                <td className="border border-black px-2 py-2">{task.assignedTo}</td>
                                <td className="border border-black px-2 py-2 text-center">{task.dueDate || '-'}</td>
                                <td className="border border-black px-2 py-2 text-center">{task.status}</td>
                                <td className="border border-black px-2 py-2 text-center font-bold">{task.priority}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-end p-4 border-t gap-2 no-print bg-gray-50">
                <Button variant="outline" onClick={onClose}>إلغاء</Button>
                <Button variant="primary" onClick={() => window.print()} leftIcon={<PrinterIcon className="w-4 h-4"/>}>طباعة</Button>
            </div>
        </Modal>
    );
};

const TaskManagementPage: React.FC = () => {
  const [tasks, setTasks] = React.useState<AdminTask[]>(initialMockTasks);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState<AdminTaskStatus | ''>('');
  const [filterPriority, setFilterPriority] = React.useState<AdminTaskPriority | ''>('');
  const [filterCategory, setFilterCategory] = React.useState<AdminTaskCategory | ''>('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Partial<AdminTask> | null>(null);
  const [viewingTask, setViewingTask] = useState<AdminTask | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');

  const filteredTasks = useMemo(() => {
    return tasks.filter(task =>
      (task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
       (task.assignedTo && task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())) ||
       (task.relatedCaseId && task.relatedCaseId.toLowerCase().includes(searchTerm.toLowerCase()))
      ) &&
      (filterStatus ? task.status === filterStatus : true) &&
      (filterPriority ? task.priority === filterPriority : true) &&
      (filterCategory ? task.category === filterCategory : true)
    ).sort((a, b) => (a.dueDate && b.dueDate) ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime() : (a.dueDate ? -1 : 1));
  }, [tasks, searchTerm, filterStatus, filterPriority, filterCategory]);

  const stats = useMemo(() => {
      const total = tasks.length;
      const completed = tasks.filter(t => t.status === AdminTaskStatus.COMPLETED).length;
      const inProgress = tasks.filter(t => t.status === AdminTaskStatus.IN_PROGRESS).length;
      const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== AdminTaskStatus.COMPLETED).length;
      return { total, completed, inProgress, overdue };
  }, [tasks]);

  const handleAddTask = () => {
    setEditingTask(null);
    setIsFormModalOpen(true);
  };

  const handleEditTask = (task: AdminTask) => {
    setEditingTask(task);
    setIsFormModalOpen(true);
  };

  const handleViewTask = (task: AdminTask) => {
    setViewingTask(task);
  };

  const handleDeleteTask = useCallback((taskId: string) => {
    if (window.confirm("هل أنت متأكد أنك تريد حذف هذه المهمة؟")) {
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    }
  }, []);

  const handleFormSubmit = (data: AdminTask) => {
    if (editingTask && editingTask.id) {
      setTasks(prevTasks => prevTasks.map(task => task.id === editingTask.id ? data : task));
    } else {
      setTasks(prevTasks => [data, ...prevTasks]);
    }
    setIsFormModalOpen(false);
    setEditingTask(null);
  };
  
  const formatDateForDisplay = (dateString?: string) => {
    if (!dateString) return <span className="text-gray-400">غير محدد</span>;
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0,0,0,0);
    date.setHours(0,0,0,0);

    let dateColor = "text-gray-600 dark:text-gray-400";
    if (date < today) dateColor = "text-danger font-bold";
    else if (date.getTime() === today.getTime()) dateColor = "text-orange-600 font-bold";

    return <span className={dateColor}>{date.toLocaleDateString('ar-EG')}</span>;
  };

  const getPriorityBorderColorClass = (priority: AdminTaskPriority): string => {
    switch (priority) {
      case AdminTaskPriority.CRITICAL: return 'border-t-danger';
      case AdminTaskPriority.HIGH: return 'border-t-warning';
      case AdminTaskPriority.MEDIUM: return 'border-t-info';
      case AdminTaskPriority.LOW: return 'border-t-success';
      default: return 'border-t-gray-300';
    }
  };

  const renderBoardView = () => {
    const columns = [
        { title: 'المهام الجديدة', status: AdminTaskStatus.TODO, color: 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10' },
        { title: 'قيد التنفيذ', status: AdminTaskStatus.IN_PROGRESS, color: 'border-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10' },
        { title: 'متوقفة', status: AdminTaskStatus.BLOCKED, color: 'border-red-500 bg-red-50/50 dark:bg-red-900/10' },
        { title: 'مكتملة', status: AdminTaskStatus.COMPLETED, color: 'border-green-500 bg-green-50/50 dark:bg-green-900/10' },
    ];

    return (
        <div className="flex overflow-x-auto gap-4 pb-4 h-[calc(100vh-350px)] no-scrollbar">
            {columns.map(col => (
                <div key={col.status} className={`flex-shrink-0 w-80 rounded-xl border-t-4 ${col.color} flex flex-col shadow-sm`}>
                    <div className="p-4 font-bold text-gray-700 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <span>{col.title}</span>
                        <span className="bg-white dark:bg-dm-card px-2 py-0.5 rounded-full text-xs border border-gray-200 dark:border-gray-700">{filteredTasks.filter(t => t.status === col.status).length}</span>
                    </div>
                    <div className="p-3 overflow-y-auto flex-1 space-y-3 vertical-scrollbar">
                        {filteredTasks.filter(t => t.status === col.status).map(task => {
                            const relatedCase = initialCases.find(c => c.id === task.relatedCaseId);
                            const caseDisplay = relatedCase ? relatedCase.caseNumber : task.relatedCaseId;
                            
                            return (
                            <div key={task.id} className={`bg-white dark:bg-dm-card p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer border-s-4 ${getPriorityBorderColorClass(task.priority).replace('border-t-', 'border-l-')}`} onClick={() => handleViewTask(task)}>
                                <h4 className="text-sm font-bold text-gray-900 dark:text-dm-text mb-2 line-clamp-2 leading-snug">{task.title}</h4>
                                <div className="flex flex-wrap gap-1 mb-2">
                                     <AdminTaskPriorityBadge priority={task.priority} size="xs" />
                                     <span className="px-1.5 py-0.5 bg-gray-50 dark:bg-dm-background text-[10px] text-gray-500 rounded border border-gray-100 dark:border-gray-800">{task.category}</span>
                                </div>
                                {task.relatedCaseId && (
                                    <div className="mb-2 text-[10px] text-primary bg-primary/5 px-2 py-1 rounded truncate border border-primary/10">
                                        قضية: {caseDisplay}
                                    </div>
                                )}
                                <div className="flex justify-between items-center text-[10px] text-gray-500 mt-2 border-t dark:border-gray-700 pt-2">
                                    <span className="font-bold flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                        {task.assignedTo.split(' ')[0]}
                                    </span>
                                    <span className="flex items-center gap-1"><ClockIcon className="w-3 h-3"/> {task.dueDate ? formatDateForDisplay(task.dueDate) : '-'}</span>
                                </div>
                            </div>
                        )})}
                    </div>
                </div>
            ))}
        </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <div className="flex items-center gap-3">
                <ClipboardDocumentListIcon className="w-10 h-10 text-primary" />
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">إدارة المهام الإدارية</h1>
            </div>
            <p className="text-sm text-gray-500 mt-1">تنظيم ومتابعة كافة المهام اللوجستية والإدارية للمكتب وفريق العمل</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsPrintModalOpen(true)} leftIcon={<PrinterIcon className="w-5 h-5"/>} className="hidden md:flex">تقرير المهام</Button>
            <div className="bg-gray-100 dark:bg-dm-card rounded-xl p-1 flex items-center shadow-inner">
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow text-primary scale-110' : 'text-gray-400 hover:text-gray-600'}`} title="عرض القائمة"><ListBulletIcon className="w-5 h-5"/></button>
                <button onClick={() => setViewMode('board')} className={`p-2 rounded-lg transition-all ${viewMode === 'board' ? 'bg-white shadow text-primary scale-110' : 'text-gray-400 hover:text-gray-600'}`} title="عرض اللوحة"><ViewColumnsIcon className="w-5 h-5"/></button>
            </div>
            <Button onClick={handleAddTask} leftIcon={<PlusCircleIcon className="w-5 h-5" />} className="shadow-lg shadow-primary/20">إضافة مهمة</Button>
        </div>
      </div>
      
      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <TaskStatCard title="المهام الكلية" count={stats.total} colorClass="border-blue-500" icon={<ChartBarIcon className="w-6 h-6"/>} />
          <TaskStatCard title="قيد الإنجاز" count={stats.inProgress} colorClass="border-yellow-500" icon={<ClockIcon className="w-6 h-6"/>} />
          <TaskStatCard title="مهام مكتملة" count={stats.completed} colorClass="border-green-500" icon={<CheckCircleIcon className="w-6 h-6"/>} />
          <TaskStatCard title="مهام متأخرة" count={stats.overdue} colorClass="border-red-500" icon={<ClockIcon className="w-6 h-6"/>} />
      </div>

      <Card className="border-none shadow-xl shadow-gray-200/50">
        {/* Advanced Filters Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-gray-50 dark:bg-dm-card/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
            <div className="md:col-span-2">
                <Input
                    placeholder="بحث سريع بالعنوان أو المسؤول..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    containerClassName="mb-0"
                    className="h-12 text-sm"
                />
            </div>
            <Select
                options={[{ value: '', label: 'كل الحالات' }, ...adminTaskStatusOptions]}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as AdminTaskStatus | '')}
                containerClassName="mb-0"
            />
            <Select
                options={[{ value: '', label: 'كل التصنيفات' }, ...adminTaskCategoryOptions]}
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as AdminTaskCategory | '')}
                containerClassName="mb-0"
            />
        </div>

        {filteredTasks.length > 0 ? (
          viewMode === 'board' ? renderBoardView() : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTasks.map(task => {
                    const relatedCase = initialCases.find(c => c.id === task.relatedCaseId);
                    const caseDisplay = relatedCase ? relatedCase.caseNumber : task.relatedCaseId;

                    return (
                    <div key={task.id} className={`group relative bg-white dark:bg-dm-card rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col border-t-4 ${getPriorityBorderColorClass(task.priority)}`}>
                        <div className="p-6 flex-grow">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-md font-black text-gray-900 dark:text-dm-text line-clamp-2 leading-snug group-hover:text-primary transition-colors cursor-pointer" onClick={() => handleViewTask(task)} title={task.title}>{task.title}</h3>
                                <AdminTaskStatusBadge status={task.status} size="xs"/>
                            </div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full uppercase tracking-wider">{task.category}</div>
                                <AdminTaskPriorityBadge priority={task.priority} size="xs" />
                            </div>
                            
                            <p className="text-xs text-gray-500 mb-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                المسؤول: <span className="font-bold text-gray-700">{task.assignedTo}</span>
                            </p>
                            <p className="text-xs text-gray-500 mb-4 flex items-center gap-2">
                                <ClockIcon className="w-3.5 h-3.5 text-gray-400"/>
                                الاستحقاق: {formatDateForDisplay(task.dueDate)}
                            </p>
                            
                            {task.relatedCaseId && (
                                <div className="text-[11px] text-primary-dark font-bold bg-primary/5 p-2 rounded-xl border border-primary/10 flex items-center gap-2">
                                    <FolderIcon className="w-3.5 h-3.5"/>
                                    قضية: {caseDisplay}
                                </div>
                            )}
                        </div>
                        <div className="px-6 py-4 border-t border-gray-50 dark:border-gray-700 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" onClick={() => handleViewTask(task)} className="text-gray-400 hover:text-primary"><EyeIcon className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEditTask(task)} className="text-gray-400 hover:text-yellow-600"><PencilIcon className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteTask(task.id)} className="text-gray-400 hover:text-danger"><TrashIcon className="w-4 h-4" /></Button>
                        </div>
                    </div>
                )})}
            </div>
          )
        ) : (
            <div className="text-center py-24 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                <FolderIcon className="w-20 h-20 mx-auto text-gray-200 mb-4"/>
                <p className="text-lg font-bold text-gray-400 tracking-tight">لا توجد مهام مطابقة للمواصفات</p>
                <p className="text-xs text-gray-400">حاول تغيير معايير التصفية أو إضافة مهمة جديدة</p>
            </div>
        )}
      </Card>

      <TaskFormModal isOpen={isFormModalOpen} onClose={() => { setIsFormModalOpen(false); setEditingTask(null); }} onSubmit={handleFormSubmit} initialData={editingTask} />
      <ViewTaskModal task={viewingTask} onClose={() => setViewingTask(null)} onEdit={(taskToEdit) => { setViewingTask(null); handleEditTask(taskToEdit);}}/>
      <PrintableTaskListModal tasks={filteredTasks} isOpen={isPrintModalOpen} onClose={() => setIsPrintModalOpen(false)} />
    </div>
  );
};

export default initialMockTasks;
export { TaskManagementPage };
