
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import { BuildingLibraryIcon, PlusCircleIcon, EyeIcon, PencilIcon, TrashIcon, FolderIcon, InformationCircleIcon, UserGroupIcon, CogIcon, IdentificationIcon } from '../constants';
import { 
    CompanyProfile, ShareholderInfo, BoardMemberInfo, AuthorizedSignatoryInfo, 
    CompanyMeeting, CorporateAction, CompanyDocument,
    CompanyDocumentType, CompanyDocumentStatus, CompanyLegalFormKuwait, 
    CompanyMeetingType, BoardMemberPosition, CorporateActionType, CorporateActionStatus
} from '../types';
import { 
    companyDocumentTypeOptions, companyDocumentStatusOptions, companyLegalFormOptionsKuwait,
    companyMeetingTypeOptions, boardMemberPositionOptions, corporateActionTypeOptions, corporateActionStatusOptions
} from '../constants';
import { CompanyDocumentStatusBadge } from '../components/ui/Badge'; 

type TabKey = 'companyProfile' | 'meetings' | 'corporateActions' | 'documents';

// --- Mock Data (Comprehensive) ---
const mockCompanyProfile: CompanyProfile = {
    id: 'comp-main-001',
    companyNameAr: 'شركة الاستثمارات الخليجية القابضة (ش.م.ك.ق)',
    companyNameEn: 'Gulf Investments Holding Company (K.S.C.P)',
    legalForm: CompanyLegalFormKuwait.KUWAITI_SHAREHOLDING_CLOSED,
    registrationNumber: 'س.ت. 12345',
    tradeLicenseNumber: 'ر.ت. 67890/2020',
    chamberOfCommerceNumber: 'ع.غ. 54321',
    establishmentDate: '2010-05-15',
    capital: 10000000, // 10 Million KWD
    paidUpCapital: 7500000,
    headOfficeAddress: 'مدينة الكويت، شرق، برج السلام، الدور 25',
    contactInfo: { phone: '22225555', email: 'info@gulfinvest.com.kw', website: 'www.gulfinvest.com.kw' },
    fiscalYearEnd: '12-31', // MM-DD
    auditorName: 'شركة إرنست ويونغ (العيبان والعصيمي وشركاهم)',
    shareholders: [
        { id: 'sh1', name: 'الشيخ/ خالد ناصر الصباح', nationality: 'كويتي', civilIdOrRegNumber: '275...', sharePercentage: 30, numberOfShares: 3000000, shareType: 'عادية' },
        { id: 'sh2', name: 'شركة دبي للاستثمار (ش.م.ع)', nationality: 'إماراتية', civilIdOrRegNumber: 'DXB-INV-001', sharePercentage: 25, numberOfShares: 2500000, shareType: 'عادية' },
        { id: 'sh3', name: 'السيد/ عبدالله محمد القطان', nationality: 'كويتي', civilIdOrRegNumber: '280...', sharePercentage: 15, numberOfShares: 1500000, shareType: 'عادية' },
    ],
    boardMembers: [
        { id: 'bm1', name: 'الشيخ/ خالد ناصر الصباح', position: BoardMemberPosition.CHAIRMAN, appointmentDate: '2020-06-01', termEndDate: '2025-05-31' },
        { id: 'bm2', name: 'السيد/ أحمد السالم', position: BoardMemberPosition.VICE_CHAIRMAN, appointmentDate: '2020-06-01', termEndDate: '2025-05-31' },
        { id: 'bm3', name: 'السيدة/ ليلى الخالد', position: BoardMemberPosition.MEMBER, appointmentDate: '2021-07-10', termEndDate: '2026-07-09' },
    ],
    authorizedSignatories: [
        { id: 'as1', name: 'الشيخ/ خالد ناصر الصباح', title: 'رئيس مجلس الإدارة', signatureScope: 'توقيع منفرد على كافة المعاملات والعقود' },
        { id: 'as2', name: 'السيد/ عمر الفاروق (المدير العام)', title: 'المدير العام', signatureScope: 'توقيع منفرد على المعاملات حتى 500,000 د.ك، وتوقيع مشترك مع رئيس المجلس للمعاملات الأكبر' },
    ]
};

const mockMeetings: CompanyMeeting[] = [
    { 
        id: 'meet1', meetingType: CompanyMeetingType.BOARD_OF_DIRECTORS, meetingDate: '2024-06-15', meetingTime: '10:00', meetingLocation: 'مقر الشركة الرئيسي - قاعة الاجتماعات الكبرى',
        attendees: ['الشيخ/ خالد ناصر الصباح', 'السيد/ أحمد السالم', 'السيدة/ ليلى الخالد', 'السيد/ عمر الفاروق (المدير العام)', 'مقرر المجلس'],
        agendaItems: "1. مناقشة واعتماد البيانات المالية للربع الثاني 2024.\n2. مراجعة خطط التوسع الإقليمي.\n3. تعيين مدير جديد لقسم الاستثمار العقاري.",
        resolutionsPassed: "1. تمت الموافقة بالإجماع على البيانات المالية للربع الثاني.\n2. تم تكليف الإدارة التنفيذية بتقديم دراسة مفصلة حول التوسع في السوق السعودي خلال شهرين.\n3. تمت الموافقة على تعيين السيد/ يوسف الحمد مديرًا لقسم الاستثمار العقاري.",
        minutesDocumentId: 'doc-minutes-bod-2024-06-15'
    },
    {
        id: 'meet2', meetingType: CompanyMeetingType.ORDINARY_GENERAL_ASSEMBLY, meetingDate: '2024-03-30', meetingLocation: 'فندق شيراتون الكويت - قاعة المؤتمرات',
        agendaItems: "1. سماع تقرير مجلس الإدارة عن السنة المالية المنتهية في 2023-12-31.\n2. سماع تقرير مدقق الحسابات.\n3. مناقشة الميزانية العمومية وحساب الأرباح والخسائر والمصادقة عليها.\n4. إبراء ذمة أعضاء مجلس الإدارة.\n5. انتخاب مجلس إدارة جديد (إذا لزم الأمر).\n6. تعيين مدقق حسابات للسنة المالية القادمة.",
        resolutionsPassed: "تمت الموافقة على جميع بنود جدول الأعمال.",
        minutesDocumentId: 'doc-minutes-oga-2024-03-30'
    }
];

const mockCorporateActions: CorporateAction[] = [
    { 
        id: 'ca1', actionType: CorporateActionType.CAPITAL_INCREASE, actionDate: '2023-11-01', 
        description: 'زيادة رأس مال الشركة',
        details: 'زيادة رأس مال الشركة من 5 مليون د.ك إلى 7.5 مليون د.ك عبر طرح أسهم جديدة للمساهمين الحاليين.', 
        status: CorporateActionStatus.COMPLETED, 
        relatedDocumentsIds: ['doc-ga-resolution-cap-increase', 'doc-moci-approval-cap-increase'] 
    },
    {
        id: 'ca2', actionType: CorporateActionType.AMEND_ARTICLES_OF_ASSOCIATION, actionDate: '2024-08-01',
        description: 'تعديل عقد التأسيس',
        details: 'تعديل المادة (5) من عقد التأسيس لتشمل أنشطة جديدة للشركة في مجال التكنولوجيا المالية.',
        status: CorporateActionStatus.IN_PROGRESS,
        relatedDocumentsIds: ['doc-draft-amendment', 'doc-extra-ga-call']
    }
];

const mockCompanyDocuments: CompanyDocument[] = [
  {
    id: 'doc-minutes-bod-2024-06-15', title: 'محضر اجتماع مجلس الإدارة بتاريخ 2024-06-15', documentType: CompanyDocumentType.MEETING_MINUTES_BOD, documentDate: '2024-06-15', status: CompanyDocumentStatus.SIGNED, keywords: ['مجلس إدارة', 'محضر', '2024'], meetingId: 'meet1', createdAt: '2024-06-16'
  },
  { 
    id: 'doc-minutes-oga-2024-03-30', title: 'محضر اجتماع الجمعية العمومية العادية بتاريخ 2024-03-30', documentType: CompanyDocumentType.MEETING_MINUTES_GA, documentDate: '2024-03-30', status: CompanyDocumentStatus.APPROVED, keywords: ['جمعية عمومية', 'عادية', 'محضر', '2024'], meetingId: 'meet2', createdAt: '2024-04-01'
  },
  {
    id: 'doc-founding-contract', title: 'عقد تأسيس شركة الاستثمارات الخليجية القابضة', documentType: CompanyDocumentType.FOUNDING_DOCUMENT, documentDate: '2010-05-10', status: CompanyDocumentStatus.ACTIVE, keywords: ['عقد تأسيس', 'نظام أساسي'], createdAt: '2010-05-10'
  },
  {
    id: 'doc-ga-resolution-cap-increase', title: 'قرار الجمعية العمومية غير العادية بزيادة رأس المال', documentType: CompanyDocumentType.GA_RESOLUTION, documentDate: '2023-10-15', status: CompanyDocumentStatus.APPROVED, corporateActionId: 'ca1', createdAt: '2023-10-16'
  },
];

// Helper function for formatting dates
const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) { return dateString; }
};

const formatCurrency = (amount?: number): string => {
    if (amount === undefined || isNaN(amount)) return '-';
    return `${amount.toLocaleString('ar-EG')} د.ك`; // Using toLocaleString for better readability
};


// --- Company Profile Form Modal ---
interface CompanyProfileFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CompanyProfile) => void;
    initialData?: CompanyProfile | null;
}
const CompanyProfileFormModal: React.FC<CompanyProfileFormModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState<Partial<CompanyProfile>>(initialData || { contactInfo: {} });
    useEffect(() => { if (initialData) setFormData(initialData); }, [initialData, isOpen]);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.startsWith("contactInfo.")) {
            const field = name.split('.')[1];
            setFormData(prev => ({ ...prev, contactInfo: { ...(prev.contactInfo || {}), [field]: value } }));
        } else {
             const numValue = ['capital', 'paidUpCapital'].includes(name) ? parseFloat(value) || 0 : value;
             setFormData(prev => ({ ...prev, [name]: numValue }));
        }
    };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.companyNameAr || !formData.legalForm || !formData.registrationNumber) {
            alert("يرجى ملء حقول اسم الشركة (عربي)، الشكل القانوني، ورقم السجل التجاري.");
            return;
        }
        onSubmit(formData as CompanyProfile);
    };
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="تعديل بيانات الشركة الأساسية" size="xl">
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto p-1">
                 <Card title="المعلومات الأساسية" titleClassName="text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input name="companyNameAr" label="اسم الشركة (عربي)" value={formData.companyNameAr || ''} onChange={handleChange} required />
                        <Input name="companyNameEn" label="اسم الشركة (إنجليزي)" value={formData.companyNameEn || ''} onChange={handleChange} />
                        <Select name="legalForm" label="الشكل القانوني" value={formData.legalForm} options={companyLegalFormOptionsKuwait} onChange={handleChange} required />
                        <Input name="registrationNumber" label="رقم السجل التجاري" value={formData.registrationNumber || ''} onChange={handleChange} required />
                        <Input name="tradeLicenseNumber" label="رقم الرخصة التجارية" value={formData.tradeLicenseNumber || ''} onChange={handleChange} />
                        <Input name="chamberOfCommerceNumber" label="رقم عضوية غرفة التجارة" value={formData.chamberOfCommerceNumber || ''} onChange={handleChange} />
                        <Input name="establishmentDate" label="تاريخ التأسيس" type="date" value={formData.establishmentDate || ''} onChange={handleChange} />
                    </div>
                </Card>
                <Card title="رأس المال والمعلومات المالية" titleClassName="text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input name="capital" label="رأس المال المصرح به (د.ك)" type="number" value={String(formData.capital || '')} onChange={handleChange} />
                        <Input name="paidUpCapital" label="رأس المال المدفوع (د.ك)" type="number" value={String(formData.paidUpCapital || '')} onChange={handleChange} />
                        <Input name="fiscalYearEnd" label="نهاية السنة المالية (MM-DD)" value={formData.fiscalYearEnd || ''} onChange={handleChange} placeholder="مثال: 12-31" />
                        <Input name="auditorName" label="اسم مدقق الحسابات" value={formData.auditorName || ''} onChange={handleChange} />
                    </div>
                </Card>
                <Card title="معلومات الاتصال والمقر" titleClassName="text-sm">
                    <TextArea name="headOfficeAddress" label="عنوان المقر الرئيسي" value={formData.headOfficeAddress || ''} onChange={handleChange} rows={2}/>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        <Input name="contactInfo.phone" label="هاتف الشركة" value={formData.contactInfo?.phone || ''} onChange={handleChange} />
                        <Input name="contactInfo.email" label="البريد الإلكتروني للشركة" type="email" value={formData.contactInfo?.email || ''} onChange={handleChange} />
                        <Input name="contactInfo.website" label="الموقع الإلكتروني" type="url" value={formData.contactInfo?.website || ''} onChange={handleChange} />
                    </div>
                </Card>
                <div className="flex justify-end space-x-3 space-x-reverse pt-3">
                    <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
                    <Button type="submit">حفظ التعديلات</Button>
                </div>
            </form>
        </Modal>
    );
};

// TODO: Implement ShareholderFormModal, BoardMemberFormModal, AuthorizedSignatoryFormModal
// TODO: Implement CompanyMeetingFormModal, ViewCompanyMeetingModal
// TODO: Implement CorporateActionFormModal, ViewCorporateActionModal
// TODO: Implement CompanyDocumentFormModal, ViewCompanyDocumentModal (similar to LegalResourcesPage)


const CompanyAffairsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('companyProfile');
  
  // State for Company Profile (single object as we assume one company for now)
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(mockCompanyProfile);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // State for Meetings
  const [meetings, setMeetings] = useState<CompanyMeeting[]>(mockMeetings);
  // ... other states for meetings modal, editingMeeting etc.

  // State for Corporate Actions
  const [corporateActions, setCorporateActions] = useState<CorporateAction[]>(mockCorporateActions);
  // ... other states for actions modal, editingAction etc.

  // State for Documents (shared or specific to this module)
  const [documents, setDocuments] = useState<CompanyDocument[]>(mockCompanyDocuments);
  // ... other states for documents modal, editingDocument etc.
  
  const handleProfileSubmit = (data: CompanyProfile) => {
    setCompanyProfile(data);
    setIsProfileModalOpen(false);
  };

  const renderCompanyProfileTab = () => (
    <Card title="ملف الشركة وبياناتها الأساسية" actions={<Button variant="outline" size="sm" onClick={() => setIsProfileModalOpen(true)} leftIcon={<PencilIcon className="w-4"/>}>تعديل بيانات الشركة</Button>}>
      {companyProfile ? (
        <div className="space-y-3 text-sm">
          <p><strong>اسم الشركة:</strong> {companyProfile.companyNameAr} ({companyProfile.companyNameEn || ''})</p>
          <p><strong>الشكل القانوني:</strong> {companyProfile.legalForm}</p>
          <p><strong>رقم السجل التجاري:</strong> {companyProfile.registrationNumber}</p>
          <p><strong>رأس المال المصرح به:</strong> {formatCurrency(companyProfile.capital)}</p>
          {/* TODO: Display Shareholders, Board Members, Signatories in sub-sections or cards */}
           <h4 className="font-semibold mt-3 text-gray-700">المساهمون:</h4>
           {companyProfile.shareholders && companyProfile.shareholders.length > 0 ? 
            (<ul className="list-disc ps-5 text-xs">{companyProfile.shareholders.map(sh => <li key={sh.id}>{sh.name} ({sh.sharePercentage}%)</li>)}</ul>)
            : <p className="text-xs text-gray-500">لا توجد بيانات مساهمين.</p>}
        </div>
      ) : (
        <p>لا توجد بيانات لملف الشركة. <Button variant="ghost" onClick={() => setIsProfileModalOpen(true)}>إضافة بيانات الشركة</Button></p>
      )}
    </Card>
  );

  const renderMeetingsTab = () => (
    <Card title="سجل الاجتماعات والقرارات">
        <div className="mb-4 flex justify-end">
            <Button onClick={() => alert("فتح نموذج إضافة اجتماع")} leftIcon={<PlusCircleIcon className="w-5"/>}>إضافة اجتماع جديد</Button>
        </div>
        {meetings.length > 0 ? (
            <div className="space-y-3">
                {meetings.map(meet => (
                    <Card key={meet.id} title={`${meet.meetingType} - ${formatDate(meet.meetingDate)}`} className="bg-gray-50">
                        <p className="text-xs text-gray-600"><strong>الموقع:</strong> {meet.meetingLocation}</p>
                        <p className="text-xs font-semibold mt-1">أهم القرارات:</p>
                        <pre className="text-xs whitespace-pre-wrap p-1 bg-white border rounded max-h-20 overflow-y-auto">{meet.resolutionsPassed || 'لا توجد قرارات مسجلة.'}</pre>
                    </Card>
                ))}
            </div>
        ) : <p className="text-gray-500 text-center py-4">لا توجد اجتماعات مسجلة.</p>}
    </Card>
  );
  // TODO: Implement renderCorporateActionsTab and renderDocumentsTab

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'companyProfile', label: 'ملف الشركة وبياناتها', icon: <IdentificationIcon className="w-5 h-5 me-2" /> },
    { key: 'meetings', label: 'سجل الاجتماعات والقرارات', icon: <UserGroupIcon className="w-5 h-5 me-2" /> },
    { key: 'corporateActions', label: 'سجل الإجراءات المؤسسية', icon: <CogIcon className="w-5 h-5 me-2" /> },
    { key: 'documents', label: 'مكتبة مستندات الشركة', icon: <FolderIcon className="w-5 h-5 me-2" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <BuildingLibraryIcon className="w-8 h-8 text-primary me-3" />
        <h1 className="text-3xl font-bold text-primary-dark">إدارة شؤون الشركات والامتثال المؤسسي</h1>
      </div>
      
       <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start">
            <InformationCircleIcon className="w-6 h-6 text-blue-600 me-3 mt-1 flex-shrink-0" />
            <div>
                <h3 className="text-md font-semibold text-blue-700 mb-1">إدارة متكاملة لشؤون شركتك</h3>
                <p className="text-sm text-blue-600 leading-relaxed">
                    تم تصميم هذه الوحدة لتوفير نظام شامل لإدارة جميع الجوانب القانونية والإدارية المتعلقة بشركتك، مع التركيز على الامتثال لـ<strong>قانون الشركات الكويتي رقم 1 لسنة 2016</strong> ولائحته التنفيذية. 
                    يمكنك هنا إدارة ملف الشركة الأساسي، بيانات المساهمين وأعضاء مجلس الإدارة، توثيق اجتماعات الجمعيات العمومية ومجالس الإدارة وقراراتها، تتبع الإجراءات المؤسسية الهامة، وأرشفة مستندات الشركة الرسمية.
                </p>
            </div>
        </div>
      </Card>

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-4 space-x-reverse" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm flex items-center
                ${activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'companyProfile' && renderCompanyProfileTab()}
      {activeTab === 'meetings' && renderMeetingsTab()}
      {/* TODO: Render other tabs when implemented */}
      {activeTab === 'corporateActions' && <Card title="سجل الإجراءات المؤسسية"><p className="text-gray-500 text-center py-5">قيد التطوير...</p></Card>}
      {activeTab === 'documents' && <Card title="مكتبة مستندات الشركة"><p className="text-gray-500 text-center py-5">سيتم عرض قائمة المستندات هنا مع فلاتر متقدمة...</p></Card>}
      
      {/* Modals */}
      <CompanyProfileFormModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)}
        onSubmit={handleProfileSubmit}
        initialData={companyProfile}
      />
      {/* TODO: Add Modals for Shareholders, BoardMembers, Signatories, Meetings, CorporateActions, Documents */}
    </div>
  );
};

export default CompanyAffairsPage;
