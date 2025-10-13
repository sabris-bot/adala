
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import { ClipboardDocumentListIcon, PlusCircleIcon, EyeIcon, PencilIcon, TrashIcon, FolderIcon, ClockIcon } from '../constants';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import { AdminTask, AdminTaskStatus, AdminTaskPriority } from '../types';
import { adminTaskStatusOptions, adminTaskPriorityOptions } from '../constants';
import { AdminTaskStatusBadge, AdminTaskPriorityBadge } from '../components/ui/Badge';

const mockAssignees = ['أحمد محمود المحمد الصباح', 'فاطمة علي حسين', 'عمر خالد', 'ليلى منصور الهاجري', 'فريق العمل القانوني', 'ناصر عبدالله القحطاني'];

const initialMockTasks: AdminTask[] = [
  { 
    id: 'task-001', 
    title: 'مراجعة شاملة لعقد توريد مع شركة الأمل (قضية CML-2024-101)', 
    description: 'التأكد من مطابقة جميع بنود العقد لسياسات الشركة والقوانين المعمول بها، ورفع تقرير بالملاحظات قبل جلسة المحكمة الكلية (مجمع محاكم الرقعي) - الدائرة التجارية الخامسة.',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0], // Due in 7 days
    assignedTo: 'أحمد محمود المحمد الصباح', 
    status: AdminTaskStatus.IN_PROGRESS, 
    priority: AdminTaskPriority.HIGH, 
    relatedCaseId: 'CML-2024-101',
    createdAt: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString().split('T')[0], // Created 3 days ago
    updatedAt: new Date().toISOString().split('T')[0],
  },
  { 
    id: 'task-002', 
    title: 'تحضير مذكرة دفاع أولية لقضية النزاع العمالي (LAB-2024-055)', 
    description: 'جمع المستندات وصياغة المسودة الأولى لمذكرة الدفاع في القضية رقم LAB-2024-055 المنظورة أمام المحكمة الكلية (مجمع محاكم حولي) - الدائرة العمالية الأولى.',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split('T')[0], // Due in 14 days
    assignedTo: 'فاطمة علي حسين', 
    status: AdminTaskStatus.TODO, 
    priority: AdminTaskPriority.MEDIUM, 
    relatedCaseId: 'LAB-2024-055',
    createdAt: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0],
  },
  { 
    id: 'task-003', 
    title: 'متابعة تنفيذ الحكم الصادر في استئناف قضية الإخلاء (RE-APP-2024-088)', 
    description: 'التنسيق مع إدارة التنفيذ بوزارة العدل (بمجمع محاكم الرقعي) لمتابعة إجراءات تنفيذ الحكم الصادر من محكمة الاستئناف - الدائرة الإيجارية الثانية.',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().split('T')[0],
    assignedTo: 'عمر خالد', 
    status: AdminTaskStatus.IN_PROGRESS, 
    priority: AdminTaskPriority.HIGH, 
    relatedCaseId: 'RE-APP-2024-088',
    createdAt: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString().split('T')[0],
  },
  { 
    id: 'task-004', 
    title: 'أرشفة مستندات قضية جنحة شيك بدون رصيد (CRIM-2024-789)', 
    description: 'أرشفة جميع المستندات والمراسلات المتعلقة بالقضية رقم CRIM-2024-789 بعد صدور الحكم النهائي من محكمة الجنح (مجمع محاكم الفروانية).',
    dueDate: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString().split('T')[0], // Past due, but completed
    assignedTo: 'ليلى منصور الهاجري', 
    status: AdminTaskStatus.COMPLETED, 
    priority: AdminTaskPriority.LOW, 
    relatedCaseId: 'CRIM-2024-789',
    createdAt: new Date(new Date().setDate(new Date().getDate() - 20)).toISOString().split('T')[0],
    completedAt: new Date(new Date().setDate(new Date().getDate() - 8)).toISOString().split('T')[0],
  },
  { 
    id: 'task-005', 
    title: 'بحث قانوني حول تعديلات قانون الشركات الجديد وتأثيرها على القضايا التجارية', 
    description: 'إعداد ملخص بأهم التعديلات التي طرأت على قانون الشركات وتأثيرها على عملاء المكتب، مع التركيز على القضايا المنظورة أمام المحاكم التجارية بدرجاتها المختلفة (كلية، استئناف، تمييز).',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
    assignedTo: 'فريق العمل القانوني', 
    status: AdminTaskStatus.TODO, 
    priority: AdminTaskPriority.MEDIUM, 
    createdAt: new Date().toISOString().split('T')[0],
  },
  {
    id: 'task-006',
    title: 'التنسيق لاجتماع مع الخبراء في قضية البيئة (ENV-012)',
    description: 'تحديد موعد مناسب وتنظيم اجتماع مع الخبراء الفنيين لمناقشة تقريرهم في القضية البيئية المنظورة أمام المحكمة الإدارية (بمجمع محاكم العاصمة).',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split('T')[0],
    assignedTo: 'أحمد محمود المحمد الصباح',
    status: AdminTaskStatus.IN_PROGRESS,
    priority: AdminTaskPriority.CRITICAL,
    relatedCaseId: 'ENV-012', 
    createdAt: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
  },
  {
    id: 'task-007',
    title: 'مراجعة سياسات الخصوصية الداخلية للموقع الإلكتروني للمكتب',
    description: 'تحديث سياسات الخصوصية على موقع المكتب لتتوافق مع أحدث التشريعات المتعلقة بحماية البيانات الشخصية في الكويت.',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 20)).toISOString().split('T')[0],
    assignedTo: 'ليلى منصور الهاجري',
    status: AdminTaskStatus.TODO,
    priority: AdminTaskPriority.MEDIUM,
    projectOrModule: 'تطوير الموقع الإلكتروني والشؤون القانونية الداخلية',
    createdAt: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString().split('T')[0],
  },
  {
    id: 'task-008',
    title: 'تقديم طلب تجديد رخصة المحاماة للمحامي/ عمر خالد',
    description: 'تجهيز وتقديم المستندات اللازمة لتجديد رخصة المحاماة السنوية للمحامي عمر خالد لدى جمعية المحامين الكويتية (بمقرها في بنيد القار).',
    dueDate: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString().split('T')[0], // Past due
    assignedTo: 'عمر خالد',
    status: AdminTaskStatus.BLOCKED,
    priority: AdminTaskPriority.HIGH,
    projectOrModule: 'الشؤون الإدارية للمكتب (جمعية المحامين)',
    createdAt: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    notes: 'معلقة بسبب انتظار شهادة حسن سير وسلوك من وزارة الداخلية. تم التواصل مع الوزارة.',
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString().split('T')[0],
  },
  {
    id: 'task-009',
    title: 'التأكد من إعلان صحيفة دعوى قضية أحوال شخصية (PS-FAM-2024-333)',
    description: 'متابعة مندوب الإعلان للتأكد من تمام إعلان صحيفة الدعوى للمدعى عليه في قضية النفقة والحضانة المنظورة أمام محكمة الأسرة بمحافظة الأحمدي - دائرة أحوال شخصية (سني).',
    assignedTo: 'ناصر عبدالله القحطاني',
    status: AdminTaskStatus.IN_PROGRESS,
    priority: AdminTaskPriority.CRITICAL, 
    relatedCaseId: 'PS-FAM-2024-333',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0],
    createdAt: new Date().toISOString().split('T')[0],
  }
];

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


  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData?.id ? "تعديل المهمة" : "إضافة مهمة جديدة"} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input name="title" label="عنوان المهمة" value={formData.title || ''} onChange={handleChange} required />
        <TextArea name="description" label="وصف المهمة (اختياري)" value={formData.description || ''} onChange={handleChange} rows={3} placeholder="أضف تفاصيل حول المهمة، مثل الخطوات المطلوبة أو النتائج المتوقعة..."/>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select name="assignedTo" label="الشخص المسؤول" value={formData.assignedTo || ''} options={assigneeOptions} onChange={handleChange} required placeholder="اختر المسؤول"/>
          <Input name="dueDate" label="تاريخ الاستحقاق (اختياري)" type="date" value={formData.dueDate || ''} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select name="status" label="حالة المهمة" value={formData.status} options={adminTaskStatusOptions} onChange={handleChange} required />
          <Select name="priority" label="أولوية المهمة" value={formData.priority} options={adminTaskPriorityOptions} onChange={handleChange} required />
        </div>
        <Input name="relatedCaseId" label="معرّف القضية المرتبطة (اختياري)" value={formData.relatedCaseId || ''} onChange={handleChange} placeholder="مثال: CML-2024-101 أو ADM-012"/>
        <Input name="projectOrModule" label="المشروع/الوحدة المرتبطة (اختياري)" value={formData.projectOrModule || ''} onChange={handleChange} placeholder="مثال: تطوير الموقع الإلكتروني، إعداد تقرير سنوي"/>
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

  return (
    <Modal isOpen={!!task} onClose={onClose} title={`تفاصيل المهمة: ${task.title}`} size="lg">
      <div className="space-y-3 text-sm">
        <p><strong>الوصف:</strong> <pre className="whitespace-pre-wrap font-sans bg-gray-50 p-2 rounded border">{task.description || 'لا يوجد وصف'}</pre></p>
        <p><strong>الشخص المسؤول:</strong> {task.assignedTo}</p>
        <p><strong>تاريخ الاستحقاق:</strong> {task.dueDate ? formatDate(task.dueDate) : 'غير محدد'}</p>
        <p><strong>الحالة:</strong> <AdminTaskStatusBadge status={task.status} size="sm" /></p>
        <p><strong>الأولوية:</strong> <AdminTaskPriorityBadge priority={task.priority} size="sm" /></p>
        {task.relatedCaseId && <p><strong>مرتبطة بالقضية:</strong> <Link to={`/cases`} className="text-primary hover:underline">{task.relatedCaseId}</Link></p>}
        {task.projectOrModule && <p><strong>المشروع/الوحدة:</strong> {task.projectOrModule}</p>}
        {task.notes && <p><strong>ملاحظات:</strong> <pre className="whitespace-pre-wrap font-sans bg-gray-50 p-2 rounded border">{task.notes}</pre></p>}
        <hr className="my-2" />
        <p><strong>تاريخ الإنشاء:</strong> {formatDate(task.createdAt)}</p>
        {task.updatedAt && <p><strong>آخر تحديث:</strong> {formatDate(task.updatedAt)}</p>}
        {task.completedAt && <p><strong>تاريخ الإنجاز:</strong> {formatDate(task.completedAt)}</p>}
      </div>
      <div className="mt-6 flex justify-end space-x-2 space-x-reverse">
        <Button variant="outline" onClick={() => { onClose(); onEdit(task); }}>تعديل المهمة</Button>
        <Button variant="primary" onClick={onClose}>إغلاق</Button>
      </div>
    </Modal>
  );
};


const TaskManagementPage: React.FC = () => {
  const [tasks, setTasks] = React.useState<AdminTask[]>(initialMockTasks);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState<AdminTaskStatus | ''>('');
  const [filterPriority, setFilterPriority] = React.useState<AdminTaskPriority | ''>('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Partial<AdminTask> | null>(null);
  const [viewingTask, setViewingTask] = useState<AdminTask | null>(null);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task =>
      (task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
       (task.assignedTo && task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())) ||
       (task.relatedCaseId && task.relatedCaseId.toLowerCase().includes(searchTerm.toLowerCase())) || // Search by case ID
       (task.projectOrModule && task.projectOrModule.toLowerCase().includes(searchTerm.toLowerCase())) // Search by project/module
      ) &&
      (filterStatus ? task.status === filterStatus : true) &&
      (filterPriority ? task.priority === filterPriority : true)
    ).sort((a, b) => (a.dueDate && b.dueDate) ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime() : (a.dueDate ? -1 : 1));
  }, [tasks, searchTerm, filterStatus, filterPriority]);

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
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    today.setHours(0,0,0,0);
    date.setHours(0,0,0,0);
    tomorrow.setHours(0,0,0,0);

    let dateColor = "text-gray-600";
    if (date < today) dateColor = "text-danger";
    else if (date.getTime() === today.getTime()) dateColor = "text-orange-600";
    else if (date.getTime() === tomorrow.getTime()) dateColor = "text-blue-600";

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
            <ClipboardDocumentListIcon className="w-8 h-8 text-primary me-3" />
            <h1 className="text-3xl font-bold text-primary-dark">إدارة المهام الإدارية</h1>
        </div>
        <Button onClick={handleAddTask} leftIcon={<PlusCircleIcon className="w-5 h-5" />}>
            إضافة مهمة جديدة
        </Button>
      </div>
      
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6 p-4 bg-slate-50 rounded-lg shadow-sm">
            <Input
                placeholder="ابحث بالعنوان، الوصف، المسؤول، رقم القضية..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                containerClassName="mb-0"
            />
            <Select
                options={[{ value: '', label: 'جميع الحالات' }, ...adminTaskStatusOptions]}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as AdminTaskStatus | '')}
                label="تصفية حسب الحالة"
                containerClassName="mb-0"
            />
            <Select
                options={[{ value: '', label: 'جميع الأولويات' }, ...adminTaskPriorityOptions]}
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as AdminTaskPriority | '')}
                label="تصفية حسب الأولوية"
                containerClassName="mb-0"
            />
        </div>

        {filteredTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTasks.map(task => (
                <Card key={task.id} className={`shadow-lg hover:shadow-xl transition-shadow duration-200 flex flex-col bg-white rounded-lg border-t-4 ${getPriorityBorderColorClass(task.priority)}`}>
                    <div className="p-5 flex-grow">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-md font-semibold text-primary-dark line-clamp-2 leading-tight" title={task.title}>{task.title}</h3>
                            <AdminTaskStatusBadge status={task.status} size="xs"/>
                        </div>
                        <p className="text-xs text-gray-500 mb-1">المسؤول: <span className="font-medium text-gray-700">{task.assignedTo}</span></p>
                        <p className="text-xs text-gray-500 mb-1 flex items-center">
                            <ClockIcon className="w-3.5 h-3.5 me-1.5 text-gray-400"/>
                            الاستحقاق: {formatDateForDisplay(task.dueDate)}
                        </p>
                        <div className="mb-3">
                            <AdminTaskPriorityBadge priority={task.priority} size="xs" />
                        </div>
                        {task.description && <p className="text-xs text-gray-600 bg-slate-50 p-2 rounded-md line-clamp-2 leading-relaxed my-2" title={task.description}>{task.description}</p>}
                        {task.relatedCaseId && <p className="text-xs text-gray-500">مرتبطة بالقضية: <Link to={`/cases`} className="text-primary hover:underline font-medium">{task.relatedCaseId}</Link></p>}
                         {task.projectOrModule && <p className="text-xs text-gray-500">المشروع/الوحدة: <span className="text-indigo-600">{task.projectOrModule}</span></p>}
                    </div>
                    <div className="border-t p-3 bg-slate-50/50 flex justify-end space-x-2 space-x-reverse rounded-b-lg">
                        <Button variant="ghost" size="sm" onClick={() => handleViewTask(task)} title="عرض التفاصيل"><EyeIcon className="w-4 h-4 text-blue-600" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditTask(task)} title="تعديل"><PencilIcon className="w-4 h-4 text-yellow-600" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteTask(task.id)} title="حذف" className="text-danger hover:text-red-700"><TrashIcon className="w-4 h-4" /></Button>
                    </div>
                </Card>
            ))}
          </div>
        ) : (
            <div className="text-center py-10 text-gray-500">
                <FolderIcon className="w-16 h-16 mx-auto text-gray-300 mb-3"/>
                <p className="text-lg">لا توجد مهام تطابق معايير البحث الحالية.</p>
            </div>
        )}
      </Card>

      <TaskFormModal 
        isOpen={isFormModalOpen} 
        onClose={() => { setIsFormModalOpen(false); setEditingTask(null); }} 
        onSubmit={handleFormSubmit} 
        initialData={editingTask} 
      />
      <ViewTaskModal 
        task={viewingTask} 
        onClose={() => setViewingTask(null)} 
        onEdit={(taskToEdit) => { setViewingTask(null); handleEditTask(taskToEdit);}}
      />
    </div>
  );
};

export default initialMockTasks; // Default export
export { TaskManagementPage }; // Named export for the component
