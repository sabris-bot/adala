import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { LegalResource, LegalResourceType, LawBranch, LegalResourceStatus, CountryCode } from '../types';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { LegalResourceStatusBadge } from '../components/ui/Badge';
import { FolderIcon, PlusCircleIcon, EyeIcon, PencilIcon, TrashIcon, InformationCircleIcon, PrinterIcon } from '../constants';
import { 
    legalResourceTypeOptions, 
    lawBranchOptions, 
    legalResourceStatusOptions, 
    countryOptions,
    kuwaitIssuingAuthoritiesOptions
} from '../constants';

const mockLegalResourcesData: LegalResource[] = [
  {
    id: 'kw-law-civil-1980',
    title: 'القانون المدني الكويتي',
    type: LegalResourceType.LAW,
    documentNumber: 'المرسوم بالقانون رقم 67 لسنة 1980',
    country: 'KW',
    publishDate: '1980-08-07',
    effectiveDate: '1981-02-25',
    lawBranch: LawBranch.CIVIL,
    issuingAuthority: 'أمير الكويت (بعد موافقة مجلس الأمة)',
    resourceStatus: LegalResourceStatus.ACTIVE_AMENDED,
    keywords: ['مدني', 'عقود', 'التزامات', 'الكويت'],
    description: 'القانون الأساسي المنظم للمعاملات المدنية في دولة الكويت.',
    officialGazetteDetails: 'الكويت اليوم، العدد 1316، تاريخ 1980/08/17',
    filePathOrLink: 'رابط افتراضي للقانون المدني', // Replace with actual link if available
  },
  {
    id: 'kw-law-companies-2016',
    title: 'قانون الشركات الكويتي',
    type: LegalResourceType.LAW,
    documentNumber: 'القانون رقم 1 لسنة 2016 بإصدار قانون الشركات',
    country: 'KW',
    publishDate: '2016-01-17',
    effectiveDate: '2016-01-17', // Usually effective from publish date unless specified
    lawBranch: LawBranch.COMPANIES,
    issuingAuthority: 'مجلس الأمة الكويتي',
    resourceStatus: LegalResourceStatus.ACTIVE_AMENDED,
    keywords: ['شركات', 'تجاري', 'تأسيس شركات', 'حوكمة'],
    description: 'القانون المنظم لجميع أنواع الشركات التجارية في الكويت.',
    officialGazetteDetails: 'الكويت اليوم، العدد 1271، ملحق، تاريخ 2016/01/17',
  },
  {
    id: 'kw-law-labor-private-2010',
    title: 'قانون العمل في القطاع الأهلي الكويتي',
    type: LegalResourceType.LAW,
    documentNumber: 'القانون رقم 6 لسنة 2010',
    country: 'KW',
    publishDate: '2010-02-21',
    effectiveDate: '2010-02-21',
    lawBranch: LawBranch.LABOR,
    issuingAuthority: 'مجلس الأمة الكويتي',
    resourceStatus: LegalResourceStatus.ACTIVE_AMENDED,
    keywords: ['عمل', 'عمالي', 'حقوق العمال', 'عقود عمل'],
    description: 'قانون العمل المنظم للعلاقة بين العمال وأصحاب العمل في القطاع الخاص الكويتي.',
    officialGazetteDetails: 'الكويت اليوم، العدد 963، تاريخ 2010/02/21',
  },
  {
    id: 'kw-decree-csc-1979',
    title: 'مرسوم بشأن نظام الخدمة المدنية',
    type: LegalResourceType.DECREE,
    documentNumber: 'مرسوم بالقانون رقم 15 لسنة 1979',
    country: 'KW',
    publishDate: '1979-04-04',
    effectiveDate: '1979-04-04',
    lawBranch: LawBranch.ADMINISTRATIVE,
    issuingAuthority: 'أمير الكويت',
    resourceStatus: LegalResourceStatus.ACTIVE_AMENDED,
    keywords: ['خدمة مدنية', 'موظفين حكوميين', 'ديوان الخدمة'],
    description: 'المرسوم المنظم لشؤون الخدمة المدنية في دولة الكويت.',
  },
  {
    id: 'kw-min-decision-moci-2023-ads',
    title: 'قرار وزاري بشأن تنظيم الإعلانات التجارية',
    type: LegalResourceType.MINISTERIAL_DECISION,
    documentNumber: 'قرار رقم 50 لسنة 2023',
    country: 'KW',
    publishDate: '2023-03-15', // Assuming a publish date
    effectiveDate: '2023-03-20',
    lawBranch: LawBranch.COMMERCIAL,
    issuingAuthority: 'وزارة التجارة والصناعة',
    resourceStatus: LegalResourceStatus.ACTIVE,
    keywords: ['إعلانات', 'تجارة', 'قرار وزاري'],
    officialGazetteDetails: 'الكويت اليوم، العدد 1650، تاريخ 2023/03/19',
    description: 'قرار وزاري صادر عن وزير التجارة والصناعة بشأن تنظيم الإعلانات التجارية وضوابطها.',
  },
   {
    id: 'kw-gazette-example-1',
    title: 'نشر تعديل بعض أحكام قانون المرور - الكويت اليوم العدد 1685',
    type: LegalResourceType.OFFICIAL_GAZETTE_PUBLICATION,
    documentNumber: 'العدد 1685',
    country: 'KW',
    publishDate: '2024-05-12',
    issuingAuthority: 'الكويت اليوم (الجريدة الرسمية)',
    lawBranch: LawBranch.TRAFFIC, 
    resourceStatus: LegalResourceStatus.ACTIVE,
    keywords: ['الكويت اليوم', 'جريدة رسمية', 'قانون المرور', 'تعديل'],
    description: 'يتضمن هذا العدد من الجريدة الرسمية نشر القانون رقم X لسنة 2024 بتعديل بعض أحكام قانون المرور.',
    filePathOrLink: 'رابط افتراضي للعدد من الجريدة الرسمية'
  },
  {
    id: 'kw-cassation-judgment-2022-1',
    title: 'حكم محكمة التمييز رقم 234/2022 - تعويضات عن خطأ طبي',
    type: LegalResourceType.JUDICIAL_PRECEDENT,
    documentNumber: 'تمييز رقم 234/2022 تجاري',
    country: 'KW',
    publishDate: '2022-05-10', // Date of judgment
    lawBranch: LawBranch.CIVIL,
    issuingAuthority: 'محكمة التمييز الكويتية',
    resourceStatus: LegalResourceStatus.ACTIVE, // Judgments are active references
    keywords: ['تمييز', 'تعويض', 'خطأ طبي', 'سابقة قضائية'],
    description: 'حكم هام من محكمة التمييز يرسخ مبدأ في قضايا التعويض عن الأخطاء الطبية.',
    internalNotes: 'مبدأ هام: مسؤولية المستشفى عن أخطاء الأطباء العاملين لديها.'
  },
];

// Form Modal Component
interface LegalResourceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (resource: LegalResource) => void;
  initialData?: Partial<LegalResource> | null;
}

const LegalResourceFormModal: React.FC<LegalResourceFormModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const getInitialFormData = (): Partial<LegalResource> => {
    return initialData || {
      type: LegalResourceType.LAW,
      country: 'KW' as CountryCode, // Use 'KW'
      publishDate: new Date().toISOString().split('T')[0],
      keywords: [],
      resourceStatus: LegalResourceStatus.ACTIVE,
      relatedDocuments: [],
    };
  };

  const [formData, setFormData] = useState<Partial<LegalResource>>(getInitialFormData);


  useEffect(() => {
    if (isOpen) {
        setFormData(getInitialFormData());
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'keywords') {
      setFormData(prev => ({ ...prev, [name]: value.split(',').map(s => s.trim()).filter(s => s) }));
    } else if (name === 'country') {
      setFormData(prev => ({ ...prev, [name]: value as CountryCode }));
    }
     else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Basic handling for related documents (can be expanded to a more complex component)
  const handleRelatedDocsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const lines = e.target.value.split('\n');
      const relatedDocs = lines.map(line => {
          const parts = line.split('|'); // title|number|relationType
          return { title: parts[0]?.trim() || '', number: parts[1]?.trim(), relationType: parts[2]?.trim() || 'مرتبط بـ' };
      }).filter(doc => doc.title);
      setFormData(prev => ({ ...prev, relatedDocuments: relatedDocs }));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.type || !formData.country || !formData.publishDate) {
        alert("يرجى ملء الحقول الإلزامية: العنوان، النوع، الدولة، وتاريخ النشر.");
        return;
    }
    onSubmit(formData as LegalResource);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData?.id ? 'تعديل مصدر قانوني' : 'إضافة مصدر قانوني جديد'} size="xl">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto p-1">
        <Input name="title" label="عنوان المصدر/القانون/الحكم" value={formData.title || ''} onChange={handleChange} required />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select name="type" label="نوع المصدر" value={formData.type} options={legalResourceTypeOptions} onChange={handleChange} required />
          <Input name="documentNumber" label="رقم القانون/المرسوم/القرار" value={formData.documentNumber || ''} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select name="country" label="الدولة" value={formData.country} options={countryOptions} onChange={handleChange} required />
          <Select name="lawBranch" label="فرع القانون" value={formData.lawBranch || ''} options={[{value: '', label: 'اختر فرع القانون'}, ...lawBranchOptions]} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <Select name="issuingAuthority" label="الجهة المصدرة (خاص بالكويت)" value={formData.issuingAuthority || ''} 
             options={[{value: '', label: 'اختر الجهة المصدرة'}, ...kuwaitIssuingAuthoritiesOptions]} 
             onChange={handleChange} 
             disabled={formData.country !== 'KW'}
           />
            <Input name="officialGazetteDetails" label="تفاصيل النشر في الجريدة الرسمية" value={formData.officialGazetteDetails || ''} onChange={handleChange} placeholder="مثال: الكويت اليوم، العدد XXX، تاريخ YYYY/MM/DD"/>
        </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input name="publishDate" label="تاريخ النشر/الإصدار" type="date" value={formData.publishDate} onChange={handleChange} required />
            <Input name="effectiveDate" label="تاريخ السريان (إن وجد)" type="date" value={formData.effectiveDate || ''} onChange={handleChange} />
            <Select name="resourceStatus" label="حالة المصدر" value={formData.resourceStatus} options={legalResourceStatusOptions} onChange={handleChange} />
        </div>
        <TextArea name="description" label="وصف موجز للمصدر" value={formData.description || ''} onChange={handleChange} rows={3} />
        <Input name="keywords" label="الكلمات المفتاحية (يفصل بينها بفاصلة)" value={formData.keywords?.join(', ') || ''} onChange={handleChange} />
        <Input name="filePathOrLink" label="رابط النص الكامل أو مسار الملف (URL)" type="url" value={formData.filePathOrLink || ''} onChange={handleChange} />
        
        <TextArea 
            name="relatedDocumentsText" // Temporary name for text area
            label="المستندات ذات الصلة (كل مستند في سطر: العنوان|الرقم|نوع العلاقة)" 
            value={formData.relatedDocuments?.map(d => `${d.title}|${d.number || ''}|${d.relationType}`).join('\n') || ''} 
            onChange={handleRelatedDocsChange} 
            rows={3}
            placeholder="مثال: قانون الشركات الكويتي|1/2016|يعدل القانون\nقرار وزاري رقم 5|5/2023|مرتبط بـ"
        />
        <TextArea name="internalNotes" label="ملاحظات داخلية" value={formData.internalNotes || ''} onChange={handleChange} rows={2} />

        <div className="flex justify-end space-x-3 space-x-reverse pt-2">
          <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
          <Button type="submit" variant="primary">{initialData?.id ? 'حفظ التعديلات' : 'إضافة المصدر'}</Button>
        </div>
      </form>
    </Modal>
  );
};

// View Details Modal Component
interface ViewLegalResourceModalProps {
  resource: LegalResource | null;
  onClose: () => void;
}

const ViewLegalResourceModal: React.FC<ViewLegalResourceModalProps> = ({ resource, onClose }) => {
  if (!resource) return null;
  const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleDateString('ar-EG', { day: '2-digit', month: 'long', year: 'numeric' }) : 'غير محدد';

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={!!resource} onClose={onClose} title={`تفاصيل المصدر: ${resource.title}`} size="lg"
      footer={
        <div className="print-hide w-full flex justify-end space-x-2 space-x-reverse">
          <Button variant="outline" onClick={onClose}>إغلاق</Button>
          <Button variant="primary" onClick={handlePrint} leftIcon={<PrinterIcon className="w-4 h-4"/>}>
            طباعة
          </Button>
        </div>
      }
    >
      <div className="printable-resource-wrapper">
        <div className="resource-print-header">
            <h1 className="text-xl font-bold">{resource.title}</h1>
            <p className="text-sm">تاريخ النشر: {formatDate(resource.publishDate)} | الجهة المصدرة: {resource.issuingAuthority || '-'}</p>
        </div>
        <div className="space-y-3 p-2 max-h-[70vh] overflow-y-auto">
            <p><strong>النوع:</strong> {resource.type}</p>
            {resource.documentNumber && <p><strong>رقم المستند:</strong> {resource.documentNumber}</p>}
            <p><strong>الدولة:</strong> {countryOptions.find(c => c.value === resource.country)?.label || resource.country}</p>
            {resource.lawBranch && <p><strong>فرع القانون:</strong> {resource.lawBranch}</p>}
            {resource.issuingAuthority && <p><strong>الجهة المصدرة:</strong> {resource.issuingAuthority}</p>}
            <p><strong>تاريخ النشر/الإصدار:</strong> {formatDate(resource.publishDate)}</p>
            {resource.effectiveDate && <p><strong>تاريخ السريان:</strong> {formatDate(resource.effectiveDate)}</p>}
            {resource.resourceStatus && <p><strong>الحالة:</strong> <LegalResourceStatusBadge status={resource.resourceStatus} size="sm"/></p>}
            {resource.officialGazetteDetails && <p><strong>تفاصيل النشر بالجريدة الرسمية:</strong> {resource.officialGazetteDetails}</p>}
            {resource.description && <p><strong>الوصف:</strong> <pre className="whitespace-pre-wrap font-sans text-sm p-2 bg-gray-100 border rounded">{resource.description}</pre></p>}
            {resource.keywords && resource.keywords.length > 0 && <p><strong>كلمات مفتاحية:</strong> {resource.keywords.join(', ')}</p>}
            {resource.filePathOrLink && (
                <p><strong>النص الكامل/المسار:</strong> <a href={resource.filePathOrLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">اضغط هنا للاطلاع أو التحميل</a></p>
            )}
            {resource.relatedDocuments && resource.relatedDocuments.length > 0 && (
                <div>
                    <strong>مستندات ذات صلة:</strong>
                    <ul className="list-disc ps-6 text-sm">
                        {resource.relatedDocuments.map((doc, idx) => (
                            <li key={idx}>{doc.title} {doc.number && `(${doc.number})`} - {doc.relationType}</li>
                        ))}
                    </ul>
                </div>
            )}
            {resource.internalNotes && <p><strong>ملاحظات داخلية:</strong> <pre className="whitespace-pre-wrap font-sans text-sm p-2 bg-yellow-50 border border-yellow-200 rounded">{resource.internalNotes}</pre></p>}
        </div>
      </div>
    </Modal>
  );
};


const LegalResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<LegalResource[]>(mockLegalResourcesData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<LegalResourceType | ''>('');
  const [filterCountry, setFilterCountry] = useState<CountryCode | ''>('');
  const [filterLawBranch, setFilterLawBranch] = useState<LawBranch | ''>('');
  const [filterIssuingAuthority, setFilterIssuingAuthority] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<LegalResourceStatus | ''>('');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Partial<LegalResource> | null>(null);
  const [viewingResource, setViewingResource] = useState<LegalResource | null>(null);

  const filteredResources = useMemo(() => {
    return resources.filter(res => {
      // Exclude 'Template' type from LegalResourcesPage display unless specifically chosen in filter
      if (res.type === LegalResourceType.TEMPLATE && filterType !== LegalResourceType.TEMPLATE && filterType !== '') return false;
      
      const searchMatch = (
        res.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (res.description && res.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        res.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (res.documentNumber && res.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      const typeMatch = filterType ? res.type === filterType : true;
      const countryMatch = filterCountry ? res.country === filterCountry : true;
      const lawBranchMatch = filterLawBranch ? res.lawBranch === filterLawBranch : true;
      const authorityMatch = filterIssuingAuthority ? res.issuingAuthority === filterIssuingAuthority : true;
      const statusMatch = filterStatus ? res.resourceStatus === filterStatus : true;

      return searchMatch && typeMatch && countryMatch && lawBranchMatch && authorityMatch && statusMatch;
    }).sort((a,b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
  }, [resources, searchTerm, filterType, filterCountry, filterLawBranch, filterIssuingAuthority, filterStatus]);

  const handleAddResource = () => {
    setEditingResource(null);
    setIsFormModalOpen(true);
  };

  const handleEditResource = (resource: LegalResource) => {
    setEditingResource(resource);
    setIsFormModalOpen(true);
  };

  const handleViewResource = (resource: LegalResource) => {
    setViewingResource(resource);
  };

  const handleDeleteResource = useCallback((resourceId: string) => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف هذا المصدر القانوني؟')) {
      setResources(prev => prev.filter(r => r.id !== resourceId));
    }
  }, []);

  const handleFormSubmit = (data: LegalResource) => {
    if (editingResource?.id) {
      setResources(prev => prev.map(r => (r.id === editingResource.id ? { ...data, id: r.id } : r)));
    } else {
      setResources(prev => [{ ...data, id: `res-${Date.now()}` }, ...prev]);
    }
    setIsFormModalOpen(false);
    setEditingResource(null);
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try { return new Date(dateString).toLocaleDateString('ar-EG'); } catch(e) { return dateString; }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
            <FolderIcon className="w-8 h-8 text-primary me-3" />
            <h1 className="text-3xl font-bold text-primary-dark">المكتبة القانونية الشاملة</h1>
        </div>
        <Button onClick={handleAddResource} leftIcon={<PlusCircleIcon className="w-5 h-5" />}>
            إضافة مصدر قانوني
        </Button>
      </div>

      <Card className="bg-primary-light/5">
         <div className="flex items-start">
          <InformationCircleIcon className="w-6 h-6 text-primary me-3 mt-1 flex-shrink-0"/>
          <div>
            <p className="text-gray-700 leading-relaxed">
              استكشف وأدر مكتبتك القانونية. تركز هذه الوحدة على توفير وصول سهل ومنظم لمختلف مصادر القانون الكويتي (تشريعات، مراسيم، قرارات وزارية، أحكام قضائية، منشورات الجريدة الرسمية) وفروعه المتعددة (مدني، تجاري، جزائي، إداري، عمل، إلخ). يمكنك أيضًا إضافة مصادر من دول عربية أخرى.
            </p>
             <p className="text-sm text-gray-600 mt-1">
              استخدم الفلاتر أدناه لتخصيص بحثك والوصول إلى المعلومات المطلوبة بسرعة ودقة.
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-4 bg-gray-50 rounded-lg mb-6">
            <Input 
                placeholder="ابحث بالكلمات المفتاحية (عنوان، وصف، رقم مستند...)" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                containerClassName="mb-4"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <Select label="نوع المصدر" options={[{value: '', label: 'الكل'}, ...legalResourceTypeOptions.filter(opt => opt.value !== LegalResourceType.TEMPLATE)]} value={filterType} onChange={(e) => setFilterType(e.target.value as LegalResourceType | '')} containerClassName="mb-0"/>
                <Select label="الدولة" options={[{value:'', label:'الكل'}, ...countryOptions]} value={filterCountry} onChange={(e) => setFilterCountry(e.target.value as CountryCode | '')} containerClassName="mb-0"/>
                <Select label="فرع القانون" options={[{value: '', label: 'الكل'}, ...lawBranchOptions]} value={filterLawBranch} onChange={(e) => setFilterLawBranch(e.target.value as LawBranch | '')} containerClassName="mb-0"/>
                <Select label="الجهة المصدرة (الكويت)" options={[{value: '', label: 'الكل'}, ...kuwaitIssuingAuthoritiesOptions]} value={filterIssuingAuthority} onChange={(e) => setFilterIssuingAuthority(e.target.value)} containerClassName="mb-0" disabled={filterCountry !== 'KW' && filterCountry !== ''}/>
                <Select label="الحالة" options={[{value: '', label: 'الكل'}, ...legalResourceStatusOptions]} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as LegalResourceStatus | '')} containerClassName="mb-0"/>
            </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                {['العنوان', 'النوع', 'الرقم', 'الفرع', 'الجهة المصدرة', 'تاريخ النشر', 'الحالة', 'إجراءات'].map(header => (
                  <th key={header} scope="col" className="px-3 py-3 text-right font-medium text-gray-600">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredResources.map(res => (
                <tr key={res.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2 whitespace-nowrap font-medium text-primary-dark max-w-xs truncate" title={res.title}>{res.title}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-gray-700">{res.type}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-gray-700">{res.documentNumber || '-'}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-gray-700">{res.lawBranch || '-'}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-gray-700 max-w-[150px] truncate" title={res.issuingAuthority}>{res.issuingAuthority || '-'}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-gray-700">{formatDate(res.publishDate)}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {res.resourceStatus ? <LegalResourceStatusBadge status={res.resourceStatus} /> : '-'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap space-x-1 space-x-reverse">
                    <Button variant="ghost" size="sm" onClick={() => handleViewResource(res)} title="عرض التفاصيل"><EyeIcon className="w-4 h-4 text-primary" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEditResource(res)} title="تعديل"><PencilIcon className="w-4 h-4 text-yellow-600" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteResource(res.id)} className="text-danger hover:text-red-700" title="حذف"><TrashIcon className="w-4 h-4" /></Button>
                  </td>
                </tr>
              ))}
              {filteredResources.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-gray-500">
                     <FolderIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    لا توجد مصادر قانونية تطابق معايير البحث الحالية.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
         {filteredResources.length > 0 && <p className="pt-4 text-xs text-gray-500 text-center">إجمالي المصادر المعروضة: {filteredResources.length}</p>}
      </Card>

      <LegalResourceFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingResource}
      />
      <ViewLegalResourceModal
        resource={viewingResource}
        onClose={() => setViewingResource(null)}
      />
    </div>
  );
};

export default LegalResourcesPage;