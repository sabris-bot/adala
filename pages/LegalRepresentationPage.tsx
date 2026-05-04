
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import SignaturePad from '../components/ui/SignaturePad'; 
import { 
    ShareIcon, PlusCircleIcon, EyeIcon, PencilIcon, TrashIcon, FolderIcon, 
    InformationCircleIcon, UsersIcon, CalendarDaysIcon, CheckCircleIcon, XCircleIcon,
    PrinterIcon, DocumentTextIcon, ClockIcon, EnvelopeIcon, MagnifyingGlassIcon,
    ScaleIcon, BuildingLibraryIcon, IdentificationIcon, ExclamationTriangleIcon,
    ArrowPathIcon, HistoryIcon, ClipboardDocumentListIcon
} from '../constants';
import { 
    LegalRepresentationRequest, RepresentationRequestStatus, RepresentationPriority,
    SubstituteLawyerProfile, Case, CaseMainType, CourtLevel, Employee 
} from '../types';
import { 
    representationRequestStatusOptions, 
    representationPriorityOptions 
} from '../constants';
import { RepresentationRequestStatusBadge } from '../components/ui/Badge';
import { initialCases } from '../data/caseData';
import { initialEmployees } from './EmployeeProfilePage';


// Mock Legal Representation Requests
export const mockLegalRepresentationRequests: LegalRepresentationRequest[] = [
  { 
    id: 'lr-req-001', 
    caseId: '1', 
    caseNumber: 'CML-2024-101', 
    clientName: 'شركة الأمل الدولية',
    caseType: CaseMainType.COMMERCIAL, 
    courtName: 'مجمع محاكم الرقعي - الدائرة التجارية',
    courtLevel: CourtLevel.FIRST_INSTANCE,
    judgeName: 'المستشار/ عبدالله العتيبي',
    hearingRoom: 'قاعة 5 - الطابق الأول',
    priority: RepresentationPriority.URGENT,
    hearingDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0], 
    hearingTime: '10:00',
    sessionObjective: 'تقديم مذكرة دفاع ختامية والمرافعة الشفوية.',
    primaryLawyerId: 'emp-001',
    primaryLawyerName: 'أ. أحمد محمود المحمد الصباح',
    substituteLawyerId: 'emp-002', 
    substituteLawyerName: 'أ. فاطمة علي حسين',
    status: RepresentationRequestStatus.PENDING,
    requestDate: new Date().toISOString().split('T')[0],
    notesForSubstitute: 'يرجى التركيز على المادة 15 من قانون التجارة. المستندات الأصلية بحوزتكم.',
    attachedFileNames: ['مذكرة_دفاع.pdf', 'مستند_خبرة.docx'],
    createdAt: new Date().toISOString().split('T')[0],
  },
  { 
    id: 'lr-req-002', 
    caseId: '3', 
    caseNumber: 'RE-APP-2024-088', 
    clientName: 'بنك الخليج المتحد',
    caseType: CaseMainType.REAL_ESTATE,
    courtName: 'محكمة الاستئناف - قصر العدل',
    courtLevel: CourtLevel.APPEALS_COURT,
    priority: RepresentationPriority.HIGH,
    judgeName: 'المستشار/ محمد المطيري',
    hearingRoom: 'الدائرة الإيجارية - قاعة 12',
    hearingDate: new Date(new Date().setDate(new Date().getDate() + 8)).toISOString().split('T')[0],
    hearingTime: '11:30',
    sessionObjective: 'حضور جلسة الاستماع لشهادة الخبير الفني.',
    primaryLawyerId: 'emp-temp-kj',
    primaryLawyerName: 'أ. خالد جاسم الأحمد',
    substituteLawyerId: 'emp-002',
    substituteLawyerName: 'أ. فاطمة علي حسين',
    status: RepresentationRequestStatus.ACCEPTED,
    requestDate: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString().split('T')[0],
    createdAt: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString().split('T')[0],
  }
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

// --- HELPERS ---
const StatCard = ({ label, value, icon: Icon, color, pulse }: { label: string, value: number, icon: any, color: 'blue' | 'yellow' | 'green' | 'red', pulse?: boolean }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
        green: 'bg-green-50 text-green-600 border-green-100',
        red: 'bg-red-50 text-red-600 border-red-100',
    };
    return (
        <Card className={`relative overflow-hidden border ${colors[color]}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider opacity-70">{label}</p>
                    <p className="text-2xl font-black mt-1">{value}</p>
                </div>
                <div className={`p-2 rounded-lg bg-white/50 border border-white ${pulse ? 'animate-pulse' : ''}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            <div className={`absolute -right-2 -bottom-2 opacity-5`}>
                <Icon className="w-16 h-16" />
            </div>
        </Card>
    );
};

const PriorityBadge = ({ priority }: { priority: RepresentationPriority }) => {
    const config = {
        [RepresentationPriority.URGENT]: { label: 'عاجل جداً', class: 'bg-red-100 text-red-700 border-red-200' },
        [RepresentationPriority.HIGH]: { label: 'عالية', class: 'bg-orange-100 text-orange-700 border-orange-200' },
        [RepresentationPriority.NORMAL]: { label: 'عادية', class: 'bg-blue-100 text-blue-700 border-blue-200' },
    };
    const c = config[priority] || config[RepresentationPriority.NORMAL];
    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${c.class}`}>
            {c.label}
        </span>
    );
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
            priority: RepresentationPriority.NORMAL,
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Select label="القضية (*)" name="caseId" value={formData.caseId || ''}
                            options={[{value: '', label: 'اختر قضية'}, ...cases.map(c => ({value: c.id, label: `${c.caseNumber} - ${c.title}`}))]}
                            onChange={handleChange} required />
                        <Select label="الأولوية" name="priority" value={formData.priority || RepresentationPriority.NORMAL} options={representationPriorityOptions} onChange={handleChange} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                        <Input label="نوع القضية" value={formData.caseType || ''} readOnly disabled className="bg-gray-100"/>
                        <Input label="مستوى المحكمة" value={formData.courtLevel || ''} readOnly disabled className="bg-gray-100"/>
                        <Input label="الموكل" value={formData.clientName || ''} readOnly disabled className="bg-gray-100"/>
                    </div>
                </Card>
                <Card title="تفاصيل الانعقاد" titleClassName="text-sm">
                     <Input label="المحكمة/المبنى (*)" name="courtName" value={formData.courtName || ''} onChange={handleChange} required placeholder="مثال: قصر العدل" />
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                        <Input label="القاعة/الغرفة" name="hearingRoom" value={formData.hearingRoom || ''} onChange={handleChange} placeholder="مثال: قاعة 3 - الطابق الثاني" />
                        <Input label="اسم القاضي (اختياري)" name="judgeName" value={formData.judgeName || ''} onChange={handleChange} placeholder="مثال: المستشار محمد ..." />
                     </div>
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

const ViewRepresentationRequestModal: React.FC<{ 
    request: LegalRepresentationRequest | null; 
    onClose: () => void; 
    onPrintAuthorization: (req: LegalRepresentationRequest) => void; 
    onUpdateStatus: (id: string, status: RepresentationRequestStatus, feedback?: string) => void;
    onSignAndApprove: (id: string, signatureUrl: string) => void;
}> = ({ request, onClose, onPrintAuthorization, onUpdateStatus, onSignAndApprove }) => {
    if (!request) return null;

    const [feedback, setFeedback] = useState(request.feedbackFromSubstitute || '');
    const [isSigning, setIsSigning] = useState(false);

    const handleSignatureSave = (dataUrl: string) => {
        onSignAndApprove(request.id, dataUrl);
        setIsSigning(false);
    };

    return (
        <Modal isOpen={!!request} onClose={onClose} title={`تفاصيل طلب إنابة: ${request.caseNumber}`} size="lg">
            <div className="space-y-4 max-h-[70vh] overflow-y-auto p-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card title="بيانات الجلسة" className="bg-gray-50/50" titleClassName="text-[10px] font-bold text-primary">
                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between border-b border-gray-100 pb-1">
                                <span className="text-gray-500">القضية:</span>
                                <span className="font-bold">{request.caseNumber}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 pb-1">
                                <span className="text-gray-500">الموكل:</span>
                                <span className="font-bold">{request.clientName}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 pb-1">
                                <span className="text-gray-500">المحكمة:</span>
                                <span className="font-bold text-gray-700 text-right">{request.courtName}</span>
                            </div>
                            {request.hearingRoom && (
                                <div className="flex justify-between border-b border-gray-100 pb-1">
                                    <span className="text-gray-500">القاعة:</span>
                                    <span className="font-bold">{request.hearingRoom}</span>
                                </div>
                            )}
                            {request.judgeName && (
                                <div className="flex justify-between border-b border-gray-100 pb-1">
                                    <span className="text-gray-500">القاضي:</span>
                                    <span className="font-bold">{request.judgeName}</span>
                                </div>
                            )}
                        </div>
                    </Card>
                    
                    <Card title="التوقيت والأولوية" className="bg-gray-50/50" titleClassName="text-[10px] font-bold text-primary">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                                    <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500">تاريخ الجلسة</p>
                                    <p className="text-sm font-bold">{formatDate(request.hearingDate)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                                    <ClockIcon className="w-5 h-5 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500">وقت الانعقاد</p>
                                    <p className="text-sm font-bold">{request.hearingTime || 'غير محدد'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                                    <ExclamationTriangleIcon className={`w-5 h-5 ${request.priority === RepresentationPriority.URGENT ? 'text-red-500' : 'text-gray-400'}`} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500">درجة الأهمية</p>
                                    <PriorityBadge priority={request.priority} />
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                <Card title="الهدف من الحضور والمهمة" titleClassName="text-[10px] font-bold text-gray-500">
                    <p className="text-sm text-gray-800 leading-relaxed font-semibold">
                        {request.sessionObjective}
                    </p>
                </Card>
                
                <Card title="أطراف الإنابة" className="bg-gray-50" titleClassName="text-sm">
                    <div className="flex justify-between items-center text-sm">
                        <div>
                            <p className="text-gray-500">المحامي الأصيل</p>
                            <p className="font-semibold">{request.primaryLawyerName}</p>
                        </div>
                        <div className="text-2xl text-gray-400">←</div>
                        <div>
                            <p className="text-gray-500">المحامي المناب</p>
                            <p className="font-semibold">{request.substituteLawyerName || 'لم يحدد'}</p>
                        </div>
                    </div>
                </Card>

                {request.notesForSubstitute && (
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded text-sm text-blue-800">
                        <strong>تعليمات/ملاحظات:</strong> {request.notesForSubstitute}
                    </div>
                )}

                {request.attachedFileNames && request.attachedFileNames.length > 0 && (
                    <div className="bg-white border p-3 rounded text-sm">
                        <strong>المرفقات:</strong>
                        <ul className="list-disc ps-5 mt-1 text-gray-600">
                            {request.attachedFileNames.map((f, i) => <li key={i}>{f}</li>)}
                        </ul>
                    </div>
                )}

                {/* Digital Signature Display */}
                {request.signatureUrl && (
                    <div className="border p-3 rounded bg-gray-50 text-center">
                        <p className="text-xs text-gray-500 mb-2">التوقيع الإلكتروني المعتمد</p>
                        <img src={request.signatureUrl} alt="Signature" className="h-16 mx-auto border-b-2 border-gray-300"/>
                        <p className="text-xs text-gray-400 mt-1">
                            بواسطة: {request.signedBy} في {new Date(request.signedAt || '').toLocaleDateString('ar-EG')}
                        </p>
                    </div>
                )}

                <Card title="الحالة والإجراءات" titleClassName="text-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <span>الحالة الحالية:</span>
                        <RepresentationRequestStatusBadge status={request.status} />
                    </div>
                    {request.status !== RepresentationRequestStatus.PENDING && request.feedbackFromSubstitute && (
                        <div className="bg-gray-100 p-2 rounded mb-3 text-sm">
                            <strong>رد المحامي المناب:</strong> {request.feedbackFromSubstitute}
                        </div>
                    )}
                    
                    {!isSigning && (
                        <div className="border-t pt-3">
                            <label className="block text-sm font-medium mb-1">تحديث الحالة / الرد:</label>
                            <TextArea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={2} placeholder="أضف ملاحظات عند تغيير الحالة (مثل: سبب الرفض أو تقرير الجلسة)"/>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {/* Only show approve if not already accepted/completed */}
                                {request.status === RepresentationRequestStatus.PENDING && (
                                    <Button size="sm" variant="primary" onClick={() => setIsSigning(true)} leftIcon={<PencilIcon className="w-4"/>}>
                                        توقيع وقبول واعتماد
                                    </Button>
                                )}
                                <Button size="sm" variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50" onClick={() => onUpdateStatus(request.id, RepresentationRequestStatus.COMPLETED, feedback)}>إكمال المهمة</Button>
                                <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50" onClick={() => onUpdateStatus(request.id, RepresentationRequestStatus.REJECTED, feedback)}>رفض</Button>
                            </div>
                        </div>
                    )}

                    {isSigning && (
                        <div className="mt-4 animate-fade-in-right">
                            <SignaturePad 
                                title="توقيع المحامي الأصيل للاعتماد"
                                onSave={handleSignatureSave}
                                onCancel={() => setIsSigning(false)}
                            />
                        </div>
                    )}
                </Card>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t mt-2">
                <Button variant="outline" onClick={onClose}>إغلاق</Button>
                {request.status === RepresentationRequestStatus.ACCEPTED && 
                    <Button onClick={() => onPrintAuthorization(request)} leftIcon={<PrinterIcon className="w-4"/>}>طباعة كتاب التفويض</Button>
                }
            </div>
        </Modal>
    );
};

const PrintableAuthorizationModal: React.FC<{ request: LegalRepresentationRequest | null; onClose: () => void }> = ({ request, onClose }) => {
    if (!request) return null;
    const today = new Date().toLocaleDateString('ar-EG');

    return (
        <Modal isOpen={!!request} onClose={onClose} title="معاينة كتاب التفويض" size="lg">
            <div id="printable-auth-letter" className="p-8 bg-white text-black font-serif leading-relaxed">
                <div className="text-center border-b-2 border-black pb-4 mb-6">
                    <h2 className="text-2xl font-bold mb-1">مكتب العدالة للمحاماة والاستشارات القانونية</h2>
                    <p className="text-sm">دولة الكويت</p>
                </div>
                
                <div className="text-left mb-6">
                    <p>التاريخ: {today}</p>
                    <p>الموافق: ....................</p>
                </div>

                <h3 className="text-xl font-bold text-center mb-8 underline">كتاب تفويض وإنابة للحضور</h3>

                <p className="mb-4 text-justify">
                    أنا الموقع أدناه، المحامي/ <strong>{request.primaryLawyerName}</strong>، بصفتي وكيلاً عن {request.clientName} في القضية رقم <strong>({request.caseNumber})</strong> المنظورة أمام <strong>{request.courtName}</strong>.
                </p>

                <p className="mb-4 text-justify">
                    أفوض وأنيب الزميل المحامي/ <strong>{request.substituteLawyerName}</strong>، للحضور نيابة عني في الجلسة المحدد لها يوم <strong>{new Date(request.hearingDate).toLocaleDateString('ar-EG', {weekday: 'long'})}</strong> الموافق <strong>{formatDate(request.hearingDate)}</strong>، وذلك للقيام بـ:
                </p>

                <div className="bg-gray-100 p-4 rounded mb-6 border border-gray-300">
                    <strong>{request.sessionObjective}</strong>
                </div>

                <p className="mb-8 text-justify">
                    وهذا تفويض مني بذلك، وله الحق في اتخاذ كافة الإجراءات القانونية اللازمة لحسن سير الدعوى في هذه الجلسة، والتوقيع نيابة عني على ما يلزم.
                </p>

                <div className="flex justify-between mt-12 px-8 align-bottom">
                    <div className="text-center">
                        <p className="font-bold mb-4">المحامي المفوض (الأصيل)</p>
                        {request.signatureUrl ? (
                            <img src={request.signatureUrl} alt="Signature" className="h-16 mx-auto"/>
                        ) : (
                            <p className="mt-8 text-gray-400 text-sm">(بانتظار التوقيع)</p>
                        )}
                        <p className="mt-2">{request.primaryLawyerName}</p>
                    </div>
                    <div className="text-center">
                        <p className="font-bold mb-4">المحامي المفوض إليه (المناب)</p>
                        <p className="mt-16">{request.substituteLawyerName}</p>
                    </div>
                </div>
                
                <div className="mt-16 text-center text-xs border-t pt-4">
                    <p>تم تحرير هذا التفويض إلكترونيًا عبر نظام إدارة القضايا {request.signedAt ? `بتاريخ ${new Date(request.signedAt).toLocaleDateString('ar-EG')}` : ''}</p>
                </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t bg-gray-50 px-4 py-3 print-hide-in-modal">
                <Button variant="outline" onClick={onClose}>إغلاق</Button>
                <Button onClick={() => window.print()} leftIcon={<PrinterIcon className="w-4"/>}>طباعة</Button>
            </div>
        </Modal>
    );
};

const LegalRepresentationPage: React.FC = () => {
  const [requests, setRequests] = useState<LegalRepresentationRequest[]>(mockLegalRepresentationRequests);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<RepresentationRequestStatus | ''>('');
  const [filterPriority, setFilterPriority] = useState<RepresentationPriority | ''>('');
  const [filterPrimaryLawyer, setFilterPrimaryLawyer] = useState('');
  const [filterSubstituteLawyer, setFilterSubstituteLawyer] = useState('');
  
  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<Partial<LegalRepresentationRequest> | null>(null);
  const [viewingRequest, setViewingRequest] = useState<LegalRepresentationRequest | null>(null);
  const [printingRequest, setPrintingRequest] = useState<LegalRepresentationRequest | null>(null);

  const filteredRequests = useMemo(() => {
    return requests.filter(req =>
      (req.caseNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       req.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       req.courtName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       req.sessionObjective?.toLowerCase().includes(searchTerm.toLowerCase())
      ) &&
      (filterStatus ? req.status === filterStatus : true) &&
      (filterPriority ? req.priority === filterPriority : true) &&
      (filterPrimaryLawyer ? req.primaryLawyerId === filterPrimaryLawyer : true) &&
      (filterSubstituteLawyer ? req.substituteLawyerId === filterSubstituteLawyer : true)
    ).sort((a,b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
  }, [requests, searchTerm, filterStatus, filterPriority, filterPrimaryLawyer, filterSubstituteLawyer]);

  const stats = useMemo(() => {
    return {
        total: requests.length,
        pending: requests.filter(r => r.status === RepresentationRequestStatus.PENDING).length,
        accepted: requests.filter(r => r.status === RepresentationRequestStatus.ACCEPTED).length,
        completed: requests.filter(r => r.status === RepresentationRequestStatus.COMPLETED).length,
        urgent: requests.filter(r => r.priority === RepresentationPriority.URGENT && r.status !== RepresentationRequestStatus.COMPLETED).length
    };
  }, [requests]);

  const handleAddRequest = () => { setEditingRequest(null); setIsFormModalOpen(true); };
  const handleEditRequest = (req: LegalRepresentationRequest) => { setEditingRequest(req); setIsFormModalOpen(true); };
  const handleViewRequest = (req: LegalRepresentationRequest) => { setViewingRequest(req); };
  const handlePrintRequest = (req: LegalRepresentationRequest) => { setPrintingRequest(req); };
  
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

  const handleStatusUpdate = (id: string, status: RepresentationRequestStatus, feedback?: string) => {
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status, feedbackFromSubstitute: feedback || r.feedbackFromSubstitute } : r));
      if (viewingRequest && viewingRequest.id === id) {
          setViewingRequest(prev => prev ? { ...prev, status, feedbackFromSubstitute: feedback || prev.feedbackFromSubstitute } : null);
      }
  };

  const handleSignAndApprove = (id: string, signatureUrl: string) => {
      const timestamp = new Date().toISOString();
      const signerName = "المحامي الأصيل"; // Ideally from current user context

      setRequests(prev => prev.map(r => 
          r.id === id ? { 
              ...r, 
              status: RepresentationRequestStatus.ACCEPTED, 
              signatureUrl, 
              signedBy: signerName, 
              signedAt: timestamp 
          } : r
      ));

      if (viewingRequest && viewingRequest.id === id) {
          setViewingRequest(prev => prev ? { 
              ...prev, 
              status: RepresentationRequestStatus.ACCEPTED, 
              signatureUrl, 
              signedBy: signerName, 
              signedAt: timestamp 
          } : null);
      }

      // Simulate sending notification
      alert(`تم اعتماد الطلب وتوقيعه بنجاح.\nتم إرسال إشعار للمحامي المناب.`);
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
                <ScaleIcon className="w-8 h-8 text-primary" />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-gray-900 font-sans tracking-tight">إدارة الإنابات القضائية</h1>
                <p className="text-sm text-gray-500">تفويض الزملاء للحضور ومعالجة طلبات التمثيل القانوني</p>
            </div>
        </div>
        <Button 
            onClick={handleAddRequest} 
            className="w-full md:w-auto shadow-lg shadow-primary/20"
            leftIcon={<PlusCircleIcon className="w-5 h-5" />}
        >
            إنشاء طلب إنابة جديد
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="إجمالي الإنابات" value={stats.total} icon={ClipboardDocumentListIcon} color="blue" />
          <StatCard label="بانتظار الاعتماد" value={stats.pending} icon={ClockIcon} color="yellow" pulse />
          <StatCard label="مهام نشطة" value={stats.accepted} icon={ArrowPathIcon} color="green" />
          <StatCard label="عاجل جداً" value={stats.urgent} icon={ExclamationTriangleIcon} color="red" />
      </div>
      
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 items-end mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="lg:col-span-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">بحث نصي</label>
                <div className="relative">
                    <Input placeholder="رقم القضية، الموكل..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pr-9" />
                    <MagnifyingGlassIcon className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
            </div>
            <Select label="الحالة" options={[{value: '', label: 'الكل'}, ...representationRequestStatusOptions]} value={filterStatus} onChange={e => setFilterStatus(e.target.value as RepresentationRequestStatus | '')} />
            <Select label="الأولوية" options={[{value: '', label: 'الكل'}, ...representationPriorityOptions]} value={filterPriority} onChange={e => setFilterPriority(e.target.value as RepresentationPriority | '')} />
            <Select label="المحامي الأصيل" options={[{value: '', label: 'الكل'}, ...initialEmployees.map(e => ({value: e.id, label: e.fullNameAr}))]} value={filterPrimaryLawyer} onChange={e => setFilterPrimaryLawyer(e.target.value)} />
            <Select label="المحامي المناب" options={[{value: '', label: 'الكل'}, ...initialEmployees.map(e => ({value: e.id, label: e.fullNameAr}))]} value={filterSubstituteLawyer} onChange={e => setFilterSubstituteLawyer(e.target.value)} />
        </div>
        
        <div className="overflow-x-auto min-h-[400px]">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {['بيانات القضية', 'الجلسة والمكان', 'المهمة', 'المحامون', 'الحالة', 'الأولوية', 'الإجراءات'].map(h=><th key={h} className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>)}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    <AnimatePresence mode="popLayout">
                        {filteredRequests.map((req, idx) => (
                            <motion.tr 
                                key={req.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group hover:bg-primary/5 transition-colors"
                            >
                                <td className="px-4 py-4">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center me-3 group-hover:bg-primary/10 transition-colors">
                                            <FolderIcon className="w-4 h-4 text-gray-400 group-hover:text-primary" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 group-hover:text-primary transition-colors">{req.caseNumber}</div>
                                            <div className="text-[10px] text-gray-500 font-mono">{req.clientName}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex flex-col">
                                        <div className="flex items-center text-xs font-bold text-gray-700">
                                            <CalendarDaysIcon className="w-3 h-3 me-1 text-primary" />
                                            {formatDate(req.hearingDate)}
                                        </div>
                                        <div className="text-[10px] text-gray-500 flex items-center mt-1">
                                            <BuildingLibraryIcon className="w-3 h-3 me-1" />
                                            {req.courtName}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="text-xs text-gray-600 line-clamp-2 max-w-[180px]" title={req.sessionObjective}>
                                        {req.sessionObjective}
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center text-[10px]">
                                            <span className="w-2 h-2 rounded-full bg-blue-400 me-1"></span>
                                            <span className="text-gray-500">أصيل: </span>
                                            <span className="font-bold text-gray-700 ms-1">{req.primaryLawyerName}</span>
                                        </div>
                                        <div className="flex items-center text-[10px]">
                                            <span className="w-2 h-2 rounded-full bg-green-400 me-1"></span>
                                            <span className="text-gray-500">مناب: </span>
                                            <span className="font-bold text-gray-700 ms-1">{req.substituteLawyerName || 'بانتظار التحديد'}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <RepresentationRequestStatusBadge status={req.status}/>
                                </td>
                                <td className="px-4 py-4">
                                    <PriorityBadge priority={req.priority} />
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="outline" size="sm" onClick={() => handleViewRequest(req)} title="عرض وإجراء" className="h-8 w-8 !p-0 flex items-center justify-center rounded-lg border-primary/20 text-primary hover:bg-primary hover:text-white">
                                            <EyeIcon className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleEditRequest(req)} title="تعديل" className="h-8 w-8 !p-0 flex items-center justify-center rounded-lg"><PencilIcon className="w-4 h-4 text-yellow-600" /></Button>
                                        {req.status === RepresentationRequestStatus.ACCEPTED && 
                                            <Button variant="ghost" size="sm" onClick={() => handlePrintRequest(req)} title="طباعة التفويض" className="h-8 w-8 !p-0 flex items-center justify-center rounded-lg"><PrinterIcon className="w-4 h-4 text-gray-600" /></Button>
                                        }
                                        <Button variant="ghost" size="sm" onClick={() => handleDeleteRequest(req.id)} className="h-8 w-8 !p-0 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg"><TrashIcon className="w-4 h-4" /></Button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </AnimatePresence>
                    {filteredRequests.length === 0 && (
                        <tr>
                            <td colSpan={7} className="text-center py-20 text-gray-500">
                                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-200">
                                    <ScaleIcon className="w-10 h-10 text-gray-300"/>
                                </div>
                                <p className="font-bold text-lg">لا توجد طلبات إنابة</p>
                                <p className="text-sm">لم يتم العثور على أية طلبات تطابق معايير البحث الحالية.</p>
                            </td>
                        </tr>
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
      
      <ViewRepresentationRequestModal 
        request={viewingRequest} 
        onClose={() => setViewingRequest(null)}
        onPrintAuthorization={handlePrintRequest}
        onUpdateStatus={handleStatusUpdate}
        onSignAndApprove={handleSignAndApprove}
      />

      <PrintableAuthorizationModal 
        request={printingRequest} 
        onClose={() => setPrintingRequest(null)} 
      />
    </div>
  );
};

export default LegalRepresentationPage;
