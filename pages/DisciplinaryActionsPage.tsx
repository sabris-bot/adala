import React, { useState, useMemo, useCallback } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import { ExclamationTriangleIcon, PlusCircleIcon, EyeIcon, PencilIcon, TrashIcon, FolderIcon, InformationCircleIcon } from '../constants';
import { Employee, DisciplinaryAction, ViolationTypeKuwait, DisciplinaryPenaltyKuwait, DisciplinaryActionStatus, RequestAttachment } from '../types';
import { violationTypeKuwaitOptions, disciplinaryPenaltyKuwaitOptions, disciplinaryActionStatusOptions } from '../constants';
import { DisciplinaryActionStatusBadge } from '../components/ui/Badge';

const mockEmployees: Pick<Employee, 'id' | 'fullNameAr' | 'employeeId'>[] = [
  { id: 'emp-001', fullNameAr: 'أحمد محمود مبارك', employeeId: 'EMP001' },
  { id: 'emp-002', fullNameAr: 'فاطمة علي حسين', employeeId: 'EMP002' },
  { id: 'emp-003', fullNameAr: 'علي محمد جاسم', employeeId: 'EMP003' },
];

export const initialDisciplinaryActions: DisciplinaryAction[] = [ // Added export
  {
    id: 'da1',
    employeeId: 'emp-001',
    employeeName: 'أحمد محمود مبارك',
    violationDate: '2024-07-10',
    reportDate: '2024-07-11',
    reportedBy: 'رئيس القسم المباشر',
    violationType: ViolationTypeKuwait.ATTENDANCE_LATENESS,
    violationDetails: 'تأخير متكرر عن مواعيد الدوام الرسمي خلال الأسبوع الماضي بدون عذر مقبول.',
    investigation: {
      investigator: 'مدير الموارد البشرية',
      investigationStartDate: '2024-07-12',
      investigationEndDate: '2024-07-14',
      investigationSummary: 'تم مراجعة سجلات الحضور والانصراف والتحدث مع الموظف. أقر الموظف بالتأخير بسبب ظروف شخصية ووعد بعدم التكرار.',
      witnesses: ['زميل العمل (س)'],
      evidence: ['سجلات الحضور والانصراف للأسبوع الماضي.', 'إقرار الموظف بالتأخير.']
    },
    legalOpinionNotes: 'وفقًا للائحة الداخلية للشركة، التأخير المتكرر يستوجب إنذارًا كتابيًا في المرة الأولى.',
    actionTaken: DisciplinaryPenaltyKuwait.WRITTEN_WARNING,
    penaltyDetails: 'إنذار كتابي رسمي يودع في ملف الموظف.',
    actionEffectiveDate: '2024-07-15',
    status: DisciplinaryActionStatus.ACTION_TAKEN,
    createdAt: '2024-07-11',
    updatedAt: '2024-07-15',
  },
  {
    id: 'da2',
    employeeId: 'emp-002',
    employeeName: 'فاطمة علي حسين',
    violationDate: '2024-06-20',
    reportDate: '2024-06-21',
    reportedBy: 'مشرف القسم',
    violationType: ViolationTypeKuwait.PERFORMANCE_NEGLIGENCE,
    violationDetails: 'إهمال في مراجعة مستندات هامة أدى إلى خطأ في بيانات العميل (ع).',
    status: DisciplinaryActionStatus.PENDING_INVESTIGATION,
    createdAt: '2024-06-21',
  },
  {
    id: 'da3',
    employeeId: 'emp-003',
    employeeName: 'علي محمد جاسم',
    violationDate: '2024-05-15',
    reportDate: '2024-05-16',
    reportedBy: 'مدير الإدارة', 
    violationType: ViolationTypeKuwait.ATTENDANCE_ABSENCE,
    violationDetails: 'غياب لمدة يومين متتاليين (15 و 16 مايو) بدون إذن مسبق أو عذر مقبول.',
    investigation: {
        investigator: 'مدير الإدارة',
        investigationSummary: 'تم التواصل مع الموظف ولم يقدم مبررًا كافيًا للغياب.',
    },
    actionTaken: DisciplinaryPenaltyKuwait.DEDUCTION_FROM_WAGE,
    penaltyDetails: 'خصم يومين من الأجر عن شهري مايو.',
    actionEffectiveDate: '2024-05-31',
    status: DisciplinaryActionStatus.ACTION_TAKEN,
    createdAt: '2024-05-16',
    updatedAt: '2024-05-20',
  },
  {
    id: 'da4',
    employeeId: 'emp-001', 
    employeeName: 'أحمد محمود مبارك',
    violationDate: '2024-08-01',
    reportDate: '2024-08-02',
    reportedBy: 'قسم الأمن الداخلي',
    violationType: ViolationTypeKuwait.POLICY_CODE_OF_CONDUCT,
    violationDetails: 'مخالفة مدونة سلوك الشركة من خلال استخدام غير لائق لموارد الشركة (الإنترنت لأغراض شخصية بشكل مفرط خلال ساعات العمل).',
    status: DisciplinaryActionStatus.INVESTIGATION_COMPLETE, 
    investigation: {
      investigator: 'لجنة تحقيق داخلية',
      investigationStartDate: '2024-08-03',
      investigationEndDate: '2024-08-05',
      investigationSummary: 'أثبت التحقيق صحة الواقعة بناءً على سجلات استخدام الإنترنت وشهادة زملاء.',
      witnesses: ['زميل (أ)', 'مشرف تقنية المعلومات'],
      evidence: ['سجل تصفح الإنترنت بتاريخ 2024-08-01.', 'لقطة شاشة من كاميرا المراقبة (إن وجدت).']
    },
    createdAt: '2024-08-02',
  },
  {
    id: 'da5',
    employeeId: 'emp-002',
    employeeName: 'فاطمة علي حسين',
    violationDate: '2024-08-10',
    reportDate: '2024-08-10',
    reportedBy: 'مدير القسم القانوني',
    violationType: ViolationTypeKuwait.CONFIDENTIALITY_BREACH,
    violationDetails: 'يشتبه في قيام الموظفة بإفشاء معلومات سرية تتعلق بقضية العميل (س) لطرف خارجي غير مصرح له.',
    status: DisciplinaryActionStatus.INVESTIGATION_IN_PROGRESS,
    investigation: {
      investigator: 'لجنة تحقيق مشكلة من (عضو قانوني، عضو موارد بشرية، مدير القسم)',
      investigationStartDate: '2024-08-11',
      investigationSummary: 'التحقيق جارٍ لجمع الأدلة واستجواب الأطراف المعنية. تم حجز جهاز الكمبيوتر الخاص بالموظفة للفحص.',
    },
    actionTaken: DisciplinaryPenaltyKuwait.TERMINATION_WITHOUT_INDEMNITY, // Example for potential outcome
    penaltyDetails: 'سيتم تحديد الجزاء النهائي بعد اكتمال التحقيق. في حال ثبوت المخالفة، قد تصل العقوبة إلى الفصل وفق المادة 41.',
    createdAt: '2024-08-10',
  }
];


interface DisciplinaryActionFormProps {
  initialData?: Partial<DisciplinaryAction> | null;
  onSubmit: (data: DisciplinaryAction) => void;
  onCancel: () => void;
  employees: Pick<Employee, 'id' | 'fullNameAr' | 'employeeId'>[];
}

const DisciplinaryActionForm: React.FC<DisciplinaryActionFormProps> = ({ initialData, onSubmit, onCancel, employees }) => {
  const [formData, setFormData] = useState<Partial<DisciplinaryAction>>(
    initialData || {
      employeeId: employees.length > 0 ? employees[0].id : '',
      violationDate: new Date().toISOString().split('T')[0],
      reportDate: new Date().toISOString().split('T')[0],
      reportedBy: '',
      violationType: violationTypeKuwaitOptions[0].value as ViolationTypeKuwait,
      status: DisciplinaryActionStatus.PENDING_INVESTIGATION,
      investigation: { investigator: '', witnesses: [], evidence: [] },
      attachments: [],
      createdAt: new Date().toISOString().split('T')[0],
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInvestigationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      investigation: { ...(prev.investigation || {investigator: ''}), [name]: value }
    }));
  };
  
  const handleListChange = (fieldName: 'witnesses' | 'evidence', value: string) => {
      const list = value.split('\n').map(s => s.trim()).filter(s => s);
      setFormData(prev => ({
          ...prev,
          investigation: { ...(prev.investigation || {investigator: ''}), [fieldName]: list }
      }));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeeId || !formData.violationDate || !formData.violationDetails || !formData.reportedBy) {
      alert("يرجى ملء الحقول الإلزامية: الموظف، تاريخ المخالفة، تفاصيل المخالفة، والمبلّغ.");
      return;
    }
    const employee = employees.find(emp => emp.id === formData.employeeId);
    onSubmit({ 
        ...formData, 
        employeeName: employee?.fullNameAr || 'غير معروف',
        updatedAt: new Date().toISOString().split('T')[0]
    } as DisciplinaryAction);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto p-1">
      <Card title="تفاصيل المخالفة" titleClassName="text-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label="الموظف" name="employeeId" value={formData.employeeId} options={employees.map(e => ({ value: e.id, label: `${e.fullNameAr} (${e.employeeId})` }))} onChange={handleChange} required />
          <Input label="تاريخ وقوع المخالفة" name="violationDate" type="date" value={formData.violationDate} onChange={handleChange} required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Input label="تاريخ الإبلاغ عن المخالفة" name="reportDate" type="date" value={formData.reportDate} onChange={handleChange} />
          <Input label="المُبلِّغ عن المخالفة" name="reportedBy" value={formData.reportedBy || ''} onChange={handleChange} required/>
        </div>
        <Select label="نوع المخالفة" name="violationType" value={formData.violationType} options={violationTypeKuwaitOptions} onChange={handleChange} required containerClassName="mt-4" />
        <TextArea label="وصف تفصيلي للمخالفة" name="violationDetails" value={formData.violationDetails || ''} onChange={handleChange} required rows={4} />
      </Card>

      <Card title="تفاصيل التحقيق (إن وجد)" titleClassName="text-md">
        <Input label="المحقق / لجنة التحقيق" name="investigator" value={formData.investigation?.investigator || ''} onChange={handleInvestigationChange} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Input label="تاريخ بدء التحقيق" name="investigationStartDate" type="date" value={formData.investigation?.investigationStartDate || ''} onChange={handleInvestigationChange} />
          <Input label="تاريخ انتهاء التحقيق" name="investigationEndDate" type="date" value={formData.investigation?.investigationEndDate || ''} onChange={handleInvestigationChange} />
        </div>
        <TextArea label="ملخص التحقيق والنتائج" name="investigationSummary" value={formData.investigation?.investigationSummary || ''} onChange={handleInvestigationChange} rows={4} />
        <TextArea label="الشهود (كل شاهد في سطر جديد)" value={formData.investigation?.witnesses?.join('\n') || ''} onChange={(e) => handleListChange('witnesses', e.target.value)} rows={3} placeholder="اسم الشاهد 1\nاسم الشاهد 2"/>
        <TextArea label="الأدلة (كل دليل في سطر جديد)" value={formData.investigation?.evidence?.join('\n') || ''} onChange={(e) => handleListChange('evidence', e.target.value)} rows={3} placeholder="وصف الدليل 1\nرابط للدليل 2"/>
      </Card>
      
      <Card title="الرأي القانوني والملاحظات" titleClassName="text-md">
        <TextArea label="الرأي القانوني / مواد القانون ذات الصلة" name="legalOpinionNotes" value={formData.legalOpinionNotes || ''} onChange={handleChange} rows={3} placeholder="مثال: بناءً على المادة (XX) من قانون العمل، وبناءً على لائحة الجزاءات الداخلية..." />
      </Card>

      <Card title="الإجراء المتخذ والجزاء" titleClassName="text-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label="الجزاء التأديبي المتخذ" name="actionTaken" value={formData.actionTaken || ''} options={[{value: '', label: 'لم يحدد بعد'}, ...disciplinaryPenaltyKuwaitOptions]} onChange={handleChange} />
          <Input label="تاريخ سريان الجزاء" name="actionEffectiveDate" type="date" value={formData.actionEffectiveDate || ''} onChange={handleChange} />
        </div>
        <TextArea label="تفاصيل إضافية للجزاء" name="penaltyDetails" value={formData.penaltyDetails || ''} onChange={handleChange} rows={2} placeholder="مثال: خصم يومين من راتب شهر أغسطس، أو إيقاف عن العمل من تاريخ كذا إلى كذا."/>
      </Card>
      
      <Card title="الحالة العامة للإجراء" titleClassName="text-md">
          <Select label="حالة الإجراء التأديبي" name="status" value={formData.status} options={disciplinaryActionStatusOptions} onChange={handleChange} required />
          <TextArea label="ملاحظات عامة" name="notes" value={formData.notes || ''} onChange={handleChange} rows={3} />
      </Card>

       <Card title="المرفقات" titleClassName="text-md">
        <p className="text-sm text-gray-500">سيتم تطوير نظام متكامل لإدارة المرفقات لاحقًا. حاليًا يمكنك ذكر أسماء الملفات الهامة في الملاحظات.</p>
      </Card>

      <div className="flex justify-end space-x-3 space-x-reverse pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>إلغاء</Button>
        <Button type="submit" variant="primary">{formData.id ? 'حفظ التعديلات' : 'إضافة إجراء'}</Button>
      </div>
    </form>
  );
};


const DisciplinaryActionsDetailsModal: React.FC<{
    action: DisciplinaryAction | null;
    onClose: () => void;
}> = ({ action, onClose }) => {
    if (!action) return null;
    const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleDateString('ar-EG') : '-';

    return (
        <Modal isOpen={!!action} onClose={onClose} title={`تفاصيل الإجراء التأديبي لـ: ${action.employeeName}`} size="xl">
            <div className="space-y-3 max-h-[75vh] overflow-y-auto p-2">
                <Card title="بيانات المخالفة الأساسية" className="bg-gray-50" titleClassName="text-sm">
                    <p><strong>الموظف:</strong> {action.employeeName} (ID: {action.employeeId})</p>
                    <p><strong>تاريخ المخالفة:</strong> {formatDate(action.violationDate)}</p>
                    <p><strong>تاريخ الإبلاغ:</strong> {formatDate(action.reportDate)} (بواسطة: {action.reportedBy || 'غير محدد'})</p>
                    <p><strong>نوع المخالفة:</strong> {action.violationType}</p>
                    <p><strong>تفاصيل المخالفة:</strong> <pre className="whitespace-pre-wrap font-sans text-sm p-2 bg-white border rounded">{action.violationDetails}</pre></p>
                </Card>

                {action.investigation && (
                    <Card title="تفاصيل التحقيق" className="bg-gray-50" titleClassName="text-sm">
                        <p><strong>المحقق:</strong> {action.investigation.investigator || '-'}</p>
                        <p><strong>تاريخ بدء التحقيق:</strong> {formatDate(action.investigation.investigationStartDate)}</p>
                        <p><strong>تاريخ انتهاء التحقيق:</strong> {formatDate(action.investigation.investigationEndDate)}</p>
                        {action.investigation.investigationSummary && <p><strong>ملخص التحقيق:</strong> <pre className="whitespace-pre-wrap font-sans text-sm p-2 bg-white border rounded">{action.investigation.investigationSummary}</pre></p>}
                        {action.investigation.witnesses && action.investigation.witnesses.length > 0 && <p><strong>الشهود:</strong> {action.investigation.witnesses.join('، ')}</p>}
                        {action.investigation.evidence && action.investigation.evidence.length > 0 && <p><strong>الأدلة:</strong> {action.investigation.evidence.join('، ')}</p>}
                    </Card>
                )}

                {action.legalOpinionNotes && (
                    <Card title="الرأي القانوني والملاحظات القانونية" className="bg-yellow-50 border-yellow-200" titleClassName="text-sm text-yellow-800">
                        <pre className="whitespace-pre-wrap font-sans text-sm p-2 bg-white border rounded">{action.legalOpinionNotes}</pre>
                    </Card>
                )}

                <Card title="الجزاء المتخذ والحالة" className="bg-gray-50" titleClassName="text-sm">
                    <p><strong>الجزاء:</strong> {action.actionTaken ? disciplinaryPenaltyKuwaitOptions.find(p=>p.value === action.actionTaken)?.label : 'لم يحدد بعد'}</p>
                    {action.penaltyDetails && <p><strong>تفاصيل الجزاء:</strong> {action.penaltyDetails}</p>}
                    <p><strong>تاريخ سريان الجزاء:</strong> {formatDate(action.actionEffectiveDate)}</p>
                    <p><strong>حالة الإجراء:</strong> <DisciplinaryActionStatusBadge status={action.status} size="sm"/></p>
                </Card>
                
                {action.notes && <Card title="ملاحظات عامة" className="bg-gray-50" titleClassName="text-sm"><pre className="whitespace-pre-wrap font-sans text-sm p-2 bg-white border rounded">{action.notes}</pre></Card>}
                <p className="text-xs text-gray-400 text-center pt-2">تاريخ الإنشاء: {formatDate(action.createdAt)} | آخر تحديث: {formatDate(action.updatedAt)}</p>
            </div>
        </Modal>
    );
};


const DisciplinaryActionsPage: React.FC = () => {
  const [actions, setActions] = useState<DisciplinaryAction[]>(initialDisciplinaryActions);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<DisciplinaryActionStatus | ''>('');
  const [filterViolationType, setFilterViolationType] = useState<ViolationTypeKuwait | ''>('');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<Partial<DisciplinaryAction> | null>(null);
  const [viewingAction, setViewingAction] = useState<DisciplinaryAction | null>(null);

  const filteredActions = useMemo(() => {
    return actions.filter(action =>
      (action.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (action.violationDetails && action.violationDetails.toLowerCase().includes(searchTerm.toLowerCase()))
      ) &&
      (filterStatus ? action.status === filterStatus : true) &&
      (filterViolationType ? action.violationType === filterViolationType : true)
    ).sort((a,b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime());
  }, [actions, searchTerm, filterStatus, filterViolationType]);
  
  const handleAddAction = () => {
    setEditingAction(null);
    setIsFormModalOpen(true);
  };

  const handleEditAction = (action: DisciplinaryAction) => {
    setEditingAction(action);
    setIsFormModalOpen(true);
  };

  const handleViewAction = (action: DisciplinaryAction) => {
    setViewingAction(action);
  };
  
  const handleDeleteAction = useCallback((actionId: string) => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف هذا الإجراء التأديبي؟')) {
        setActions(prev => prev.filter(a => a.id !== actionId));
    }
  }, []);

  const handleFormSubmit = (data: DisciplinaryAction) => {
    let updatedActions;
    if (editingAction && editingAction.id) {
      updatedActions = actions.map(a => a.id === editingAction.id ? { ...data, id: a.id, createdAt: a.createdAt } : a);
    } else {
      updatedActions = [{ ...data, id: `da-${Date.now()}` }, ...actions];
    }
    setActions(updatedActions);
    setIsFormModalOpen(false);
    setEditingAction(null);
  };
  
  const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleDateString('ar-EG') : '-';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
            <ExclamationTriangleIcon className="w-8 h-8 text-primary me-3" />
            <h1 className="text-3xl font-bold text-primary-dark">التحقيقات والإجراءات التأديبية</h1>
        </div>
        <Button onClick={handleAddAction} leftIcon={<PlusCircleIcon className="w-5 h-5" />}>
            إضافة إجراء تأديبي
        </Button>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start">
            <InformationCircleIcon className="w-6 h-6 text-blue-600 me-3 mt-1 flex-shrink-0" />
            <div>
                <h3 className="text-md font-semibold text-blue-700 mb-1">توثيق التحقيقات والإجراءات التأديبية</h3>
                <p className="text-sm text-blue-600 leading-relaxed">
                    تهدف هذه الوحدة إلى توثيق ومتابعة كافة التحقيقات والمخالفات والإجراءات التأديبية المتخذة بحق الموظفين. 
                    من الضروري الالتزام بالإجراءات القانونية الصحيحة المنصوص عليها في <strong>قانون العمل الكويتي رقم 6 لسنة 2010</strong> ولائحة الجزاءات المعتمدة في الشركة لضمان سلامة الإجراءات وحفظ حقوق جميع الأطراف.
                    <br/>
                    يشمل ذلك توثيق تفاصيل التحقيق (المحقق، التواريخ، الملخص، الشهود، الأدلة) والرأي القانوني قبل اتخاذ أي جزاء.
                </p>
            </div>
        </div>
      </Card>
      
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <Input placeholder="ابحث بالاسم أو تفاصيل المخالفة..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} containerClassName="mb-0"/>
            <Select label="تصفية بالحالة" options={[{value: '', label: 'الكل'}, ...disciplinaryActionStatusOptions]} value={filterStatus} onChange={e => setFilterStatus(e.target.value as DisciplinaryActionStatus | '')} containerClassName="mb-0"/>
            <Select label="تصفية بنوع المخالفة" options={[{value: '', label: 'الكل'}, ...violationTypeKuwaitOptions]} value={filterViolationType} onChange={e => setFilterViolationType(e.target.value as ViolationTypeKuwait | '')} containerClassName="mb-0"/>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-100">
                    <tr>
                        {['الموظف', 'نوع المخالفة', 'تاريخ المخالفة', 'الجزاء المتخذ', 'الحالة', 'إجراءات'].map(h=><th key={h} className="px-3 py-3 text-right font-medium">{h}</th>)}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {filteredActions.map(action => (
                        <tr key={action.id} className="hover:bg-primary-light/5">
                            <td className="px-3 py-2 whitespace-nowrap font-medium">{action.employeeName}</td>
                            <td className="px-3 py-2 whitespace-nowrap">{action.violationType}</td>
                            <td className="px-3 py-2 whitespace-nowrap">{formatDate(action.violationDate)}</td>
                            <td className="px-3 py-2 whitespace-nowrap">{action.actionTaken ? disciplinaryPenaltyKuwaitOptions.find(p=>p.value===action.actionTaken)?.label : '-'}</td>
                            <td className="px-3 py-2 whitespace-nowrap"><DisciplinaryActionStatusBadge status={action.status}/></td>
                            <td className="px-3 py-2 whitespace-nowrap space-x-1 space-x-reverse">
                                <Button variant="ghost" size="sm" onClick={() => handleViewAction(action)} title="عرض التفاصيل"><EyeIcon className="w-4 h-4 text-primary" /></Button>
                                <Button variant="ghost" size="sm" onClick={() => handleEditAction(action)} title="تعديل"><PencilIcon className="w-4 h-4 text-yellow-600" /></Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteAction(action.id)} className="text-danger hover:text-red-700" title="حذف"><TrashIcon className="w-4 h-4" /></Button>
                            </td>
                        </tr>
                    ))}
                    {filteredActions.length === 0 && (
                        <tr><td colSpan={6} className="text-center py-10 text-gray-500"><FolderIcon className="w-12 h-12 mx-auto mb-2 text-gray-400"/>لا توجد إجراءات تطابق بحثك.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      </Card>

      <Modal isOpen={isFormModalOpen} onClose={() => { setIsFormModalOpen(false); setEditingAction(null);}} title={editingAction?.id ? `تعديل إجراء تأديبي: ${editingAction.employeeName}` : "إضافة إجراء تأديبي جديد"} size="xl">
          <DisciplinaryActionForm initialData={editingAction} onSubmit={handleFormSubmit} onCancel={() => { setIsFormModalOpen(false); setEditingAction(null); }} employees={mockEmployees} />
      </Modal>
      
      <DisciplinaryActionsDetailsModal action={viewingAction} onClose={() => setViewingAction(null)} />
      
      <Card title="ملاحظات قانونية عامة (أمثلة من قانون العمل الكويتي رقم 6 لسنة 2010 للقطاع الأهلي)" className="border-t-2 border-primary-light">
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            <li><strong>المادة 26 (التحقيق قبل الجزاء):</strong> "لا يجوز توقيع جزاء على العامل إلا بعد إبلاغه كتابة بما هو منسوب إليه وسماع أقواله وتحقيق دفاعه وإثبات ذلك في محضر يودع بملفه الخاص. ويجب إبلاغ العامل كتابة بما وقع عليه من جزاءات ونوعها ومقدارها وأسباب توقيعها والعقوبة التي سيتعرض لها في حالة العودة." هذا هو جوهر "التحقيق" من منظور حقوق العامل وضمانات الدفاع.</li>
             <li><strong>أهمية التحقيق:</strong> يجب أن يكون التحقيق عادلاً وموضوعياً، وأن يتم توثيق جميع إجراءاته ونتائجه بدقة، بما في ذلك أقوال الشهود والأدلة المقدمة.</li>
            <li><strong>المادة 25 (الجزاءات التأديبية):</strong> تحدد الجزاءات التي يجوز لصاحب العمل توقيعها على العامل، مثل التنبيه، الإنذار، الخصم من الأجر، الإيقاف عن العمل، والفصل.</li>
            <li><strong>المادة 41 (فصل العامل بدون إنذار أو تعويض أو مكافأة):</strong> تحدد الحالات التي يجوز فيها فصل العامل دون إنذار أو تعويض أو مكافأة (مثل ارتكاب العامل خطأ نشأت عنه خسارة جسيمة، أو إذا أفشى أسرار المنشأة).</li>
            <li><strong>لائحة الجزاءات (المادة 28):</strong> يجب على صاحب العمل الذي يستخدم عشرة عمال فأكثر أن يضع في مكان ظاهر بالمنشأة لائحة بالجزاءات والمخالفات معتمدة من الوزارة المختصة. ويجب أن يتناسب الجزاء مع المخالفة.</li>
        </ul>
        <p className="text-xs text-gray-500 mt-2">هذه مجرد أمثلة، ويجب دائمًا الرجوع للنصوص القانونية الكاملة واستشارة متخصص عند التعامل مع حالات تأديبية فعلية.</p>
      </Card>

    </div>
  );
};

export default DisciplinaryActionsPage;