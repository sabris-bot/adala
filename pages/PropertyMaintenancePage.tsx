
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { 
    MaintenanceRequest, MaintenanceCategory, MaintenancePriority, 
    MaintenanceStatus, RequestAttachment, Property, PropertyUnitStatus, 
    PropertyType, PropertyUnit 
} from '../types';
import { mockProperties, mockMaintenanceRequests } from '../data/propertyData';
import { 
    WrenchScrewdriverIcon, PlusCircleIcon, EyeIcon, PencilIcon, TrashIcon, 
    FolderIcon, InformationCircleIcon, PaperClipIcon, ArrowRightIcon
} from '../constants';
import { 
    maintenanceCategoryOptions, maintenancePriorityOptions, 
    maintenanceStatusOptions 
} from '../constants';
import { Badge, BadgeColor } from '../components/ui/Badge';
import { Link } from 'react-router-dom';

// Use central mock properties
const mockPropertiesForMaintenance = mockProperties;

const getStatusBadgeColor = (status: MaintenanceStatus): BadgeColor => {
    switch(status) {
        case MaintenanceStatus.COMPLETED_CLOSED: return 'green';
        case MaintenanceStatus.COMPLETED_PENDING_REVIEW: return 'teal';
        case MaintenanceStatus.PENDING_APPROVAL: case MaintenanceStatus.APPROVED_PENDING_ASSIGNMENT: return 'yellow';
        case MaintenanceStatus.ASSIGNED_TO_VENDOR: case MaintenanceStatus.IN_PROGRESS: return 'blue';
        case MaintenanceStatus.ON_HOLD_PARTS_NEEDED: case MaintenanceStatus.ON_HOLD_TENANT_UNAVAILABLE: return 'orange';
        case MaintenanceStatus.CANCELLED: case MaintenanceStatus.REJECTED: return 'red';
        default: return 'gray';
    }
};

const MaintenanceStatusBadge: React.FC<{ status: MaintenanceStatus, size?: 'xs' | 'sm' }> = ({ status, size = 'xs' }) => (
    <Badge text={status} color={getStatusBadgeColor(status)} size={size} />
);

const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  try { return new Date(dateString).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }); } 
  catch(e) { return dateString; }
};
const formatCurrency = (amount?: number) => amount !== undefined ? `${amount.toFixed(3)} د.ك` : '-';


interface MaintenanceRequestFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: MaintenanceRequest) => void;
  initialData?: Partial<MaintenanceRequest> | null;
  properties: Array<Pick<Property, 'id' | 'name' | 'units' | 'type'>>; // Added 'type'
}

const MaintenanceRequestFormModal: React.FC<MaintenanceRequestFormModalProps> = ({ isOpen, onClose, onSubmit, initialData, properties }) => {
    const { addToast } = useToast();
    const getInitialFormData = useCallback((): Partial<MaintenanceRequest> => {
        const defaultProperty = properties.length > 0 ? properties[0] : undefined;
        return initialData || {
            propertyId: defaultProperty?.id || '',
            propertyName: defaultProperty?.name || '',
            unitId: undefined,
            propertyUnitName: undefined,
            requestDate: new Date().toISOString().split('T')[0],
            priority: MaintenancePriority.MEDIUM,
            status: MaintenanceStatus.PENDING_APPROVAL,
            attachments: [],
            createdAt: new Date().toISOString().split('T')[0],
        };
    }, [initialData, properties]);

    const [formData, setFormData] = useState<Partial<MaintenanceRequest>>(getInitialFormData);
    const [availableUnits, setAvailableUnits] = useState<PropertyUnit[]>([]);

    useEffect(() => {
        if (isOpen) {
             const currentData = getInitialFormData();
             setFormData(currentData);
             if (currentData.propertyId) {
                 const selectedProp = properties.find(p => p.id === currentData.propertyId);
                 setAvailableUnits(selectedProp?.units || []);
             } else {
                 setAvailableUnits([]);
             }
        }
    }, [isOpen, getInitialFormData, properties]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        let updatedFormData = { ...formData, [name]: value };

        if (name === "propertyId") {
            const selectedProp = properties.find(p => p.id === value);
            updatedFormData.propertyName = selectedProp?.name || '';
            updatedFormData.unitId = undefined; // Reset unit when property changes
            updatedFormData.propertyUnitName = undefined;
            setAvailableUnits(selectedProp?.units || []);
        }
        if (name === "unitId") {
            const selectedUnit = availableUnits?.find(u => u.id === value);
            updatedFormData.propertyUnitName = selectedUnit?.unitNumber || '';
        }
        
        setFormData(updatedFormData);
    };
    
    const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.value.split(',').map(f => f.trim()).filter(f => f);
        const attachments: RequestAttachment[] = files.map((file, index) => ({
            id: `att-${Date.now()}-${index}`,
            name: file,
            uploadedAt: new Date().toISOString()
        }));
        setFormData(prev => ({...prev, attachments }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.propertyId || !formData.reportedBy || !formData.requestDate || !formData.description || !formData.category) {
            addToast({
                type: 'warning',
                title: 'بيانات ناقصة',
                message: 'يرجى ملء الحقول الإلزامية: العقار، المُبلغ، تاريخ الطلب، الوصف، وفئة الصيانة.'
            });
            return;
        }
        onSubmit({ ...formData, updatedAt: new Date().toISOString() } as MaintenanceRequest);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData?.id ? "تعديل طلب صيانة" : "إضافة طلب صيانة جديد"} size="xl">
            <form onSubmit={handleSubmit} className="space-y-3 max-h-[75vh] overflow-y-auto p-1 scrollbar-thin">
                <Card title="معلومات الطلب الأساسية" titleClassName="text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Select label="العقار (*)" name="propertyId" value={formData.propertyId || ''} options={properties.map(p=>({value:p.id, label:p.name}))} onChange={handleChange} required placeholder="اختر العقار"/>
                        {properties.find(p=>p.id === formData.propertyId)?.type === PropertyType.BUILDING && availableUnits && availableUnits.length > 0 && ( // Check type too
                            <Select label="الوحدة (إن وجدت)" name="unitId" value={formData.unitId || ''} options={[{value:'', label:'لا يوجد / عام للعقار'}, ...availableUnits.map(u=>({value:u.id, label:u.unitNumber}))]} onChange={handleChange} />
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                        <Input label="المُبلِّغ عن المشكلة (*)" name="reportedBy" value={formData.reportedBy || ''} onChange={handleChange} required/>
                        <Input label="معلومات الاتصال بالمُبلِّغ" name="reporterContact" value={formData.reporterContact || ''} onChange={handleChange} placeholder="هاتف أو بريد إلكتروني"/>
                        <Input label="تاريخ الطلب (*)" name="requestDate" type="date" value={formData.requestDate} onChange={handleChange} required />
                    </div>
                    <TextArea label="وصف المشكلة / تفاصيل الطلب (*)" name="description" value={formData.description || ''} onChange={handleChange} required rows={3}/>
                </Card>
                <Card title="تصنيف وتفاصيل الصيانة" titleClassName="text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Select label="فئة الصيانة (*)" name="category" value={formData.category} options={maintenanceCategoryOptions} onChange={handleChange} required />
                        <Select label="أولوية الطلب" name="priority" value={formData.priority} options={maintenancePriorityOptions} onChange={handleChange} />
                        <Select label="حالة الطلب" name="status" value={formData.status} options={maintenanceStatusOptions} onChange={handleChange} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                        <Input label="المقاول/الفني المسند إليه" name="assignedToVendorName" value={formData.assignedToVendorName || ''} onChange={handleChange} />
                        <Input label="التكلفة التقديرية (د.ك)" name="estimatedCost" type="number" value={String(formData.estimatedCost || '')} onChange={handleChange} step="0.001"/>
                        <Input label="التكلفة الفعلية (د.ك)" name="cost" type="number" value={String(formData.cost || '')} onChange={handleChange} step="0.001"/>
                    </div>
                     <Input label="رقم الفاتورة (إن وجدت)" name="invoiceNumber" value={formData.invoiceNumber || ''} onChange={handleChange} />
                </Card>
                <Card title="التواريخ والملاحظات والمرفقات" titleClassName="text-sm">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input label="تاريخ جدولة العمل" name="scheduledDate" type="date" value={formData.scheduledDate || ''} onChange={handleChange} />
                        <Input label="تاريخ الإنجاز الفعلي" name="completionDate" type="date" value={formData.completionDate || ''} onChange={handleChange} />
                    </div>
                    <TextArea label="ملاحظات عامة على الطلب" name="notes" value={formData.notes || ''} onChange={handleChange} rows={2} />
                    <TextArea label="ملاحظات الإنجاز (عند الإغلاق)" name="completionNotes" value={formData.completionNotes || ''} onChange={handleChange} rows={2} />
                    <Input label="أسماء المرفقات (يفصل بينها بفاصلة)" name="attachmentInput" type="text" onChange={(e) => handleAttachmentChange(e)} placeholder="فاتورة.pdf, صور المشكلة.jpg"/>
                </Card>
                <div className="flex justify-end space-x-2 space-x-reverse pt-2">
                    <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
                    <Button type="submit">{initialData?.id ? 'حفظ التعديلات' : 'إضافة طلب'}</Button>
                </div>
            </form>
        </Modal>
    );
};

const ViewMaintenanceRequestModal: React.FC<{ request: MaintenanceRequest | null; onClose: () => void; }> = ({ request, onClose }) => {
    if (!request) return null;
    return (
        <Modal isOpen={!!request} onClose={onClose} title={`تفاصيل طلب صيانة: ${request.propertyName} ${request.propertyUnitName ? `/ ${request.propertyUnitName}` : ''}`} size="lg">
            <div className="space-y-3 p-2 max-h-[70vh] overflow-y-auto scrollbar-thin">
                <p><strong>العقار/الوحدة:</strong> {request.propertyName} {request.propertyUnitName ? `/ ${request.propertyUnitName}` : ''}</p>
                <p><strong>المُبلِّغ:</strong> {request.reportedBy} ({request.reporterContact || 'لا يوجد اتصال'})</p>
                <p><strong>تاريخ الطلب:</strong> {formatDate(request.requestDate)}</p>
                <div className="mb-2"><strong>الوصف:</strong> <pre className="whitespace-pre-wrap font-sans text-xs p-1 bg-gray-100 border rounded mt-1">{request.description}</pre></div>
                <p><strong>الفئة:</strong> {request.category} | <strong>الأولوية:</strong> {request.priority} | <strong>الحالة:</strong> <MaintenanceStatusBadge status={request.status} size="sm"/></p>
                <p><strong>المقاول/الفني:</strong> {request.assignedToVendorName || '-'}</p>
                <p><strong>تاريخ الجدولة:</strong> {formatDate(request.scheduledDate)} | <strong>تاريخ الإنجاز:</strong> {formatDate(request.completionDate)}</p>
                <p><strong>التكلفة التقديرية:</strong> {formatCurrency(request.estimatedCost)} | <strong>التكلفة الفعلية:</strong> {formatCurrency(request.cost)} {request.invoiceNumber && `(فاتورة: ${request.invoiceNumber})`}</p>
                {request.notes && <div className="mb-2"><strong>ملاحظات:</strong> <pre className="whitespace-pre-wrap font-sans text-xs p-1 bg-yellow-50 border rounded mt-1">{request.notes}</pre></div>}
                {request.completionNotes && <div className="mb-2"><strong>ملاحظات الإنجاز:</strong> <pre className="whitespace-pre-wrap font-sans text-xs p-1 bg-green-50 border rounded mt-1">{request.completionNotes}</pre></div>}
                {request.attachments && request.attachments.length > 0 && <div><strong>المرفقات:</strong> {request.attachments.map(att => att.name).join(', ')}</div>}
            </div>
        </Modal>
    );
};


const PropertyMaintenancePage: React.FC = () => {
  const [requests, setRequests] = useState<MaintenanceRequest[]>(mockMaintenanceRequests);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<MaintenanceStatus | ''>('');
  const [filterPriority, setFilterPriority] = useState<MaintenancePriority | ''>('');
  const [filterCategory, setFilterCategory] = useState<MaintenanceCategory | ''>('');
  const [filterProperty, setFilterProperty] = useState<string>('');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<Partial<MaintenanceRequest> | null>(null);
  const [viewingRequest, setViewingRequest] = useState<MaintenanceRequest | null>(null);

  const filteredRequests = useMemo(() => {
    return requests.filter(req =>
      (req.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
       req.propertyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       req.propertyUnitName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       req.reportedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (req.assignedToVendorName && req.assignedToVendorName.toLowerCase().includes(searchTerm.toLowerCase()))
      ) &&
      (filterStatus ? req.status === filterStatus : true) &&
      (filterPriority ? req.priority === filterPriority : true) &&
      (filterCategory ? req.category === filterCategory : true) &&
      (filterProperty ? req.propertyId === filterProperty : true)
    ).sort((a,b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
  }, [requests, searchTerm, filterStatus, filterPriority, filterCategory, filterProperty]);

  const handleAddRequest = () => { setEditingRequest(null); setIsFormModalOpen(true); };
  const handleEditRequest = (req: MaintenanceRequest) => { setEditingRequest(req); setIsFormModalOpen(true); };
  const handleViewRequest = (req: MaintenanceRequest) => setViewingRequest(req);
  const handleDeleteRequest = useCallback((id: string) => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف طلب الصيانة هذا؟')) {
      setRequests(prev => prev.filter(r => r.id !== id));
    }
  }, []);

  const handleFormSubmit = (data: MaintenanceRequest) => {
    if (editingRequest?.id) {
      setRequests(prev => prev.map(r => (r.id === editingRequest.id ? data : r)));
    } else {
      setRequests(prev => [{ ...data, id: `mreq-${Date.now()}` }, ...prev]);
    }
    setIsFormModalOpen(false); setEditingRequest(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
            <Link to="/property-management" className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full me-4 transition-colors">
                <ArrowRightIcon className="w-5 h-5 text-gray-600" />
            </Link>
            <WrenchScrewdriverIcon className="w-8 h-8 text-primary me-3" />
            <h1 className="text-3xl font-bold text-primary-dark">سجلات صيانة العقارات</h1>
        </div>
        <Button onClick={handleAddRequest} leftIcon={<PlusCircleIcon className="w-5 h-5" />}>إضافة طلب صيانة</Button>
      </div>
      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start">
          <InformationCircleIcon className="w-6 h-6 text-blue-600 me-3 mt-1 flex-shrink-0"/>
          <p className="text-sm text-blue-700">أدر طلبات الصيانة بكفاءة. سجل تفاصيل المشكلة، عين مقاولين، تتبع التكاليف، وحافظ على عقاراتك في أفضل حال.</p>
        </div>
      </Card>
      <Card>
        <div className="p-3 bg-gray-50 rounded-md mb-4">
            <Input placeholder="ابحث في الطلبات..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} containerClassName="mb-3"/>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Select label="العقار" options={[{value:'', label:'الكل'}, ...mockPropertiesForMaintenance.map(p=>({value:p.id, label:p.name}))]} value={filterProperty} onChange={e => setFilterProperty(e.target.value)} containerClassName="mb-0"/>
                <Select label="الفئة" options={[{value:'', label:'الكل'}, ...maintenanceCategoryOptions]} value={filterCategory} onChange={e => setFilterCategory(e.target.value as MaintenanceCategory | '')} containerClassName="mb-0"/>
                <Select label="الأولوية" options={[{value:'', label:'الكل'}, ...maintenancePriorityOptions]} value={filterPriority} onChange={e => setFilterPriority(e.target.value as MaintenancePriority | '')} containerClassName="mb-0"/>
                <Select label="الحالة" options={[{value:'', label:'الكل'}, ...maintenanceStatusOptions]} value={filterStatus} onChange={e => setFilterStatus(e.target.value as MaintenanceStatus | '')} containerClassName="mb-0"/>
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-xs">
            <thead className="bg-gray-100">
              <tr>
                {['العقار/الوحدة', 'الفئة', 'الأولوية', 'الحالة', 'المُبلغ', 'تاريخ الطلب', 'المقاول', 'التكلفة (تقدير/فعلي)', 'إجراءات'].map(h=><th key={h} className="px-2 py-2 text-right font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map(req => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-2 py-1.5 font-medium">{req.propertyName}{req.propertyUnitName ? ` / ${req.propertyUnitName}` : ''}</td>
                  <td className="px-2 py-1.5">{req.category}</td>
                  <td className="px-2 py-1.5">{req.priority}</td>
                  <td className="px-2 py-1.5"><MaintenanceStatusBadge status={req.status}/></td>
                  <td className="px-2 py-1.5">{req.reportedBy}</td>
                  <td className="px-2 py-1.5">{formatDate(req.requestDate)}</td>
                  <td className="px-2 py-1.5">{req.assignedToVendorName || '-'}</td>
                  <td className="px-2 py-1.5">{formatCurrency(req.estimatedCost)} / {formatCurrency(req.cost)}</td>
                  <td className="px-2 py-1.5 space-x-1 space-x-reverse">
                    <Button variant="ghost" size="sm" onClick={() => handleViewRequest(req)} title="عرض"><EyeIcon className="w-3.5 text-blue-600"/></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEditRequest(req)} title="تعديل"><PencilIcon className="w-3.5 text-yellow-600"/></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteRequest(req.id)} title="حذف" className="text-danger"><TrashIcon className="w-3.5"/></Button>
                  </td>
                </tr>
              ))}
              {filteredRequests.length === 0 && <tr><td colSpan={9} className="text-center py-5 text-gray-500"><FolderIcon className="w-10 h-10 mx-auto mb-1"/>لا توجد طلبات تطابق البحث.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
      <MaintenanceRequestFormModal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} onSubmit={handleFormSubmit} initialData={editingRequest} properties={mockPropertiesForMaintenance} />
      <ViewMaintenanceRequestModal request={viewingRequest} onClose={() => setViewingRequest(null)} />
    </div>
  );
};

export default PropertyMaintenancePage;
