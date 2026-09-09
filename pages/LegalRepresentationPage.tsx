import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import SignaturePad from '../components/ui/SignaturePad'; 
import { useToast } from '../components/ui/Toast';
import { 
    ShareIcon, PlusCircleIcon, EyeIcon, PencilIcon, TrashIcon, FolderIcon, 
    InformationCircleIcon, UsersIcon, CalendarDaysIcon, CheckCircleIcon, XCircleIcon,
    PrinterIcon, DocumentTextIcon, ClockIcon, EnvelopeIcon, MagnifyingGlassIcon,
    ScaleIcon, BuildingLibraryIcon, IdentificationIcon, ExclamationTriangleIcon,
    ArrowPathIcon, HistoryIcon, ClipboardDocumentListIcon, SparklesIcon, ArchiveBoxIcon
} from '../constants';
import { 
    LegalRepresentationRequest, RepresentationRequestStatus, RepresentationPriority,
    Case, CaseMainType, CourtLevel, Employee 
} from '../types';
import { 
    representationRequestStatusOptions, 
    representationPriorityOptions 
} from '../constants';
import { RepresentationRequestStatusBadge } from '../components/ui/Badge';
import { initialCases } from '../data/caseData';
import { initialEmployees } from './EmployeeProfilePage';

// Standardized Legal Delegation Directions & Types
export enum DelegationDirection {
    OUTGOING = 'صادرة بموظفينا (Outgoing)',
    INCOMING = 'واردة لمكتبنا (Incoming)'
}

export enum DelegationScopeType {
    COURT_APPEARANCE = 'حضور مجمع الدوائر والمرافعة',
    PROCEDURAL = 'صرف شيكات وصياغة تنازلات',
    CASE_FOLLOW_UP = 'مراجعة إدارة الخبراء والمعاينة الميدانية',
    HEARING_REPRESENTATION = 'تمثيل أمام النيابة والتحقيقات العمالية'
}

// Sub-interface expanding original Request with specific legal delegation properties.
export interface EnhancedDelegation extends LegalRepresentationRequest {
    direction: DelegationDirection;
    scopeType: DelegationScopeType;
    startDate: string;
    endDate: string;
    legalAuthority: string; // e.g. "محكمة الفروانية" or "إدارة التنفيذ"
    actionLog: { id: string; date: string; action: string; actor: string; output?: string }[];
}

// Mock Enhanced Legal Delegations
const initialDelegations: EnhancedDelegation[] = [
    {
        id: 'del-001',
        caseId: '1',
        caseNumber: 'CML-2024-101',
        clientName: 'شركة الإيرادات المتحدة للخدمات',
        caseType: CaseMainType.COMMERCIAL,
        courtName: 'مجمع محاكم الرقعي – الدائرة التجارية',
        courtLevel: CourtLevel.FIRST_INSTANCE,
        judgeName: 'المستشار شبيب الرشيدي',
        hearingRoom: 'قاعة 3 - الدور الثاني',
        priority: RepresentationPriority.URGENT,
        hearingDate: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString().split('T')[0], // 4 days later
        hearingTime: '09:30',
        sessionObjective: 'حضور جلسة الاستجواب أمام الدائرة الكلية وتقديم أصل عقد النقل التأسيسي.',
        primaryLawyerId: 'emp-001',
        primaryLawyerName: 'أ. أحمد محمود مبارك',
        substituteLawyerId: 'emp-002',
        substituteLawyerName: 'أ. فاطمة علي حسين',
        status: RepresentationRequestStatus.ACCEPTED,
        requestDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString().split('T')[0],
        notesForSubstitute: 'يرجى حفظ الرد على البند الثالث من تقرير خبير الإثبات المالي.',
        direction: DelegationDirection.OUTGOING,
        scopeType: DelegationScopeType.COURT_APPEARANCE,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString().split('T')[0],
        legalAuthority: 'وزارة العدل – المحكمة الكلية الأهلية',
        actionLog: [
            { id: 'act-1', date: new Date().toISOString().split('T')[0], action: 'إنشاء وبث طلب الإنابة القضائية', actor: 'أ. أحمد محمود مبارك' },
            { id: 'act-2', date: new Date().toISOString().split('T')[0], action: 'تأكيد وقبول التكليف والتوقيع الرقمي', actor: 'أ. فاطمة علي حسين' }
        ]
    },
    {
        id: 'del-002',
        caseId: '3',
        caseNumber: 'RE-APP-2024-088',
        clientName: 'السديرة العقارية للمقاولات',
        caseType: CaseMainType.REAL_ESTATE,
        courtName: 'محكمة استئناف الإيجارات العاصمة',
        courtLevel: CourtLevel.APPEALS_COURT,
        judgeName: 'المستشار فيصل الشمري',
        hearingRoom: 'قاعة استئناف 14 - الدور الأرضي',
        priority: RepresentationPriority.HIGH,
        hearingDate: new Date(Date.now() + 12 * 24 * 3600 * 1000).toISOString().split('T')[0], // 12 days later
        hearingTime: '11:00',
        sessionObjective: 'إيداع صحيفة الاستئناف المتقابل وسداد التأمين لدى الصيرفة المدنية.',
        primaryLawyerId: 'emp-temp-kj',
        primaryLawyerName: 'أ. خالد جاسم الأحمد (مكتب متعاقد)',
        substituteLawyerId: 'emp-001',
        substituteLawyerName: 'أ. أحمد محمود مبارك',
        status: RepresentationRequestStatus.PENDING,
        requestDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString().split('T')[0],
        direction: DelegationDirection.INCOMING,
        scopeType: DelegationScopeType.PROCEDURAL,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
        legalAuthority: 'قصر العدل – إدارة الكتاب والموثقين',
        actionLog: [
            { id: 'act-3', date: new Date().toISOString().split('T')[0], action: 'استلام الإنابة الواردة للمكتب وجاري دراسة الأوراق والمرفقات', actor: 'أ. أحمد محمود مبارك' }
        ]
    }
];

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

// --- Sub-Modals & Custom Views ---
interface DelegationFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (delegation: EnhancedDelegation) => void;
    initialData?: Partial<EnhancedDelegation> | null;
    cases: Pick<Case, 'id' | 'caseNumber' | 'title' | 'clientName' | 'caseMainType' | 'courtLevel' | 'courtName'>[];
    lawyers: Pick<Employee, 'id' | 'fullNameAr'>[];
}

const DelegationFormModal: React.FC<DelegationFormModalProps> = ({ isOpen, onClose, onSubmit, initialData, cases, lawyers }) => {
    const { addToast } = useToast();
    const [formData, setFormData] = useState<Partial<EnhancedDelegation>>({});

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData(initialData);
            } else {
                setFormData({
                    direction: DelegationDirection.OUTGOING,
                    scopeType: DelegationScopeType.COURT_APPEARANCE,
                    priority: RepresentationPriority.NORMAL,
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
                    status: RepresentationRequestStatus.PENDING,
                    legalAuthority: 'قصر العدل ورئاسة المحاكم',
                    hearingDate: new Date().toISOString().split('T')[0],
                    attachedFileNames: [],
                    actionLog: []
                });
            }
        }
    }, [isOpen, initialData]);

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
                    courtName: selectedCase.courtName || 'مجمع محاكم الكويت',
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.caseId || !formData.courtName || !formData.startDate || !formData.endDate || !formData.primaryLawyerId || !formData.sessionObjective) {
            addToast({
                type: 'warning',
                title: 'بيانات ناقصة',
                message: 'يرجى استيفاء الحقول الأساسية: ملف القضية، الدائرة والجهة القانونية، مدة الإنابة، وهدف التكليف.'
            });
            return;
        }

        const dateCheckStart = new Date(formData.startDate).getTime();
        const dateCheckEnd = new Date(formData.endDate).getTime();
        if (dateCheckEnd < dateCheckStart) {
            addToast({
                type: 'warning',
                title: 'تناقض في المواعيد',
                message: 'تاريخ انتهاء الإنابة أو صلاحية التفويض لا يعتمد صياغة سابقة لتاريخ البدء.'
            });
            return;
        }

        const newlyCreated: EnhancedDelegation = {
            ...(formData as EnhancedDelegation),
            id: formData.id || `del-${Date.now()}`,
            createdAt: formData.createdAt || new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString(),
            actionLog: formData.actionLog || [
                { id: `act-${Date.now()}`, date: new Date().toISOString().split('T')[0], action: 'تحرير التكليف وبدء فترة المتابعة ومراقبة النفاذ', actor: formData.primaryLawyerName || 'النظام الإداري' }
            ]
        };

        onSubmit(newlyCreated);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={formData.id ? "تعديل حوكمة الإنابة القانونية" : "تقييد وتصدير إنابة بملف الخصام"} size="lg">
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select label="جاهة وتوجيه التفويض (*)" name="direction" value={formData.direction} options={Object.values(DelegationDirection).map(d=>({value:d, label:d}))} onChange={handleChange} required />
                    <Select label="نوع ونطاق الإنابة (*)" name="scopeType" value={formData.scopeType} options={Object.values(DelegationScopeType).map(s=>({value:s, label:s}))} onChange={handleChange} required />
                </div>

                <div className="p-4 bg-gray-50 dark:bg-dm-background rounded-2xl border dark:border-gray-800 space-y-3">
                    <h4 className="text-xs font-black text-gray-700 dark:text-gray-300">سند الارتباط بملف القضية المستهدفة</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Select label="القضية المرتبطة (*)" name="caseId" value={formData.caseId || ''} options={[{value: '', label: 'اختر قضية بالتسمية'}, ...cases.map(c => ({value: c.id, label: `${c.caseNumber} - ${c.title}`}))]} onChange={handleChange} required />
                        <Select label="درجة الأولوية" name="priority" value={formData.priority || RepresentationPriority.NORMAL} options={representationPriorityOptions} onChange={handleChange} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs text-slate-500 font-bold">
                        <p>🔹 الموكل: {formData.clientName || 'غير مكتمل'}</p>
                        <p>🔹 التصنيف: {formData.caseType || '-'}</p>
                        <p>🔹 درجة المحاكمة: {formData.courtLevel || '-'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="سلطة أو جهة الإحالة (المحكمة المعنية)" name="courtName" value={formData.courtName || ''} onChange={handleChange} required />
                    <Input label="سلطة ترخيص الإنابة (الإدارة المختصة)" name="legalAuthority" value={formData.legalAuthority || ''} onChange={handleChange} />
                </div>

                <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10 space-y-3">
                    <h4 className="text-xs font-black text-amber-800 dark:text-amber-400">مدة فعالية التفويض الزمني (صلاحية الإنابة)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input label="الحظر والبدء الزمني (*)" name="startDate" type="date" value={formData.startDate || ''} onChange={handleChange} required />
                        <Input label="نهاية التفويض (تاريخ القفل) (*)" name="endDate" type="date" value={formData.endDate || ''} onChange={handleChange} required />
                    </div>
                </div>

                <TextArea label="مسؤوليات المحامي وهدف التفويض بالتفصيل (*)" name="sessionObjective" value={formData.sessionObjective || ''} onChange={handleChange} required rows={3} placeholder="يرجى صياغة النطاق مثل: يحضر جلسة المرافعة، ويقدم مستند مضاهاة الخطوط ويقر بصحة التوقيعات ومحاضر المصالحة الفنية..."/>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select label="المحامي الأصيل (طالب التفويض) (*)" name="primaryLawyerId" value={formData.primaryLawyerId || ''} options={[{value: '', label: 'اختر المحامي المشرف'}, ...lawyers.map(l=>({value:l.id, label:l.fullNameAr}))]} onChange={handleChange} required />
                    <Select label="المحامي المناب (المكلف بالإجراء) (*)" name="substituteLawyerId" value={formData.substituteLawyerId || ''} options={[{value: '', label: 'اختر المحامي المساند'}, ...lawyers.map(l=>({value:l.id, label:l.fullNameAr}))]} onChange={handleChange} required />
                </div>

                <TextArea label="توجيهات فنية ومرفقات مطلوبة" name="notesForSubstitute" value={formData.notesForSubstitute || ''} onChange={handleChange} rows={2} placeholder="نصوص تشريعية، أحكام تمييز سابقة، عينات تسليم، إلخ..." />

                <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-800">
                    <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">إلغاء</Button>
                    <Button type="submit" className="rounded-xl px-6">حفظ وبدء حوكمة الصلاحية</Button>
                </div>
            </form>
        </Modal>
    );
};

interface DelegationDetailModalProps {
    delegation: EnhancedDelegation | null;
    onClose: () => void;
    onUpdateStatus: (id: string, status: RepresentationRequestStatus, remarks: string) => void;
    onPerformAction: (id: string, actionDesc: string) => void;
    onPrintLetter: (delegation: EnhancedDelegation) => void;
    onSignApproved: (id: string, signUrl: string) => void;
}

const DelegationDetailModal: React.FC<DelegationDetailModalProps> = ({ delegation, onClose, onUpdateStatus, onPerformAction, onPrintLetter, onSignApproved }) => {
    const [actionInput, setActionInput] = useState('');
    const [remarksInput, setRemarksInput] = useState('');
    const [isSigning, setIsSigning] = useState(false);

    if (!delegation) return null;

    // Check if delegation is currently expired
    const isExpired = new Date(delegation.endDate).getTime() < Date.now();
    const isExpiringSoon = !isExpired && (new Date(delegation.endDate).getTime() - Date.now() < 3 * 24 * 3600 * 1000); // 3 days

    const handleActionSubmit = () => {
        if (!actionInput.trim()) return;
        onPerformAction(delegation.id, actionInput);
        setActionInput('');
    };

    const handleSignatureSave = (dataUrl: string) => {
        onSignApproved(delegation.id, dataUrl);
        setIsSigning(false);
    };

    return (
        <Modal isOpen={!!delegation} onClose={onClose} title={`تفويض الإنابة القضائية: ${delegation.caseNumber}`} size="lg">
            <div className="space-y-6 max-h-[72vh] overflow-y-auto p-1">
                
                {/* Expiration warnings alerts */}
                {isExpired && (
                    <div className="p-4 bg-red-50 rounded-2xl border border-red-200 text-red-700 text-xs font-bold leading-relaxed flex items-center gap-2">
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-500 animate-bounce" />
                        <span>منتهية الفعالية والولاية الزمنية! انتهت الإنابة بصلاحيتها القانونية في تاريخ {formatDate(delegation.endDate)} ولا يجوز الاعتماد عليها بالجلسة.</span>
                    </div>
                )}
                {isExpiringSoon && (
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-700 text-xs font-bold leading-relaxed flex items-center gap-2">
                        <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
                        <span>تحذير اقتراب انتهاء الفعالية: الإنابة سوف تفقد الحماية والصلاحية القانونية خلال أقل من 72 ساعة في {formatDate(delegation.endDate)}.</span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">توجيه وجاهة التفويض</h4>
                        <p className="text-sm font-extrabold text-gray-800 dark:text-white">{delegation.direction}</p>
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">نطاق عمل الإنابة</h4>
                        <p className="text-sm font-extrabold text-[#4f46e5]">{delegation.scopeType}</p>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-dm-background rounded-2xl border dark:border-gray-850 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-bold">
                    <div>
                        <span className="text-gray-400 block text-[9px] mb-0.5">الملف والسند</span>
                        <span className="text-gray-950 dark:text-gray-200">{delegation.caseNumber}</span>
                    </div>
                    <div>
                        <span className="text-gray-400 block text-[9px] mb-0.5">درجة الأهمية</span>
                        <span className="text-red-650">{delegation.priority}</span>
                    </div>
                    <div>
                        <span className="text-gray-400 block text-[9px] mb-0.5">البدء الفعلي</span>
                        <span className="text-gray-950 dark:text-gray-200 font-mono">{formatDate(delegation.startDate)}</span>
                    </div>
                    <div>
                        <span className="text-gray-400 block text-[9px] mb-0.5">القفل الزمني</span>
                        <span className="text-gray-950 dark:text-gray-200 font-mono text-red-600">{formatDate(delegation.endDate)}</span>
                    </div>
                </div>

                <div className="space-y-2.5">
                    <h4 className="text-xs font-black text-gray-800 dark:text-white">الولاية والمهمة المستهدفة بمجمع المحاكم:</h4>
                    <p className="p-4 bg-blue-500/5 text-xs text-primary font-bold rounded-2xl border border-primary/10 leading-relaxed">
                        {delegation.sessionObjective}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-white dark:bg-dm-card border dark:border-gray-800 rounded-xl">
                        <span className="text-[10px] text-gray-400 font-bold block mb-1">المحامي المفوض (الأصيل)</span>
                        <p className="font-black text-gray-800 dark:text-gray-200">{delegation.primaryLawyerName}</p>
                    </div>
                    <div className="p-3 bg-white dark:bg-dm-card border dark:border-gray-800 rounded-xl">
                        <span className="text-[10px] text-gray-400 font-bold block mb-1">المحامي المفوض إليه (المناب)</span>
                        <p className="font-black text-gray-800 dark:text-gray-200">{delegation.substituteLawyerName || 'لم يحدد'}</p>
                    </div>
                </div>

                {/* Attachments Section */}
                {delegation.signatureUrl && (
                    <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 text-center">
                        <span className="text-[10px] text-slate-400 block mb-1.5 font-bold">توقيع اعتماد مكتب العدالة الفني</span>
                        <img src={delegation.signatureUrl} alt="Official Signing" className="max-h-16 mx-auto dark:invert bg-white p-1 rounded-lg" />
                        <span className="text-[9px] font-mono text-emerald-600 block mt-1.5">موقع إلكترونياً ومتصل بقفل الخادم الفني</span>
                    </div>
                )}

                {/* Submitting Actions Logs checklist */}
                <div className="space-y-3 pt-4 border-t dark:border-gray-850">
                    <h4 className="text-xs font-bold text-gray-800 dark:text-white flex items-center gap-1.5">
                        <HistoryIcon className="w-4 h-4 text-primary" />
                        سجل الحضور والمتابعة القانونية (Action Trails)
                    </h4>

                    <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                        {delegation.actionLog.map(action => (
                            <div key={action.id} className="p-3 bg-gray-50 dark:bg-dm-background rounded-xl text-[10px] leading-relaxed border dark:border-gray-850">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-gray-800 dark:text-white">{action.action}</span>
                                    <span className="text-gray-400 font-mono font-bold">{action.date}</span>
                                </div>
                                <span className="text-primary block text-[9px] font-bold">بواسطة: {action.actor}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="تدوين إجراء قضائي تم اتخاذه بموجب التفويض..."
                            value={actionInput}
                            onChange={(e)=>setActionInput(e.target.value)}
                            className="flex-grow text-xs rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-dm-background border-none text-gray-800"
                        />
                        <Button size="sm" onClick={handleActionSubmit} className="rounded-xl font-bold">تسجيل إجراء</Button>
                    </div>
                </div>

                {/* Signing Canvas component if activated */}
                {isSigning && (
                    <div className="p-4 bg-gray-55/40 dark:bg-dm-card border rounded-2xl">
                        <SignaturePad 
                            title="التوقيع بالقلم للاعتماد النهائي للجلسة"
                            onSave={handleSignatureSave}
                            onCancel={() => setIsSigning(false)}
                        />
                    </div>
                )}

                {/* Updating Status workflow */}
                {!isSigning && (
                    <div className="p-4 bg-gray-50 dark:bg-dm-background rounded-2xl border dark:border-gray-850 space-y-3">
                        <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300">أدوات إشراف وحوكمة الإنابة القانونية</h4>
                        <div className="flex items-center gap-3">
                            <Select label="تحديث حالة التفويض" value={delegation.status} options={representationRequestStatusOptions} onChange={(e)=>onUpdateStatus(delegation.id, e.target.value as RepresentationRequestStatus, remarksInput)} />
                            <div className="flex gap-1.5 mt-5">
                                <Button size="sm" variant="outline" className="border-primary/20 text-primary hover:bg-primary/10 rounded-xl" onClick={()=>setIsSigning(true)}>توقيع فوري</Button>
                                <Button size="sm" onClick={() => onPrintLetter(delegation)} className="rounded-xl" leftIcon={<PrinterIcon className="w-4 h-4"/>}>طباعة كتاب التفويض</Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="flex justify-end pt-4 border-t dark:border-gray-850">
                <Button variant="outline" className="rounded-xl" onClick={onClose}>إغلاق النافذة</Button>
            </div>
        </Modal>
    );
};

// Printable Authorization Letter Component
const OfficialAuthLetterModal: React.FC<{ delegation: EnhancedDelegation | null, onClose: () => void }> = ({ delegation, onClose }) => {
    if (!delegation) return null;
    const today = new Date().toLocaleDateString('ar-EG');
    const hasAuditLog = delegation.actionLog && delegation.actionLog.length > 0;

    return (
        <Modal isOpen={!!delegation} onClose={onClose} title="معاينة وطباعة كتاب إنابة الحضور المعتمد" size="lg">
            <div className="flex flex-col space-y-4">
                <div id="auth-letter-page" className="p-10 bg-white text-black font-serif leading-relaxed border aspect-[1/1.414] max-w-full relative shadow-md">
                    <div className="text-center border-b-2 border-black pb-4 mb-8">
                        <h2 className="text-xl font-extrabold tracking-tight">مكتب العدالة للمحاماة والاستشارات القانونية والمطالبات</h2>
                        <p className="text-[10px] font-mono mt-1 font-bold">عدالة – منظومة الإدارة القانونية والتشريعية المتكاملة (v3)</p>
                    </div>

                    <div className="flex justify-between text-xs mb-8">
                        <p>تاريخ المعاينة: {today}</p>
                        <p>الرقم المسلسل: {delegation.id}</p>
                    </div>

                    <h3 className="text-lg font-black text-center underline mb-8">كـتـاب إنـابـة ومـرافـعـة فـنـيـة مـعـتـمـدة</h3>

                    <p className="text-xs text-justify mb-5 font-medium leading-relaxed">
                        أنا الموقع أدناه المحامي/ <strong>{delegation.primaryLawyerName}</strong>، بصفتي المقيد كحاضر قضائي فني عن الموكل <strong>{delegation.clientName}</strong> في ملف القضية الجنائي/المدني المقيد برقم <strong>({delegation.caseNumber})</strong> المنظور بصفة رسمية أمام <strong>{delegation.courtName}</strong>.
                    </p>

                    <p className="text-xs text-justify mb-5 font-medium leading-relaxed">
                        أفوض وأنيب بموجب هذا الزميل المحامي/ <strong>{delegation.substituteLawyerName}</strong>، للحضور نيابة عني ومباشرة كافة أوجه الدفاع الحركي، وسلوك المرافعة الشفوية والإقرار أمام الهيئات الموقرة في الجلسات والنفقات المقررة برابط تاريخ البدء <strong>{formatDate(delegation.startDate)}</strong> والممتدة حتى قفل التفويض بتاريخ <strong>{formatDate(delegation.endDate)}</strong> متمسكين بما آلت إليه الصلاحيات، وله حق تقديم مذكرات الرد والطعن القانوني المقررة.
                    </p>

                    <div className="my-6 p-4 bg-gray-50 border border-gray-200 text-xs font-sans rounded-xl text-slate-700 leading-relaxed">
                        <strong>نطاق الولاية موضوع التفويض القضائي:</strong>
                        <p className="mt-1 font-semibold text-gray-900">{delegation.sessionObjective}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-12 mt-12 text-center text-xs">
                        <div>
                            <p className="font-bold underline mb-4">توقيع المحامي المفوِّض (الأصيل)</p>
                            {delegation.signatureUrl ? (
                                <img src={delegation.signatureUrl} alt="Signature Badge" className="h-14 mx-auto dark:invert bg-white border p-1 rounded-md" />
                            ) : (
                                <div className="h-10 mt-2 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-400 text-[10px]">بانتظار الإمضاء القلمي</div>
                            )}
                            <p className="mt-2 text-[10px] font-bold">{delegation.primaryLawyerName}</p>
                        </div>
                        <div>
                            <p className="font-bold underline mb-4">إمضاء وقبول المحامي المناب</p>
                            <p className="mt-16 text-[10px] font-bold">{delegation.substituteLawyerName}</p>
                        </div>
                    </div>

                    {/* QR and official digital stamp footer */}
                    <div className="absolute bottom-10 left-10 right-10 flex justify-between items-center text-[9px] text-gray-450 border-t pt-4 font-mono font-bold">
                        <span>تم الصدور والاستخراج الفني عبر خادم العدالة الآمن - الكويت</span>
                        <span>شفرة التحقق: AUTH-{delegation.id.slice(-6)}</span>
                    </div>
                </div>

                <div className="flex justify-end gap-2 bg-gray-50 p-4 rounded-b-2xl">
                    <Button variant="outline" className="rounded-xl" onClick={onClose}>إلغاء</Button>
                    <Button onClick={() => window.print()} className="rounded-xl px-6" leftIcon={<PrinterIcon className="w-4 h-4"/>}>اطبع المستند كـ PDF</Button>
                </div>
            </div>
        </Modal>
    );
};

// --- MAIN PAGE LAYOUT ---
const LegalRepresentationPage: React.FC = () => {
    const { addToast } = useToast();
    
    // Delegation state list
    const [delegations, setDelegations] = useState<EnhancedDelegation[]>(initialDelegations);

    // Filters and search states
    const [searchQuery, setSearchQuery] = useState('');
    const [directionFilter, setDirectionFilter] = useState<'all' | DelegationDirection>('all');
    const [scopeFilter, setScopeFilter] = useState<'all' | DelegationScopeType>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | RepresentationRequestStatus>('all');

    // Modals control
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingDelegation, setEditingDelegation] = useState<EnhancedDelegation | null>(null);
    const [viewingDelegation, setViewingDelegation] = useState<EnhancedDelegation | null>(null);
    const [printingDelegation, setPrintingDelegation] = useState<EnhancedDelegation | null>(null);

    // Statistics counts
    const statistics = useMemo(() => {
        const total = delegations.length;
        const active = delegations.filter(d => d.status === RepresentationRequestStatus.ACCEPTED && new Date(d.endDate).getTime() >= Date.now()).length;
        const incoming = delegations.filter(d => d.direction === DelegationDirection.INCOMING).length;
        const expired = delegations.filter(d => new Date(d.endDate).getTime() < Date.now()).length;
        return { total, active, incoming, expired };
    }, [delegations]);

    const handleFormSubmit = (delegation: EnhancedDelegation) => {
        const isEditing = delegations.some(d => d.id === delegation.id);
        if (isEditing) {
            setDelegations(prev => prev.map(d => d.id === delegation.id ? delegation : d));
            addToast({ type: 'success', title: 'تم وتحديث الإنابة', message: 'جرى تعديل تعليمات ومستويات الإنابة القضائية بنجاح.' });
        } else {
            setDelegations(prev => [delegation, ...prev]);
            addToast({ type: 'success', title: 'تصدير ناجح', message: 'تم فتح ملف الإنابة وتعميم التنبيه قبل تاريخ انتهاء الصلاحية.' });
        }
        setIsFormOpen(false);
        setEditingDelegation(null);
    };

    const handleUpdateStatus = (id: string, newStatus: RepresentationRequestStatus, remarks: string) => {
        setDelegations(prev => prev.map(d => {
            if (d.id === id) {
                const newLog = {
                    id: `act-${Date.now()}`,
                    date: new Date().toISOString().split('T')[0],
                    action: `تغيير حالة الإنابة إلى [${newStatus}] ملاحظات: ${remarks || 'لا يوجد'}`,
                    actor: 'صحة التوقيع / الشؤون القلمية'
                };
                return {
                    ...d,
                    status: newStatus,
                    feedbackFromSubstitute: remarks,
                    actionLog: [...d.actionLog, newLog],
                    updatedAt: new Date().toISOString()
                };
            }
            return d;
        }));
        setViewingDelegation(null);
        addToast({ type: 'success', title: 'تم تعديل الرتبة الإدارية', message: 'جرى تدوين تحديث الحضور بملفات القضية بنجاح.' });
    };

    const handlePerformAction = (id: string, actionDesc: string) => {
        setDelegations(prev => prev.map(d => {
            if (d.id === id) {
                const newLog = {
                    id: `act-${Date.now()}`,
                    date: new Date().toISOString().split('T')[0],
                    action: actionDesc,
                    actor: d.substituteLawyerName || 'المحامي المكلف بالملف'
                };
                return {
                    ...d,
                    actionLog: [...d.actionLog, newLog],
                    updatedAt: new Date().toISOString()
                };
            }
            return d;
        }));
        // Update viewing element to avoid stale content
        setViewingDelegation(prev => prev && prev.id === id ? { ...prev, actionLog: [...prev.actionLog, { id: `act-${Date.now()}`, date: new Date().toISOString().split('T')[0], action: actionDesc, actor: prev.substituteLawyerName }] } as EnhancedDelegation : prev);
        addToast({ type: 'success', title: 'تم تقييد الإجراء الفعلي', message: 'سُجلت المحاضرة والملاحظة بسلسلة المتابعة بنجاح.' });
    };

    const handleSignApproved = (id: string, signatureUrl: string) => {
        setDelegations(prev => prev.map(d => {
            if (d.id === id) {
                const newLog = {
                    id: `act-${Date.now()}`,
                    date: new Date().toISOString().split('T')[0],
                    action: 'توقيع واعتماد التفويض القلمي والمرافعة رقمياً',
                    actor: 'رئاسة القسم فني'
                };
                return {
                    ...d,
                    signatureUrl,
                    signedBy: 'المحامي المفوض (المشرف القانوني العام)',
                    signedAt: new Date().toISOString(),
                    status: RepresentationRequestStatus.ACCEPTED,
                    actionLog: [...d.actionLog, newLog]
                };
            }
            return d;
        }));
        // Update model view immediately
        setViewingDelegation(prev => prev ? { ...prev, signatureUrl, signedBy: 'المفوض الفني العام', signedAt: new Date().toISOString(), status: RepresentationRequestStatus.ACCEPTED } as EnhancedDelegation : null);
        addToast({ type: 'success', title: 'توقيع ناجح', message: 'تم اعتماد وصرف التفويض للزميل لحين موعد الجلسة.' });
    };

    const handleDeleteDelegation = (id: string) => {
        if (confirm('هل ترغب في شطب ملف الإنابة القضائية وإلغاء ترخيص تفويض المرافعة؟')) {
            setDelegations(prev => prev.filter(d => d.id !== id));
            addToast({ type: 'success', title: 'شطب وإبطال', message: 'تم إنهاء العمل بملف التفويض نهائياً وبأثر رجعي.' });
        }
    };

    const handleEditDelegation = (delegation: EnhancedDelegation) => {
        setEditingDelegation(delegation);
        setIsFormOpen(true);
    };

    const handlePrintLetter = (delegation: EnhancedDelegation) => {
        setPrintingDelegation(delegation);
    };

    // Filtered Delegations lists
    const filteredDelegations = useMemo(() => {
        return delegations.filter(del => {
            const matchesSearch = del.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                del.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                del.courtName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                del.primaryLawyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (del.substituteLawyerName && del.substituteLawyerName.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesDirection = directionFilter === 'all' || del.direction === directionFilter;
            const matchesScope = scopeFilter === 'all' || del.scopeType === scopeFilter;
            const matchesStatus = statusFilter === 'all' || del.status === statusFilter;

            return matchesSearch && matchesDirection && matchesScope && matchesStatus;
        });
    }, [delegations, searchQuery, directionFilter, scopeFilter, statusFilter]);

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-32">
            
            {/* Executive Cover page widget */}
            <div className="relative overflow-hidden bg-[#1e293b] rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/15 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl animate-pulse" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-6 text-center md:text-right">
                        <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                            <ScaleIcon className="w-9 h-9 text-amber-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center justify-center md:justify-start gap-2">
                                نظام الإنابات والتوكيلات القضائية
                                <span className="text-[10px] bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full font-black font-sans uppercase">Lawyer POA Scope</span>
                            </h1>
                            <p className="text-xs text-slate-400 mt-1 font-bold">صياغة وتعميم إنابات المرافعة وحضور كتاب المحاكم والخبراء مع مراقبة النفاذ والتواقيع الرقمية الفورية</p>
                        </div>
                    </div>

                    <Button 
                        onClick={() => { setEditingDelegation(null); setIsFormOpen(true); }} 
                        className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold px-6 rounded-2xl shadow-xl border-none"
                    >
                        تحرير كتاب إنابة جديدة +
                    </Button>
                </div>
            </div>

            {/* Smart Stats indicators */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="إجمالي ملفات التراخيص" value={statistics.total} icon={FolderIcon} color="blue" />
                <StatCard label="التفويضات السارية المعتمدة" value={statistics.active} icon={CheckCircleIcon} color="green" />
                <StatCard label="إنابات واردة (مكتب خارجي)" value={statistics.incoming} icon={UsersIcon} color="yellow" />
                <StatCard label="ملفات متقادمة / منتهية" value={statistics.expired} icon={ExclamationTriangleIcon} color="red" pulse />
            </div>

            {/* Main Desk layout with filtering panel */}
            <Card className="p-6 md:p-8 rounded-[2rem] border-none shadow-xl">
                
                {/* Custom multi-filter rows panel */}
                <div className="p-5 bg-gray-50 dark:bg-dm-background rounded-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 text-xs font-bold border dark:border-gray-850">
                    <div>
                        <label className="text-slate-400 mb-1.5 block">تصنيف وتوجيه الطلب:</label>
                        <select 
                            value={directionFilter} 
                            onChange={(e)=>setDirectionFilter(e.target.value as any)}
                            className="w-full border-none bg-white p-2.5 rounded-xl text-xs font-bold shadow-sm"
                        >
                            <option value="all">كل الاتجاهات (صادر / وارد)</option>
                            <option value={DelegationDirection.OUTGOING}>{DelegationDirection.OUTGOING}</option>
                            <option value={DelegationDirection.INCOMING}>{DelegationDirection.INCOMING}</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-slate-400 mb-1.5 block">نطاق الغرض القانوني:</label>
                        <select 
                            value={scopeFilter} 
                            onChange={(e)=>setScopeFilter(e.target.value as any)}
                            className="w-full border-none bg-white p-2.5 rounded-xl text-xs font-bold shadow-sm"
                        >
                            <option value="all">كل نطاقات التراخيص</option>
                            <option value={DelegationScopeType.COURT_APPEARANCE}>{DelegationScopeType.COURT_APPEARANCE}</option>
                            <option value={DelegationScopeType.PROCEDURAL}>{DelegationScopeType.PROCEDURAL}</option>
                            <option value={DelegationScopeType.CASE_FOLLOW_UP}>{DelegationScopeType.CASE_FOLLOW_UP}</option>
                            <option value={DelegationScopeType.HEARING_REPRESENTATION}>{DelegationScopeType.HEARING_REPRESENTATION}</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-slate-400 mb-1.5 block">حالة السند القانوني:</label>
                        <select 
                            value={statusFilter} 
                            onChange={(e)=>setStatusFilter(e.target.value as any)}
                            className="w-full border-none bg-white p-2.5 rounded-xl text-xs font-bold shadow-sm"
                        >
                            <option value="all">كل حالات الاعتمادات المتاحة</option>
                            <option value={RepresentationRequestStatus.PENDING}>قيد المطالعة والقبول (Pending)</option>
                            <option value={RepresentationRequestStatus.ACCEPTED}>معتمد ومفعّل (Active)</option>
                            <option value={RepresentationRequestStatus.COMPLETED}>تمت المهمة مجمع المحاكم (Closed)</option>
                            <option value={RepresentationRequestStatus.REJECTED}>تم الرفض والالغاء (Cancelled)</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-slate-400 mb-1.5 block">مربع البحث السريع:</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="رقم القضية، الموكل، الزميل المناب..."
                                value={searchQuery}
                                onChange={(e)=>setSearchQuery(e.target.value)}
                                className="w-full border-none bg-white pr-9 pl-4 py-2.5 rounded-xl text-xs font-bold shadow-sm"
                            />
                            <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>
                </div>

                {/* Table list of delegations */}
                <div className="overflow-x-auto min-h-[350px]">
                    <table className="min-w-full text-right text-xs">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-dm-background border-b border-gray-100 dark:border-gray-800 text-gray-500 font-black uppercase tracking-widest">
                                <th className="p-4">رقم القضية والارتباط</th>
                                <th className="p-4 text-center">التوجيه</th>
                                <th className="p-4">نطاق الإنابة والمسؤولية</th>
                                <th className="p-4">المحامي الأصيل ← المناب</th>
                                <th className="p-4">صلاحية التفويض</th>
                                <th className="p-4 text-center">أمن السند</th>
                                <th className="p-4 text-center">التحكم</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-850 font-bold text-gray-700 dark:text-gray-300">
                            {filteredDelegations.map(del => {
                                const isExpired = new Date(del.endDate).getTime() < Date.now();
                                return (
                                    <tr key={del.id} className="hover:bg-gray-55/40 transition-colors group">
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 bg-primary/10 rounded-xl">
                                                    <ScaleIcon className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <span className="font-black text-gray-900 dark:text-white block">{del.caseNumber}</span>
                                                    <span className="text-[10px] text-gray-400 dark:text-gray-500 block truncate max-w-[150px] font-bold">{del.clientName}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center whitespace-nowrap">
                                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black ${del.direction === DelegationDirection.OUTGOING ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                                                {del.direction.split(' ')[0]}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div>
                                                <span className="font-extrabold text-gray-800 dark:text-gray-200 block">{del.scopeType}</span>
                                                <span className="text-[10px] text-primary block truncate max-w-[160px]" title={del.sessionObjective}>{del.sessionObjective}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 whitespace-nowrap text-xs">
                                            <span className="text-gray-900 dark:text-gray-250 font-bold">{del.primaryLawyerName.split(' ')[1] || del.primaryLawyerName}</span>
                                            <span className="text-slate-400 mx-2">←</span>
                                            <span className="text-primary font-black">{del.substituteLawyerName ? (del.substituteLawyerName.split(' ')[1] || del.substituteLawyerName) : 'لم يتم تحديده'}</span>
                                        </td>
                                        <td className="p-4 whitespace-nowrap font-mono">
                                            {isExpired ? (
                                                <span className="text-red-650 font-extrabold line-through block">متقادم ({del.endDate})</span>
                                            ) : (
                                                <span className="text-emerald-700 block">سارٍ لغاية {del.endDate}</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            <RepresentationRequestStatusBadge status={del.status} />
                                        </td>
                                        <td className="p-4 text-center whitespace-nowrap">
                                            <div className="flex gap-1 justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => setViewingDelegation(del)} className="p-2.5 bg-gray-50 hover:bg-primary/10 text-primary rounded-xl" title="حوكمة وتعديل وسجل التواقيع"><EyeIcon className="w-4 h-4"/></button>
                                                <button onClick={() => handleEditDelegation(del)} className="p-2.5 bg-gray-50 hover:bg-amber-50 text-amber-600 rounded-xl" title="تعديل التفاصيل"><PencilIcon className="w-4 h-4"/></button>
                                                <button onClick={() => handlePrintLetter(del)} className="p-2.5 bg-gray-50 hover:bg-indigo-55 text-indigo-600 rounded-xl" title="استعراض كتاب التفويض والتصدير"><PrinterIcon className="w-4 h-4"/></button>
                                                <button onClick={() => handleDeleteDelegation(del.id)} className="p-2.5 bg-gray-50 hover:bg-rose-50 text-rose-600 rounded-xl" title="إلغاء وإسقاط الصلاحية"><TrashIcon className="w-4 h-4"/></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Modals controls */}
            <DelegationFormModal 
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={editingDelegation}
                cases={initialCases}
                lawyers={initialEmployees}
            />

            <DelegationDetailModal 
                delegation={viewingDelegation}
                onClose={() => setViewingDelegation(null)}
                onUpdateStatus={handleUpdateStatus}
                onPerformAction={handlePerformAction}
                onPrintLetter={handlePrintLetter}
                onSignApproved={handleSignApproved}
            />

            <OfficialAuthLetterModal 
                delegation={printingDelegation}
                onClose={() => setPrintingDelegation(null)}
            />
        </div>
    );
};

// --- Custom Internal Helpers ---
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
                    <span className="text-xs text-gray-400 ms-1 font-bold">ملفات</span>
                </div>
            </div>
            <div className={`relative z-10 p-3 rounded-xl bg-gradient-to-br ${colorMap[color].split(' ')[0]} ${pulse ? 'animate-pulse' : ''}`}>
                <Icon className={`w-6 h-6 ${colorMap[color].split(' ')[2]}`} />
            </div>
        </motion.div>
    );
}

export default LegalRepresentationPage;
