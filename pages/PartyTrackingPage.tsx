import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import { 
    MapPinIcon, PlusCircleIcon, EyeIcon, PencilIcon, TrashIcon, FolderIcon, 
    InformationCircleIcon, CalendarDaysIcon, BriefcaseIcon, UsersIcon,
    BellAlertIcon, XCircleIcon
} from '../constants';
import { 
    TrackableParty, PartyRelationshipType, TrackingStatus, 
    TrackingLocationDetails, TrackingEntry, PartyAssignment, Case, Employee
} from '../types';
import { 
    partyRelationshipTypeOptions, trackingStatusOptions, 
    KUWAIT_COURTS_LIST, KUWAIT_PROSECUTIONS_LIST, KUWAIT_JUDICIAL_DEPARTMENTS_LIST
} from '../constants';
import { Badge } from '../components/ui/Badge';

// Import mock data for linking
import { initialCases } from './CaseListPage';
import { initialEmployees } from './EmployeeProfilePage';

// --- Mock Data ---
const mockTrackableParties: TrackableParty[] = [
    { 
        id: 'tp-001', fullName: 'أحمد عبدالله (مندوب)', phone: '99887766', 
        relationshipType: PartyRelationshipType.DELEGATE, organizationOrOffice: 'مكتب عدالة للمحاماة',
        idCardPhotoUrl: 'https://picsum.photos/seed/delegate1/100/100',
        notes: 'مندوب متخصص في إيداع المستندات ومتابعة الإعلانات.',
        createdAt: '2023-01-15'
    },
    { 
        id: 'tp-002', fullName: 'فاطمة حسن (معقبة قضايا)', phone: '66554433', 
        relationshipType: PartyRelationshipType.CASE_FOLLOWER, organizationOrOffice: 'خدمات متابعة القضايا المستقلة',
        idCardPhotoUrl: 'https://picsum.photos/seed/follower1/100/100',
        notes: 'معقبة ذات خبرة في مراجعة النيابات وإدارات التنفيذ.',
        createdAt: '2023-02-20'
    },
    { 
        id: 'tp-003', fullName: 'خالد جاسم (مندوب جديد)', phone: '55112233', 
        relationshipType: PartyRelationshipType.DELEGATE, organizationOrOffice: 'مكتب عدالة للمحاماة',
        idCardPhotoUrl: 'https://picsum.photos/seed/delegate2/100/100',
        notes: 'تحت التدريب، يفضل إسناد مهام بسيطة له في البداية.',
        createdAt: '2024-06-01'
    }
];

const mockPartyAssignments: PartyAssignment[] = [
    {
        id: 'assign-001',
        trackablePartyId: 'tp-001',
        trackablePartyName: mockTrackableParties.find(tp => tp.id === 'tp-001')?.fullName || '',
        caseId: initialCases.find(c => c.caseNumber === 'CML-2024-101')?.id,
        caseNumber: initialCases.find(c => c.caseNumber === 'CML-2024-101')?.caseNumber,
        taskDescription: 'إيداع مذكرة دفاع في قضية شركة الأمل (CML-2024-101) وتسليم نسخة للخصم.',
        destination: {
            courtOrDepartmentName: 'مجمع محاكم الرقعي',
            floor: 'الدور الثاني',
            sectionOrOffice: 'قلم كتاب الدائرة التجارية الخامسة',
        },
        assignedByLawyerId: initialEmployees.find(e => e.fullNameAr.includes("أحمد محمود"))?.id || 'emp-001',
        assignedByLawyerName: initialEmployees.find(e => e.fullNameAr.includes("أحمد محمود"))?.fullNameAr || 'أ. أحمد محمود المحمد الصباح',
        expectedStartTime: new Date(new Date().getTime() + 15 * 60 * 1000).toISOString(), // In 15 minutes for testing
        expectedEndTime: new Date(new Date().getTime() + 2 * 60 * 60 * 1000).toISOString(), // In 2 hours for testing
        currentStatus: TrackingStatus.PREPARING_TO_LEAVE,
        trackingLog: [
            { id: 'log-001-1', timestamp: new Date().toISOString(), status: TrackingStatus.PREPARING_TO_LEAVE, recordedBy: 'النظام', notes: 'تم إنشاء المهمة وإسنادها.' }
        ],
        lastUpdateTimestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
    },
    {
        id: 'assign-002',
        trackablePartyId: 'tp-002',
        trackablePartyName: mockTrackableParties.find(tp => tp.id === 'tp-002')?.fullName || '',
        caseId: initialCases.find(c => c.caseNumber === 'CRIM-2024-789')?.id,
        caseNumber: initialCases.find(c => c.caseNumber === 'CRIM-2024-789')?.caseNumber,
        taskDescription: 'مراجعة نيابة الأموال العامة للاستعلام عن آخر تطورات الشكوى رقم (XXX/2024).',
        destination: {
            courtOrDepartmentName: 'نيابة الأموال العامة',
            sectionOrOffice: 'قسم الاستعلامات',
        },
        assignedByLawyerId: initialEmployees.find(e => e.fullNameAr.includes("ناصر عبدالله"))?.id || 'emp-temp-na',
        assignedByLawyerName: initialEmployees.find(e => e.fullNameAr.includes("ناصر عبدالله"))?.fullNameAr || 'أ. ناصر عبدالله القحطاني',
        expectedStartTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        expectedEndTime: new Date(Date.now() + 25 * 60 * 1000).toISOString(), // End time approaching
        currentStatus: TrackingStatus.ARRIVED_AT_LOCATION,
        lastLocationUpdate: { courtOrDepartmentName: 'نيابة الأموال العامة', sectionOrOffice: 'الاستقبال' },
        trackingLog: [
            { id: 'log-002-1', timestamp: new Date(Date.now() - 2*60*60*1000).toISOString(), status: TrackingStatus.PREPARING_TO_LEAVE, recordedBy: 'النظام' },
            { id: 'log-002-2', timestamp: new Date(Date.now() - 1.5*60*60*1000).toISOString(), status: TrackingStatus.ON_THE_WAY, recordedBy: 'المعقب', notes: 'خرجت من المكتب.'},
            { id: 'log-002-3', timestamp: new Date(Date.now() - 0.5*60*60*1000).toISOString(), status: TrackingStatus.ARRIVED_AT_LOCATION, locationDetails: {courtOrDepartmentName: 'نيابة الأموال العامة', sectionOrOffice: 'الاستقبال'}, recordedBy: 'المعقب', notes: 'وصلت للنيابة، يوجد ازدحام.'}
        ],
        lastUpdateTimestamp: new Date(Date.now() - 0.5*60*60*1000).toISOString(),
        createdAt: new Date(Date.now() - 3*60*60*1000).toISOString(),
    },
    {
        id: 'assign-003',
        trackablePartyId: 'tp-001',
        trackablePartyName: mockTrackableParties.find(tp => tp.id === 'tp-001')?.fullName || '',
        caseId: initialCases.find(c => c.caseNumber === 'ADM-2024-012')?.id,
        caseNumber: initialCases.find(c => c.caseNumber === 'ADM-2024-012')?.caseNumber,
        taskDescription: 'حضور جلسة في المحكمة الإدارية للاستعلام عن قرار في القضية الإدارية.',
        destination: {
            courtOrDepartmentName: 'المحكمة الإدارية (بمجمع محاكم العاصمة) - الدائرة الأولى',
            sectionOrOffice: 'قاعة الجلسات رقم 2',
        },
        assignedByLawyerId: initialEmployees.find(e => e.fullNameAr.includes("ليلى منصور"))?.id || 'emp-temp-lh',
        assignedByLawyerName: initialEmployees.find(e => e.fullNameAr.includes("ليلى منصور"))?.fullNameAr || 'أ. ليلى منصور الهاجري',
        expectedStartTime: new Date(new Date().setDate(new Date().getDate() - 1)).setHours(11,0,0,0).toString(), // Yesterday
        currentStatus: TrackingStatus.TASK_COMPLETED,
        lastLocationUpdate: { courtOrDepartmentName: 'المحكمة الإدارية', sectionOrOffice: 'قلم كتاب الدائرة' },
        trackingLog: [
            { id: 'log-003-1', timestamp: new Date(new Date().setDate(new Date().getDate() - 1)).setHours(10,0,0,0).toString(), status: TrackingStatus.ON_THE_WAY, recordedBy: 'المندوب' },
            { id: 'log-003-2', timestamp: new Date(new Date().setDate(new Date().getDate() - 1)).setHours(10,45,0,0).toString(), status: TrackingStatus.AT_SPECIFIC_DEPARTMENT, locationDetails: {courtOrDepartmentName: 'المحكمة الإدارية', sectionOrOffice: 'قاعة الجلسات رقم 2'}, recordedBy: 'المندوب', notes: 'الجلسة لم تبدأ بعد.' },
            { id: 'log-003-3', timestamp: new Date(new Date().setDate(new Date().getDate() - 1)).setHours(12,15,0,0).toString(), status: TrackingStatus.TASK_COMPLETED, locationDetails: {courtOrDepartmentName: 'المحكمة الإدارية', sectionOrOffice: 'قلم كتاب الدائرة'}, recordedBy: 'المندوب', notes: 'تم الاستعلام، القرار تأجل للنطق بالحكم لجلسة ...' }
        ],
        lastUpdateTimestamp: new Date(new Date().setDate(new Date().getDate() - 1)).setHours(12,15,0,0).toString(),
        createdAt: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
        updatedAt: new Date(new Date().setDate(new Date().getDate() - 1)).setHours(12,15,0,0).toString(),
    },
];


type TabKey = 'activeAssignments' | 'manageParties' | 'fullLog';

const formatDate = (dateString?: string, includeTime = false) => {
  if (!dateString) return '-';
  try {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    return new Date(dateString).toLocaleDateString('ar-EG', options);
  } catch (e) { return dateString; }
};

const getTrackingStatusBadgeColor = (status: TrackingStatus): 'green' | 'yellow' | 'red' | 'blue' | 'gray' | 'purple' | 'orange' | 'cyan' => {
    switch(status) {
        case TrackingStatus.PREPARING_TO_LEAVE: return 'yellow';
        case TrackingStatus.ON_THE_WAY: return 'blue';
        case TrackingStatus.ARRIVED_AT_LOCATION: case TrackingStatus.AT_SPECIFIC_DEPARTMENT: return 'cyan';
        case TrackingStatus.MET_WITH_ASSIGNED_LAWYER: case TrackingStatus.TASK_IN_PROGRESS: return 'purple';
        case TrackingStatus.TASK_COMPLETED: return 'green';
        case TrackingStatus.DELAYED: case TrackingStatus.UNABLE_TO_COMPLETE: return 'red';
        case TrackingStatus.RETURNED_TO_OFFICE: return 'gray';
        default: return 'gray';
    }
};

const TrackingStatusBadge: React.FC<{ status: TrackingStatus, size?: 'xs' | 'sm' }> = ({ status, size = 'xs' }) => (
    <Badge text={status} color={getTrackingStatusBadgeColor(status)} size={size} />
);

// --- Notification Item Type ---
interface NotificationItem extends PartyAssignment {
    alertType: 'start' | 'end';
    alertTime: string;
}

// --- Notification Card Component ---
const NotificationCard: React.FC<{ assignment: NotificationItem; onDismiss: () => void }> = ({ assignment, onDismiss }) => {
    const isStart = assignment.alertType === 'start';
    const time = new Date(assignment.alertTime).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="w-80 bg-white dark:bg-dm-card shadow-lg rounded-lg p-4 border-l-4 border-accent-DEFAULT animate-fade-in-right">
            <div className="flex items-start">
                <BellAlertIcon className="w-6 h-6 text-accent-DEFAULT flex-shrink-0 mt-1" />
                <div className="ms-3 flex-grow overflow-hidden">
                    <p className="font-bold text-sm text-primary-dark dark:text-primary-light">
                        {isStart ? 'تنبيه باقتراب بدء مهمة' : 'تنبيه باقتراب انتهاء مهمة'}
                    </p>
                    <p className="text-xs text-neutral-text dark:text-dm-text mt-1 truncate" title={assignment.taskDescription}>
                        <strong>المهمة:</strong> {assignment.taskDescription}
                    </p>
                    <p className="text-xs text-secondary dark:text-secondary-light mt-1">
                        <strong>المكلف:</strong> {assignment.trackablePartyName}
                    </p>
                    <p className="text-xs text-secondary dark:text-secondary-light mt-1">
                        <strong>الوقت المتوقع:</strong> {time}
                    </p>
                </div>
                <button onClick={onDismiss} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex-shrink-0">
                    <XCircleIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};


// --- Forms ---
interface PartyFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (party: TrackableParty) => void;
    initialData?: Partial<TrackableParty> | null;
}
const PartyForm: React.FC<PartyFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState<Partial<TrackableParty>>(initialData || { relationshipType: PartyRelationshipType.DELEGATE });
    useEffect(() => { if(isOpen) setFormData(initialData || { relationshipType: PartyRelationshipType.DELEGATE, createdAt: new Date().toISOString() }); }, [isOpen, initialData]);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.fullName || !formData.phone) { alert("الاسم والهاتف مطلوبان."); return; }
        onSubmit({ ...formData, id: formData.id || `tp-${Date.now()}`, createdAt: formData.createdAt || new Date().toISOString() } as TrackableParty);
    };
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData?.id ? "تعديل بيانات الطرف" : "إضافة طرف متتبع جديد"} size="lg">
            <form onSubmit={handleSubmit} className="space-y-3 p-2">
                <Input name="fullName" label="الاسم الكامل" value={formData.fullName || ''} onChange={handleChange} required />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input name="phone" label="رقم الهاتف" type="tel" value={formData.phone || ''} onChange={handleChange} required />
                    <Input name="email" label="البريد الإلكتروني (اختياري)" type="email" value={formData.email || ''} onChange={handleChange} />
                </div>
                <Select name="relationshipType" label="نوع العلاقة بالملف" value={formData.relationshipType} options={partyRelationshipTypeOptions} onChange={handleChange} required />
                <Input name="organizationOrOffice" label="جهة العمل/المكتب" value={formData.organizationOrOffice || ''} onChange={handleChange} />
                <Input name="idCardPhotoUrl" label="رابط صورة الهوية/البطاقة (اختياري)" type="url" value={formData.idCardPhotoUrl || ''} onChange={handleChange} placeholder="https://example.com/id.jpg"/>
                <TextArea name="notes" label="ملاحظات إدارية/قانونية" value={formData.notes || ''} onChange={handleChange} rows={2} />
                <div className="flex justify-end space-x-2 space-x-reverse pt-2">
                    <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
                    <Button type="submit">{initialData?.id ? 'حفظ التعديلات' : 'إضافة الطرف'}</Button>
                </div>
            </form>
        </Modal>
    );
};

interface AssignmentFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (assignment: PartyAssignment) => void;
    initialData?: Partial<PartyAssignment> | null;
    parties: TrackableParty[];
    cases: Pick<Case, 'id' | 'caseNumber' | 'title'>[];
    lawyers: Pick<Employee, 'id' | 'fullNameAr'>[];
}
const AssignmentFormModal: React.FC<AssignmentFormProps> = ({ isOpen, onClose, onSubmit, initialData, parties, cases, lawyers }) => {
    const getInitialFormData = (): Partial<PartyAssignment> => {
        const defaultDestination: TrackingLocationDetails = { courtOrDepartmentName: '', floor: '', sectionOrOffice: '' };
        return initialData || {
            trackablePartyId: parties[0]?.id || '',
            caseId: undefined,
            taskDescription: '',
            destination: defaultDestination,
            assignedByLawyerId: lawyers[0]?.id || '',
            currentStatus: TrackingStatus.PREPARING_TO_LEAVE,
            trackingLog: [],
            createdAt: new Date().toISOString(),
            lastUpdateTimestamp: new Date().toISOString(),
        };
    };
    const [formData, setFormData] = useState<Partial<PartyAssignment>>(getInitialFormData);
    
    const locationOptions = useMemo(() => [
        { value: '', label: 'اختر وجهة المهمة...' },
        { value: 'مقر المكتب الرئيسي', label: 'مقر المكتب الرئيسي (للمهام الداخلية)'},
        ...KUWAIT_COURTS_LIST.map(c => ({ value: c.value, label: `${c.label} (محكمة)` })),
        ...KUWAIT_PROSECUTIONS_LIST.map(p => ({ value: p.value, label: `${p.label} (نيابة)` })),
        ...KUWAIT_JUDICIAL_DEPARTMENTS_LIST.map(d => ({ value: d.value, label: `${d.label} (إدارة/جهة قضائية)` })),
        // Consider adding KUWAIT_MINISTRIES_LIST etc. if relevant
    ], []);

    useEffect(() => { if(isOpen) setFormData(getInitialFormData()); }, [isOpen, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.startsWith("destination.")) {
            const field = name.split('.')[1];
            setFormData(prev => ({ ...prev, destination: { ...(prev.destination!), [field]: value } }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.trackablePartyId || !formData.taskDescription || !formData.destination?.courtOrDepartmentName || !formData.assignedByLawyerId) {
            alert("يرجى ملء حقول الطرف المتتبع، وصف المهمة، اسم المحكمة/الإدارة، والمحامي المشرف."); return;
        }
        const party = parties.find(p => p.id === formData.trackablePartyId);
        const caseInfo = formData.caseId ? cases.find(c => c.id === formData.caseId) : null;
        const lawyer = lawyers.find(l => l.id === formData.assignedByLawyerId);
        
        let firstLogEntry: TrackingEntry | undefined = undefined;
        if(!formData.id) { // Only add initial log entry for new assignments
          firstLogEntry = {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            status: TrackingStatus.PREPARING_TO_LEAVE,
            recordedBy: lawyer?.fullNameAr || 'النظام',
            notes: 'تم إنشاء المهمة وإسنادها.'
          };
        }
    
        const assignmentPayload: PartyAssignment = { 
            ...(formData as Omit<PartyAssignment, 'id' | 'trackablePartyName' | 'caseNumber' | 'assignedByLawyerName' | 'trackingLog' | 'lastUpdateTimestamp' | 'createdAt' | 'updatedAt'>), 
            id: formData.id || `assign-${Date.now()}`,
            trackablePartyName: party?.fullName || '',
            caseNumber: caseInfo?.caseNumber,
            assignedByLawyerName: lawyer?.fullNameAr || '',
            trackingLog: formData.id ? (formData.trackingLog || []) : (firstLogEntry ? [firstLogEntry] : []),
            lastUpdateTimestamp: new Date().toISOString(),
            createdAt: formData.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        onSubmit(assignmentPayload);
    };
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData?.id ? "تعديل مهمة ميدانية" : "إسناد مهمة ميدانية جديدة"} size="xl">
            <form onSubmit={handleSubmit} className="space-y-3 p-2 max-h-[75vh] overflow-y-auto scrollbar-thin">
                <Card title="تفاصيل المهمة الأساسية" titleClassName="text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Select label="الطرف المتتبع (المندوب/المعقب)" name="trackablePartyId" value={formData.trackablePartyId} options={parties.map(p=>({value:p.id, label:`${p.fullName} (${p.relationshipType})`}))} onChange={handleChange} required />
                        <Select label="المحامي المشرف على المهمة" name="assignedByLawyerId" value={formData.assignedByLawyerId} options={lawyers.map(l=>({value:l.id, label:l.fullNameAr}))} onChange={handleChange} required />
                    </div>
                    <Select label="مرتبطة بالقضية (اختياري)" name="caseId" value={formData.caseId || ''} options={[{value:'', label:'غير مرتبطة بقضية محددة'}, ...cases.map(c=>({value:c.id, label:`${c.caseNumber} - ${c.title}`}))]} onChange={handleChange} />
                    <TextArea label="وصف المهمة المطلوبة" name="taskDescription" value={formData.taskDescription || ''} onChange={handleChange} required rows={2} placeholder="مثال: إيداع مذكرة، حضور جلسة استعلام، تصوير ملف..."/>
                </Card>
                <Card title="وجهة المهمة وتوقيتاتها" titleClassName="text-sm">
                    <Select label="المحكمة/الإدارة المستهدفة" name="destination.courtOrDepartmentName" value={formData.destination?.courtOrDepartmentName || ''} options={locationOptions} onChange={handleChange} required />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                        <Input label="الطابق (اختياري)" name="destination.floor" value={formData.destination?.floor || ''} onChange={handleChange} />
                        <Input label="القسم/المكتب (اختياري)" name="destination.sectionOrOffice" value={formData.destination?.sectionOrOffice || ''} onChange={handleChange} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                        <Input label="الوقت المتوقع لبدء المهمة" name="expectedStartTime" type="datetime-local" value={formData.expectedStartTime ? new Date(new Date(formData.expectedStartTime).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''} onChange={handleChange} />
                        <Input label="الوقت المتوقع لانتهاء المهمة" name="expectedEndTime" type="datetime-local" value={formData.expectedEndTime ? new Date(new Date(formData.expectedEndTime).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''} onChange={handleChange} />
                    </div>
                </Card>
                {initialData?.id && ( // Show status update only when editing
                    <Card title="تحديث حالة المهمة" titleClassName="text-sm">
                        <Select label="الحالة الحالية للمهمة" name="currentStatus" value={formData.currentStatus} options={trackingStatusOptions} onChange={handleChange} />
                        <TextArea name="updateNotes" label="ملاحظات على تحديث الحالة (اختياري)" rows={2} placeholder="أضف أي ملاحظات إضافية مع تحديث الحالة..."/>
                    </Card>
                )}
                <div className="flex justify-end space-x-2 space-x-reverse pt-2">
                    <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
                    <Button type="submit">{initialData?.id ? 'حفظ التعديلات' : 'إسناد المهمة'}</Button>
                </div>
            </form>
        </Modal>
    );
};

// --- Main Page Component ---
const PartyTrackingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('activeAssignments');
  
  const [assignments, setAssignments] = useState<PartyAssignment[]>(mockPartyAssignments);
  const [trackableParties, setTrackableParties] = useState<TrackableParty[]>(mockTrackableParties);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const [isPartyFormOpen, setIsPartyFormOpen] = useState(false);
  const [editingParty, setEditingParty] = useState<TrackableParty | null>(null);
  
  const [isAssignmentFormOpen, setIsAssignmentFormOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<PartyAssignment | null>(null);
  const [viewingAssignment, setViewingAssignment] = useState<PartyAssignment | null>(null);

  // --- NOTIFICATION LOGIC ---
  const handleDismissNotification = useCallback((id: string, alertType: 'start' | 'end') => {
    setNotifications(prev => prev.filter(n => !(n.id === id && n.alertType === alertType)));
  }, []);

  useEffect(() => {
    const checkUpcomingAssignments = () => {
      const now = new Date();
      const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
      
      const upcomingNotifications: NotificationItem[] = [];

      assignments.forEach(assignment => {
        if (assignment.currentStatus === TrackingStatus.TASK_COMPLETED || assignment.currentStatus === TrackingStatus.RETURNED_TO_OFFICE) {
          return;
        }

        if (assignment.expectedStartTime) {
          const startTime = new Date(assignment.expectedStartTime);
          if (startTime > now && startTime <= thirtyMinutesFromNow) {
            if (!notifications.some(n => n.id === assignment.id && n.alertType === 'start')) {
              upcomingNotifications.push({ ...assignment, alertType: 'start', alertTime: assignment.expectedStartTime });
            }
          }
        }
        if (assignment.expectedEndTime) {
          const endTime = new Date(assignment.expectedEndTime);
          if (endTime > now && endTime <= thirtyMinutesFromNow) {
            if (!notifications.some(n => n.id === assignment.id && n.alertType === 'end')) {
              upcomingNotifications.push({ ...assignment, alertType: 'end', alertTime: assignment.expectedEndTime });
            }
          }
        }
      });
      
      if (upcomingNotifications.length > 0) {
        setNotifications(prev => {
            const existingIds = new Set(prev.map(n => `${n.id}-${n.alertType}`));
            const newUniqueNotifications = upcomingNotifications.filter(n => !existingIds.has(`${n.id}-${n.alertType}`));
            return [...prev, ...newUniqueNotifications];
        });
      }
    };
    
    const intervalId = setInterval(checkUpcomingAssignments, 30000); // Check every 30 seconds
    return () => clearInterval(intervalId);
  }, [assignments, notifications]);


  // Party CRUD
  const handlePartySubmit = (party: TrackableParty) => {
    setTrackableParties(prev => editingParty ? prev.map(p => p.id === party.id ? party : p) : [party, ...prev]);
    setIsPartyFormOpen(false); setEditingParty(null);
  };
  const openPartyForm = (party?: TrackableParty) => { setEditingParty(party || null); setIsPartyFormOpen(true); };
  const deleteParty = (id: string) => { if(window.confirm('هل أنت متأكد؟ سيؤثر هذا على المهام المسندة لهذا الطرف.')) setTrackableParties(prev => prev.filter(p => p.id !== id)); };

  // Assignment CRUD and Status Update
  const handleAssignmentSubmit = (assignment: PartyAssignment) => {
    const isEditing = !!editingAssignment?.id;
    let updatedAssignment = { ...assignment };

    if (isEditing) {
        const originalAssignment = assignments.find(a => a.id === editingAssignment.id);
        const updateNotesField = (document.querySelector('textarea[name="updateNotes"]') as HTMLTextAreaElement)?.value;

        if (originalAssignment && originalAssignment.currentStatus !== assignment.currentStatus) {
            const newLogEntry: TrackingEntry = {
                id: `log-${Date.now()}`,
                timestamp: new Date().toISOString(),
                status: assignment.currentStatus,
                recordedBy: assignment.assignedByLawyerName, 
                notes: `الحالة تغيرت إلى: ${assignment.currentStatus}. ${updateNotesField || ''}`.trim(),
                locationDetails: (assignment.currentStatus === TrackingStatus.ARRIVED_AT_LOCATION || assignment.currentStatus === TrackingStatus.AT_SPECIFIC_DEPARTMENT) && assignment.destination.courtOrDepartmentName ? assignment.destination : undefined
            };
            updatedAssignment.trackingLog = [...(originalAssignment.trackingLog || []), newLogEntry];
        }
        updatedAssignment.lastUpdateTimestamp = new Date().toISOString();
        setAssignments(prev => prev.map(a => a.id === editingAssignment.id ? updatedAssignment : a));
    } else {
        updatedAssignment.lastUpdateTimestamp = new Date().toISOString();
        setAssignments(prev => [updatedAssignment, ...prev]);
    }
    
    setIsAssignmentFormOpen(false); 
    setEditingAssignment(null);
  };
  const openAssignmentForm = (assign?: PartyAssignment) => { setEditingAssignment(assign || null); setIsAssignmentFormOpen(true); };
  const deleteAssignment = (id: string) => { if(window.confirm('هل أنت متأكد من حذف هذه المهمة؟')) setAssignments(prev => prev.filter(a => a.id !== id)); };

  const fullTrackingLog = useMemo(() => {
    return assignments.flatMap(assign => 
        assign.trackingLog.map(log => ({
            ...log,
            assignmentId: assign.id,
            taskDescription: assign.taskDescription.substring(0, 50) + '...',
            partyName: assign.trackablePartyName,
        }))
    ).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [assignments]);


  const renderActiveAssignments = () => (
    <Card title="المهام الميدانية النشطة والحالية">
        <div className="mb-4 flex justify-end">
            <Button onClick={() => openAssignmentForm()} leftIcon={<PlusCircleIcon className="w-5"/>}>إسناد مهمة جديدة</Button>
        </div>
        {assignments.filter(a => a.currentStatus !== TrackingStatus.TASK_COMPLETED && a.currentStatus !== TrackingStatus.RETURNED_TO_OFFICE).length === 0 && <p className="text-gray-500 text-center py-4">لا توجد مهام نشطة حاليًا.</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignments.filter(a => a.currentStatus !== TrackingStatus.TASK_COMPLETED && a.currentStatus !== TrackingStatus.RETURNED_TO_OFFICE).map(assign => (
                <Card key={assign.id} title={assign.taskDescription.substring(0,40) + '...'} className="shadow-md hover:shadow-lg transition-shadow flex flex-col" titleClassName="text-sm">
                    <div className="text-xs space-y-1 flex-grow">
                        <p><strong>المكلف:</strong> {assign.trackablePartyName}</p>
                        <p><strong>القضية:</strong> {assign.caseNumber || '-'}</p>
                        <p><strong>الوجهة:</strong> {assign.destination.courtOrDepartmentName} {assign.destination.sectionOrOffice && `- ${assign.destination.sectionOrOffice}`}</p>
                        <p><strong>المحامي المشرف:</strong> {assign.assignedByLawyerName}</p>
                        <p><strong>وقت البدء المتوقع:</strong> {formatDate(assign.expectedStartTime, true)}</p>
                        <p><strong>الحالة الحالية:</strong> <TrackingStatusBadge status={assign.currentStatus} /></p>
                        <p><strong>آخر تحديث:</strong> {formatDate(assign.lastUpdateTimestamp, true)}</p>
                    </div>
                    <div className="border-t pt-2 mt-2 flex justify-end space-x-1 space-x-reverse">
                        <Button variant="ghost" size="sm" onClick={() => setViewingAssignment(assign)}><EyeIcon className="w-3.5 text-primary"/></Button>
                        <Button variant="ghost" size="sm" onClick={() => openAssignmentForm(assign)}><PencilIcon className="w-3.5 text-yellow-600"/></Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteAssignment(assign.id)} className="text-danger"><TrashIcon className="w-3.5"/></Button>
                    </div>
                </Card>
            ))}
        </div>
    </Card>
  );
  const renderManageParties = () => (
    <Card title="إدارة الأطراف المتتبعة (المندوبون، المعقبون)">
      <div className="mb-4 flex justify-end">
        <Button onClick={() => openPartyForm()} leftIcon={<PlusCircleIcon className="w-5"/>}>إضافة طرف جديد</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-100"><tr>{['الاسم', 'الهاتف', 'نوع العلاقة', 'جهة العمل', 'إجراءات'].map(h=><th key={h} className="px-3 py-2 text-right">{h}</th>)}</tr></thead>
          <tbody>
            {trackableParties.map(p => (
              <tr key={p.id}>
                <td className="px-3 py-2 flex items-center">
                    <img src={p.idCardPhotoUrl || `https://ui-avatars.com/api/?name=${p.fullName.replace(/\s+/g, '+')}&background=random`} alt={p.fullName} className="w-7 h-7 rounded-full me-2 object-cover"/>
                    {p.fullName}
                </td>
                <td className="px-3 py-2">{p.phone}</td>
                <td className="px-3 py-2">{p.relationshipType}</td>
                <td className="px-3 py-2">{p.organizationOrOffice || '-'}</td>
                <td className="px-3 py-2 space-x-1 space-x-reverse">
                  <Button variant="ghost" size="sm" onClick={() => openPartyForm(p)}><PencilIcon className="w-4 text-yellow-600"/></Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteParty(p.id)} className="text-danger"><TrashIcon className="w-4"/></Button>
                </td>
              </tr>
            ))}
            {trackableParties.length === 0 && <tr><td colSpan={5} className="text-center py-4">لا توجد أطراف مسجلة.</td></tr>}
          </tbody>
        </table>
      </div>
    </Card>
  );
  const renderFullLog = () => (
    <Card title="سجل التتبع الشامل لجميع المهام">
        {fullTrackingLog.length === 0 && <p className="text-gray-500 text-center py-4">لا توجد سجلات تتبع.</p>}
        <ul className="space-y-2 max-h-[60vh] overflow-y-auto p-1 scrollbar-thin">
            {fullTrackingLog.map(log => (
                <li key={log.id} className="p-2 border rounded-md bg-slate-50 text-xs">
                    <p><strong>وقت التحديث:</strong> {formatDate(log.timestamp, true)} (بواسطة: {log.recordedBy})</p>
                    <p><strong>المهمة:</strong> {log.taskDescription} (لـِ: {log.partyName})</p>
                    <p><strong>الحالة الجديدة:</strong> <TrackingStatusBadge status={log.status} /></p>
                    {log.locationDetails?.courtOrDepartmentName && <p><strong>الموقع:</strong> {log.locationDetails.courtOrDepartmentName} {log.locationDetails.sectionOrOffice ? `- ${log.locationDetails.sectionOrOffice}` : ''}</p>}
                    {log.notes && <p><strong>ملاحظات:</strong> {log.notes}</p>}
                </li>
            ))}
        </ul>
    </Card>
  );

  const tabsConfig = [
    { key: 'activeAssignments', label: 'المهام النشطة', icon: <BriefcaseIcon className="w-4 h-4 me-1.5" /> },
    { key: 'manageParties', label: 'إدارة الأطراف', icon: <UsersIcon className="w-4 h-4 me-1.5" /> },
    { key: 'fullLog', label: 'سجل التتبع الشامل', icon: <CalendarDaysIcon className="w-4 h-4 me-1.5" /> },
  ];

  return (
    <div className="space-y-6">
        {/* Notification Area */}
        <div className="fixed top-20 right-4 z-50 space-y-2">
            {notifications.map(notification => (
                <NotificationCard 
                    key={`${notification.id}-${notification.alertType}`} 
                    assignment={notification} 
                    onDismiss={() => handleDismissNotification(notification.id, notification.alertType)} 
                />
            ))}
        </div>

      <div className="flex items-center">
        <MapPinIcon className="w-8 h-8 text-primary me-3" />
        <h1 className="text-3xl font-bold text-primary-dark">تتبع الأطراف والمهام الميدانية</h1>
      </div>
      
      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start">
            <InformationCircleIcon className="w-6 h-6 text-blue-600 me-3 mt-1 flex-shrink-0" />
            <div>
                <h3 className="text-md font-semibold text-blue-700 mb-1">متابعة دقيقة لتحركات الفريق القانوني</h3>
                <p className="text-sm text-blue-600 leading-relaxed">
                    تمكنك هذه الوحدة من تسجيل وتتبع المهام الميدانية المسندة للمندوبين والمعقبين، وتحديث حالتهم ومواقعهم لحظيًا.
                    <br/>
                    تهدف إلى تعزيز التنسيق، ضمان الالتزام بالمواعيد، وتوفير سجل موثق لكافة التحركات المتعلقة بالقضايا والمهام خارج المكتب.
                </p>
            </div>
        </div>
      </Card>

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-4 space-x-reverse overflow-x-auto scrollbar-thin pb-1" aria-label="Tabs">
          {tabsConfig.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={`whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm flex items-center
                ${activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'activeAssignments' && renderActiveAssignments()}
      {activeTab === 'manageParties' && renderManageParties()}
      {activeTab === 'fullLog' && renderFullLog()}

      <PartyForm isOpen={isPartyFormOpen} onClose={() => setIsPartyFormOpen(false)} onSubmit={handlePartySubmit} initialData={editingParty} />
      <AssignmentFormModal 
        isOpen={isAssignmentFormOpen} 
        onClose={() => setIsAssignmentFormOpen(false)} 
        onSubmit={handleAssignmentSubmit} 
        initialData={editingAssignment}
        parties={trackableParties}
        cases={initialCases}
        lawyers={initialEmployees}
      />
      
      {viewingAssignment && (
          <Modal isOpen={!!viewingAssignment} onClose={()=>setViewingAssignment(null)} title={`تفاصيل المهمة: ${viewingAssignment.taskDescription.substring(0,30)}...`} size="lg">
            <div className="space-y-2 p-2 text-sm max-h-[70vh] overflow-y-auto">
                <p><strong>المكلف:</strong> {viewingAssignment.trackablePartyName}</p>
                <p><strong>القضية المرتبطة:</strong> {viewingAssignment.caseNumber || 'لا يوجد'}</p>
                <p><strong>وصف المهمة:</strong> {viewingAssignment.taskDescription}</p>
                <p><strong>الوجهة:</strong> {viewingAssignment.destination.courtOrDepartmentName} {viewingAssignment.destination.floor && `- ${viewingAssignment.destination.floor}`} {viewingAssignment.destination.sectionOrOffice && `- ${viewingAssignment.destination.sectionOrOffice}`}</p>
                <p><strong>المحامي المشرف:</strong> {viewingAssignment.assignedByLawyerName}</p>
                <p><strong>وقت البدء المتوقع:</strong> {formatDate(viewingAssignment.expectedStartTime, true)}</p>
                <p><strong>الحالة الحالية:</strong> <TrackingStatusBadge status={viewingAssignment.currentStatus} size="sm"/></p>
                <hr/>
                <h4 className="font-semibold">سجل التتبع:</h4>
                <ul className="list-disc ps-5 space-y-1 text-xs">
                    {viewingAssignment.trackingLog.map(log => (
                        <li key={log.id}>
                            {formatDate(log.timestamp, true)} - <strong>{log.status}</strong> (بواسطة: {log.recordedBy})
                            {log.locationDetails?.courtOrDepartmentName && <span className="text-gray-500"> - الموقع: {log.locationDetails.courtOrDepartmentName}</span>}
                            {log.notes && <span className="text-gray-500"> - ملاحظات: {log.notes}</span>}
                        </li>
                    ))}
                </ul>
            </div>
          </Modal>
      )}
    </div>
  );
};

export default PartyTrackingPage;