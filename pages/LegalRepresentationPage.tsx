import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import { 
    ShareIcon, PlusCircleIcon, EyeIcon, PencilIcon, TrashIcon, FolderIcon, 
    InformationCircleIcon, UsersIcon, CalendarDaysIcon, CheckCircleIcon, XCircleIcon 
} from '../constants';
import { 
    LegalRepresentationRequest, RepresentationRequestStatus, SubstituteLawyerProfile, 
    Case, CaseMainType, CourtLevel, Employee 
} from '../types';
import { representationRequestStatusOptions, caseMainTypeOptions, courtLevelOptions } from '../constants';
import { RepresentationRequestStatusBadge } from '../components/ui/Badge';
import { initialCases } from './CaseListPage'; 
import { initialEmployees } from './EmployeeProfilePage';


// Mock Substitute Lawyers (derived from initialEmployees for consistency)
const mockSubstituteLawyers: SubstituteLawyerProfile[] = initialEmployees
  .filter(emp => emp.jobTitle?.includes('محام') || emp.jobTitle?.includes('مستشار')) // Simple filter for lawyers
  .map(emp => ({
    ...emp,
    specializations: emp.specializations || [CaseMainType.COMMERCIAL, CaseMainType.CIVIL, CaseMainType.CRIMINAL], // Example default
    frequentedCourts: emp.frequentedCourts || [CourtLevel.FIRST_INSTANCE, CourtLevel.APPEALS_COURT, CourtLevel.CASSATION_COURT], // Example default
    availabilityStatus: emp.status === 'Active' ? 'Available' : (emp.status === 'OnLeave' ? 'OnLeave' : 'Busy'),
  }));

// Mock Legal Representation Requests
export const mockLegalRepresentationRequests: LegalRepresentationRequest[] = [ // Added export
  { 
    id: 'lr-req-001', 
    caseId: initialCases.find(c => c.caseNumber === 'CML-2024-101')?.id || '1', 
    caseNumber: initialCases.find(c => c.caseNumber === 'CML-2024-101')?.caseNumber || 'CML-2024-101', 
    clientName: initialCases.find(c => c.caseNumber === 'CML-2024-101')?.clientName || 'شركة الأمل',
    caseType: initialCases.find(c => c.caseNumber === 'CML-2024-101')?.caseMainType || CaseMainType.COMMERCIAL, 
    courtName: 'المحكمة الكلية (مجمع محاكم الرقعي) - الدائرة التجارية الخامسة',
    courtLevel: CourtLevel.FIRST_INSTANCE,
    hearingDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().split('T')[0], 
    hearingTime: '10:00',
    sessionObjective: 'تقديم مذكرة بالطلبات الختامية في الدعوى رقم (CML-2024-101).',
    primaryLawyerId: initialEmployees.find(e => e.fullNameAr.includes("أحمد محمود"))?.id || 'emp-001',
    primaryLawyerName: initialEmployees.find(e => e.fullNameAr.includes("أحمد محمود"))?.fullNameAr || 'أ. أحمد محمود المحمد الصباح',
    substituteLawyerId: mockSubstituteLawyers.find(l => l.fullNameAr.includes("فاطمة علي"))?.id || 'emp-002', 
    substituteLawyerName: mockSubstituteLawyers.find(l => l.fullNameAr.includes("فاطمة علي"))?.fullNameAr || 'أ. فاطمة علي حسين',
    status: RepresentationRequestStatus.PENDING,
    requestDate: new Date().toISOString().split('T')[0],
    notesForSubstitute: 'يرجى التأكد من إرفاق مستند (س) مع المذكرة. التركيز على البند الثالث من المذكرة، صفحة 5. المستندات ذات الصلة مرسلة بالإيميل.',
    attachedFileNames: ['مذكرة_ختامية_امل.pdf', 'مستند_س.docx', 'محضر_الجلسة_السابقة.pdf'],
    createdAt: new Date().toISOString().split('T')[0],
  },
  { 
    id: 'lr-req-002', 
    caseId: initialCases.find(c => c.caseNumber === 'RE-APP-2024-088')?.id || '3', 
    caseNumber: initialCases.find(c => c.caseNumber === 'RE-APP-2024-088')?.caseNumber || 'RE-APP-2024-088', 
    clientName: initialCases.find(c => c.caseNumber === 'RE-APP-2024-088')?.clientName || 'مجموعة الأنوار العقارية',
    caseType: initialCases.find(c => c.caseNumber === 'RE-APP-2024-088')?.caseMainType || CaseMainType.REAL_ESTATE,
    courtName: 'محكمة الاستئناف (قصر العدل) - الدائرة الإيجارية الثانية',
    courtLevel: CourtLevel.APPEALS_COURT,
    hearingDate: new Date(new Date().setDate(new Date().getDate() + 12)).toISOString().split('T')[0],
    hearingTime: '09:30',
    sessionObjective: 'حضور جلسة مرافعة شفوية في الاستئناف رقم (RE-APP-2024-088).',
    primaryLawyerId: initialEmployees.find(e => e.fullNameAr.includes("خالد جاسم"))?.id || 'emp-temp-kj',
    primaryLawyerName: initialEmployees.find(e => e.fullNameAr.includes("خالد جاسم"))?.fullNameAr || 'أ. خالد جاسم الأحمد',
    substituteLawyerId: initialEmployees.find(e => e.fullNameAr.includes("فاطمة علي"))?.id || 'emp-002',
    substituteLawyerName: initialEmployees.find(e => e.fullNameAr.includes("فاطمة علي"))?.fullNameAr || 'أ. فاطمة علي حسين',
    status: RepresentationRequestStatus.ACCEPTED,
    requestDate: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString().split('T')[0],
    acceptanceRejectionDate: new Date(new Date().setDate(new Date().getDate() -1)).toISOString().split('T')[0],
    notesForSubstitute: 'الدفاع يركز على خطأ الحكم الابتدائي في تطبيق القانون وتفسير بنود العقد. المذكرة الاستئنافية ومستنداتنا مرفقة ومفصلة. أهم النقاط صفحة 7 و 12.',
    attachedFileNames: ['صحيفة_الاستئناف_انوار.pdf', 'الحكم_الابتدائي_المستأنف.pdf', 'عقد_الايجار_المتنازع_عليه.pdf'],
    createdAt: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString().split('T')[0],
  },
  { 
    id: 'lr-req-003', 
    caseId: initialCases.find(c => c.caseNumber === 'CRIM-2024-789')?.id || 'crim-001', 
    caseNumber: initialCases.find(c => c.caseNumber === 'CRIM-2024-789')?.caseNumber || 'CRIM-2024-789', 
    clientName: initialCases.find(c => c.caseNumber === 'CRIM-2024-789')?.clientName || 'شركة التمويل السريع',
    caseType: initialCases.find(c => c.caseNumber === 'CRIM-2024-789')?.caseMainType || CaseMainType.CRIMINAL,
    courtName: 'محكمة الجنح (بمجمع محاكم الفروانية) - الدائرة الثالثة',
    courtLevel: CourtLevel.FIRST_INSTANCE,
    hearingDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0], // Past date for completed
    hearingTime: '11:00',
    sessionObjective: 'حضور جلسة النطق بالحكم واستلام نسخة من منطوق الحكم في القضية رقم (CRIM-2024-789).',
    primaryLawyerId: initialEmployees.find(e => e.fullNameAr.includes("ناصر عبدالله"))?.id || 'emp-temp-na',
    primaryLawyerName: initialEmployees.find(e => e.fullNameAr.includes("ناصر عبدالله"))?.fullNameAr || 'أ. ناصر عبدالله القحطاني',
    substituteLawyerId: initialEmployees.find(e => e.fullNameAr.includes("نورة خالد"))?.id || 'emp-004',
    substituteLawyerName: initialEmployees.find(e => e.fullNameAr.includes("نورة خالد"))?.fullNameAr || 'أ. نورة خالد السبيعي',
    status: RepresentationRequestStatus.COMPLETED,
    requestDate: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString().split('T')[0],
    acceptanceRejectionDate: new Date(new Date().setDate(new Date().getDate() -9)).toISOString().split('T')[0],
    completionDate: new Date(new Date().setDate(new Date().getDate() -7)).toISOString().split('T')[0],
    feedbackFromSubstitute: 'تم النطق بالحكم بإدانة المتهم ومعاقبته بالحبس شهر وغرامة 500 د.ك. تم استلام نسخة من منطوق الحكم وإرفاقها بملف القضية الأصلي.',
    createdAt: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString().split('T')[0],
  },
  { 
    id: 'lr-req-004', 
    caseId: initialCases.find(c => c.caseNumber === 'PS-FAM-2024-333')?.id || 'ps-001', 
    caseNumber: initialCases.find(c => c.caseNumber === 'PS-FAM-2024-333')?.caseNumber || 'PS-FAM-2024-333', 
    clientName: initialCases.find(c => c.caseNumber === 'PS-FAM-2024-333')?.clientName || 'السيدة (فاطمة خ.)',
    caseType: initialCases.find(c => c.caseNumber === 'PS-FAM-2024-333')?.caseMainType || CaseMainType.PERSONAL_STATUS,
    courtName: 'محكمة الأسرة (بمحافظة الأحمدي) - دائرة أحوال شخصية (سني)',
    courtLevel: CourtLevel.FIRST_INSTANCE,
    hearingDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split('T')[0], 
    hearingTime: '12:30',
    sessionObjective: 'طلب تأجيل لتقديم مستندات إضافية.',
    primaryLawyerId: initialEmployees.find(e => e.fullNameAr.includes("هند سعد"))?.id || 'emp-temp-hs',
    primaryLawyerName: initialEmployees.find(e => e.fullNameAr.includes("هند سعد"))?.fullNameAr || 'أ. هند سعد العتيبي',
    substituteLawyerId: initialEmployees.find(e => e.fullNameAr.includes("فاطمة علي"))?.id || 'emp-002',
    substituteLawyerName: initialEmployees.find(e => e.fullNameAr.includes("فاطمة علي"))?.fullNameAr || 'أ. فاطمة علي حسين',
    status: RepresentationRequestStatus.REJECTED, 
    requestDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0],
    acceptanceRejectionDate: new Date().toISOString().split('T')[0],
    notesForSubstitute: 'الرجاء طلب التأجيل لمدة أسبوعين لإرفاق تقرير طبي حديث.',
    feedbackFromSubstitute: 'لا يمكنني الحضور في هذا الموعد لارتباطي بجلسة أخرى في محكمة التمييز. اعتذر.', 
    createdAt: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0],
  },
   {
    id: 'lr-req-005',
    caseId: initialCases.find(c => c.caseNumber === 'traffic-001')?.id || 'traffic-001',
    caseNumber: initialCases.find(c => c.caseNumber === 'traffic-001')?.caseNumber || 'TRF-COMP-2024-501',
    clientName: initialCases.find(c => c.caseNumber === 'traffic-001')?.clientName || 'السيد/ جابر مبارك الصالح',
    caseType: initialCases.find(c => c.caseNumber === 'traffic-001')?.caseMainType || CaseMainType.CIVIL,
    courtName: 'محكمة المرور (مجمع محاكم الرقعي) - دائرة التعويضات',
    courtLevel: CourtLevel.SPECIALIZED_COURT,
    hearingDate: new Date(new Date().setDate(new Date().getDate() + 20)).toISOString().split('T')[0],
    hearingTime: '09:00',
    sessionObjective: 'حضور جلسة للاستماع لشهادة الشهود في قضية التعويض عن حادث مروري رقم (TRF-COMP-2024-501).',
    primaryLawyerId: initialEmployees.find(e => e.fullNameAr.includes("مشاري فهد"))?.id || 'emp-temp-mf',
    primaryLawyerName: initialEmployees.find(e => e.fullNameAr.includes("مشاري فهد"))?.fullNameAr || 'أ. مشاري فهد العجمي',
    substituteLawyerId: '', // Pending assignment
    substituteLawyerName: '',
    status: RepresentationRequestStatus.PENDING,
    requestDate: new Date().toISOString().split('T')[0],
    notesForSubstitute: 'الشهود هم (شاهد 1) و (شاهد 2). يرجى التأكد من جاهزية الأسئلة الموجهة إليهم (مرسلة سابقًا).',
    createdAt: new Date().toISOString().split('T')[0],
  },
];

// Format Date Helper
const formatDate = (dateString?: string, includeTime = false) => {
  if (!dateString) return '-';
  try {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    return new Date(dateString).toLocaleDateString('ar-EG', options);
  } catch (e) { return dateString; }
};

interface RequestFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (request: LegalRepresentationRequest) => void;
    initialData?: Partial<LegalRepresentationRequest> | null;
    cases: Pick<Case, 'id' | 'caseNumber' | 'title' | 'clientName' | 'caseMainType' | 'courtLevel' | 'courtName'>[];
    lawyers: Pick<Employee, 'id' | 'fullNameAr'>[];
}

const RequestFormModal: React.FC<RequestFormModalProps> = ({ isOpen, onClose, onSubmit, initialData, cases, lawyers }) => {
    const [formData, setFormData] = useState<Partial<LegalRepresentationRequest>>(
        initialData || {
            caseId: undefined,
            courtName: undefined,
            status: RepresentationRequestStatus.PENDING,
            requestDate: new Date().toISOString().split('T')[0],
            hearingDate: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString().split('T')[0],
            attachedFileNames: [],
        }
    );

    useEffect(() => {
        if (isOpen) {
            const defaultData: Partial<LegalRepresentationRequest> = {
                caseId: undefined,
                courtName: undefined,
                status: RepresentationRequestStatus.PENDING,
                requestDate: new Date().toISOString().split('T')[0],
                hearingDate: new Date().toISOString().split('T')[0],
                createdAt: new Date().toISOString().split('T')[0],
                attachedFileNames: [],
            };
             const currentInitialData = initialData || defaultData;
            setFormData(currentInitialData);

            // Pre-fill courtName from case if a case is selected and courtName is empty in form
            if (currentInitialData.caseId && !currentInitialData.courtName) {
                const selectedCase = cases.find(c => c.id === currentInitialData.caseId);
                if (selectedCase) {
                    setFormData(prev => ({
                        ...prev,
                        caseNumber: selectedCase.caseNumber,
                        clientName: selectedCase.clientName,
                        caseType: selectedCase.caseMainType,
                        courtLevel: selectedCase.courtLevel,
                        courtName: selectedCase.courtName || '',
                    }));
                }
            }
        }
    }, [isOpen, initialData, cases]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === "caseId" && value) {
            const selectedCase = cases.find(c => c.id === value);
            if (selectedCase) {
                setFormData(prev => ({
                    ...prev,
                    caseNumber: selectedCase.caseNumber,
                    clientName: selectedCase.clientName,
                    caseType: selectedCase.caseMainType,
                    courtLevel: selectedCase.courtLevel,
                    courtName: prev?.courtName || selectedCase.courtName || '',
                }));
            }
        }
        if (name === "primaryLawyerId" && value) {
            const selectedLawyer = lawyers.find(l => l.id === value);
            if (selectedLawyer) {
                setFormData(prev => ({ ...prev, primaryLawyerName: selectedLawyer.fullNameAr }));
            }
        }
        if (name === "substituteLawyerId" && value) {
            const selectedLawyer = lawyers.find(l => l.id === value);
            if (selectedLawyer) {
                setFormData(prev => ({ ...prev, substituteLawyerName: selectedLawyer.fullNameAr }));
            }
        }
    };
    
    const handleAttachedFilesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFormData(prev => ({...prev, attachedFileNames: e.target.value.split('\n').map(f => f.trim()).filter(f => f)}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.caseId || !formData.courtName?.trim() || !formData.hearingDate || !formData.sessionObjective || !formData.primaryLawyerId) {
            alert("يرجى ملء الحقول الإلزامية: القضية، المحكمة، تاريخ الجلسة، هدف الجلسة، والمحامي الأصيل.");
            return;
        }
        onSubmit({ ...formData, updatedAt: new Date().toISOString() } as LegalRepresentationRequest);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={formData.id ? "تعديل طلب إنابة" : "إنشاء طلب إنابة قانونية جديد"} size="xl">
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto p-1">
                <Card title="بيانات القضية والجلسة" titleClassName="text-sm">
                    <Select label="القضية (*)" name="caseId" value={formData.caseId || ''}
                        options={[{value: '', label: 'اختر قضية'}, ...cases.map(c => ({value: c.id, label: `${c.caseNumber} - ${c.title}`}))]}
                        onChange={handleChange} required />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                        <Input label="نوع القضية" value={formData.caseType || ''} readOnly disabled className="bg-gray-100"/>
                        <Input label="مستوى المحكمة (من القضية)" value={formData.courtLevel || ''} readOnly disabled className="bg-gray-100"/>
                        <Input label="الموكل" value={formData.clientName || ''} readOnly disabled className="bg-gray-100"/>
                    </div>
                     <Input label="المحكمة/مكان الانعقاد (*)" name="courtName" value={formData.courtName || ''} onChange={handleChange} required placeholder="مثال: محكمة الأحمدي الكلية - الدائرة التجارية الخامسة - قاعة 3" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                        <Input label="تاريخ الجلسة/المهمة (*)" name="hearingDate" type="date" value={formData.hearingDate} onChange={handleChange} required />
                        <Input label="وقت الجلسة (اختياري)" name="hearingTime" type="time" value={formData.hearingTime || ''} onChange={handleChange} />
                    </div>
                    <TextArea label="الهدف من الجلسة/المهمة (*)" name="sessionObjective" value={formData.sessionObjective || ''} onChange={handleChange} required rows={2} placeholder="مثال: تقديم مذكرة دفاع، حضور مرافعة، استلام صورة حكم، طلب تأجيل..." />
                </Card>
                <Card title="المحامون والملاحظات" titleClassName="text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Select label="المحامي الأصيل (صاحب الطلب) (*)" name="primaryLawyerId" value={formData.primaryLawyerId || ''}
                            options={[{value: '', label: 'اختر المحامي الأصيل'}, ...lawyers.map(l => ({value: l.id, label: l.fullNameAr}))]}
                            onChange={handleChange} required />
                        <Select label="المحامي المناب (المطلوب منه الحضور)" name="substituteLawyerId" value={formData.substituteLawyerId || ''}
                            options={[{value: '', label: 'اختر المحامي المناب (اختياري الآن)'}, ...lawyers.filter(l => l.id !== formData.primaryLawyerId).map(l => ({value: l.id, label: l.fullNameAr}))]}
                            onChange={handleChange} />
                    </div>
                     <TextArea label="ملاحظات/تعليمات للمحامي المناب" name="notesForSubstitute" value={formData.notesForSubstitute || ''} onChange={handleChange} rows={3} placeholder="أية نقاط هامة، مستندات مطلوبة، استراتيجية معينة..." />
                     <TextArea label="أسماء الملفات المرفقة (كل ملف في سطر)" value={formData.attachedFileNames?.join('\n') || ''} onChange={handleAttachedFilesChange} rows={2} placeholder="مذكرة_دفاع.pdf\nصورة_من_الإعلان.docx"/>
                </Card>
                { initialData?.id && // Show status only when editing
                    <Select label="حالة الطلب" name="status" value={formData.status} options={representationRequestStatusOptions} onChange={handleChange} />
                }
                 { (formData.status === RepresentationRequestStatus.REJECTED || formData.status === RepresentationRequestStatus.COMPLETED) &&
                    <TextArea label="ملاحظات/رد المحامي المناب" name="feedbackFromSubstitute" value={formData.feedbackFromSubstitute || ''} onChange={handleChange} rows={3} placeholder="سبب الرفض، أو نتيجة الحضور، أو ملاحظات بعد الجلسة."/>
                }
                <div className="flex justify-end space-x-3 space-x-reverse pt-3">
                    <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
                    <Button type="submit">{formData.id ? "حفظ التعديلات" : "إرسال الطلب"}</Button>
                </div>
            </form>
        </Modal>
    );
};

// TODO: ViewRequestModal, ProcessRequestModal

const LegalRepresentationPage: React.FC = () => {
  const [requests, setRequests] = useState<LegalRepresentationRequest[]>(mockLegalRepresentationRequests);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<RepresentationRequestStatus | ''>('');
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<Partial<LegalRepresentationRequest> | null>(null);
  // const [viewingRequest, setViewingRequest] = useState<LegalRepresentationRequest | null>(null);

  const filteredRequests = useMemo(() => {
    return requests.filter(req =>
      (req.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
       req.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       req.courtName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       req.primaryLawyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (req.substituteLawyerName && req.substituteLawyerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
       req.sessionObjective.toLowerCase().includes(searchTerm.toLowerCase())
      ) &&
      (filterStatus ? req.status === filterStatus : true)
    ).sort((a,b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
  }, [requests, searchTerm, filterStatus]);

  const handleAddRequest = () => {
    setEditingRequest(null);
    setIsFormModalOpen(true);
  };

  const handleEditRequest = (req: LegalRepresentationRequest) => {
    setEditingRequest(req);
    setIsFormModalOpen(true);
  };
  
  const handleDeleteRequest = useCallback((requestId: string) => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف طلب الإنابة هذا؟')) {
        setRequests(prev => prev.filter(r => r.id !== requestId));
    }
  }, []);

  const handleFormSubmit = (data: LegalRepresentationRequest) => {
    if (editingRequest && editingRequest.id) {
      setRequests(prev => prev.map(r => (r.id === editingRequest.id ? data : r)));
    } else {
      setRequests(prev => [{ ...data, id: `lr-req-${Date.now()}` }, ...prev]);
    }
    setIsFormModalOpen(false);
    setEditingRequest(null);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
            <ShareIcon className="w-8 h-8 text-primary me-3" />
            <h1 className="text-3xl font-bold text-primary-dark dark:text-primary-light">إدارة طلبات الإنابة القانونية</h1>
        </div>
        <Button onClick={handleAddRequest} leftIcon={<PlusCircleIcon className="w-5 h-5" />}>
            إنشاء طلب إنابة جديد
        </Button>
      </div>

      <Card className="bg-blue-50 dark:bg-dm-card/30 border-blue-200 dark:border-blue-700/50">
        <div className="flex items-start">
            <InformationCircleIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 me-3 mt-1 flex-shrink-0" />
            <div>
                <h3 className="text-md font-semibold text-blue-700 dark:text-blue-300 mb-1">تنظيم وتتبع الإنابات القانونية</h3>
                <p className="text-sm text-blue-600 dark:text-blue-400 leading-relaxed">
                    تسهل هذه الوحدة عملية طلب وتتبع حضور الجلسات أو إنجاز المهام القانونية نيابة عن محامٍ آخر، سواء داخل المكتب أو مع محامين خارجيين.
                    يمكنك تسجيل تفاصيل القضية، موعد الجلسة أو المهمة، المحامي الأصيل والمناب، وتحديث حالة الطلب (قبول، رفض، إنجاز).
                </p>
            </div>
        </div>
      </Card>
      
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 dark:bg-dm-card/50 rounded-lg">
            <Input placeholder="ابحث برقم القضية، اسم الموكل، المحكمة، المحامي، هدف الجلسة..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} containerClassName="mb-0"/>
            <Select label="تصفية بالحالة" options={[{value: '', label: 'الكل'}, ...representationRequestStatusOptions]} value={filterStatus} onChange={e => setFilterStatus(e.target.value as RepresentationRequestStatus | '')} containerClassName="mb-0"/>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                <thead className="bg-gray-100 dark:bg-dm-card/80">
                    <tr>
                        {['رقم القضية', 'الموكل', 'المحكمة', 'تاريخ الجلسة', 'المحامي المناب', 'الحالة', 'إجراءات'].map(h=><th key={h} className="px-3 py-3 text-right font-medium text-gray-600 dark:text-gray-300">{h}</th>)}
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-dm-background divide-y divide-gray-200 dark:divide-gray-600">
                    {filteredRequests.map(req => (
                        <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-dm-card/60">
                            <td className="px-3 py-2 whitespace-nowrap text-gray-700 dark:text-dm-text">{req.caseNumber}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-gray-700 dark:text-dm-text">{req.clientName}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-gray-700 dark:text-dm-text max-w-xs truncate" title={req.courtName}>{req.courtName}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-gray-500 dark:text-gray-400">{formatDate(req.hearingDate, !!req.hearingTime)} {req.hearingTime || ''}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-gray-700 dark:text-dm-text">{req.substituteLawyerName || <span className="text-gray-400 dark:text-gray-500">لم يحدد</span>}</td>
                            <td className="px-3 py-2 whitespace-nowrap"><RepresentationRequestStatusBadge status={req.status}/></td>
                            <td className="px-3 py-2 whitespace-nowrap space-x-1 space-x-reverse">
                                {/* <Button variant="ghost" size="sm" onClick={() => setViewingRequest(req)} title="عرض التفاصيل"><EyeIcon className="w-4 h-4 text-primary dark:text-primary-light" /></Button> */}
                                <Button variant="ghost" size="sm" onClick={() => handleEditRequest(req)} title="تعديل/معالجة"><PencilIcon className="w-4 h-4 text-yellow-600 dark:text-yellow-400" /></Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteRequest(req.id)} className="text-danger hover:text-red-700 dark:text-red-400 dark:hover:text-red-500" title="حذف"><TrashIcon className="w-4 h-4" /></Button>
                            </td>
                        </tr>
                    ))}
                    {filteredRequests.length === 0 && (
                        <tr><td colSpan={7} className="text-center py-10 text-gray-500 dark:text-gray-400"><FolderIcon className="w-12 h-12 mx-auto mb-2 text-gray-400 dark:text-gray-500"/>لا توجد طلبات إنابة تطابق بحثك.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      </Card>

      <RequestFormModal 
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingRequest}
        cases={initialCases}
        lawyers={initialEmployees}
      />
      
      {/* Placeholder for ViewRequestModal and ProcessRequestModal if they are needed separately */}
      {/* 
      <ViewRequestModal request={viewingRequest} onClose={() => setViewingRequest(null)} onEdit={handleEditRequest} />
      <ProcessRequestModal ... /> 
      */}
    </div>
  );
};

export default LegalRepresentationPage;