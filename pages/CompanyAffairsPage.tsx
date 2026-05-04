
import React, { useState, useMemo } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import { 
    BuildingLibraryIcon, PlusCircleIcon, EyeIcon, PencilIcon, TrashIcon, 
    FolderIcon, InformationCircleIcon, UserGroupIcon, CogIcon, IdentificationIcon,
    PrinterIcon, ClockIcon, UserTieIcon, ChartBarIcon, DocumentTextIcon
} from '../constants';
import { 
    CompanyProfile, ShareholderInfo, BoardMemberInfo, AuthorizedSignatoryInfo, 
    CompanyMeeting, CorporateAction, CompanyDocument, CorporateCommittee,
    CompanyDocumentType, CompanyDocumentStatus, CompanyLegalFormKuwait, 
    CompanyMeetingType, BoardMemberPosition, CorporateActionType, CorporateActionStatus
} from '../types';
import { 
    companyDocumentStatusOptions, companyLegalFormOptionsKuwait,
    companyMeetingTypeOptions, boardMemberPositionOptions, corporateActionTypeOptions, corporateActionStatusOptions
} from '../constants';
import { CompanyDocumentStatusBadge, Badge } from '../components/ui/Badge'; 

type TabKey = 'profile' | 'structure' | 'governance' | 'documents';

// --- Mock Data (Comprehensive) ---
const mockCompanyProfile: CompanyProfile = {
    id: 'comp-main-001',
    companyNameAr: 'شركة الاستثمارات الخليجية القابضة (ش.م.ك.ق)',
    companyNameEn: 'Gulf Investments Holding Company (K.S.C.P)',
    legalForm: CompanyLegalFormKuwait.KUWAITI_SHAREHOLDING_CLOSED,
    registrationNumber: '12345',
    tradeLicenseNumber: '2020/67890',
    chamberOfCommerceNumber: '54321',
    establishmentDate: '2010-05-15',
    capital: 10000000, // 10 Million KWD
    paidUpCapital: 10000000,
    headOfficeAddress: 'مدينة الكويت، شرق، برج السلام، الدور 25',
    contactInfo: { phone: '22225555', email: 'info@gulfinvest.com.kw', website: 'www.gulfinvest.com.kw' },
    fiscalYearEnd: '12-31', 
    auditorName: 'إرنست ويونغ (العيبان والعصيمي وشركاهم)',
    shareholders: [
        { id: 'sh1', name: 'الشيخ/ خالد ناصر الصباح', nationality: 'كويتي', civilIdOrRegNumber: '275010112345', sharePercentage: 51, numberOfShares: 5100000, shareClass: 'عادية', votingRights: true },
        { id: 'sh2', name: 'شركة دبي للاستثمار (ش.م.ع)', nationality: 'إماراتية', civilIdOrRegNumber: 'DXB-INV-001', sharePercentage: 25, numberOfShares: 2500000, shareClass: 'ممتازة', votingRights: true },
        { id: 'sh3', name: 'مؤسسة الكويت للتقدم العلمي', nationality: 'كويتية', civilIdOrRegNumber: 'KAS-888', sharePercentage: 14, numberOfShares: 1400000, shareClass: 'فئة أ', votingRights: true },
        { id: 'sh4', name: 'صندوق الاستثمار الوطني', nationality: 'كويتية', civilIdOrRegNumber: 'NIF-999', sharePercentage: 10, numberOfShares: 1000000, shareClass: 'عادية', votingRights: false },
    ],
    boardMembers: [
        { id: 'bm1', name: 'الشيخ/ خالد ناصر الصباح', position: BoardMemberPosition.CHAIRMAN, appointmentDate: '2023-04-01', termEndDate: '2026-03-31', isAuthorizedSignatory: true },
        { id: 'bm2', name: 'السيد/ أحمد السالم', position: BoardMemberPosition.VICE_CHAIRMAN, appointmentDate: '2023-04-01', termEndDate: '2026-03-31', isAuthorizedSignatory: true },
        { id: 'bm3', name: 'السيدة/ ليلى الخالد', position: BoardMemberPosition.MEMBER, appointmentDate: '2023-04-01', termEndDate: '2026-03-31', isAuthorizedSignatory: false },
        { id: 'bm4', name: 'السيد/ عمر الفاروق', position: BoardMemberPosition.MANAGING_DIRECTOR, appointmentDate: '2023-04-01', termEndDate: '2026-03-31', isAuthorizedSignatory: true },
        { id: 'bm5', name: 'د. يوسف المنصور', position: BoardMemberPosition.MEMBER, appointmentDate: '2024-01-15', termEndDate: '2027-01-14', isAuthorizedSignatory: false },
    ],
    authorizedSignatories: [
        { id: 'as1', name: 'الشيخ/ خالد ناصر الصباح', title: 'رئيس مجلس الإدارة', signatureScope: 'منفرداً في كافة المعاملات المالية والإدارية والقضائية دون حد أقصى.', authorityLimit: 0, jointSignatureRequired: false },
        { id: 'as2', name: 'السيد/ أحمد السالم', title: 'نائب الرئيس', signatureScope: 'منفرداً في غياب الرئيس، أو مجتمعاً مع عضو آخر في المعاملات التي تزيد عن 100,000 د.ك.', authorityLimit: 100000, jointSignatureRequired: true },
        { id: 'as3', name: 'السيد/ عمر الفاروق', title: 'الرئيس التنفيذي', signatureScope: 'منفرداً في المعاملات الإدارية والمالية حتى 50,000 د.ك.', authorityLimit: 50000, jointSignatureRequired: false },
    ],
    committees: [
        { id: 'com1', name: 'لجنة التدقيق والمخاطر', description: 'مراجعة التقارير المالية والإشراف على التدقيق الداخلي.', membersIds: ['bm3', 'bm5'], chairpersonId: 'bm3', frequency: 'ربع سنوي' },
        { id: 'com2', name: 'لجنة الترشيحات والمكافآت', description: 'تحديد سياسات المكافآت وترشيح أعضاء المجلس.', membersIds: ['bm1', 'bm2', 'bm3'], chairpersonId: 'bm1', frequency: 'سنوي' },
    ]
};

const mockMeetings: CompanyMeeting[] = [
    { 
        id: 'meet1', meetingType: CompanyMeetingType.BOARD_OF_DIRECTORS, meetingDate: '2024-06-15', meetingTime: '10:00', meetingLocation: 'المقر الرئيسي',
        attendees: ['الشيخ خالد', 'أحمد السالم', 'ليلى الخالد', 'عمر الفاروق'],
        agendaItems: "1. مناقشة البيانات المالية للربع الثاني.\n2. التوسع في السوق السعودي.",
        resolutionsPassed: "1. اعتماد البيانات المالية.\n2. الموافقة المبدئية على فتح فرع الرياض.",
        minutesDocumentId: 'doc-minutes-bod-2024-06-15'
    },
    {
        id: 'meet2', meetingType: CompanyMeetingType.ORDINARY_GENERAL_ASSEMBLY, meetingDate: '2024-03-30', meetingLocation: 'فندق الشيراتون',
        agendaItems: "1. تقرير مجلس الإدارة.\n2. تقرير مراقب الحسابات.\n3. توزيع الأرباح.",
        resolutionsPassed: "اعتماد توزيع أرباح نقدية بنسبة 10%.",
        minutesDocumentId: 'doc-minutes-oga-2024-03-30'
    }
];

const mockCorporateActions: CorporateAction[] = [
    { 
        id: 'ca1', actionType: CorporateActionType.CAPITAL_INCREASE, actionDate: '2023-11-01', 
        description: 'زيادة رأس المال (أسهم منحة)',
        details: 'زيادة رأس المال من 8 مليون إلى 10 مليون عبر توزيع أسهم منحة.', 
        status: CorporateActionStatus.COMPLETED, 
        relatedDocumentsIds: ['doc-ga-resolution-cap-increase'] 
    },
    {
        id: 'ca2', actionType: CorporateActionType.AMEND_ARTICLES_OF_ASSOCIATION, actionDate: '2024-08-01',
        description: 'إضافة أنشطة تجارية',
        details: 'تعديل المادة (5) لإضافة نشاط الاستثمار العقاري.',
        status: CorporateActionStatus.IN_PROGRESS,
    }
];

const mockCompanyDocuments: CompanyDocument[] = [
  {
    id: 'doc1', title: 'عقد التأسيس المعدل', documentType: CompanyDocumentType.FOUNDING_DOCUMENT, documentDate: '2023-12-01', status: CompanyDocumentStatus.ACTIVE, keywords: ['تأسيس', 'نظام أساسي'], createdAt: '2023-12-01'
  },
  {
    id: 'doc2', title: 'الترخيص التجاري 2024', documentType: CompanyDocumentType.TRADE_LICENSE, documentDate: '2024-01-01', status: CompanyDocumentStatus.ACTIVE, keywords: ['ترخيص', 'تجارة'], createdAt: '2024-01-01'
  },
];

// Helper functions
const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch (e) { return dateString; }
};
const formatCurrency = (amount?: number) => amount ? `${amount.toLocaleString()} د.ك` : '-';

// --- MODAL COMPONENTS ---

// 1. Shareholder Modal
const ShareholderModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (data: ShareholderInfo) => void; initialData?: ShareholderInfo }> = ({ isOpen, onClose, onSave, initialData }) => {
    const [data, setData] = useState<Partial<ShareholderInfo>>(initialData || { nationality: 'كويتي', shareClass: 'عادية', votingRights: true });
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "تعديل مساهم" : "إضافة مساهم جديد"} size="md">
            <div className="space-y-3">
                <Input label="اسم المساهم" value={data.name || ''} onChange={e => setData({...data, name: e.target.value})} required/>
                <div className="grid grid-cols-2 gap-3">
                    <Input label="الجنسية" value={data.nationality || ''} onChange={e => setData({...data, nationality: e.target.value})} />
                    <Input label="الرقم المدني/السجل" value={data.civilIdOrRegNumber || ''} onChange={e => setData({...data, civilIdOrRegNumber: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Input label="عدد الأسهم" type="number" value={data.numberOfShares?.toString() || ''} onChange={e => setData({...data, numberOfShares: Number(e.target.value)})} />
                    <Input label="نسبة الملكية (%)" type="number" value={data.sharePercentage?.toString() || ''} onChange={e => setData({...data, sharePercentage: Number(e.target.value)})} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Select label="فئة الأسهم" value={data.shareClass} options={[{value: 'عادية', label: 'عادية'}, {value: 'ممتازة', label: 'ممتازة'}, {value: 'فئة أ', label: 'فئة أ'}, {value: 'فئة ب', label: 'فئة ب'}]} onChange={e => setData({...data, shareClass: e.target.value})} />
                    <div className="flex items-end pb-2">
                        <label className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                            <input type="checkbox" checked={data.votingRights} onChange={e => setData({...data, votingRights: e.target.checked})} className="form-checkbox h-4 w-4 text-primary"/>
                            <span className="text-sm">حق التصويت</span>
                        </label>
                    </div>
                </div>
                <div className="flex justify-end pt-2"><Button onClick={() => { if(data.name) { onSave(data as ShareholderInfo); onClose(); }}}>حفظ</Button></div>
            </div>
        </Modal>
    );
};

// 2. Board Member Modal
const BoardMemberModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (data: BoardMemberInfo) => void; initialData?: BoardMemberInfo }> = ({ isOpen, onClose, onSave, initialData }) => {
    const [data, setData] = useState<Partial<BoardMemberInfo>>(initialData || { position: BoardMemberPosition.MEMBER });
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "تعديل عضو" : "إضافة عضو مجلس إدارة"} size="md">
            <div className="space-y-3">
                <Input label="اسم العضو" value={data.name || ''} onChange={e => setData({...data, name: e.target.value})} required/>
                <Select label="المنصب" value={data.position} options={boardMemberPositionOptions} onChange={e => setData({...data, position: e.target.value as any})} />
                <div className="grid grid-cols-2 gap-3">
                    <Input label="تاريخ التعيين" type="date" value={data.appointmentDate || ''} onChange={e => setData({...data, appointmentDate: e.target.value})} />
                    <Input label="انتهاء العضوية" type="date" value={data.termEndDate || ''} onChange={e => setData({...data, termEndDate: e.target.value})} />
                </div>
                <label className="flex items-center space-x-2 space-x-reverse"><input type="checkbox" checked={data.isAuthorizedSignatory} onChange={e => setData({...data, isAuthorizedSignatory: e.target.checked})} className="form-checkbox"/><span>مخول بالتوقيع</span></label>
                <div className="flex justify-end pt-2"><Button onClick={() => { if(data.name) { onSave(data as BoardMemberInfo); onClose(); }}}>حفظ</Button></div>
            </div>
        </Modal>
    );
};

// 3. Signatory Modal
const SignatoryModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (data: AuthorizedSignatoryInfo) => void; initialData?: AuthorizedSignatoryInfo }> = ({ isOpen, onClose, onSave, initialData }) => {
    const [data, setData] = useState<Partial<AuthorizedSignatoryInfo>>(initialData || { jointSignatureRequired: false });
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="إدارة المخولين بالتوقيع" size="md">
            <div className="space-y-3">
                <Input label="الاسم" value={data.name || ''} onChange={e => setData({...data, name: e.target.value})} required/>
                <Input label="الصفة (مثل: مدير عام)" value={data.title || ''} onChange={e => setData({...data, title: e.target.value})} />
                <div className="grid grid-cols-2 gap-3">
                    <Input label="الحد الأقصى للتوقيع (د.ك)" type="number" value={data.authorityLimit?.toString() || ''} onChange={e => setData({...data, authorityLimit: Number(e.target.value)})} placeholder="0 = غير محدود" />
                    <Input label="صالح حتى" type="date" value={data.authorizedUntil || ''} onChange={e => setData({...data, authorizedUntil: e.target.value})} />
                </div>
                <label className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                    <input type="checkbox" checked={data.jointSignatureRequired} onChange={e => setData({...data, jointSignatureRequired: e.target.checked})} className="form-checkbox"/>
                    <span className="text-sm">توقيع مشترك مطلوب؟</span>
                </label>
                <TextArea label="حدود الصلاحية التفصيلية" value={data.signatureScope || ''} onChange={e => setData({...data, signatureScope: e.target.value})} rows={3} placeholder="مثال: منفرد حتى 50 ألف، مجتمع فيما زاد..."/>
                <div className="flex justify-end pt-2"><Button onClick={() => { if(data.name) { onSave(data as AuthorizedSignatoryInfo); onClose(); }}}>حفظ</Button></div>
            </div>
        </Modal>
    );
};

// 3.1 Committee Modal
const CommitteeModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onSave: (data: CorporateCommittee) => void; 
    initialData?: CorporateCommittee;
    boardMembers: BoardMemberInfo[];
}> = ({ isOpen, onClose, onSave, initialData, boardMembers }) => {
    const [data, setData] = useState<Partial<CorporateCommittee>>(initialData || { membersIds: [], frequency: 'ربع سنوي' });
    
    const toggleMember = (id: string) => {
        const current = data.membersIds || [];
        if (current.includes(id)) {
            setData({ ...data, membersIds: current.filter(m => m !== id) });
        } else {
            setData({ ...data, membersIds: [...current, id] });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "تعديل لجنة" : "تشكيل لجنة جديدة"} size="md">
            <div className="space-y-3">
                <Input label="اسم اللجنة" value={data.name || ''} onChange={e => setData({...data, name: e.target.value})} required/>
                <Select label="دورية الاجتماعات" value={data.frequency} options={[{value: 'شهري', label: 'شهري'}, {value: 'ربع سنوي', label: 'ربع سنوي'}, {value: 'نصف سنوي', label: 'نصف سنوي'}, {value: 'سنوي', label: 'سنوي'}]} onChange={e => setData({...data, frequency: e.target.value})} />
                <Select label="رئيس اللجنة" value={data.chairpersonId} options={boardMembers.map(bm => ({ value: bm.id, label: bm.name }))} onChange={e => setData({...data, chairpersonId: e.target.value})} />
                
                <div className="space-y-2">
                    <label className="text-sm font-bold block">أعضاء اللجنة</label>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border rounded bg-gray-50">
                        {boardMembers.map(bm => (
                            <label key={bm.id} className="flex items-center space-x-2 space-x-reverse text-xs cursor-pointer">
                                <input type="checkbox" checked={data.membersIds?.includes(bm.id)} onChange={() => toggleMember(bm.id)} className="form-checkbox h-3 w-3"/>
                                <span>{bm.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
                
                <TextArea label="وصف واختصاصات اللجنة" value={data.description || ''} onChange={e => setData({...data, description: e.target.value})} rows={3} />
                <div className="flex justify-end pt-2"><Button onClick={() => { if(data.name) { onSave(data as CorporateCommittee); onClose(); }}}>حفظ</Button></div>
            </div>
        </Modal>
    );
};

// 4. Meeting Modal
const MeetingModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (data: CompanyMeeting) => void; initialData?: CompanyMeeting }> = ({ isOpen, onClose, onSave, initialData }) => {
    const [data, setData] = useState<Partial<CompanyMeeting>>(initialData || { meetingType: CompanyMeetingType.BOARD_OF_DIRECTORS, meetingDate: new Date().toISOString().split('T')[0] });
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="توثيق اجتماع" size="lg">
            <div className="space-y-3 p-1">
                <div className="grid grid-cols-2 gap-3">
                    <Select label="نوع الاجتماع" value={data.meetingType} options={companyMeetingTypeOptions} onChange={e => setData({...data, meetingType: e.target.value as any})} />
                    <Input label="التاريخ" type="date" value={data.meetingDate} onChange={e => setData({...data, meetingDate: e.target.value})} />
                </div>
                <Input label="الموقع" value={data.meetingLocation || ''} onChange={e => setData({...data, meetingLocation: e.target.value})} />
                <Input label="الحضور (أسماء مفصولة بفاصلة)" value={data.attendees?.join(', ') || ''} onChange={e => setData({...data, attendees: e.target.value.split(',').map(s=>s.trim())})} />
                <TextArea label="جدول الأعمال" value={data.agendaItems || ''} onChange={e => setData({...data, agendaItems: e.target.value})} rows={3} />
                <TextArea label="القرارات المتخذة" value={data.resolutionsPassed || ''} onChange={e => setData({...data, resolutionsPassed: e.target.value})} rows={3} />
                <div className="flex justify-end pt-2"><Button onClick={() => { if(data.meetingDate) { onSave(data as CompanyMeeting); onClose(); }}}>حفظ السجل</Button></div>
            </div>
        </Modal>
    );
};

// 5. Corporate Action Modal
const ActionModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (data: CorporateAction) => void; initialData?: CorporateAction; }> = ({ isOpen, onClose, onSave, initialData }) => {
    const [data, setData] = useState<Partial<CorporateAction>>({ ...initialData, actionType: initialData?.actionType || CorporateActionType.OTHER, status: initialData?.status || CorporateActionStatus.PENDING_APPROVAL, actionDate: initialData?.actionDate || new Date().toISOString().split('T')[0] });
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="تسجيل إجراء مؤسسي" size="lg">
            <div className="space-y-3 p-1">
                <Select label="نوع الإجراء" value={data.actionType} options={corporateActionTypeOptions} onChange={e => setData({...data, actionType: e.target.value as any})} />
                <Input label="الوصف المختصر" value={data.description || ''} onChange={e => setData({...data, description: e.target.value})} />
                <div className="grid grid-cols-2 gap-3">
                    <Input label="تاريخ البدء" type="date" value={data.actionDate} onChange={e => setData({...data, actionDate: e.target.value})} />
                    <Select label="الحالة" value={data.status} options={corporateActionStatusOptions} onChange={e => setData({...data, status: e.target.value as any})} />
                </div>
                <TextArea label="التفاصيل والخطوات" value={data.details || ''} onChange={e => setData({...data, details: e.target.value})} rows={3} />
                <div className="flex justify-end pt-2"><Button onClick={() => { if(data.description) { onSave(data as CorporateAction); onClose(); }}}>حفظ الإجراء</Button></div>
            </div>
        </Modal>
    );
};

// 6. Document Modal
const DocumentModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (data: CompanyDocument) => void; initialData?: CompanyDocument }> = ({ isOpen, onClose, onSave, initialData }) => {
    const [data, setData] = useState<Partial<CompanyDocument>>(initialData || { status: CompanyDocumentStatus.ACTIVE, documentDate: new Date().toISOString().split('T')[0] });
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="إضافة مستند مؤسسي" size="md">
            <div className="space-y-3 p-1">
                <Input label="عنوان المستند" value={data.title || ''} onChange={e => setData({...data, title: e.target.value})} required/>
                <Select label="نوع المستند" value={data.documentType} options={Object.values(CompanyDocumentType).map(t => ({ value: t, label: t }))} onChange={e => setData({...data, documentType: e.target.value as any})} />
                <div className="grid grid-cols-2 gap-3">
                    <Input label="تاريخ المستند" type="date" value={data.documentDate} onChange={e => setData({...data, documentDate: e.target.value})} />
                    <Select label="الحالة" value={data.status} options={companyDocumentStatusOptions} onChange={e => setData({...data, status: e.target.value as any})} />
                </div>
                <Input label="كلمات مفتاحية (مفصولة بفاصلة)" value={data.keywords?.join(', ') || ''} onChange={e => setData({...data, keywords: e.target.value.split(',').map(s=>s.trim())})} />
                <div className="flex justify-end pt-2"><Button onClick={() => { if(data.title) { onSave(data as CompanyDocument); onClose(); }}}>حفظ المستند</Button></div>
            </div>
        </Modal>
    );
};

// --- MAIN PAGE ---
const CompanyAffairsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabKey>('profile');
    const [company, setCompany] = useState<CompanyProfile>(mockCompanyProfile);
    const [meetings, setMeetings] = useState<CompanyMeeting[]>(mockMeetings);
    const [actions, setActions] = useState<CorporateAction[]>(mockCorporateActions);
    const [documents, setDocuments] = useState<CompanyDocument[]>(mockCompanyDocuments);

    // Modal States
    const [modals, setModals] = useState({
        shareholder: false,
        board: false,
        signatory: false,
        committee: false,
        meeting: false,
        action: false,
        profileEdit: false,
        document: false,
    });

    const [editingItem, setEditingItem] = useState<{ type: string, data: any } | null>(null);
    
    // Handlers
    const toggleModal = (key: keyof typeof modals, state: boolean) => {
        if (!state) setEditingItem(null);
        setModals(prev => ({ ...prev, [key]: state }));
    };

    const updateCompany = (field: keyof CompanyProfile, value: any) => setCompany(prev => ({ ...prev, [field]: value }));
    
    const handleSaveShareholder = (sh: ShareholderInfo) => {
        if (editingItem && editingItem.type === 'shareholder') {
            updateCompany('shareholders', company.shareholders?.map(s => s.id === sh.id ? sh : s));
        } else {
            updateCompany('shareholders', [...(company.shareholders || []), { ...sh, id: `sh-${Date.now()}` }]);
        }
    };

    const handleSaveBoardMember = (bm: BoardMemberInfo) => {
        if (editingItem && editingItem.type === 'board') {
            updateCompany('boardMembers', company.boardMembers?.map(b => b.id === bm.id ? bm : b));
        } else {
            updateCompany('boardMembers', [...(company.boardMembers || []), { ...bm, id: `bm-${Date.now()}` }]);
        }
    };

    const handleSaveSignatory = (as: AuthorizedSignatoryInfo) => {
        if (editingItem && editingItem.type === 'signatory') {
            updateCompany('authorizedSignatories', company.authorizedSignatories?.map(s => s.id === as.id ? as : s));
        } else {
            updateCompany('authorizedSignatories', [...(company.authorizedSignatories || []), { ...as, id: `as-${Date.now()}` }]);
        }
    };

    const handleSaveCommittee = (com: CorporateCommittee) => {
        if (editingItem && editingItem.type === 'committee') {
            updateCompany('committees', company.committees?.map(c => c.id === com.id ? com : c));
        } else {
            updateCompany('committees', [...(company.committees || []), { ...com, id: `com-${Date.now()}` }]);
        }
    };

    const handleSaveMeeting = (m: CompanyMeeting) => {
        if (editingItem && editingItem.type === 'meeting') {
            setMeetings(prev => prev.map(mm => mm.id === m.id ? m : mm));
        } else {
            setMeetings(prev => [{ ...m, id: `mt-${Date.now()}` }, ...prev]);
        }
    };

    const handleSaveAction = (a: CorporateAction) => {
        if (editingItem && editingItem.type === 'action') {
            setActions(prev => prev.map(aa => aa.id === a.id ? a : aa));
        } else {
            setActions(prev => [{ ...a, id: `act-${Date.now()}` }, ...prev]);
        }
    };

    const handleSaveDocument = (d: CompanyDocument) => {
        if (editingItem && editingItem.type === 'document') {
            setDocuments(prev => prev.map(dd => dd.id === d.id ? d : dd));
        } else {
            setDocuments(prev => [{ ...d, id: `doc-${Date.now()}`, createdAt: new Date().toISOString().split('T')[0] }, ...prev]);
        }
    };

    const handleDelete = (type: 'shareholder' | 'board' | 'signatory' | 'committee' | 'meeting' | 'action' | 'document', id: string) => {
        if (!confirm('هل أنت متأكد من رغبتك في الحذف؟')) return;
        switch(type) {
            case 'shareholder': updateCompany('shareholders', company.shareholders?.filter(s => s.id !== id)); break;
            case 'board': updateCompany('boardMembers', company.boardMembers?.filter(b => b.id !== id)); break;
            case 'signatory': updateCompany('authorizedSignatories', company.authorizedSignatories?.filter(s => s.id !== id)); break;
            case 'committee': updateCompany('committees', company.committees?.filter(c => c.id !== id)); break;
            case 'meeting': setMeetings(prev => prev.filter(m => m.id !== id)); break;
            case 'action': setActions(prev => prev.filter(a => a.id !== id)); break;
            case 'document': setDocuments(prev => prev.filter(d => d.id !== id)); break;
        }
    };

    const handleEdit = (type: string, data: any) => {
        setEditingItem({ type, data });
        toggleModal(type as any, true);
    };

    const handlePrint = () => {
        window.print();
    };

    // RENDERERS

    const renderProfileTab = () => (
        <div className="space-y-6 animate-fade-in-right">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
                <Card className="text-center py-4 bg-white border-t-4 border-blue-500">
                    <p className="text-gray-500 text-xs text-nowrap">رأس المال المدفوع</p>
                    <p className="text-xl font-bold text-blue-700 mt-1">{formatCurrency(company.paidUpCapital)}</p>
                </Card>
                <Card className="text-center py-4 bg-white border-t-4 border-green-500">
                    <p className="text-gray-500 text-xs">عدد المساهمين</p>
                    <p className="text-xl font-bold text-green-700 mt-1">{company.shareholders?.length || 0}</p>
                </Card>
                <Card className="text-center py-4 bg-white border-t-4 border-purple-500">
                    <p className="text-gray-500 text-xs">أعضاء مجلس الإدارة</p>
                    <p className="text-xl font-bold text-purple-700 mt-1">{company.boardMembers?.length || 0}</p>
                </Card>
                <Card className="text-center py-4 bg-white border-t-4 border-yellow-500">
                    <p className="text-gray-500 text-xs">السنة المالية</p>
                    <p className="text-xl font-bold text-yellow-700 mt-1">{company.fiscalYearEnd}</p>
                </Card>
            </div>

            {/* General Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card title="بيانات الشركة الأساسية" actions={
                        <div className="flex gap-2 no-print">
                            <Button variant="ghost" size="sm" onClick={handlePrint} iconOnly><PrinterIcon className="w-4 h-4"/></Button>
                            <Button variant="ghost" size="sm" onClick={() => toggleModal('profileEdit', true)}><PencilIcon className="w-4 h-4 text-gray-500"/></Button>
                        </div>
                    }>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                            <div><span className="text-gray-500 block">الاسم القانوني (عربي):</span> <span className="font-semibold text-lg">{company.companyNameAr}</span></div>
                            <div><span className="text-gray-500 block">الاسم القانوني (إنجليزي):</span> <span className="font-semibold text-lg">{company.companyNameEn || '-'}</span></div>
                            <div><span className="text-gray-500 block">الشكل القانوني:</span> <span className="font-semibold">{company.legalForm}</span></div>
                            <div><span className="text-gray-500 block">تاريخ التأسيس:</span> <span className="font-semibold">{formatDate(company.establishmentDate)}</span></div>
                            <div><span className="text-gray-500 block">رقم السجل التجاري:</span> <span className="font-semibold">{company.registrationNumber}</span></div>
                            <div><span className="text-gray-500 block">رقم الترخيص:</span> <span className="font-semibold">{company.tradeLicenseNumber}</span></div>
                            <div><span className="text-gray-500 block">رقم غرفة التجارة:</span> <span className="font-semibold">{company.chamberOfCommerceNumber}</span></div>
                            <div><span className="text-gray-500 block">مراقب الحسابات:</span> <span className="font-semibold">{company.auditorName}</span></div>
                            <div className="md:col-span-2"><span className="text-gray-500 block">العنوان والمقر الرئيسي:</span> <span className="font-semibold">{company.headOfficeAddress}</span></div>
                            <div><span className="text-gray-500 block">الهاتف:</span> <span className="font-semibold">{company.contactInfo?.phone}</span></div>
                            <div><span className="text-gray-500 block">البريد الإلكتروني:</span> <span className="font-semibold">{company.contactInfo?.email}</span></div>
                        </div>
                    </Card>

                    <Card title="القضايا والنزاعات المتعلقة بالشركة" actions={<Badge text="ربط آلي مع قسم القضايا" color="blue" size="xs"/>}>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 border rounded-lg bg-red-50 border-red-100">
                                <div className="flex gap-3 items-center">
                                    <div className="p-2 bg-red-100 text-red-600 rounded-full"><BuildingLibraryIcon className="w-5 h-5"/></div>
                                    <div>
                                        <p className="font-bold text-sm">قضية رقم 567/2024 تجاري كلي</p>
                                        <p className="text-xs text-gray-500">موضوع القضية: ندب خبير لمحاسبة الشركة</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" leftIcon={<EyeIcon className="w-4"/>}>عرض</Button>
                            </div>
                            <div className="flex justify-between items-center p-3 border rounded-lg bg-gray-50 border-gray-100">
                                <div className="flex gap-3 items-center">
                                    <div className="p-2 bg-gray-200 text-gray-600 rounded-full"><BuildingLibraryIcon className="w-5 h-5"/></div>
                                    <div>
                                        <p className="font-bold text-sm">تظلم رقم 123/2023 عمالي</p>
                                        <p className="text-xs text-gray-500">موضوع القضية: مطالبة عمالية من موظف سابق</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" leftIcon={<EyeIcon className="w-4"/>}>عرض</Button>
                            </div>
                        </div>
                    </Card>
                </div>

                <Card title="حالة الامتثال القانوني" className="h-fit">
                    <div className="space-y-6">
                        <div className="flex justify-between items-center bg-green-50 p-3 rounded-lg border border-green-100">
                            <div className="flex gap-2 items-center">
                                <InformationCircleIcon className="w-5 h-5 text-green-600"/>
                                <span className="text-sm font-bold text-green-800">الترخيص التجاري ساري</span>
                            </div>
                            <Badge text="نشط" color="green" size="xs"/>
                        </div>
                        <div className="flex justify-between items-center bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                            <div className="flex gap-2 items-center">
                                <ClockIcon className="w-5 h-5 text-yellow-600"/>
                                <span className="text-sm font-bold text-yellow-800">الجمعية العمومية قريبة</span>
                            </div>
                            <Badge text="بانتظار الموعد" color="yellow" size="xs"/>
                        </div>
                        <div className="pt-4 border-t space-y-4">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">تنبيهات الحوكمة</h4>
                            <ul className="text-xs space-y-2 text-gray-600">
                                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1"></div> يجب ايداع البيانات المالي قبل 31/03/2025.</li>
                                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1"></div> تنبيه: صلاحية تجديد عضوية مجلس الإدارة تنتهي قريباً.</li>
                            </ul>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );

    const renderStructureTab = () => (
        <div className="space-y-6 animate-fade-in-right">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Board Members */}
                <Card title="مجلس الإدارة" actions={<Button size="sm" variant="outline" onClick={() => toggleModal('board', true)} leftIcon={<PlusCircleIcon className="w-4"/>}>إضافة</Button>}>
                    {company.boardMembers?.length ? (
                        <div className="space-y-3">
                            {company.boardMembers.map(bm => (
                                <div key={bm.id} className="flex justify-between items-center p-3 bg-white border rounded shadow-sm hover:border-primary transition-colors group">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-purple-50 rounded-full text-purple-600 me-3"><UserTieIcon className="w-5 h-5"/></div>
                                        <div>
                                            <p className="font-bold text-sm text-gray-800">{bm.name}</p>
                                            <p className="text-xs text-primary">{bm.position}</p>
                                            <p className="text-[10px] text-gray-400">تنتهي: {formatDate(bm.termEndDate)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="sm" onClick={() => handleEdit('board', bm)}><PencilIcon className="w-4 h-4 text-gray-400 group-hover:text-yellow-600"/></Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleDelete('board', bm.id)} className="text-red-400"><TrashIcon className="w-4"/></Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-center text-gray-500 py-4">لا يوجد أعضاء.</p>}
                </Card>

                {/* Signatories */}
                <Card title="المخولون بالتوقيع" actions={<Button size="sm" variant="outline" onClick={() => toggleModal('signatory', true)} leftIcon={<PlusCircleIcon className="w-4"/>}>إضافة</Button>}>
                    {company.authorizedSignatories?.length ? (
                        <div className="space-y-3">
                            {company.authorizedSignatories.map(as => (
                                <div key={as.id} className="p-3 bg-white border rounded shadow-sm group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-bold text-sm">{as.name}</p>
                                            <p className="text-xs text-gray-500">{as.title}</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="sm" onClick={() => handleEdit('signatory', as)}><PencilIcon className="w-4 h-4 text-gray-400 group-hover:text-yellow-600"/></Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDelete('signatory', as.id)} className="text-red-400"><TrashIcon className="w-4"/></Button>
                                        </div>
                                    </div>
                                    <div className="bg-yellow-50 p-2 rounded text-xs text-yellow-800 border border-yellow-100">
                                        <div className="flex justify-between mb-1">
                                            <span><strong>نطاق الصلاحية:</strong> {as.signatureScope}</span>
                                            {as.authorityLimit ? <Badge text={`بحد أقصى: ${formatCurrency(as.authorityLimit)}`} color="yellow" size="xs"/> : <Badge text="صلاحية مالية مطلقة" color="blue" size="xs"/>}
                                        </div>
                                        {as.jointSignatureRequired && <p className="text-[10px] text-orange-600 font-bold">• يتطلب توقيعاً مشتركاً مع مخول آخر.</p>}
                                        {as.authorizedUntil && <p className="text-[10px] text-gray-500 mt-1">تاريخ انتهاد التفويض: {formatDate(as.authorizedUntil)}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-center text-gray-500 py-4">لا يوجد مخولين.</p>}
                </Card>
            </div>

            {/* Shareholders */}
            <Card title="سجل المساهمين / الشركاء" actions={<Button size="sm" onClick={() => toggleModal('shareholder', true)} leftIcon={<PlusCircleIcon className="w-4"/>}>إضافة مساهم</Button>}>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-right">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-3">الاسم</th>
                                <th className="px-4 py-3">الجنسية</th>
                                <th className="px-4 py-3">الفئة</th>
                                <th className="px-4 py-3">حق التصويت</th>
                                <th className="px-4 py-3 text-center">النسبة</th>
                                <th className="px-4 py-3 no-print">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {company.shareholders?.map(sh => (
                                <tr key={sh.id} className="hover:bg-gray-50 group">
                                    <td className="px-4 py-3 font-medium">{sh.name}</td>
                                    <td className="px-4 py-3">{sh.nationality}</td>
                                    <td className="px-4 py-3"><Badge text={sh.shareClass} color="gray" size="xs"/></td>
                                    <td className="px-4 py-3">{sh.votingRights ? <Badge text="نعم" color="green" size="xs"/> : <Badge text="لا" color="red" size="xs"/>}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center">
                                            <span className="w-10 text-right font-bold text-gray-700">{sh.sharePercentage}%</span>
                                            <div className="w-20 bg-gray-200 h-1.5 rounded-full ms-2 overflow-hidden hidden sm:block">
                                                <div className="bg-blue-600 h-1.5" style={{width: `${sh.sharePercentage}%`}}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 no-print flex gap-2 justify-end">
                                        <Button variant="ghost" size="sm" onClick={() => handleEdit('shareholder', sh)}><PencilIcon className="w-4 h-4 text-gray-400 group-hover:text-yellow-600"/></Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleDelete('shareholder', sh.id)} className="text-red-500"><TrashIcon className="w-4"/></Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Committees */}
            <Card title="اللجان المنبثقة من المجلس" actions={<Button size="sm" variant="outline" onClick={() => toggleModal('committee', true)} leftIcon={<PlusCircleIcon className="w-4"/>}>تشكيل لجنة</Button>}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {company.committees?.length ? company.committees.map(com => (
                        <div key={com.id} className="p-4 bg-gray-50 border rounded-lg hover:border-primary transition-colors group">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="font-bold text-primary">{com.name}</h4>
                                    <p className="text-xs text-gray-500">الدورية: {com.frequency}</p>
                                </div>
                                <div className="flex items-center gap-1 no-print">
                                    <Button variant="ghost" size="sm" onClick={() => handleEdit('committee', com)}><PencilIcon className="w-3 h-3 text-gray-400 group-hover:text-yellow-600"/></Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete('committee', com.id)} className="text-red-400"><TrashIcon className="w-3"/></Button>
                                </div>
                            </div>
                            <p className="text-xs text-gray-600 mb-3 line-clamp-2">{com.description}</p>
                            <div className="flex flex-wrap gap-1">
                                {com.membersIds.map(mid => {
                                    const member = company.boardMembers?.find(bm => bm.id === mid);
                                    return <Badge key={mid} text={member?.name || 'عضو'} color={mid === com.chairpersonId ? 'purple' : 'blue'} size="xs"/>
                                })}
                            </div>
                        </div>
                    )) : <p className="col-span-2 text-center text-gray-500 py-4">لا توجد لجان حالياً.</p>}
                </div>
            </Card>
        </div>
    );

    const renderGovernanceTab = () => (
        <div className="space-y-6 animate-fade-in-right">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card title="الاجتماعات والمحاضر" actions={<Button size="sm" variant="outline" onClick={() => toggleModal('meeting', true)} leftIcon={<PlusCircleIcon className="w-4"/>}>توثيق اجتماع</Button>}>
                        {meetings.length > 0 ? (
                            <div className="space-y-3">
                                {meetings.map(m => (
                                    <div key={m.id} className="border-l-4 border-blue-500 bg-white p-3 rounded shadow-sm hover:shadow-md transition-shadow group">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-sm text-gray-800">{m.meetingType}</p>
                                                <p className="text-xs text-gray-500 flex items-center mt-1"><ClockIcon className="w-3 h-3 me-1"/> {formatDate(m.meetingDate)}</p>
                                            </div>
                                            <div className="flex items-center gap-1 no-print">
                                                <Button variant="ghost" size="sm" onClick={() => handleEdit('meeting', m)}><PencilIcon className="w-4 h-4 text-gray-400 group-hover:text-yellow-600"/></Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDelete('meeting', m.id)} className="text-red-400"><TrashIcon className="w-4"/></Button>
                                                <Button variant="ghost" size="sm" className="text-blue-600" title="طباعة المحضر"><PrinterIcon className="w-4"/></Button>
                                            </div>
                                        </div>
                                        {m.resolutionsPassed && (
                                            <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded line-clamp-2">
                                                <strong>القرارات:</strong> {m.resolutionsPassed}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-gray-500 text-center py-4">لا توجد اجتماعات.</p>}
                    </Card>

                    <Card title="الإجراءات المؤسسية" actions={<Button size="sm" variant="outline" onClick={() => toggleModal('action', true)} leftIcon={<PlusCircleIcon className="w-4"/>}>إجراء جديد</Button>}>
                        {actions.length > 0 ? (
                            <div className="space-y-3">
                                {actions.map(act => (
                                    <div key={act.id} className="border rounded p-3 bg-white flex flex-col gap-2 group shadow-sm hover:border-primary transition-colors">
                                        <div className="flex justify-between items-center">
                                            <Badge text={act.status} color={act.status === CorporateActionStatus.COMPLETED ? 'green' : act.status === CorporateActionStatus.IN_PROGRESS ? 'blue' : 'yellow'} size="xs"/>
                                            <div className="flex items-center gap-1 no-print">
                                                <Button variant="ghost" size="sm" onClick={() => handleEdit('action', act)}><PencilIcon className="w-4 h-4 text-gray-400 group-hover:text-yellow-600"/></Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDelete('action', act.id)} className="text-red-400"><TrashIcon className="w-4"/></Button>
                                            </div>
                                        </div>
                                        <p className="font-bold text-sm">{act.actionType}</p>
                                        <p className="text-xs text-gray-600">{act.description}</p>
                                        <p className="text-xs text-gray-400">{formatDate(act.actionDate)}</p>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-gray-500 text-center py-4">لا توجد إجراءات.</p>}
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card title="تتبع السياسات واللوائح">
                        <div className="space-y-4">
                            <div className="p-3 bg-gray-50 rounded border border-gray-100">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-bold">دليل تفويض السلطات</span>
                                    <Badge text="محدث" color="green" size="xs"/>
                                </div>
                                <p className="text-[10px] text-gray-500">تم الاعتماد: 01/01/2024</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded border border-gray-100">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-bold">لائحة حوكمة الشركات</span>
                                    <Badge text="قيد المراجعة" color="yellow" size="xs"/>
                                </div>
                                <p className="text-[10px] text-gray-500">آخر تحديث: 15/05/2023</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded border border-gray-100">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-bold">سياسة الإفصاح والشفافية</span>
                                    <Badge text="محدث" color="green" size="xs"/>
                                </div>
                                <p className="text-[10px] text-gray-500">تم الاعتماد: 20/09/2023</p>
                            </div>
                            <Button fullWidth variant="outline" size="sm">إضافة سياسة جديدة</Button>
                        </div>
                    </Card>

                    <Card title="الإفصاحات المطلوبة">
                         <div className="space-y-2">
                             <div className="flex items-center gap-2 p-2 bg-red-50 text-red-700 rounded text-[10px]">
                                 <InformationCircleIcon className="w-4 h-4"/>
                                 <span>إفصاح هيئة أسهم المال (ربع سنوي)</span>
                             </div>
                             <div className="flex items-center gap-2 p-2 bg-blue-50 text-blue-700 rounded text-[10px]">
                                 <ClockIcon className="w-4 h-4"/>
                                 <span>تقرير الحوكمة السنوي</span>
                             </div>
                         </div>
                    </Card>
                </div>
            </div>
        </div>
    );

    const renderDocumentsTab = () => (
        <Card title="الأرشيف المؤسسي" actions={<Button size="sm" onClick={() => toggleModal('document', true)} leftIcon={<PlusCircleIcon className="w-4"/>}>إيداع مستند</Button>}>
             <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-right">عنوان المستند</th>
                            <th className="px-4 py-3 text-right">النوع</th>
                            <th className="px-4 py-3 text-right">التاريخ</th>
                            <th className="px-4 py-3 text-right">الحالة</th>
                            <th className="px-4 py-3 no-print">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {documents.map(doc => (
                            <tr key={doc.id} className="hover:bg-gray-50 group">
                                <td className="px-4 py-3 font-medium flex items-center">
                                    <DocumentTextIcon className="w-5 h-5 text-gray-400 me-2"/>
                                    {doc.title}
                                </td>
                                <td className="px-4 py-3">{doc.documentType}</td>
                                <td className="px-4 py-3">{formatDate(doc.documentDate)}</td>
                                <td className="px-4 py-3"><CompanyDocumentStatusBadge status={doc.status} size="xs"/></td>
                                <td className="px-4 py-3 text-left no-print flex gap-2 justify-end">
                                    <Button variant="ghost" size="sm"><EyeIcon className="w-4 h-4 text-blue-600"/></Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleEdit('document', doc)}><PencilIcon className="w-4 h-4 text-gray-400 group-hover:text-yellow-600"/></Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete('document', doc.id)}><TrashIcon className="w-4 h-4 text-red-500"/></Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
        </Card>
    );

    // --- MAIN RENDER ---
    return (
        <div className="space-y-6">
             <div className="flex items-center mb-2">
                <BuildingLibraryIcon className="w-8 h-8 text-primary me-3" />
                <h1 className="text-3xl font-bold text-primary-dark">إدارة شؤون الشركات والحوكمة</h1>
            </div>

            <div className="flex border-b border-gray-200 overflow-x-auto">
                <button onClick={() => setActiveTab('profile')} className={`px-6 py-3 border-b-2 font-medium text-sm transition-colors flex items-center ${activeTab === 'profile' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                    <IdentificationIcon className="w-4 h-4 me-2"/> الملف العام
                </button>
                <button onClick={() => setActiveTab('structure')} className={`px-6 py-3 border-b-2 font-medium text-sm transition-colors flex items-center ${activeTab === 'structure' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                    <UserGroupIcon className="w-4 h-4 me-2"/> الهيكل والملكية
                </button>
                <button onClick={() => setActiveTab('governance')} className={`px-6 py-3 border-b-2 font-medium text-sm transition-colors flex items-center ${activeTab === 'governance' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                    <CogIcon className="w-4 h-4 me-2"/> الحوكمة والقرارات
                </button>
                <button onClick={() => setActiveTab('documents')} className={`px-6 py-3 border-b-2 font-medium text-sm transition-colors flex items-center ${activeTab === 'documents' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                    <FolderIcon className="w-4 h-4 me-2"/> الأرشيف
                </button>
            </div>

            <div className="min-h-[400px]">
                {activeTab === 'profile' && renderProfileTab()}
                {activeTab === 'structure' && renderStructureTab()}
                {activeTab === 'governance' && renderGovernanceTab()}
                {activeTab === 'documents' && renderDocumentsTab()}
            </div>

            {/* Modals */}
            <ShareholderModal 
                isOpen={modals.shareholder} 
                onClose={() => toggleModal('shareholder', false)} 
                onSave={handleSaveShareholder} 
                initialData={editingItem?.type === 'shareholder' ? editingItem.data : undefined}
            />
            <BoardMemberModal 
                isOpen={modals.board} 
                onClose={() => toggleModal('board', false)} 
                onSave={handleSaveBoardMember} 
                initialData={editingItem?.type === 'board' ? editingItem.data : undefined}
            />
            <SignatoryModal 
                isOpen={modals.signatory} 
                onClose={() => toggleModal('signatory', false)} 
                onSave={handleSaveSignatory} 
                initialData={editingItem?.type === 'signatory' ? editingItem.data : undefined}
            />
            <MeetingModal 
                isOpen={modals.meeting} 
                onClose={() => toggleModal('meeting', false)} 
                onSave={handleSaveMeeting} 
                initialData={editingItem?.type === 'meeting' ? editingItem.data : undefined}
            />
            <ActionModal 
                isOpen={modals.action} 
                onClose={() => toggleModal('action', false)} 
                onSave={handleSaveAction} 
                initialData={editingItem?.type === 'action' ? editingItem.data : undefined}
            />
            <CommitteeModal
                isOpen={modals.committee}
                onClose={() => toggleModal('committee', false)}
                onSave={handleSaveCommittee}
                initialData={editingItem?.type === 'committee' ? editingItem.data : undefined}
                boardMembers={company.boardMembers || []}
            />
            <DocumentModal
                isOpen={modals.document}
                onClose={() => toggleModal('document', false)}
                onSave={handleSaveDocument}
                initialData={editingItem?.type === 'document' ? editingItem.data : undefined}
            />
            
            <Modal isOpen={modals.profileEdit} onClose={() => toggleModal('profileEdit', false)} title="تعديل بيانات الشركة" size="lg">
                <div className="space-y-4 p-1">
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="اسم الشركة (عربي)" value={company.companyNameAr} onChange={e => updateCompany('companyNameAr', e.target.value)} />
                        <Input label="اسم الشركة (إنجليزي)" value={company.companyNameEn || ''} onChange={e => updateCompany('companyNameEn', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="رأس المال" type="number" value={company.paidUpCapital?.toString()} onChange={e => updateCompany('paidUpCapital', Number(e.target.value))} />
                        <Input label="رقم السجل التجاري" value={company.registrationNumber} onChange={e => updateCompany('registrationNumber', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="رقم الترخيص" value={company.tradeLicenseNumber || ''} onChange={e => updateCompany('tradeLicenseNumber', e.target.value)} />
                        <Input label="رقم الغرفة" value={company.chamberOfCommerceNumber || ''} onChange={e => updateCompany('chamberOfCommerceNumber', e.target.value)} />
                    </div>
                    <TextArea label="العنوان الرئيسي" value={company.headOfficeAddress} onChange={e => updateCompany('headOfficeAddress', e.target.value)} rows={2} />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="الهاتف" value={company.contactInfo?.phone || ''} onChange={e => updateCompany('contactInfo', {...company.contactInfo, phone: e.target.value})} />
                        <Input label="البريد الإلكتروني" value={company.contactInfo?.email || ''} onChange={e => updateCompany('contactInfo', {...company.contactInfo, email: e.target.value})} />
                    </div>
                    <div className="flex justify-end pt-2"><Button onClick={() => toggleModal('profileEdit', false)}>حفظ التغييرات</Button></div>
                </div>
            </Modal>
        </div>
    );
};

export default CompanyAffairsPage;
