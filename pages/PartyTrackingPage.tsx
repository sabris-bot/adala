
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import SignaturePad from '../components/ui/SignaturePad';
import { Badge, BadgeColor } from '../components/ui/Badge';
import { 
    MapPinIcon, PlusCircleIcon, EyeIcon, PencilIcon, TrashIcon, 
    CheckCircleIcon, UserGroupIcon, FolderIcon, ClockIcon, ArrowPathIcon,
    BuildingOffice2Icon, ClipboardListCheckIcon, CameraIcon, PaperClipIcon,
    ExclamationTriangleIcon, HistoryIcon, BriefcaseIcon, MagnifyingGlassIcon
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

// Mock Data
const mockParties: TrackableParty[] = [
    { id: 'p1', fullName: 'محمد علي (مندوب)', phone: '90001111', relationshipType: PartyRelationshipType.DELEGATE, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    { id: 'p2', fullName: 'سالم أحمد (معقب)', phone: '90002222', relationshipType: PartyRelationshipType.CASE_FOLLOWER, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
];

const mockAssignments: PartyAssignment[] = [
    {
        id: 'assign1',
        trackablePartyId: 'p1',
        trackablePartyName: 'محمد علي (مندوب)',
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
        trackablePartyName: 'سالم أحمد (معقب)',
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

// --- Helper for Workflow Logic ---
const getNextLogicalStatus = (current: TrackingStatus): TrackingStatus | null => {
    switch (current) {
        case TrackingStatus.PREPARING_TO_LEAVE: return TrackingStatus.ON_THE_WAY;
        case TrackingStatus.ON_THE_WAY: return TrackingStatus.ARRIVED_AT_LOCATION;
        case TrackingStatus.ARRIVED_AT_LOCATION: return TrackingStatus.AT_SPECIFIC_DEPARTMENT;
        case TrackingStatus.AT_SPECIFIC_DEPARTMENT: return TrackingStatus.TASK_IN_PROGRESS;
        case TrackingStatus.TASK_IN_PROGRESS: return TrackingStatus.TASK_COMPLETED;
        case TrackingStatus.TASK_COMPLETED: return TrackingStatus.RETURNED_TO_OFFICE;
        default: return null;
    }
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
    const getInitialFormData = (): Partial<PartyAssignment> => {
        const defaultDestination: TrackingLocationDetails = { courtOrDepartmentName: '', floor: '', sectionOrOffice: '' };
        return initialData || {
            trackablePartyId: parties[0]?.id || '',
            caseId: undefined,
            taskCategory: FieldTaskCategory.JUDICIAL_NOTIFICATION,
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
    const [isSigning, setIsSigning] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialFormData());
            setIsSigning(false);
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

    const locationOptions = KUWAIT_COURTS_LIST;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.trackablePartyId || !formData.taskDescription || !formData.destination?.courtOrDepartmentName || !formData.assignedByLawyerId) {
            alert("يرجى ملء حقول الطرف المتتبع، وصف المهمة، اسم المحكمة/الإدارة، والمحامي المشرف.");
            return;
        }

        if (formData.currentStatus === TrackingStatus.TASK_COMPLETED && !formData.signatureUrl && !isSigning) {
            if (window.confirm("هل ترغب في إضافة توقيع إلكتروني لإتمام هذه المهمة؟")) {
                setIsSigning(true);
                return;
            }
        }

        const party = parties.find(p => p.id === formData.trackablePartyId);
        const caseInfo = formData.caseId ? cases.find(c => c.id === formData.caseId) : null;
        const lawyer = lawyers.find(l => l.id === formData.assignedByLawyerId);
        
        let firstLogEntry: TrackingEntry | undefined = undefined;
        if(!formData.id) { 
          firstLogEntry = {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            status: TrackingStatus.PREPARING_TO_LEAVE,
            recordedBy: lawyer?.fullNameAr || 'النظام',
            notes: 'تم إنشاء المهمة وإسنادها.'
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
        setFormData(prev => ({ ...prev, signatureUrl: dataUrl, signedBy: 'المندوب/المعقب', signedAt: new Date().toISOString() }));
        setIsSigning(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData?.id ? "تعديل مهمة ميدانية" : "إسناد مهمة ميدانية جديدة"} size="xl">
            {isSigning ? (
                <div className="p-4">
                    <SignaturePad 
                        title="توقيع إتمام المهمة"
                        onSave={handleSignatureSave}
                        onCancel={() => setIsSigning(false)}
                    />
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-3 p-2 max-h-[75vh] overflow-y-auto scrollbar-thin">
                    <Card title="تفاصيل المهمة الأساسية" titleClassName="text-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Select label="الطرف المتتبع (المندوب/المعقب)" name="trackablePartyId" value={formData.trackablePartyId} options={parties.map(p=>({value:p.id, label:`${p.fullName} (${p.relationshipType})`}))} onChange={handleChange} required />
                            <Select label="نوع المهمة" name="taskCategory" value={formData.taskCategory} options={fieldTaskCategoryOptions} onChange={handleChange} required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                             <Select label="المحامي المشرف على المهمة" name="assignedByLawyerId" value={formData.assignedByLawyerId} options={lawyers.map(l=>({value:l.id, label:l.fullNameAr}))} onChange={handleChange} required />
                             <Select label="مرتبطة بالقضية (اختياري)" name="caseId" value={formData.caseId || ''} options={[{value:'', label:'غير مرتبطة بقضية محددة'}, ...cases.map(c=>({value:c.id, label:`${c.caseNumber} - ${c.title}`}))]} onChange={handleChange} />
                        </div>
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
                    {initialData?.id && ( 
                        <Card title="تحديث حالة المهمة (إداري)" titleClassName="text-sm">
                            <Select label="الحالة الحالية للمهمة" name="currentStatus" value={formData.currentStatus} options={trackingStatusOptions} onChange={handleChange} />
                            {formData.signatureUrl ? (
                                <div className="mt-2 p-2 border rounded bg-green-50 flex items-center text-green-700 text-sm">
                                    <CheckCircleIcon className="w-4 h-4 me-2"/> تم إرفاق التوقيع
                                </div>
                            ) : (
                                formData.currentStatus === TrackingStatus.TASK_COMPLETED && (
                                    <Button type="button" size="sm" variant="outline" onClick={() => setIsSigning(true)} className="mt-2" leftIcon={<PencilIcon className="w-4"/>}>إضافة توقيع الإنجاز</Button>
                                )
                            )}
                        </Card>
                    )}
                    <div className="flex justify-end space-x-2 space-x-reverse pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
                        <Button type="submit">{initialData?.id ? 'حفظ التعديلات' : 'إسناد المهمة'}</Button>
                    </div>
                </form>
            )}
        </Modal>
    );
};

// --- New Status Update Modal (For Field Use) ---
interface StatusUpdateModalProps {
    assignment: PartyAssignment | null;
    onClose: () => void;
    onUpdate: (id: string, newStatus: TrackingStatus, notes: string, location?: string) => void;
}

const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({ assignment, onClose, onUpdate }) => {
    const [selectedStatus, setSelectedStatus] = useState<TrackingStatus | ''>('');
    const [notes, setNotes] = useState('');
    const [location, setLocation] = useState('');
    const [isLoadingLoc, setIsLoadingLoc] = useState(false);

    useEffect(() => {
        if (assignment) {
            const next = getNextLogicalStatus(assignment.currentStatus);
            setSelectedStatus(next || assignment.currentStatus);
            setNotes('');
            setLocation('');
        }
    }, [assignment]);

    if (!assignment) return null;

    const handleLocate = () => {
        setIsLoadingLoc(true);
        // Simulate geolocation
        setTimeout(() => {
            setLocation('29.3759 N, 47.9774 E (تم التحديد آلياً)');
            setIsLoadingLoc(false);
        }, 800);
    };

    const handleSubmit = () => {
        if (selectedStatus) {
            onUpdate(assignment.id, selectedStatus, notes, location);
        }
    };

    return (
        <Modal isOpen={!!assignment} onClose={onClose} title="تحديث حالة المهمة الميدانية" size="md">
            <div className="space-y-4">
                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 text-center">
                    <p className="text-sm text-gray-500 mb-1">الحالة الحالية</p>
                    <TrackingStatusBadge status={assignment.currentStatus} size="sm" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">تحديث إلى الحالة الجديدة</label>
                    <Select 
                        value={selectedStatus} 
                        onChange={(e) => setSelectedStatus(e.target.value as TrackingStatus)} 
                        options={trackingStatusOptions} 
                        containerClassName="mb-2"
                    />
                </div>

                <TextArea 
                    label="ملاحظات ميدانية" 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)} 
                    rows={2} 
                    placeholder="مثال: الازدحام شديد، تم تسليم الأوراق للموظف المختص..."
                />

                <div className="flex items-end gap-2">
                    <Input 
                        label="الموقع الحالي" 
                        value={location} 
                        onChange={(e) => setLocation(e.target.value)} 
                        containerClassName="flex-grow mb-0" 
                        placeholder="إحداثيات أو وصف الموقع"
                        readOnly
                    />
                    <Button 
                        type="button" 
                        variant="secondary" 
                        onClick={handleLocate} 
                        disabled={isLoadingLoc}
                        className="mb-0"
                    >
                        {isLoadingLoc ? 'جاري التحديد...' : '📍 موقعي'}
                    </Button>
                </div>

                <div className="flex justify-end pt-4 space-x-2 space-x-reverse">
                    <Button variant="outline" onClick={onClose}>إلغاء</Button>
                    <Button variant="primary" onClick={handleSubmit} leftIcon={<ArrowPathIcon className="w-4 h-4"/>}>
                        تأكيد التحديث
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

const PartyTrackingPage: React.FC = () => {
    const [assignments, setAssignments] = useState<PartyAssignment[]>(mockAssignments);
    const [parties, setParties] = useState<TrackableParty[]>(mockParties);
    const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState<Partial<PartyAssignment> | null>(null);
    const [viewingAssignment, setViewingAssignment] = useState<PartyAssignment | null>(null);
    const [statusUpdateAssignment, setStatusUpdateAssignment] = useState<PartyAssignment | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const stats = useMemo(() => {
        return {
            total: assignments.length,
            completed: assignments.filter(a => a.currentStatus === TrackingStatus.TASK_COMPLETED).length,
            inProgress: assignments.filter(a => [TrackingStatus.TASK_IN_PROGRESS, TrackingStatus.AT_SPECIFIC_DEPARTMENT, TrackingStatus.ON_THE_WAY].includes(a.currentStatus)).length,
            delayed: assignments.filter(a => a.currentStatus === TrackingStatus.DELAYED || a.currentStatus === TrackingStatus.UNABLE_TO_COMPLETE).length
        };
    }, [assignments]);

    const filteredAssignments = useMemo(() => {
        if (!searchQuery) return assignments;
        const q = searchQuery.toLowerCase();
        return assignments.filter(a => 
            a.trackablePartyName.toLowerCase().includes(q) || 
            a.taskDescription.toLowerCase().includes(q) ||
            a.destination.courtOrDepartmentName.toLowerCase().includes(q) ||
            a.caseNumber?.toLowerCase().includes(q)
        );
    }, [assignments, searchQuery]);

    const liveFeed = useMemo(() => {
        return assignments
            .flatMap(a => a.trackingLog.map(log => ({ ...log, assignmentName: a.trackablePartyName, task: a.taskCategory })))
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 5);
    }, [assignments]);

    const handleAddAssignment = () => {
        setEditingAssignment(null);
        setIsAssignmentModalOpen(true);
    };

    const handleEditAssignment = (assignment: PartyAssignment) => {
        setEditingAssignment(assignment);
        setIsAssignmentModalOpen(true);
    };

    const handleAssignmentSubmit = (data: PartyAssignment) => {
        if(editingAssignment?.id) {
            setAssignments(prev => prev.map(a => a.id === editingAssignment.id ? data : a));
        } else {
            setAssignments(prev => [data, ...prev]);
        }
        setIsAssignmentModalOpen(false);
        setEditingAssignment(null);
    };

    const handleDeleteAssignment = (id: string) => {
        if(window.confirm("هل أنت متأكد من حذف هذه المهمة؟")) {
            setAssignments(prev => prev.filter(a => a.id !== id));
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
                    updatedAt: new Date().toISOString()
                };
            }
            return assign;
        }));
        setStatusUpdateAssignment(null);
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-center gap-4"
            >
                <div className="flex items-center">
                    <div className="p-3 bg-primary/10 rounded-xl me-4">
                        <MapPinIcon className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 font-sans tracking-tight">تتبع المهام الميدانية</h1>
                        <p className="text-sm text-gray-500">إدارة حركة المناديب والمعقبين والنتائج في الوقت الفعلي</p>
                    </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <Button 
                        onClick={handleAddAssignment} 
                        className="flex-1 md:flex-none shadow-lg shadow-primary/20"
                        leftIcon={<PlusCircleIcon className="w-5 h-5"/>}
                    >
                        إسناد مهمة جديدة
                    </Button>
                </div>
            </motion.div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="إجمالي المهام" value={stats.total} icon={FolderIcon} color="blue" />
                <StatCard label="قيد التنفيذ" value={stats.inProgress} icon={ClockIcon} color="yellow" pulse />
                <StatCard label="تم الإنجاز بنجاح" value={stats.completed} icon={CheckCircleIcon} color="green" />
                <StatCard label="تعذر تنفيذها / تأخير" value={stats.delayed} icon={ExclamationTriangleIcon} color="red" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-8 space-y-4">
                    <Card>
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center">
                                <ClipboardListCheckIcon className="w-5 h-5 me-2 text-primary" />
                                قائمة التكليفات الجارية
                            </h2>
                            <div className="relative w-full sm:w-64">
                                <Input 
                                    placeholder="بحث بالاسم، الوصف، الوجهة..." 
                                    value={searchQuery} 
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pr-10"
                                />
                                <MagnifyingGlassIcon className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>

                        <div className="overflow-x-auto min-h-[400px]">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {['المكلف', 'المهمة', 'الوجهة', 'الحالة', 'الجدول الزمني', 'الإجراءات'].map(h => (
                                            <th key={h} className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    <AnimatePresence mode="popLayout">
                                        {filteredAssignments.map((assign, idx) => (
                                            <motion.tr 
                                                key={assign.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 10 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="group hover:bg-primary/5 transition-colors"
                                            >
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center">
                                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center me-3 text-xs font-bold text-gray-500 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                                            {assign.trackablePartyName.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900">{assign.trackablePartyName}</div>
                                                            <div className="text-xs text-gray-500">{assign.caseNumber || 'عمل خارجي'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-medium text-primary bg-primary/5 px-2 py-0.5 rounded-full self-start mb-1">
                                                            {assign.taskCategory}
                                                        </span>
                                                        <span className="text-sm text-gray-700 truncate max-w-[200px]" title={assign.taskDescription}>
                                                            {assign.taskDescription}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 font-medium text-gray-600">
                                                    <div className="flex items-center">
                                                        <MapPinIcon className="w-3 h-3 me-1 text-gray-400" />
                                                        {assign.destination.courtOrDepartmentName}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <TrackingStatusBadge status={assign.currentStatus}/>
                                                </td>
                                                <td className="px-4 py-4 text-xs font-mono text-gray-500">
                                                    {formatDate(assign.lastUpdateTimestamp, true)}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button variant="outline" size="sm" onClick={() => setStatusUpdateAssignment(assign)} title="تحديث الحالة" className="h-8 w-8 !p-0 flex items-center justify-center rounded-lg border-primary/20 text-primary hover:bg-primary hover:text-white">
                                                            <ArrowPathIcon className="w-4 h-4"/>
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => setViewingAssignment(assign)} title="عرض" className="h-8 w-8 !p-0 flex items-center justify-center rounded-lg"><EyeIcon className="w-4 h-4 text-primary"/></Button>
                                                        <Button variant="ghost" size="sm" onClick={() => handleEditAssignment(assign)} title="تعديل" className="h-8 w-8 !p-0 flex items-center justify-center rounded-lg"><PencilIcon className="w-4 h-4 text-yellow-600"/></Button>
                                                        <Button variant="ghost" size="sm" onClick={() => handleDeleteAssignment(assign.id)} className="h-8 w-8 !p-0 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg"><TrashIcon className="w-4 h-4"/></Button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                    {filteredAssignments.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="text-center py-20 text-gray-500">
                                                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-200">
                                                    <MagnifyingGlassIcon className="w-10 h-10 text-gray-300"/>
                                                </div>
                                                <p className="font-bold text-lg">لم يتم العثور على نتائج</p>
                                                <p className="text-sm">حاول تغيير معايير البحث أو إضافة مهمة جديدة</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* Sidebar - Live Feed */}
                <div className="lg:col-span-4 space-y-4">
                    <Card title="آخر التحديثات الميدانية" icon={<HistoryIcon className="w-5 h-5 text-primary" />}>
                        <div className="space-y-4">
                            {liveFeed.map((update, idx) => (
                                <motion.div 
                                    key={update.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="relative ps-6 border-s border-gray-200 pb-4 last:pb-0"
                                >
                                    <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-primary ring-4 ring-white shadow-sm"></div>
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-xs font-bold text-gray-800">{update.assignmentName}</span>
                                        <span className="text-[10px] text-gray-400 font-mono">{formatDate(update.timestamp, true)}</span>
                                    </div>
                                    <div className="bg-gray-50 p-2 rounded text-xs border border-gray-100">
                                        <div className="flex items-center gap-1 mb-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                            <span className="font-semibold text-primary">{update.status}</span>
                                        </div>
                                        <p className="text-gray-600 line-clamp-2">{update.notes || `تغيير الحالة إلى ${update.status}`}</p>
                                    </div>
                                </motion.div>
                            ))}
                            {liveFeed.length === 0 && <p className="text-center py-10 text-gray-400 text-sm italic">لا يوجد نشاط مسجل مؤخراً</p>}
                        </div>
                        <Button variant="ghost" size="sm" className="w-full mt-4 text-xs font-bold text-primary hover:bg-primary/5">مشاهدة السجل الكامل</Button>
                    </Card>

                    <Card className="bg-gradient-to-br from-primary to-primary-dark text-white p-6 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-bold text-lg mb-2">تطبيق المندوب الميداني</h3>
                            <p className="text-xs opacity-90 mb-4 leading-relaxed">
                                يمكن للمناديب تحميل تطبيق المحمول المخصص لتحديث الحالات والتقاط صور المستندات وتحديد الموقع آلياً.
                            </p>
                            <Button variant="secondary" size="sm" className="bg-white text-primary border-none hover:bg-white/90">احصل على التطبيق</Button>
                        </div>
                        <BuildingOffice2Icon className="w-32 h-32 absolute -bottom-8 -left-8 opacity-10 rotate-12" />
                    </Card>
                </div>
            </div>

            <AssignmentFormModal 
                isOpen={isAssignmentModalOpen} 
                onClose={() => setIsAssignmentModalOpen(false)} 
                onSubmit={handleAssignmentSubmit} 
                initialData={editingAssignment} 
                parties={parties} 
                cases={initialCases}
                lawyers={initialEmployees}
            />

            <StatusUpdateModal 
                assignment={statusUpdateAssignment}
                onClose={() => setStatusUpdateAssignment(null)}
                onUpdate={handleQuickStatusUpdate}
            />

            {/* Same Viewing Modal from earlier, just ensure it handles category and better display */}
            <AnimatePresence>
                {viewingAssignment && (
                    <Modal isOpen={!!viewingAssignment} onClose={()=>setViewingAssignment(null)} title="تفاصيل المهمة الميدانية" size="lg">
                        {/* ... already improved the details modal above, ensuring category is visible */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between bg-primary/5 p-4 rounded-xl border border-primary/10">
                                <div className="flex items-center">
                                    <div className="p-3 bg-white rounded-lg shadow-sm me-3">
                                        <ClipboardListCheckIcon className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{viewingAssignment.trackablePartyName}</h4>
                                        <span className="text-xs text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full">{viewingAssignment.taskCategory}</span>
                                    </div>
                                </div>
                                <div className="text-left">
                                    <TrackingStatusBadge status={viewingAssignment.currentStatus} size="sm" />
                                    <p className="text-[10px] text-gray-400 mt-1 uppercase font-mono">{viewingAssignment.id}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <DetailItem label="وصف المهمة" value={viewingAssignment.taskDescription} />
                                <DetailItem label="الوجهة" value={viewingAssignment.destination.courtOrDepartmentName} subValue={`${viewingAssignment.destination.floor || '-'} / ${viewingAssignment.destination.sectionOrOffice || '-'}`} />
                                <DetailItem label="المحامي المسؤول" value={viewingAssignment.assignedByLawyerName} />
                                <DetailItem label="رقم القضية" value={viewingAssignment.caseNumber || 'مهمة إدارية عامة'} />
                            </div>

                            <div className="border-t pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h5 className="font-bold text-gray-800 flex items-center">
                                        <HistoryIcon className="w-4 h-4 me-2 text-primary" />
                                        الخط الزمني للمهمة (Timeline)
                                    </h5>
                                    <Button size="sm" variant="outline" className="text-xs font-bold" leftIcon={<MapPinIcon className="w-3 h-3"/>} onClick={() => openGoogleMaps(viewingAssignment.destination)}>توجيه الخرائط</Button>
                                </div>
                                
                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                                   {viewingAssignment.trackingLog.map((log, idx) => (
                                       <div key={log.id} className="relative ps-6 border-s-2 border-gray-100 pb-4 last:pb-0">
                                           <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm ${idx === viewingAssignment.trackingLog.length - 1 ? 'bg-primary' : 'bg-gray-300'}`}></div>
                                           <div className="flex justify-between items-center mb-1">
                                               <span className="text-xs font-bold text-gray-700">{log.status}</span>
                                               <span className="text-[10px] text-gray-400 font-mono">{formatDate(log.timestamp, true)}</span>
                                           </div>
                                           <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-100 italic">
                                                {log.notes || 'تحديث تلقائي للنظام'}
                                                {log.locationDetails && <span className="block mt-1 text-blue-500 font-bold">📍 {log.locationDetails.courtOrDepartmentName}</span>}
                                           </p>
                                       </div>
                                   ))}
                                </div>
                            </div>
                            
                            {viewingAssignment.signatureUrl && (
                                <div className="border-t pt-6 text-center">
                                    <p className="text-xs font-bold text-gray-500 mb-2">إقرار المندوب بالإنجاز (توقيع إلكتروني)</p>
                                    <div className="inline-block p-4 bg-white border rounded-lg shadow-inner">
                                        <img src={viewingAssignment.signatureUrl} alt="Signature" className="max-h-24 grayscale dark:invert" />
                                        <div className="mt-2 text-[10px] text-gray-400 font-mono">
                                            الموقع: {viewingAssignment.signedBy} | {formatDate(viewingAssignment.signedAt, true)}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Modal>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- Helper UI Components ---

const StatCard: React.FC<{ label: string, value: number, icon: any, color: 'blue' | 'yellow' | 'green' | 'red', pulse?: boolean }> = ({ label, value, icon: Icon, color, pulse }) => {
    const colorMap = {
        blue: 'from-blue-500/20 to-blue-600/20 text-blue-700 border-blue-200',
        yellow: 'from-yellow-500/20 to-yellow-600/20 text-yellow-700 border-yellow-200',
        green: 'from-green-500/20 to-green-600/20 text-green-700 border-green-200',
        red: 'from-red-500/20 to-red-600/20 text-red-700 border-red-200'
    };
    
    return (
        <motion.div 
            whileHover={{ scale: 1.02 }}
            className={`bg-white p-5 rounded-2xl border shadow-sm flex items-center justify-between overflow-hidden relative`}
        >
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br ${colorMap[color].split(' ')[0]} rounded-full blur-2xl opacity-50`}></div>
            <div className="relative z-10">
                <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">{label}</p>
                <div className="flex items-baseline">
                    <span className="text-3xl font-black text-gray-900">{value}</span>
                    <span className="text-xs text-gray-400 ms-1 font-bold">مهام</span>
                </div>
            </div>
            <div className={`relative z-10 p-3 rounded-xl bg-gradient-to-br ${colorMap[color].split(' ')[0]} ${pulse ? 'animate-pulse' : ''}`}>
                <Icon className={`w-6 h-6 ${colorMap[color].split(' ')[2]}`} />
            </div>
        </motion.div>
    );
};

const DetailItem: React.FC<{ label: string, value: string, subValue?: string }> = ({ label, value, subValue }) => (
    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{label}</p>
        <p className="text-sm font-bold text-gray-800 leading-tight">{value}</p>
        {subValue && <p className="text-xs text-primary font-medium mt-1">{subValue}</p>}
    </div>
);

export default PartyTrackingPage;
