import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import SignaturePad from '../components/ui/SignaturePad';
import { Badge, BadgeColor } from '../components/ui/Badge';
import { 
    MapPinIcon, PlusCircleIcon, EyeIcon, PencilIcon, TrashIcon, 
    CheckCircleIcon, UserGroupIcon, FolderIcon, ClockIcon, ArrowPathIcon,
    BuildingOffice2Icon, ClipboardListCheckIcon, CameraIcon, PaperClipIcon,
    ExclamationTriangleIcon, HistoryIcon, BriefcaseIcon, MagnifyingGlassIcon,
    UserCircleIcon, KeyIcon, IdentificationIcon, CalendarDaysIcon, PhoneIcon, EnvelopeIcon
} from '../constants';
import { 
    PartyAssignment, TrackableParty, TrackingStatus, TrackingLocationDetails, 
    TrackingEntry, PartyRelationshipType, Case, Employee, FieldTaskCategory 
} from '../types';
import { 
    trackingStatusOptions, partyRelationshipTypeOptions, KUWAIT_COURTS_LIST,
    fieldTaskCategoryOptions
} from '../constants';
import { initialCases } from '../data/caseData';
import { initialEmployees } from './EmployeeProfilePage';

// Standardized Case Party Roles (Plaintiff, Defendant, Third Party, Intervenor)
enum CasePartyRole {
    PLAINTIFF = 'مدعي (Plaintiff)',
    DEFENDANT = 'مدعى عليه (Defendant)',
    THIRD_PARTY = 'خصم أدخل/منضم (Third Party)',
    INTERVENOR = 'متدخل هجومي/انضمامي (Intervenor)'
}

interface CaseParty {
    id: string;
    fullName: string;
    role: CasePartyRole;
    idNumber: string; // ID/Passport
    phone: string;
    email: string;
    linkedCaseIds: string[]; // Linked to multiple cases
    notes: string;
    interactionHistory: { id: string; date: string; action: string; notes?: string }[];
}

// Mock Case Parties Data
const initialCaseParties: CaseParty[] = [
    {
        id: 'party-001',
        fullName: 'شركة الروتيل للخدمات اللوجستية',
        role: CasePartyRole.PLAINTIFF,
        idNumber: 'KUW-9900881',
        phone: '965-44002211',
        email: 'info@rotile-logistics.com',
        linkedCaseIds: ['1', '3'],
        notes: 'العميل معفي من الرسوم الجزئية بموجب الاتفاقية السنوية مع المكتب.',
        interactionHistory: [
            { id: 'intl-1', date: '2024-05-10', action: 'استلام مستندات الأهلية وعقد التأسيس الموثق' },
            { id: 'intl-2', date: '2024-05-18', action: 'مراجعة أولية لعقد الاستدلال القضائي مع المستشار صبري شطا' }
        ]
    },
    {
        id: 'party-002',
        fullName: 'السيد/ عبد المحسن ثنيان الغانم',
        role: CasePartyRole.DEFENDANT,
        idNumber: '289101201144',
        phone: '965-66007788',
        email: 'a.alghanim@gmail.com',
        linkedCaseIds: ['1'],
        notes: 'الخصم يمثله مكتب الدستور للمحاماة. جاري إعلان صحيفة الاستئناف.',
        interactionHistory: [
            { id: 'intl-3', date: '2024-05-12', action: 'رفض التسوية الودية المقترحة لمستحقات نهاية الاستئناف' }
        ]
    },
    {
        id: 'party-003',
        fullName: 'بنك بوبيان الإسلامي (مكتب الفروانية)',
        role: CasePartyRole.THIRD_PARTY,
        idNumber: 'BANK-BOB22',
        phone: '965-1820082',
        email: 'legal@boubyan.com',
        linkedCaseIds: ['2'],
        notes: 'أدخل بالخصومة لتقديم الميزانية التفصيلية لعوائد الصناديق الاستثمارية المستهدفة.',
        interactionHistory: [
            { id: 'intl-4', date: '2024-05-15', action: 'مخاطبة الممثل القانوني للبنك لتجهيز كشوف الحسابات' }
        ]
    },
    {
        id: 'party-004',
        fullName: 'الشركة الخليجية للتعمير العقاري',
        role: CasePartyRole.INTERVENOR,
        idNumber: 'KGC-887711',
        phone: '965-44556600',
        email: 'legal@kgc-group.com',
        linkedCaseIds: ['3'],
        notes: 'متدخل انضمامي لحماية الرهن التأميني المقيد على العقار موضوع النزاع الحالي.',
        interactionHistory: [
            { id: 'intl-5', date: '2024-05-20', action: 'تقديم مذكرة التدخل الانضمامي في ملف الدعوى بمجمع محاكم الرقعي' }
        ]
    }
];

// Existing Field Executions Data (TrackableParty)
const mockParties: TrackableParty[] = [
    { id: 'p1', fullName: 'محمد علي (مندوب الرقعي)', phone: '90001111', relationshipType: PartyRelationshipType.DELEGATE, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    { id: 'p2', fullName: 'سالم أحمد (معقب العاصمة)', phone: '90002222', relationshipType: PartyRelationshipType.CASE_FOLLOWER, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    { id: 'p3', fullName: 'عبد الرزاق القطان (مندوب الفروانية)', phone: '90003333', relationshipType: PartyRelationshipType.DELEGATE, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
];

const mockAssignments: PartyAssignment[] = [
    {
        id: 'assign1',
        trackablePartyId: 'p1',
        trackablePartyName: 'محمد علي (مندوب الرقعي)',
        caseId: '1',
        caseNumber: 'CML-2024-101',
        taskCategory: FieldTaskCategory.DOCUMENT_FILING,
        taskDescription: 'إيداع صحيفة دعوى استئناف',
        destination: { courtOrDepartmentName: 'قصر العدل', floor: 'الأرضي', sectionOrOffice: 'الجدول العام' },
        assignedByLawyerId: 'emp-001',
        assignedByLawyerName: 'أحمد محمود مبارك',
        currentStatus: TrackingStatus.TASK_COMPLETED,
        trackingLog: [
            { id: 'log1', timestamp: '2024-08-01T08:00:00Z', status: TrackingStatus.PREPARING_TO_LEAVE, recordedBy: 'أحمد محمود مبارك' },
            { id: 'log2', timestamp: '2024-08-01T10:00:00Z', status: TrackingStatus.TASK_COMPLETED, recordedBy: 'محمد علي', notes: 'تم الإيداع بنجاح والحصول على الختم' }
        ],
        lastUpdateTimestamp: '2024-08-01T10:00:00Z',
        createdAt: '2024-08-01T08:00:00Z',
        updatedAt: '2024-08-01T10:00:00Z'
    },
    {
        id: 'assign2',
        trackablePartyId: 'p2',
        trackablePartyName: 'سالم أحمد (معقب العاصمة)',
        caseId: '2',
        caseNumber: 'GEN-2024-205',
        taskCategory: FieldTaskCategory.JUDICIAL_NOTIFICATION,
        taskDescription: 'إعلان خصم في منطقة كيفان',
        destination: { courtOrDepartmentName: 'محكمة العاصمة', floor: 'الأرضي', sectionOrOffice: 'قسم الإعلان' },
        assignedByLawyerId: 'emp-001',
        assignedByLawyerName: 'أحمد محمود مبارك',
        currentStatus: TrackingStatus.ON_THE_WAY,
        trackingLog: [
            { id: 'log3', timestamp: '2024-08-02T09:00:00Z', status: TrackingStatus.PREPARING_TO_LEAVE, recordedBy: 'أحمد محمود مبارك' },
            { id: 'log4', timestamp: '2024-08-02T09:30:00Z', status: TrackingStatus.ON_THE_WAY, recordedBy: 'سالم أحمد' }
        ],
        lastUpdateTimestamp: '2024-08-02T09:30:00Z',
        createdAt: '2024-08-02T09:00:00Z'
    }
];

const getTrackingStatusColor = (status: TrackingStatus): BadgeColor => {
    switch (status) {
        case TrackingStatus.TASK_COMPLETED: return 'green';
        case TrackingStatus.UNABLE_TO_COMPLETE: case TrackingStatus.DELAYED: return 'red';
        case TrackingStatus.TASK_IN_PROGRESS: case TrackingStatus.AT_SPECIFIC_DEPARTMENT: return 'blue';
        case TrackingStatus.ON_THE_WAY: case TrackingStatus.ARRIVED_AT_LOCATION: return 'yellow';
        case TrackingStatus.RETURNED_TO_OFFICE: return 'gray';
        default: return 'gray';
    }
};

const TrackingStatusBadge: React.FC<{ status: TrackingStatus, size?: 'xs' | 'sm' }> = ({ status, size = 'xs' }) => (
    <Badge text={status} color={getTrackingStatusColor(status)} size={size} />
);

const openGoogleMaps = (destination: TrackingLocationDetails) => {
    const query = encodeURIComponent(`${destination.courtOrDepartmentName} الكويت`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
};

const formatDate = (dateStr?: string, includeTime = false) => {
    if (!dateStr) return '-';
    try {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        if (includeTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }
        return new Date(dateStr).toLocaleDateString('ar-EG', options);
    } catch (e) { return dateStr; }
};

// --- Modal Components ---
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
    const { addToast } = useToast();
    const [formData, setFormData] = useState<Partial<PartyAssignment>>({});
    const [isSigning, setIsSigning] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsSigning(false);
            if (initialData) {
                setFormData(initialData);
            } else {
                setFormData({
                    trackablePartyId: parties[0]?.id || '',
                    caseId: undefined,
                    taskCategory: FieldTaskCategory.JUDICIAL_NOTIFICATION,
                    taskDescription: '',
                    destination: { courtOrDepartmentName: KUWAIT_COURTS_LIST[0]?.value || 'المحكمة الكلية (قصر العدل)', floor: 'الأرضي', sectionOrOffice: 'قسم الإعلان' },
                    assignedByLawyerId: lawyers[0]?.id || '',
                    currentStatus: TrackingStatus.PREPARING_TO_LEAVE,
                    trackingLog: [],
                    createdAt: new Date().toISOString(),
                    lastUpdateTimestamp: new Date().toISOString(),
                });
            }
        }
    }, [isOpen, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('destination.')) {
            const destField = name.split('.')[1] as keyof TrackingLocationDetails;
            setFormData(prev => ({ ...prev, destination: { ...(prev.destination || {courtOrDepartmentName:''}), [destField]: value } }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.trackablePartyId || !formData.taskDescription || !formData.destination?.courtOrDepartmentName || !formData.assignedByLawyerId) {
            addToast({
                type: 'warning',
                title: 'بيانات ناقصة',
                message: 'يرجى ملء حقول الطرف المتتبع، وصف المهمة بوضوح والمحامي المشرف عليها.'
            });
            return;
        }

        const party = parties.find(p => p.id === formData.trackablePartyId);
        const caseInfo = formData.caseId ? cases.find(c => c.id === formData.caseId) : null;
        const lawyer = lawyers.find(l => l.id === formData.assignedByLawyerId);
        
        let firstLogEntry: TrackingEntry | undefined = undefined;
        if (!formData.id) { 
          firstLogEntry = {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            status: TrackingStatus.PREPARING_TO_LEAVE,
            recordedBy: lawyer?.fullNameAr || 'النظام الإداري',
            notes: 'تم صياغة المهمة الميدانية وإسنادها رسمياً.'
          };
        }
    
        const assignmentPayload: PartyAssignment = { 
            ...(formData as PartyAssignment), 
            id: formData.id || `assign-${Date.now()}`,
            trackablePartyName: party?.fullName || '',
            caseNumber: caseInfo?.caseNumber,
            assignedByLawyerName: lawyer?.fullNameAr || '',
            taskCategory: formData.taskCategory || FieldTaskCategory.OTHER,
            trackingLog: formData.id ? (formData.trackingLog || []) : (firstLogEntry ? [firstLogEntry] : []),
            lastUpdateTimestamp: new Date().toISOString(),
            createdAt: formData.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        onSubmit(assignmentPayload);
    };

    const handleSignatureSave = (dataUrl: string) => {
        setFormData(prev => ({ ...prev, signatureUrl: dataUrl, signedBy: 'المندوب/المعني بالتسليم', signedAt: new Date().toISOString() }));
        setIsSigning(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={formData.id ? "تعديل التكليف الميداني" : "إسناد تكليف ميداني جديد للمناديب"} size="lg">
            {isSigning ? (
                <div className="p-4">
                    <SignaturePad 
                        title="إقرار وتوقيع المندوب"
                        onSave={handleSignatureSave}
                        onCancel={() => setIsSigning(false)}
                    />
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4 p-1 max-h-[75vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select label="الطرف المتتبع (المندوب/المعقب)" name="trackablePartyId" value={formData.trackablePartyId} options={parties.map(p=>({value:p.id, label:p.fullName}))} onChange={handleChange} required />
                        <Select label="تصنيف التكليف" name="taskCategory" value={formData.taskCategory} options={fieldTaskCategoryOptions} onChange={handleChange} required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <Select label="المحامي المشرف على النزول" name="assignedByLawyerId" value={formData.assignedByLawyerId} options={lawyers.map(l=>({value:l.id, label:l.fullNameAr}))} onChange={handleChange} required />
                         <Select label="الارتباط القضائي بملف الدعوى" name="caseId" value={formData.caseId || ''} options={[{value:'', label:'غير مرتبطة محددة'}, ...cases.map(c=>({value:c.id, label:`القضية رقم ${c.caseNumber} - ${c.title}`}))]} onChange={handleChange} />
                    </div>
                    
                    <div className="p-4 bg-gray-50 dark:bg-dm-background rounded-2xl border dark:border-gray-800 space-y-3">
                        <h4 className="text-xs font-black text-gray-700 dark:text-gray-300">الوجهة والطرف المقصود</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <Select label="المحكمة المستهدفة" name="destination.courtOrDepartmentName" value={formData.destination?.courtOrDepartmentName || ''} options={KUWAIT_COURTS_LIST} onChange={handleChange} required />
                            <Input label="الدور" name="destination.floor" value={formData.destination?.floor || ''} onChange={handleChange} placeholder="مثال: الدور الأول" />
                            <Input label="القسم / الغرفة" name="destination.sectionOrOffice" value={formData.destination?.sectionOrOffice || ''} onChange={handleChange} placeholder="مثال: الجدول العام" />
                        </div>
                    </div>

                    <TextArea label="مسؤوليات وتوجيهات المهمة بالتفصيل" name="taskDescription" value={formData.taskDescription || ''} onChange={handleChange} required rows={3} placeholder="اكتب ما يتعين على المندوب فعله بمقر المحكمة..."/>
                    
                    {formData.signatureUrl && (
                        <div className="p-3 bg-green-50 rounded-xl border border-green-200 flex items-center justify-between">
                            <span className="text-xs text-green-700 font-extrabold flex items-center gap-1">✅ معتمد تزامناً مع توقيع الختم الفني</span>
                            <button type="button" onClick={() => setIsSigning(true)} className="text-xs text-primary underline">تحديث التوقيع</button>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-800">
                        <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">إلغاء</Button>
                        <Button type="button" variant="outline" onClick={() => setIsSigning(true)} className="rounded-xl text-primary border-primary/20">تضمين توقيع</Button>
                        <Button type="submit" className="rounded-xl px-6">حفظ واعتماد التكليف</Button>
                    </div>
                </form>
            )}
        </Modal>
    );
};

interface StatusUpdateModalProps {
    assignment: PartyAssignment | null;
    onClose: () => void;
    onUpdate: (id: string, newStatus: TrackingStatus, notes: string, location?: string) => void;
}

const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({ assignment, onClose, onUpdate }) => {
    const [status, setStatus] = useState<TrackingStatus>(TrackingStatus.ON_THE_WAY);
    const [notes, setNotes] = useState('');
    const [loc, setLoc] = useState('');

    useEffect(() => {
        if (assignment) {
            setStatus(assignment.currentStatus);
            setNotes('');
            setLoc(assignment.destination.courtOrDepartmentName);
        }
    }, [assignment]);

    if (!assignment) return null;

    return (
        <Modal isOpen={!!assignment} onClose={onClose} title="ثبت التحديث الميداني فورياً" size="md">
            <div className="space-y-4">
                <Select label="الوضع الميداني الحالي" value={status} options={trackingStatusOptions} onChange={(e)=>setStatus(e.target.value as TrackingStatus)} required />
                <Input label="موقعك الحالي بالمجمع" value={loc} onChange={(e)=>setLoc(e.target.value)} placeholder="مثال: أمام الدائرة التجارية - قاعة 3" />
                <TextArea label="ملاحظات النزول والمطالعة" value={notes} onChange={(e)=>setNotes(e.target.value)} rows={3} placeholder="يرجى كتابة ما آلت إليه الإجراءات..." />
                <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-800">
                    <Button variant="outline" onClick={onClose} className="rounded-xl">إلغاء</Button>
                    <Button onClick={() => onUpdate(assignment.id, status, notes, loc)} className="rounded-xl px-6">تسجيل التحديث</Button>
                </div>
            </div>
        </Modal>
    );
};

// --- CASE PARTIES REGISTRY FORMS ---
interface PartyFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (party: CaseParty) => void;
    initialData?: CaseParty | null;
}

const CasePartyFormModal: React.FC<PartyFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const { addToast } = useToast();
    const [formData, setFormData] = useState<Partial<CaseParty>>({});

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData(initialData);
            } else {
                setFormData({
                    fullName: '',
                    role: CasePartyRole.PLAINTIFF,
                    idNumber: '',
                    phone: '',
                    email: '',
                    linkedCaseIds: ['1'],
                    notes: ''
                });
            }
        }
    }, [isOpen, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCheckboxChange = (caseId: string) => {
        const currentLinks = formData.linkedCaseIds || [];
        if (currentLinks.includes(caseId)) {
            setFormData(prev => ({ ...prev, linkedCaseIds: currentLinks.filter(id => id !== caseId) }));
        } else {
            setFormData(prev => ({ ...prev, linkedCaseIds: [...currentLinks, caseId] }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.fullName || !formData.idNumber || !formData.phone) {
            addToast({ type: 'warning', title: 'بيانات ناقصة', message: 'يرجى إكمال اسم الطرف، رقم الهوية وعنوان الاتصال.' });
            return;
        }

        const partyObj: CaseParty = {
            ...(formData as CaseParty),
            id: formData.id || `party-${Date.now()}`,
            interactionHistory: formData.interactionHistory || [
                { id: `i-${Date.now()}`, date: new Date().toISOString().split('T')[0], action: 'تسجيل الطرف بالدائرة وإقرار الربط الحركي بالقضايا' }
            ]
        };
        onSubmit(partyObj);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={formData.id ? "تعديل وحوكمة طرف قضائي" : "تسجيل طرف قضائي جديد للخصام"} size="md">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="الاسم الكامل للطرف القضائي" name="fullName" value={formData.fullName || ''} onChange={handleChange} required />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select label="دوره القانوني موضوع الخصومة" name="role" value={formData.role} options={Object.values(CasePartyRole).map(r=>({value:r, label:r}))} onChange={handleChange} required />
                    <Input label="الرقم المدني / جواز السفر المعتمد" name="idNumber" value={formData.idNumber || ''} onChange={handleChange} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="هاتف التواصل" name="phone" value={formData.phone || ''} onChange={handleChange} required />
                    <Input label="البريد الإلكتروني المعتمد للإخطار" name="email" value={formData.email || ''} onChange={handleChange} />
                </div>

                <div className="p-4 bg-gray-50 dark:bg-dm-background rounded-2xl border dark:border-gray-800">
                    <label className="text-xs font-black text-gray-500 mb-3 block">ربط الطرف بملفات قضايا حية بالمكتب:</label>
                    <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                        {initialCases.map(c => (
                            <label key={c.id} className="flex items-center gap-2.5 text-xs font-bold text-gray-700 dark:text-gray-350 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={formData.linkedCaseIds?.includes(c.id) || false}
                                    onChange={() => handleCheckboxChange(c.id)}
                                    className="rounded border-gray-300 text-primary focus:ring-primary/20 accent-primary"
                                />
                                <span>القضية رقم {c.caseNumber} - {c.title}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <TextArea label="ملاحظات وتوجيهات الخصوم" name="notes" value={formData.notes || ''} onChange={handleChange} rows={2} />

                <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-800">
                    <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">إلغاء</Button>
                    <Button type="submit" className="rounded-xl px-6">حفظ وتسجيل الطرف</Button>
                </div>
            </form>
        </Modal>
    );
};

// --- PARTY TRACKING PAGE ---
const PartyTrackingPage: React.FC = () => {
    const { addToast } = useToast();
    
    // Primary View tab ('field_delegates' or 'case_entities')
    const [primaryTab, setPrimaryTab] = useState<'field_delegates' | 'case_entities'>('case_entities');

    // --- Sub Tab 1: Delegates states ---
    const [assignments, setAssignments] = useState<PartyAssignment[]>(mockAssignments);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState<PartyAssignment | null>(null);
    const [viewingAssignment, setViewingAssignment] = useState<PartyAssignment | null>(null);
    const [statusUpdateAssignment, setStatusUpdateAssignment] = useState<PartyAssignment | null>(null);

    // --- Sub Tab 2: Case Parties State ---
    const [caseParties, setCaseParties] = useState<CaseParty[]>(initialCaseParties);
    const [partiesSearchQuery, setPartiesSearchQuery] = useState('');
    const [selectedPartyForMap, setSelectedPartyForMap] = useState<CaseParty | null>(initialCaseParties[0]);
    const [isPartyModalOpen, setIsPartyModalOpen] = useState(false);
    const [editingParty, setEditingParty] = useState<CaseParty | null>(null);
    const [viewingParty, setViewingParty] = useState<CaseParty | null>(null);

    // Filter assignments
    const filteredAssignments = useMemo(() => {
        return assignments.filter(assign =>
            assign.trackablePartyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            assign.taskDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
            assign.destination.courtOrDepartmentName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [assignments, searchQuery]);

    // Live activity Feed simulator
    const liveFeed = useMemo(() => {
        const feed: { id: string; timestamp: string; assignmentName: string; status: TrackingStatus; notes?: string }[] = [];
        assignments.forEach(assign => {
            assign.trackingLog.forEach((log, i) => {
                feed.push({
                    id: `${assign.id}-${i}`,
                    timestamp: log.timestamp,
                    assignmentName: assign.trackablePartyName,
                    status: log.status,
                    notes: log.notes
                });
            });
        });
        return feed.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8);
    }, [assignments]);

    // Stats calculations
    const stats = useMemo(() => {
        const total = assignments.length;
        const completed = assignments.filter(a => a.currentStatus === TrackingStatus.TASK_COMPLETED).length;
        const inProgress = assignments.filter(a => a.currentStatus === TrackingStatus.TASK_IN_PROGRESS || a.currentStatus === TrackingStatus.ON_THE_WAY).length;
        const delayed = assignments.filter(a => a.currentStatus === TrackingStatus.DELAYED || a.currentStatus === TrackingStatus.UNABLE_TO_COMPLETE).length;
        return { total, completed, inProgress, delayed };
    }, [assignments]);

    // Handler for Delegate Assignment Submit
    const handleAssignmentSubmit = (assignment: PartyAssignment) => {
        if (editingAssignment) {
            setAssignments(prev => prev.map(a => a.id === assignment.id ? assignment : a));
            addToast({ type: 'success', title: 'تعديل ناجح', message: 'تم تحديث التكليف الميداني بنجاح.' });
        } else {
            setAssignments(prev => [assignment, ...prev]);
            addToast({ type: 'success', title: 'حفظ ناجح', message: 'تم إسناد المهمة الميدانية للمندوب المعتمد.' });
        }
        setIsAssignmentModalOpen(false);
        setEditingAssignment(null);
    };

    const handleEditAssignment = (assignment: PartyAssignment) => {
        setEditingAssignment(assignment);
        setIsAssignmentModalOpen(true);
    };

    const handleDeleteAssignment = (id: string) => {
        if (confirm('هل ترغب في شطب هذا التكليف الميداني بشكل نهائي؟')) {
            setAssignments(prev => prev.filter(a => a.id !== id));
            addToast({ type: 'success', title: 'تم الحذف', message: 'تم التخلص من التكليف الميداني المختار.' });
        }
    };

    const handleQuickStatusUpdate = (id: string, newStatus: TrackingStatus, notes: string, location?: string) => {
        setAssignments(prev => prev.map(assign => {
            if (assign.id === id) {
                const newLogEntry: TrackingEntry = {
                    id: `log-${Date.now()}`,
                    timestamp: new Date().toISOString(),
                    status: newStatus,
                    recordedBy: assign.trackablePartyName,
                    notes: notes,
                    locationDetails: location ? { courtOrDepartmentName: location } : undefined
                };
                return {
                    ...assign,
                    currentStatus: newStatus,
                    trackingLog: [...assign.trackingLog, newLogEntry],
                    lastUpdateTimestamp: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    signatureUrl: newStatus === TrackingStatus.TASK_COMPLETED ? assign.signatureUrl || '/signature-demo.png' : assign.signatureUrl,
                    signedBy: newStatus === TrackingStatus.TASK_COMPLETED ? 'المندوب بالمجمع' : assign.signedBy,
                    signedAt: newStatus === TrackingStatus.TASK_COMPLETED ? new Date().toISOString() : assign.signedAt
                };
            }
            return assign;
        }));
        setStatusUpdateAssignment(null);
        addToast({ type: 'success', title: 'تم تسجيل التحديث', message: 'جرى بث الإحداثيات والحالات إلى شاشة المتابعة.' });
    };

    // --- CASE PARTIES REGISTRY HANDLERS ---
    const handlePartySubmit = (party: CaseParty) => {
        const isEditing = caseParties.some(p => p.id === party.id);
        if (isEditing) {
            setCaseParties(prev => prev.map(p => p.id === party.id ? party : p));
            addToast({ type: 'success', title: 'تم التعديل الفني', message: `تم تحديث بيانات الطرف "${party.fullName}" وسجل الربط.` });
        } else {
            setCaseParties(prev => [party, ...prev]);
            addToast({ type: 'success', title: 'إضافة ناجحة', message: `تم تقييد الطرف "${party.fullName}" بدائرة المكتب الخاصة.` });
        }
        setIsPartyModalOpen(false);
        setEditingParty(null);
        setSelectedPartyForMap(party);
    };

    const handleDeleteParty = (id: string) => {
        if (confirm('هل أنت متأكد من رغبتك في شطب هذا الطرف القضائي من كافة ملفات القضايا بالمنظومة؟')) {
            setCaseParties(prev => prev.filter(p => p.id !== id));
            if (selectedPartyForMap?.id === id) {
                setSelectedPartyForMap(null);
            }
            addToast({ type: 'success', title: 'شطب ناجح', message: 'تم إقصاء الطرف بنجاح.' });
        }
    };

    const handleAddParty = () => {
        setEditingParty(null);
        setIsPartyModalOpen(true);
    };

    const handleEditParty = (party: CaseParty) => {
        setEditingParty(party);
        setIsPartyModalOpen(true);
    };

    const filteredCaseParties = useMemo(() => {
        return caseParties.filter(p => 
            p.fullName.toLowerCase().includes(partiesSearchQuery.toLowerCase()) ||
            p.idNumber.toLowerCase().includes(partiesSearchQuery.toLowerCase()) ||
            p.role.toLowerCase().includes(partiesSearchQuery.toLowerCase())
        );
    }, [caseParties, partiesSearchQuery]);

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-32">
            
            {/* Visual Header Grid Theme */}
            <div className="relative overflow-hidden bg-primary-dark rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-light/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-400/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl" />
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-6 text-center md:text-right">
                        <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl">
                            <UserGroupIcon className="w-10 h-10 text-white animate-pulse" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black tracking-tighter">وحدة الأطراف والمهام الميدانية الجارية</h1>
                            <p className="text-xs text-primary-light/85 mt-1 font-bold">إدارة المتنازعين والخصوم والمناديب وتنسيق إرساليات الإعلانات بمجمع المحاكم</p>
                        </div>
                    </div>
                    
                    {/* Switch layout views tabs */}
                    <div className="flex bg-white/10 p-1.5 rounded-2xl border border-white/10 gap-1 text-xs font-bold">
                        <button
                            onClick={() => setPrimaryTab('case_entities')}
                            className={`px-5 py-2.5 rounded-xl transition-all ${primaryTab === 'case_entities' ? 'bg-amber-400 text-slate-900 font-extrabold shadow-md' : 'text-white hover:bg-white/5'}`}
                        >
                            سجل أطراف القضايا والعلاقات
                        </button>
                        <button
                            onClick={() => setPrimaryTab('field_delegates')}
                            className={`px-5 py-2.5 rounded-xl transition-all ${primaryTab === 'field_delegates' ? 'bg-amber-400 text-slate-900 font-extrabold shadow-md' : 'text-white hover:bg-white/5'}`}
                        >
                            خطوط سير وتكليفات المناديب الميدانيين
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {/* --- SUB TAB 1: FIELD DELEGATE TRACKING VIEW --- */}
                {primaryTab === 'field_delegates' && (
                    <motion.div 
                        key="field_tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        {/* Mini Stats Banner */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard label="إجمالي إرساليات المندوبين" value={stats.total} icon={FolderIcon} color="blue" />
                            <StatCard label="قائم بالمهام حالياً" value={stats.inProgress} icon={ClockIcon} color="yellow" pulse />
                            <StatCard label="إيداعات مكتملة ومختومة" value={stats.completed} icon={CheckCircleIcon} color="green" />
                            <StatCard label="تعذّر المباشرة / تأمين" value={stats.delayed} icon={ExclamationTriangleIcon} color="red" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Main delegates tasks desk */}
                            <div className="lg:col-span-8 space-y-4">
                                <Card className="p-6 md:p-8 rounded-[2rem] border-none shadow-xl">
                                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                                        <h2 className="text-md font-black text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                            <ClipboardListCheckIcon className="w-5 h-5 text-primary" />
                                            شاشات مراقبة التكليفات الميدانية
                                        </h2>
                                        
                                        <div className="flex gap-2 w-full sm:w-auto">
                                            <div className="relative flex-grow sm:w-60">
                                                <input 
                                                    type="text" 
                                                    placeholder="بحث باسم المندوب أو الوجهة..."
                                                    className="w-full pr-10 pl-4 py-2.5 bg-gray-50 dark:bg-dm-background border-none rounded-xl text-xs font-bold"
                                                    value={searchQuery}
                                                    onChange={(e)=>setSearchQuery(e.target.value)}
                                                />
                                                <MagnifyingGlassIcon className="w-4.5 h-4.5 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                                            </div>
                                            <Button size="sm" onClick={() => { setEditingAssignment(null); setIsAssignmentModalOpen(true); }} className="rounded-xl font-bold"><PlusCircleIcon className="w-4 h-4 me-1.5"/>إسناد</Button>
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="min-w-full text-right text-xs">
                                            <thead>
                                                <tr className="bg-gray-50 dark:bg-dm-background border-b border-gray-100 dark:border-gray-800">
                                                    <th className="p-4 font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">المندوب وتفاصيل الربط</th>
                                                    <th className="p-4 font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center">التصنيف</th>
                                                    <th className="p-4 font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">المهمة الميدانية</th>
                                                    <th className="p-4 font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">الوجهة المقصودة</th>
                                                    <th className="p-4 font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center">الحالة</th>
                                                    <th className="p-4 font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center">التحكم</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-55 dark:divide-gray-800">
                                                {filteredAssignments.map(assign => (
                                                    <tr key={assign.id} className="hover:bg-gray-55/30 transition-colors group">
                                                        <td className="p-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center font-black text-primary">
                                                                    {assign.trackablePartyName.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <div className="font-black text-gray-800 dark:text-white">{assign.trackablePartyName}</div>
                                                                    <div className="text-[10px] text-gray-400 mt-0.5">{assign.caseNumber || 'إداري عام خارج النزاع'}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            <span className="px-2 py-0.5 bg-primary/5 text-primary rounded-md text-[9px] font-bold">{assign.taskCategory}</span>
                                                        </td>
                                                        <td className="p-4">
                                                            <p className="text-gray-650 dark:text-gray-300 font-medium truncate max-w-[150px]" title={assign.taskDescription}>{assign.taskDescription}</p>
                                                        </td>
                                                        <td className="p-4 whitespace-nowrap font-bold text-gray-600 dark:text-gray-450 flex items-center gap-1.5 mt-2">
                                                            <MapPinIcon className="w-3.5 h-3.5 text-red-500" />
                                                            {assign.destination.courtOrDepartmentName}
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            <TrackingStatusBadge status={assign.currentStatus}/>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex gap-1 justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                                                                <button onClick={() => setStatusUpdateAssignment(assign)} className="p-2.5 bg-gray-50 hover:bg-primary/10 text-primary rounded-xl" title="تسجيل تحديث حالي"><ArrowPathIcon className="w-4 h-4"/></button>
                                                                <button onClick={() => setViewingAssignment(assign)} className="p-2.5 bg-gray-50 hover:bg-blue-50 text-blue-600 rounded-xl" title="استعراض وسجل التواقيع"><EyeIcon className="w-4 h-4"/></button>
                                                                <button onClick={() => handleEditAssignment(assign)} className="p-2.5 bg-gray-50 hover:bg-amber-50 text-amber-600 rounded-xl" title="تحديث المهمة"><PencilIcon className="w-4 h-4"/></button>
                                                                <button onClick={() => handleDeleteAssignment(assign.id)} className="p-2.5 bg-gray-50 hover:bg-rose-50 text-rose-600 rounded-xl" title="شطب وإلغاء"><TrashIcon className="w-4 h-4"/></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            </div>

                            {/* Sidebar: live feed simulator */}
                            <div className="lg:col-span-4 space-y-6">
                                <Card title="موجز مباشر - أحداث حركة الحقل" icon={<HistoryIcon className="w-5 h-5 text-primary" />}>
                                    <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin">
                                        {liveFeed.map(update => (
                                            <div key={update.id} className="relative ps-5 border-s-2 border-primary/20 pb-4 last:pb-0">
                                                <div className="absolute -left-[6px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-white shadow-sm" />
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-xs font-black text-gray-800 dark:text-white truncate max-w-[120px]">{update.assignmentName}</span>
                                                    <span className="text-[9px] text-gray-400 font-mono font-bold">{formatDate(update.timestamp, true)}</span>
                                                </div>
                                                <div className="bg-gray-50 dark:bg-dm-background p-2.5 rounded-xl border dark:border-gray-850 text-[10px] leading-relaxed">
                                                    <p className="font-extrabold text-blue-600 dark:text-blue-400 mb-1">{update.status}</p>
                                                    <p className="text-gray-500 font-medium">{update.notes || 'تحديث حالة الإجراء القضائي'}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                                
                                <Card className="bg-gradient-to-br from-primary to-primary-dark text-white p-6 relative overflow-hidden rounded-[2rem]">
                                    <div className="relative z-10 space-y-3">
                                        <h3 className="font-black text-xs uppercase tracking-widest text-[#facc15]">بوابة المندوب الحقلية الموحدة</h3>
                                        <p className="text-xs opacity-90 leading-relaxed">جهازك المحمول يسمح برسم إحداثيات خط المعبر الجغرافي لضمان إثبات المثول والإعلان القانوني السليم.</p>
                                        <Button variant="secondary" size="sm" className="bg-white text-primary border-none hover:bg-white/95 rounded-xl font-bold" onClick={()=>alert('سيتم إرسال رابط التنزيل لجهاز المندوب بقاعدة التسجيل.')}>بث الإحداثيات والخرائط 📳</Button>
                                    </div>
                                    <BuildingOffice2Icon className="w-24 h-24 absolute -bottom-4 -left-4 opacity-10 rotate-12 text-white" />
                                </Card>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* --- SUB TAB 2: CASE PARTIES & RELATIONSHIP GRAPH VIEW --- */}
                {primaryTab === 'case_entities' && (
                    <motion.div 
                        key="entities_tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            
                            {/* Parties Registry cards */}
                            <div className="lg:col-span-7 space-y-4">
                                <Card className="p-6 md:p-8 rounded-[2rem] border-none shadow-xl">
                                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                                        <div>
                                            <h2 className="text-md font-black text-gray-800 dark:text-gray-200">سجل أطراف الخصومة والأقارب</h2>
                                            <p className="text-[10px] text-gray-400 font-medium">سجل الأطراف ذوي الميول القضائية المرتبطة بقضايا المكتب</p>
                                        </div>
                                        
                                        <div className="flex gap-2 w-full sm:w-auto">
                                            <div className="relative flex-grow sm:w-56">
                                                <input 
                                                    type="text" 
                                                    placeholder="بحث باسم الخصم، المدني، الصفة..."
                                                    className="w-full pr-10 pl-4 py-2 bg-gray-50 dark:bg-dm-background border-none rounded-xl text-xs font-bold shadow-inner"
                                                    value={partiesSearchQuery}
                                                    onChange={(e)=>setPartiesSearchQuery(e.target.value)}
                                                />
                                                <MagnifyingGlassIcon className="w-4.5 h-4.5 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                                            </div>
                                            <Button size="sm" className="rounded-xl" onClick={handleAddParty}>تسجيل طرف +</Button>
                                        </div>
                                    </div>

                                    {/* Small grid of entities */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {filteredCaseParties.map(party => {
                                            const roleColors = {
                                                [CasePartyRole.PLAINTIFF]: 'border-emerald-100 dark:border-emerald-950/40 bg-emerald-500/5 text-emerald-700 dark:text-emerald-450',
                                                [CasePartyRole.DEFENDANT]: 'border-rose-100 dark:border-rose-950/40 bg-rose-500/5 text-rose-700 dark:text-rose-450',
                                                [CasePartyRole.THIRD_PARTY]: 'border-blue-100 dark:border-blue-950/40 bg-blue-500/5 text-blue-700 dark:text-blue-450',
                                                [CasePartyRole.INTERVENOR]: 'border-purple-100 dark:border-purple-950/40 bg-purple-500/5 text-purple-700 dark:text-purple-450'
                                            };
                                            
                                            const isSelected = selectedPartyForMap?.id === party.id;

                                            return (
                                                <div 
                                                    key={party.id}
                                                    onClick={() => setSelectedPartyForMap(party)}
                                                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${isSelected ? 'border-primary ring-4 ring-primary/10 bg-primary/5 shadow-md scale-[1.01]' : 'border-gray-50 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 bg-white dark:bg-dm-card shadow-sm'}`}
                                                >
                                                    <div className="flex justify-between items-start mb-3">
                                                        <span className={`px-2 py-0.5 rounded-lg border text-[9px] font-black ${roleColors[party.role] || ''}`}>
                                                            {party.role.split(' ')[0]}
                                                        </span>
                                                        <div className="flex gap-1">
                                                            <button 
                                                                type="button" 
                                                                onClick={(e) => { e.stopPropagation(); handleEditParty(party); }}
                                                                className="p-1.5 text-gray-400 hover:text-amber-500 rounded-lg hover:bg-gray-100 dark:hover:bg-dm-background"
                                                                title="تعديل التفاصيل"
                                                            >
                                                                <PencilIcon className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button 
                                                                type="button" 
                                                                className="p-1.5 text-gray-400 hover:text-rose-500 rounded-lg hover:bg-gray-100 dark:hover:bg-dm-background"
                                                                onClick={(e) => { e.stopPropagation(); handleDeleteParty(party.id); }}
                                                                title="مسح الطرف"
                                                            >
                                                                <TrashIcon className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <h3 className="text-xs font-black dark:text-white leading-relaxed truncate">{party.fullName}</h3>
                                                    
                                                    <div className="mt-4 space-y-1 text-[10px] text-gray-400 font-bold font-mono">
                                                        <p className="flex items-center gap-1.5"><IdentificationIcon className="w-3.5 h-3.5 opacity-60" /> الهوية: {party.idNumber}</p>
                                                        <p className="flex items-center gap-1.5"><BriefcaseIcon className="w-3.5 h-3.5 opacity-60" /> القضايا المرتبطة: {party.linkedCaseIds.length} ملف</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </Card>
                            </div>

                            {/* Sidebar: Dynamic visual mapping graph */}
                            <div className="lg:col-span-5 space-y-6">
                                <Card title="مستكشف خرائط العلاقات والخصوم" icon={<UserGroupIcon className="w-5 h-5 text-primary" />}>
                                    {selectedPartyForMap ? (
                                        <div className="space-y-6">
                                            {/* Visual representation network of party linked to multiple cases */}
                                            <div className="p-4 bg-gray-50 dark:bg-dm-background rounded-2xl border dark:border-gray-850 flex flex-col justify-center items-center relative overflow-hidden min-h-[220px]">
                                                {/* Connecting Background Network effect with custom circles */}
                                                <div className="text-center z-10 w-full">
                                                    {/* Central Node representing the Case Party */}
                                                    <motion.div 
                                                        animate={{ scale: [1, 1.02, 1] }} 
                                                        transition={{ repeat: Infinity, duration: 3 }}
                                                        className="w-20 h-20 bg-primary text-white rounded-full flex flex-col items-center justify-center border-4 border-white dark:border-gray-800 shadow-xl mx-auto z-20 relative p-1 text-center"
                                                    >
                                                        <UserCircleIcon className="w-5 h-5" />
                                                        <span className="text-[8px] font-black tracking-tighter truncate max-w-full">{selectedPartyForMap.fullName.split(' ')[0]}</span>
                                                    </motion.div>

                                                    {/* Visual Lines / Arrows linking to external Case nodes */}
                                                    <div className="flex justify-center gap-8 mt-8">
                                                        {selectedPartyForMap.linkedCaseIds.map((caseId, index) => {
                                                            const relatedCase = initialCases.find(c => c.id === caseId);
                                                            return (
                                                                <div key={caseId} className="flex flex-col items-center relative">
                                                                    {/* Connector line */}
                                                                    <div className="absolute -top-8 w-0.5 h-8 bg-dashed border-r border-[#6366f1]" />
                                                                    
                                                                    <div className="p-2 bg-white dark:bg-dm-card border border-[#818cf8] rounded-xl shadow-lg text-center font-mono max-w-[100px] z-10">
                                                                        <FolderIcon className="w-4 h-4 text-[#4f46e5] mx-auto mb-1" />
                                                                        <span className="text-[8px] font-black text-slate-700 dark:text-gray-300 block truncate">
                                                                            {relatedCase ? relatedCase.caseNumber : `كود ${caseId}`}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Profile contact card details */}
                                            <div className="p-4 bg-white dark:bg-dm-card rounded-2xl border dark:border-gray-800 space-y-3 shadow-inner">
                                                <h4 className="text-xs font-black text-gray-800 dark:text-white pb-2 border-b dark:border-gray-800 flex items-center gap-1.5">
                                                    <UserCircleIcon className="w-4.5 h-4.5 text-primary" />
                                                    تفاصيل الهوية والملف التعريفي
                                                </h4>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-gray-500 font-bold">
                                                    <p className="flex items-center gap-1.5"><PhoneIcon className="w-3.5 h-3.5 opacity-60" /> {selectedPartyForMap.phone}</p>
                                                    <p className="flex items-center gap-1.5"><EnvelopeIcon className="w-3.5 h-3.5 opacity-60" /> {selectedPartyForMap.email}</p>
                                                    <p className="flex items-center gap-1.5"><IdentificationIcon className="w-3.5 h-3.5 opacity-60" /> الرقم المالي/المدني: {selectedPartyForMap.idNumber}</p>
                                                    <p className="flex items-center gap-1.5 col-span-2"><UserGroupIcon className="w-3.5 h-3.5 opacity-60" /> الصفة والدور: {selectedPartyForMap.role}</p>
                                                </div>

                                                {selectedPartyForMap.notes && (
                                                    <div className="p-3.5 bg-yellow-500/5 rounded-xl border border-yellow-500/10 text-[10px] leading-relaxed text-yellow-800 dark:text-amber-300">
                                                        <strong>ملاحظة مصلحة الخصوم:</strong> {selectedPartyForMap.notes}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Interaction History timeline */}
                                            <div className="space-y-3">
                                                <h4 className="text-xs font-black text-gray-700 dark:text-gray-200">سجل التفاعلات والنشاط الفني للطرف</h4>
                                                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                                                    {selectedPartyForMap.interactionHistory.map((item) => (
                                                        <div key={item.id} className="p-3 bg-gray-50 dark:bg-dm-background rounded-xl border dark:border-gray-850 text-[10px] leading-relaxed">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className="font-extrabold text-gray-800 dark:text-white">{item.action}</span>
                                                                <span className="font-mono text-gray-400 font-bold">{item.date}</span>
                                                            </div>
                                                            {item.notes && <p className="text-gray-450 italic">{item.notes}</p>}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-20 text-gray-400 text-xs font-bold">يرجى نقر أحد الأركان لاستعراض خارطة العلاقات</div>
                                    )}
                                </Card>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modals controls */}
            <AssignmentFormPropsWrapper 
                isOpen={isAssignmentModalOpen} 
                onClose={() => setIsAssignmentModalOpen(false)} 
                onSubmit={handleAssignmentSubmit} 
                initialData={editingAssignment} 
                parties={mockParties} 
                cases={initialCases}
                lawyers={initialEmployees}
            />

            <StatusUpdateModal 
                assignment={statusUpdateAssignment}
                onClose={() => setStatusUpdateAssignment(null)}
                onUpdate={handleQuickStatusUpdate}
            />

            <CasePartyFormModal 
                isOpen={isPartyModalOpen}
                onClose={() => setIsPartyModalOpen(false)}
                onSubmit={handlePartySubmit}
                initialData={editingParty}
            />

            {/* View modal details wrapper */}
            {viewingAssignment && (
                <Modal isOpen={!!viewingAssignment} onClose={()=>setViewingAssignment(null)} title="استعراض التكليف وإقرارات المندوبين" size="md">
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-dm-background rounded-2xl border dark:border-gray-850">
                            <h3 className="text-xs font-black text-gray-800 dark:text-white">{viewingAssignment.trackablePartyName}</h3>
                            <p className="text-[10px] text-gray-400 mt-1 uppercase font-mono">{viewingAssignment.id} | {viewingAssignment.taskCategory}</p>
                        </div>
                        <div className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
                            <p><strong>عقد المهمة:</strong> {viewingAssignment.taskDescription}</p>
                            <p><strong>الوجهة والطرف المقصود:</strong> {viewingAssignment.destination.courtOrDepartmentName} (الدور {viewingAssignment.destination.floor || '-'} / غرق {viewingAssignment.destination.sectionOrOffice || '-'})</p>
                            <p><strong>المحامي المسؤول المسؤول:</strong> {viewingAssignment.assignedByLawyerName}</p>
                        </div>
                        {viewingAssignment.signatureUrl && (
                            <div className="border-t pt-4 text-center">
                                <p className="text-[10px] text-gray-400 mb-2 font-bold">توقيع تسليم المندوب الميداني</p>
                                <img src={viewingAssignment.signatureUrl} alt="Signature Check" className="max-h-20 mx-auto dark:invert bg-white border p-2 rounded-xl" />
                                <span className="text-[9px] text-gray-400 font-mono mt-1 block">وقّع بواسطة: {viewingAssignment.signedBy} | {formatDate(viewingAssignment.signedAt)}</span>
                            </div>
                        )}
                        <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-800">
                            <Button variant="outline" className="rounded-xl" onClick={() => setViewingAssignment(null)}>إغلاق</Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

// Wrapper supporting direct assignment form modal to avoid any prop binding mismatches
const AssignmentFormPropsWrapper: React.FC<AssignmentFormProps> = (props) => {
    return <AssignmentFormModal {...props} />;
};

function StatCard({ label, value, icon: Icon, color, pulse }: { label: string, value: number, icon: any, color: 'blue' | 'yellow' | 'green' | 'red', pulse?: boolean }) {
    const colorMap = {
        blue: 'from-blue-500/20 to-blue-600/20 text-blue-700 border-blue-200',
        yellow: 'from-yellow-500/20 to-yellow-600/20 text-yellow-700 border-yellow-200',
        green: 'from-green-500/20 to-green-600/20 text-green-700 border-green-200',
        red: 'from-red-500/20 to-red-600/20 text-red-700 border-red-200'
    };
    
    return (
        <motion.div 
            whileHover={{ scale: 1.02 }}
            className={`bg-white dark:bg-dm-card p-5 rounded-2xl border dark:border-gray-800 shadow-sm flex items-center justify-between overflow-hidden relative`}
        >
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br ${colorMap[color].split(' ')[0]} rounded-full blur-2xl opacity-50`}></div>
            <div className="relative z-10">
                <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">{label}</p>
                <div className="flex items-baseline">
                    <span className="text-3xl font-black text-gray-900 dark:text-white">{value}</span>
                    <span className="text-xs text-gray-400 ms-1 font-bold">مهام</span>
                </div>
            </div>
            <div className={`relative z-10 p-3 rounded-xl bg-gradient-to-br ${colorMap[color].split(' ')[0]} ${pulse ? 'animate-pulse' : ''}`}>
                <Icon className={`w-6 h-6 ${colorMap[color].split(' ')[2]}`} />
            </div>
        </motion.div>
    );
}

function DetailItem({ label, value, subValue }: { label: string, value: string, subValue?: string }) {
    return (
        <div className="p-3 bg-gray-50 dark:bg-dm-background rounded-lg border border-gray-100 dark:border-gray-850">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{label}</p>
            <p className="text-sm font-bold text-gray-800 dark:text-white leading-tight">{value}</p>
            {subValue && <p className="text-xs text-primary font-medium mt-1">{subValue}</p>}
        </div>
    );
}

export default PartyTrackingPage;
