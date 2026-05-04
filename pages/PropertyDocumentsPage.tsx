
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import { 
    FolderIcon, PlusCircleIcon, EyeIcon, PencilIcon, TrashIcon, 
    InformationCircleIcon, PaperClipIcon, ArrowRightIcon 
} from '../constants';
import { 
    PropertyDocument, PropertyDocumentType, Property, 
    PropertyUnit, PropertyUnitStatus, PropertyType, Case
} from '../types';
import { mockProperties, mockPropertyDocuments } from '../data/propertyData';
import { initialCases as mockCases } from '../data/caseData';
import { propertyDocumentTypeOptions } from '../constants';
import { Badge } from '../components/ui/Badge';
import { Link } from 'react-router-dom';
import { BuildingLibraryIcon } from '../constants';

// Use central mock data
const mockPropertiesForDocManagement = mockProperties;
const mockPropertyDocumentsData = mockPropertyDocuments;

const formatDate = (dateString?: string): string => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) { return dateString; }
};

interface PropertyDocumentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (document: PropertyDocument) => void;
  initialData?: Partial<PropertyDocument> | null;
  properties: Array<Pick<Property, 'id' | 'name' | 'type' | 'units'>>;
  cases: Case[];
}

const PropertyDocumentFormModal: React.FC<PropertyDocumentFormModalProps> = ({ isOpen, onClose, onSubmit, initialData, properties, cases }) => {
  const getInitialFormData = useCallback((): Partial<PropertyDocument> => {
    return initialData || {
      propertyId: properties.length > 0 ? properties[0].id : '',
      documentName: '',
      documentType: PropertyDocumentType.OTHER,
      uploadedBy: 'مستخدم النظام', // Default uploader
      uploadedAt: new Date().toISOString().split('T')[0],
      tags: [],
      relatedCaseIds: [],
    };
  }, [initialData, properties]);

  const [formData, setFormData] = useState<Partial<PropertyDocument>>(getInitialFormData);
  const [availableUnits, setAvailableUnits] = useState<PropertyUnit[]>([]);

  useEffect(() => {
    if (isOpen) {
      const currentData = getInitialFormData();
      setFormData(currentData);
      if (currentData.propertyId) {
        const selectedProp = properties.find(p => p.id === currentData.propertyId);
        if (selectedProp?.type === PropertyType.BUILDING) {
            setAvailableUnits(selectedProp.units || []);
        } else {
            setAvailableUnits([]);
        }
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
      updatedFormData.unitId = undefined; // Reset unit when property changes
      if (selectedProp?.type === PropertyType.BUILDING) {
        setAvailableUnits(selectedProp.units || []);
      } else {
        setAvailableUnits([]);
      }
    }
    setFormData(updatedFormData);
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) }));
  };

  const handleCaseChange = (caseId: string) => {
    const currentIds = formData.relatedCaseIds || [];
    if (currentIds.includes(caseId)) {
        setFormData(prev => ({ ...prev, relatedCaseIds: currentIds.filter(id => id !== caseId) }));
    } else {
        setFormData(prev => ({ ...prev, relatedCaseIds: [...currentIds, caseId] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.documentName || !formData.propertyId || !formData.documentType) {
      alert("يرجى ملء الحقول الإلزامية: اسم المستند، العقار المرتبط، ونوع المستند.");
      return;
    }
    onSubmit({ ...formData, uploadedAt: formData.uploadedAt || new Date().toISOString().split('T')[0] } as PropertyDocument);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData?.id ? 'تعديل مستند عقار' : 'إضافة مستند عقار جديد'} size="xl">
      <form onSubmit={handleSubmit} className="space-y-3 max-h-[75vh] overflow-y-auto p-1 scrollbar-thin">
        <Input name="documentName" label="اسم المستند (*)" value={formData.documentName || ''} onChange={handleChange} required />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Select label="العقار المرتبط (*)" name="propertyId" value={formData.propertyId || ''} options={properties.map(p => ({ value: p.id, label: p.name }))} onChange={handleChange} required placeholder="اختر العقار"/>
          {properties.find(p=>p.id === formData.propertyId)?.type === PropertyType.BUILDING && availableUnits.length > 0 && (
             <Select label="الوحدة (إن وجدت)" name="unitId" value={formData.unitId || ''} options={[{value: '', label:'عام للعقار/لا يوجد'}, ...availableUnits.map(u => ({value: u.id, label: u.unitNumber}))]} onChange={handleChange} />
          )}
        </div>
        <Select label="نوع المستند (*)" name="documentType" value={formData.documentType} options={propertyDocumentTypeOptions} onChange={handleChange} required />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input name="issueDate" label="تاريخ الإصدار (إن وجد)" type="date" value={formData.issueDate || ''} onChange={handleChange} />
          <Input name="expiryDate" label="تاريخ الانتهاء (إن وجد)" type="date" value={formData.expiryDate || ''} onChange={handleChange} />
        </div>
        <Input name="referenceNumber" label="الرقم المرجعي للمستند (إن وجد)" value={formData.referenceNumber || ''} onChange={handleChange} />
        <Input name="filePathOrLink" label="مسار الملف أو الرابط (محاكاة)" type="text" value={formData.filePathOrLink || ''} onChange={handleChange} placeholder="مثال: /uploads/deed.pdf أو https://example.com/doc" />
        <TextArea name="description" label="وصف المستند" value={formData.description || ''} onChange={handleChange} rows={2} />
        <Input name="tags" label="الكلمات المفتاحية (يفصل بينها بفاصلة)" value={formData.tags?.join(', ') || ''} onChange={handleTagsChange} />
        
        <div className="space-y-2 border-t pt-3 mt-3">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center">
            <BuildingLibraryIcon className="w-4 h-4 me-1 text-primary" />
            القضايا القانونية المرتبطة (نظام عدالة)
          </label>
          <p className="text-xs text-gray-500 mb-2">اختر القضايا التي تود ربط هذا المستند بها للوصول السريع:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border rounded bg-gray-50 dark:bg-gray-800 scrollbar-thin">
            {cases.map(c => (
                <label key={c.id} className="flex items-center space-x-2 space-x-reverse cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded transition-colors">
                    <input 
                        type="checkbox" 
                        checked={formData.relatedCaseIds?.includes(c.id)} 
                        onChange={() => handleCaseChange(c.id)}
                        className="rounded text-primary focus:ring-primary h-4 w-4"
                    />
                    <div className="flex flex-col">
                        <span className="text-xs font-medium truncate w-48" title={c.title}>{c.title}</span>
                        <span className="text-[10px] text-gray-400">{c.caseNumber}</span>
                    </div>
                </label>
            ))}
          </div>
        </div>

        <Input name="uploadedBy" label="تم الرفع بواسطة" value={formData.uploadedBy || 'مستخدم النظام'} onChange={handleChange} required />
        
        <div className="flex justify-end space-x-2 space-x-reverse pt-2">
          <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
          <Button type="submit">{initialData?.id ? 'حفظ التعديلات' : 'إضافة المستند'}</Button>
        </div>
      </form>
    </Modal>
  );
};

interface ViewPropertyDocumentModalProps {
  document: PropertyDocument | null;
  onClose: () => void;
  properties: Array<Pick<Property, 'id' | 'name' | 'units'>>;
  cases: Case[];
}
const ViewPropertyDocumentModal: React.FC<ViewPropertyDocumentModalProps> = ({ document: doc, onClose, properties, cases }) => {
  if (!doc) return null;
  const property = properties.find(p => p.id === doc.propertyId);
  const unit = property?.units?.find(u => u.id === doc.unitId);
  
  const relatedCases = cases.filter(c => doc.relatedCaseIds?.includes(c.id));

  return (
    <Modal isOpen={!!doc} onClose={onClose} title={`تفاصيل مستند: ${doc.documentName}`} size="lg">
      <div className="space-y-2 p-2 text-sm max-h-[70vh] overflow-y-auto scrollbar-thin">
        <p><strong>العقار المرتبط:</strong> {property?.name || 'غير معروف'} {unit ? ` / وحدة: ${unit.unitNumber}` : ''}</p>
        <p><strong>نوع المستند:</strong> {doc.documentType}</p>
        {doc.referenceNumber && <p><strong>الرقم المرجعي:</strong> {doc.referenceNumber}</p>}
        <p><strong>تاريخ الإصدار:</strong> {formatDate(doc.issueDate)}</p>
        <p><strong>تاريخ الانتهاء:</strong> {formatDate(doc.expiryDate)}</p>
        {doc.filePathOrLink && <p><strong>المسار/الرابط:</strong> <a href={doc.filePathOrLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">{doc.filePathOrLink}</a></p>}
        {doc.description && <p><strong>الوصف:</strong> <pre className="whitespace-pre-wrap font-sans text-xs p-1 bg-gray-100 border rounded">{doc.description}</pre></p>}
        {doc.tags && doc.tags.length > 0 && <p><strong>الكلمات المفتاحية:</strong> {doc.tags.map(tag => <Badge key={tag} text={tag} color="gray" size="xs" className="me-1"/>)}</p>}
        
        {relatedCases.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-bold text-blue-800 dark:text-blue-300 text-xs mb-2 flex items-center">
                    <BuildingLibraryIcon className="w-4 h-4 me-1" />
                    قضايا مرتبطة في نظام عدالة
                </h4>
                <div className="space-y-2">
                    {relatedCases.map(c => (
                        <div key={c.id} className="flex justify-between items-center bg-white dark:bg-dm-card p-2 rounded shadow-sm">
                            <div>
                                <p className="text-xs font-bold">{c.title}</p>
                                <p className="text-[10px] text-gray-500">{c.caseNumber}</p>
                            </div>
                            <Link to="/legal-representation" state={{ caseId: c.id }}>
                                <Button variant="ghost" size="sm" className="h-7 text-[10px]" leftIcon={<EyeIcon className="w-3" />}>فتح القضية</Button>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        )}

        <hr className="my-2"/>
        <p><strong>تم الرفع بواسطة:</strong> {doc.uploadedBy}</p>
        <p><strong>تاريخ الرفع:</strong> {formatDate(doc.uploadedAt)}</p>
      </div>
    </Modal>
  );
};


const PropertyDocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<PropertyDocument[]>(mockPropertyDocumentsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDocumentType, setFilterDocumentType] = useState<PropertyDocumentType | ''>('');
  const [filterPropertyId, setFilterPropertyId] = useState<string>('');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Partial<PropertyDocument> | null>(null);
  const [viewingDocument, setViewingDocument] = useState<PropertyDocument | null>(null);

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc =>
      (doc.documentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
       (doc.referenceNumber && doc.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
       (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) ||
       (mockPropertiesForDocManagement.find(p=>p.id === doc.propertyId)?.name.toLowerCase().includes(searchTerm.toLowerCase()))
      ) &&
      (filterDocumentType ? doc.documentType === filterDocumentType : true) &&
      (filterPropertyId ? doc.propertyId === filterPropertyId : true)
    ).sort((a,b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }, [documents, searchTerm, filterDocumentType, filterPropertyId]);

  const handleAddDocument = () => { setEditingDocument(null); setIsFormModalOpen(true); };
  const handleEditDocument = (doc: PropertyDocument) => { setEditingDocument(doc); setIsFormModalOpen(true); };
  const handleViewDocument = (doc: PropertyDocument) => setViewingDocument(doc);
  const handleDeleteDocument = useCallback((id: string) => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف هذا المستند؟')) {
      setDocuments(prev => prev.filter(d => d.id !== id));
    }
  }, []);

  const handleFormSubmit = (data: PropertyDocument) => {
    if (editingDocument?.id) {
      setDocuments(prev => prev.map(d => (d.id === editingDocument.id ? data : d)));
    } else {
      setDocuments(prev => [{ ...data, id: `doc-${Date.now()}` }, ...prev]);
    }
    setIsFormModalOpen(false); setEditingDocument(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <Link to="/property-management" className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full me-4 transition-colors">
              <ArrowRightIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <FolderIcon className="w-8 h-8 text-primary me-3" />
          <h1 className="text-3xl font-bold text-primary-dark dark:text-primary-light">إدارة مستندات العقارات</h1>
        </div>
        <Button onClick={handleAddDocument} leftIcon={<PlusCircleIcon className="w-5 h-5" />}>إضافة مستند جديد</Button>
      </div>
      <Card className="bg-blue-50 dark:bg-dm-card/30 border-blue-200 dark:border-blue-700/50">
        <div className="flex items-start">
            <InformationCircleIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 me-3 mt-1 flex-shrink-0" />
            <p className="text-sm text-blue-700 dark:text-blue-400 leading-relaxed">
                أرشفة وتنظيم وثائقك العقارية الهامة (وثائق ملكية، مخططات، رخص، عقود صيانة، صور، إلخ).
            </p>
        </div>
      </Card>
      <Card>
        <div className="p-3 bg-gray-50 rounded-md mb-4">
            <Input placeholder="ابحث بالاسم، الوصف، الرقم المرجعي، الكلمات المفتاحية، اسم العقار..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} containerClassName="mb-3"/>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Select label="نوع المستند" options={[{value:'', label:'الكل'}, ...propertyDocumentTypeOptions]} value={filterDocumentType} onChange={e => setFilterDocumentType(e.target.value as PropertyDocumentType | '')} containerClassName="mb-0"/>
                <Select label="العقار" options={[{value:'', label:'الكل'}, ...mockPropertiesForDocManagement.map(p=>({value:p.id, label:p.name}))]} value={filterPropertyId} onChange={e => setFilterPropertyId(e.target.value)} containerClassName="mb-0"/>
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-xs">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 py-2 text-right font-medium">اسم المستند</th>
                <th className="px-2 py-2 text-right font-medium">النوع</th>
                <th className="px-2 py-2 text-right font-medium">العقار/الوحدة</th>
                <th className="px-2 py-2 text-right font-medium">القضايا المرتبطة</th>
                <th className="px-2 py-2 text-right font-medium">تاريخ الإصدار</th>
                <th className="px-2 py-2 text-right font-medium">تاريخ الانتهاء</th>
                <th className="px-2 py-2 text-right font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map(doc => {
                const prop = mockPropertiesForDocManagement.find(p => p.id === doc.propertyId);
                const unit = prop?.units?.find(u => u.id === doc.unitId);
                const linkedCaseCount = doc.relatedCaseIds?.length || 0;
                return (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-2 py-1.5 font-medium max-w-xs truncate" title={doc.documentName}>{doc.documentName}</td>
                    <td className="px-2 py-1.5">{doc.documentType}</td>
                    <td className="px-2 py-1.5">{prop?.name || '-'}{unit ? ` / ${unit.unitNumber}` : ''}</td>
                    <td className="px-2 py-1.5">
                      {linkedCaseCount > 0 ? (
                        <div title={mockCases.filter(c => doc.relatedCaseIds?.includes(c.id)).map(c => c.caseNumber).join(', ')}>
                          <Badge 
                            text={`${linkedCaseCount} قضية`} 
                            color="blue" 
                            size="xs" 
                            className="cursor-help"
                          />
                        </div>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-2 py-1.5">{formatDate(doc.issueDate)}</td>
                    <td className="px-2 py-1.5">{formatDate(doc.expiryDate)}</td>
                    <td className="px-2 py-1.5 space-x-1 space-x-reverse">
                      <Button variant="ghost" size="sm" onClick={() => handleViewDocument(doc)} title="عرض"><EyeIcon className="w-3.5 text-blue-600"/></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditDocument(doc)} title="تعديل"><PencilIcon className="w-3.5 text-yellow-600"/></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteDocument(doc.id)} title="حذف" className="text-danger"><TrashIcon className="w-3.5"/></Button>
                    </td>
                  </tr>
              );})}
              {filteredDocuments.length === 0 && <tr><td colSpan={6} className="text-center py-5 text-gray-500"><FolderIcon className="w-10 h-10 mx-auto mb-1"/>لا توجد مستندات تطابق البحث.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
      <PropertyDocumentFormModal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} onSubmit={handleFormSubmit} initialData={editingDocument} properties={mockPropertiesForDocManagement} cases={mockCases} />
      <ViewPropertyDocumentModal document={viewingDocument} onClose={() => setViewingDocument(null)} properties={mockPropertiesForDocManagement} cases={mockCases} />
    </div>
  );
};

export default PropertyDocumentsPage;
