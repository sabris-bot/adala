
import React, { useState, useMemo, useCallback } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import { ComplianceStatusBadge } from '../components/ui/Badge';
import { ShieldCheckIcon, PlusCircleIcon, EyeIcon, PencilIcon, TrashIcon, FolderIcon, InformationCircleIcon } from '../constants';
import { ComplianceRequirement, ComplianceCategory, ComplianceStatus, ComplianceFrequency } from '../types';
import { complianceCategoryOptions, complianceStatusOptions, complianceFrequencyOptions } from '../constants';

export const initialComplianceData: ComplianceRequirement[] = [ // Added export
  {
    id: 'comp1',
    title: 'تجديد الرخصة التجارية السنوية',
    description: 'تجديد الرخصة التجارية للمؤسسة قبل تاريخ انتهاء صلاحيتها.',
    category: ComplianceCategory.LICENSES,
    authority: 'وزارة التجارة والصناعة',
    frequency: ComplianceFrequency.ANNUAL,
    dueDate: '2024-12-15',
    status: ComplianceStatus.SCHEDULED,
    assignedTo: 'قسم الشؤون الإدارية',
    nextReviewDate: '2024-11-01',
    evidenceLink: 'https://example.com/license-docs/1',
    createdAt: '2023-01-10',
  },
  {
    id: 'comp2',
    title: 'تقديم الإقرار الضريبي الربع سنوي (Q3)',
    description: 'إعداد وتقديم الإقرار الضريبي للربع الثالث من العام المالي.',
    category: ComplianceCategory.TAX,
    authority: 'الهيئة العامة للضرائب',
    frequency: ComplianceFrequency.QUARTERLY,
    dueDate: '2024-10-25',
    status: ComplianceStatus.IN_PROGRESS,
    assignedTo: 'القسم المالي',
    lastReviewDate: '2024-09-20',
    nextReviewDate: '2024-10-15',
    createdAt: '2023-02-15',
  },
  {
    id: 'comp3',
    title: 'تحديث سياسة حماية البيانات',
    description: 'مراجعة وتحديث سياسة حماية البيانات لتتوافق مع اللوائح الجديدة.',
    category: ComplianceCategory.DATA_PROTECTION,
    authority: 'هيئة حماية البيانات (افتراضية)',
    frequency: ComplianceFrequency.AS_NEEDED,
    status: ComplianceStatus.COMPLIANT,
    assignedTo: 'القسم القانوني',
    lastReviewDate: '2024-06-30',
    evidenceLink: 'https://example.com/policy/data-protection-v2.pdf',
    createdAt: '2023-03-20',
    updatedAt: '2024-06-30',
  },
  {
    id: 'comp4',
    title: 'التدريب السنوي على مكافحة غسيل الأموال',
    description: 'إجراء دورة تدريبية إلزامية لجميع الموظفين المعنيين.',
    category: ComplianceCategory.ANTI_MONEY_LAUNDERING,
    authority: 'وحدة التحريات المالية',
    frequency: ComplianceFrequency.ANNUAL,
    dueDate: '2024-11-30',
    status: ComplianceStatus.OVERDUE,
    assignedTo: 'إدارة الموارد البشرية / قسم الامتثال',
    nextReviewDate: '2024-10-01',
    notes: 'تم تجاوز الموعد، يجب الإسراع في التنفيذ.',
    createdAt: '2023-04-01',
  },
  {
    id: 'comp5',
    title: 'تجديد السجل التجاري للشركة',
    description: 'متابعة وإنهاء إجراءات تجديد السجل التجاري للشركة لدى وزارة التجارة.',
    category: ComplianceCategory.COMMERCIAL_REG,
    authority: 'وزارة التجارة والصناعة',
    frequency: ComplianceFrequency.ANNUAL, 
    dueDate: '2025-03-31',
    status: ComplianceStatus.SCHEDULED,
    assignedTo: 'مسؤول العلاقات الحكومية',
    createdAt: '2024-01-15',
  },
  {
    id: 'comp6',
    title: 'تجديد إذن عمل للموظف (خالد أحمد)',
    description: 'تقديم طلب تجديد إذن العمل للموظف خالد أحمد قبل انتهاء صلاحيته.',
    category: ComplianceCategory.LABOR_LAW,
    authority: 'الهيئة العامة للقوى العاملة',
    frequency: ComplianceFrequency.ANNUAL, 
    dueDate: '2024-09-15',
    status: ComplianceStatus.IN_PROGRESS,
    assignedTo: 'مسؤول شؤون الموظفين',
    notes: 'تم جمع المستندات المطلوبة، بانتظار توقيع الموظف.',
    createdAt: '2024-07-01',
  },
  {
    id: 'comp7',
    title: "تجديد العلامة التجارية 'علامتي المميزة'",
    description: "دفع رسوم تجديد العلامة التجارية المسجلة 'علامتي المميزة' لدى إدارة حماية الملكية الفكرية.",
    category: ComplianceCategory.INTELLECTUAL_PROPERTY,
    authority: 'وزارة التجارة - إدارة حماية الملكية الفكرية',
    frequency: ComplianceFrequency.AS_NEEDED, // Or every 10 years, for example
    dueDate: '2025-06-30',
    status: ComplianceStatus.SCHEDULED,
    assignedTo: 'القسم القانوني',
    createdAt: '2024-02-01',
  },
  {
    id: 'comp8',
    title: 'مراجعة وتجديد عقد الإيجار الرئيسي للمقر',
    description: 'مراجعة شروط عقد الإيجار الحالي للمقر الرئيسي والتفاوض بشأن تجديده قبل انتهاء المدة.',
    category: ComplianceCategory.CONTRACTUAL_OBLIGATIONS,
    authority: 'إدارة العقود / الإدارة',
    frequency: ComplianceFrequency.AS_NEEDED, // Based on lease term
    dueDate: '2024-12-31',
    status: ComplianceStatus.UNDER_REVIEW,
    assignedTo: 'المدير الإداري',
    notes: 'تم التواصل مع المؤجر لبدء مفاوضات التجديد.',
    createdAt: '2024-05-10',
  },
  {
    id: 'comp9',
    title: 'تقديم تقرير الانبعاثات السنوي',
    description: 'إعداد وتقديم تقرير الانبعاثات الكربونية السنوي للشركة.',
    category: ComplianceCategory.ENVIRONMENTAL,
    authority: 'الهيئة العامة للبيئة',
    frequency: ComplianceFrequency.ANNUAL,
    dueDate: '2025-03-31',
    status: ComplianceStatus.SCHEDULED,
    assignedTo: 'مسؤول البيئة والاستدامة',
    createdAt: '2024-08-01',
  },
  {
    id: 'comp10',
    title: 'إيداع البيانات المالية السنوية المدققة',
    description: 'تقديم نسخة من البيانات المالية المدققة عن السنة المالية المنتهية إلى وزارة التجارة والصناعة.',
    category: ComplianceCategory.FINANCIAL_REPORTING,
    authority: 'وزارة التجارة والصناعة',
    frequency: ComplianceFrequency.ANNUAL,
    dueDate: '2025-04-30',
    status: ComplianceStatus.IN_PROGRESS,
    assignedTo: 'المدير المالي',
    notes: 'البيانات قيد التدقيق حاليًا من قبل المدقق الخارجي.',
    createdAt: '2024-07-20',
  },
  {
    id: 'comp11',
    title: 'الفحص السنوي لنظام إطفاء الحريق بالمقر الرئيسي',
    description: 'التنسيق مع شركة صيانة معتمدة لفحص واختبار نظام إطفاء الحريق والتأكد من صلاحيته.',
    category: ComplianceCategory.HEALTH_SAFETY,
    authority: 'شركة صيانة معتمدة / الإدارة العامة للإطفاء',
    frequency: ComplianceFrequency.ANNUAL,
    dueDate: '2024-09-30',
    status: ComplianceStatus.COMPLIANT,
    assignedTo: 'مسؤول الأمن والسلامة',
    lastReviewDate: '2023-09-25', // Assuming it was done last year
    evidenceLink: '#safety_inspection_report_2023.pdf',
    createdAt: '2023-08-15',
    updatedAt: '2023-09-28',
  },
  {
    id: 'comp12',
    title: 'مراجعة داخلية لسياسات أمن المعلومات (ISO 27001)',
    description: 'إجراء مراجعة داخلية شاملة لسياسات وإجراءات أمن المعلومات للتأكد من توافقها مع معيار ISO 27001.',
    category: ComplianceCategory.OTHER, // Can be used for internal policies or specific standards
    authority: 'قسم التدقيق الداخلي / استشاري أمن معلومات خارجي',
    frequency: ComplianceFrequency.ANNUAL,
    dueDate: '2024-11-15',
    status: ComplianceStatus.UNDER_REVIEW,
    assignedTo: 'مدير أمن المعلومات',
    notes: 'المراجعة بدأت، ومن المتوقع الانتهاء منها خلال شهر.',
    createdAt: '2024-06-01',
  },
];

// Props for ComplianceForm
interface ComplianceFormProps {
  initialData: Partial<ComplianceRequirement> | null;
  onSubmit: (data: ComplianceRequirement) => void;
  onCancel: () => void;
}

const ComplianceForm: React.FC<ComplianceFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<ComplianceRequirement>>(
    initialData || {
      title: '',
      category: complianceCategoryOptions[0].value as ComplianceCategory,
      authority: '',
      frequency: complianceFrequencyOptions[1].value as ComplianceFrequency, // Annual
      status: complianceStatusOptions[0].value as ComplianceStatus, // Compliant
      createdAt: new Date().toISOString().split('T')[0],
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.category || !formData.authority || !formData.status || !formData.frequency) {
        alert("يرجى ملء الحقول الإلزامية: العنوان، الفئة، الجهة، الحالة، والدورية.");
        return;
    }
    onSubmit(formData as ComplianceRequirement);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 max-h-[75vh] overflow-y-auto p-1">
      <Input name="title" label="عنوان المتطلب" value={formData.title || ''} onChange={handleChange} required />
      <TextArea name="description" label="وصف المتطلب" value={formData.description || ''} onChange={handleChange} rows={3} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select name="category" label="الفئة" value={formData.category} options={complianceCategoryOptions} onChange={handleChange} required />
        <Input name="authority" label="الجهة المختصة/الرقابية" value={formData.authority || ''} onChange={handleChange} required />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select name="frequency" label="دورية المتطلب" value={formData.frequency} options={complianceFrequencyOptions} onChange={handleChange} required />
        <Select name="status" label="حالة الامتثال" value={formData.status} options={complianceStatusOptions} onChange={handleChange} required />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input name="dueDate" label="تاريخ الاستحقاق" type="date" value={formData.dueDate || ''} onChange={handleChange} />
        <Input name="assignedTo" label="المسؤول المعين" value={formData.assignedTo || ''} onChange={handleChange} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input name="lastReviewDate" label="تاريخ آخر مراجعة" type="date" value={formData.lastReviewDate || ''} onChange={handleChange} />
        <Input name="nextReviewDate" label="تاريخ المراجعة القادم" type="date" value={formData.nextReviewDate || ''} onChange={handleChange} />
      </div>
      <Input name="evidenceLink" label="رابط المستندات/الأدلة" type="url" value={formData.evidenceLink || ''} onChange={handleChange} placeholder="https://example.com/doc.pdf"/>
      <TextArea name="notes" label="ملاحظات إضافية" value={formData.notes || ''} onChange={handleChange} rows={3} />
      
      <div className="flex justify-end space-x-3 space-x-reverse pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>إلغاء</Button>
        <Button type="submit" variant="primary">{initialData?.id ? 'حفظ التعديلات' : 'إضافة متطلب'}</Button>
      </div>
    </form>
  );
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  try {
      return new Date(dateString).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch(e) { return dateString; }
};

// New Modal for Viewing Compliance Item Details
interface ViewComplianceItemModalProps {
  item: ComplianceRequirement | null;
  onClose: () => void;
}

const ViewComplianceItemModal: React.FC<ViewComplianceItemModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <Modal isOpen={!!item} onClose={onClose} title={`تفاصيل الالتزام: ${item.title}`} size="lg">
      <div className="space-y-3 p-2 max-h-[70vh] overflow-y-auto">
        <Card title="ملخص الالتزام" className="bg-gray-50" titleClassName="text-sm">
            <p><strong>الفئة:</strong> {item.category}</p>
            <p><strong>الجهة المختصة:</strong> {item.authority}</p>
            <p><strong>الدورية:</strong> {item.frequency}</p>
            <p><strong>تاريخ الاستحقاق:</strong> {formatDate(item.dueDate)}</p>
            <p><strong>الحالة:</strong> <ComplianceStatusBadge status={item.status} size="sm"/></p>
            <p><strong>المسؤول:</strong> {item.assignedTo || '-'}</p>
        </Card>
        
        {item.description && (
            <Card title="الوصف التفصيلي" className="bg-gray-50" titleClassName="text-sm">
                <pre className="whitespace-pre-wrap font-sans text-sm p-2 bg-white border rounded">{item.description}</pre>
            </Card>
        )}

        <Card title="التواريخ والمراجعات" className="bg-gray-50" titleClassName="text-sm">
            <p><strong>تاريخ آخر مراجعة:</strong> {formatDate(item.lastReviewDate)}</p>
            <p><strong>تاريخ المراجعة القادم:</strong> {formatDate(item.nextReviewDate)}</p>
        </Card>

        {item.evidenceLink && (
            <Card title="الأدلة والمستندات" className="bg-gray-50" titleClassName="text-sm">
                <p>
                    <strong>رابط الأدلة:</strong>{' '}
                    <a href={item.evidenceLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                        {item.evidenceLink}
                    </a>
                </p>
            </Card>
        )}
        
        {item.notes && (
            <Card title="ملاحظات إضافية" className="bg-yellow-50 border-yellow-200" titleClassName="text-sm text-yellow-800">
                 <pre className="whitespace-pre-wrap font-sans text-sm p-2 bg-white border rounded">{item.notes}</pre>
            </Card>
        )}
        <p className="text-xs text-gray-400 text-center pt-2">
            تاريخ إنشاء السجل: {formatDate(item.createdAt)}
            {item.updatedAt && ` | آخر تعديل: ${formatDate(item.updatedAt)}`}
        </p>
      </div>
    </Modal>
  );
};


export const CompliancePage: React.FC = () => { // Changed to named export
  const [complianceItems, setComplianceItems] = useState<ComplianceRequirement[]>(initialComplianceData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<ComplianceCategory | ''>('');
  const [filterStatus, setFilterStatus] = useState<ComplianceStatus | ''>('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<ComplianceRequirement> | null>(null);
  const [viewingItem, setViewingItem] = useState<ComplianceRequirement | null>(null); // For details modal

  const filteredItems = useMemo(() => {
    return complianceItems.filter(item =>
      (item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
       item.authority.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (item.assignedTo && item.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()))
      ) &&
      (filterCategory ? item.category === filterCategory : true) &&
      (filterStatus ? item.status === filterStatus : true)
    ).sort((a, b) => new Date(a.dueDate || '9999-12-31').getTime() - new Date(b.dueDate || '9999-12-31').getTime());
  }, [complianceItems, searchTerm, filterCategory, filterStatus]);

  const handleAddItem = () => {
    setEditingItem(null); 
    setIsModalOpen(true);
  };

  const handleEditItem = (item: ComplianceRequirement) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleViewItem = (item: ComplianceRequirement) => { // Updated to set viewingItem
    setViewingItem(item);
  };

  const handleDeleteItem = useCallback((itemId: string) => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف هذا المتطلب؟')) {
      setComplianceItems(prev => prev.filter(item => item.id !== itemId));
    }
  }, []);

  const handleFormSubmit = (data: ComplianceRequirement) => {
    const submittedData = {
        ...data,
        updatedAt: new Date().toISOString().split('T')[0]
    };

    if (editingItem && editingItem.id) { 
        setComplianceItems(prev => prev.map(item => (item.id === editingItem.id ? { ...submittedData, id: editingItem.id, createdAt: item.createdAt } : item)));
    } else {
        setComplianceItems(prev => [{ ...submittedData, id: String(Date.now() + Math.random()), createdAt: new Date().toISOString().split('T')[0] }, ...prev]);
    }
    setIsModalOpen(false);
    setEditingItem(null);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
            <ShieldCheckIcon className="w-8 h-8 text-primary me-3" />
            <h1 className="text-3xl font-bold text-primary-dark">سجل الامتثال والالتزامات القانونية</h1>
        </div>
        <Button onClick={handleAddItem} leftIcon={<PlusCircleIcon className="w-5 h-5" />}> {/* Corrected typo here */}
            إضافة متطلب امتثال
        </Button>
      </div>
      
      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start">
            <InformationCircleIcon className="w-6 h-6 text-blue-600 me-3 mt-1 flex-shrink-0" />
            <div>
                <h3 className="text-md font-semibold text-blue-700 mb-1">نظرة عامة على سجل الامتثال</h3>
                <p className="text-sm text-blue-600 leading-relaxed">
                    تهدف هذه الوحدة إلى مساعدتك في تتبع وإدارة جميع متطلبات الامتثال القانوني والتنظيمي التي تخضع لها مؤسستك. 
                    يمكنك هنا تسجيل المتطلبات المختلفة (مثل التراخيص، الإقرارات الضريبية، التزامات حماية البيانات، إلخ)، وتحديد الجهات المسؤولة عنها، وتواريخ استحقاقها، وحالتها الحالية. 
                    <br/>يساعدك هذا السجل في ضمان الالتزام بالقوانين واللوائح وتجنب أي مخالفات أو غرامات.
                </p>
            </div>
        </div>
      </Card>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <Input
            placeholder="ابحث بالعنوان، الوصف، الجهة، المسؤول..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            containerClassName="mb-0"
          />
          <Select
            label="تصفية بالفئة"
            options={[{ value: '', label: 'كل الفئات' }, ...complianceCategoryOptions]}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as ComplianceCategory | '')}
            containerClassName="mb-0"
          />
          <Select
            label="تصفية بالحالة"
            options={[{ value: '', label: 'كل الحالات' }, ...complianceStatusOptions]}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as ComplianceStatus | '')}
            containerClassName="mb-0"
          />
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                {['عنوان المتطلب', 'الفئة', 'الجهة المختصة', 'تاريخ الاستحقاق', 'الحالة', 'المسؤول', 'إجراءات'].map(header => (
                  <th key={header} scope="col" className="px-4 py-3 text-right font-medium text-secondary-dark uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-primary-light/5 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{item.title}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600">{item.category}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600">{item.authority}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600">{formatDate(item.dueDate)}</td>
                  <td className="px-4 py-3 whitespace-nowrap"><ComplianceStatusBadge status={item.status} /></td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600">{item.assignedTo || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-1 space-x-reverse">
                    <Button variant="ghost" size="sm" onClick={() => handleViewItem(item)} title="عرض التفاصيل"><EyeIcon className="w-4 h-4 text-primary" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEditItem(item)} title="تعديل"><PencilIcon className="w-4 h-4 text-yellow-600" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteItem(item.id)} className="text-danger hover:text-red-700" title="حذف"><TrashIcon className="w-4 h-4" /></Button>
                  </td>
                </tr>
              ))}
               {filteredItems.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-10 text-center text-gray-500 text-lg">
                    <FolderIcon className="w-12 h-12 mx-auto text-gray-400 mb-2"/>لا توجد متطلبات امتثال تطابق بحثك.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingItem(null); }} title={editingItem?.id ? `تعديل متطلب امتثال: ${editingItem.title}` : 'إضافة متطلب امتثال جديد'} size="lg">
          <ComplianceForm initialData={editingItem} onSubmit={handleFormSubmit} onCancel={() => { setIsModalOpen(false); setEditingItem(null); }} />
      </Modal>

      <ViewComplianceItemModal item={viewingItem} onClose={() => setViewingItem(null)} />
    </div>
  );
};

// Removed 'export default CompliancePage;' as it's now a named export
