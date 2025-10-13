import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import { BuildingOffice2Icon, PlusCircleIcon, EyeIcon, PencilIcon, TrashIcon, FolderIcon, UsersIcon, DocumentTextIcon, CalendarDaysIcon, BriefcaseIcon, ReceiptPercentIcon, ArrowUturnLeftIcon, LinkIcon, WrenchScrewdriverIcon, PresentationChartLineIcon } from '../constants';
import { 
    Property, PropertyUnit, Tenant, LeaseAgreement, RentPayment,
    PropertyType, PropertyUnitStatus, LeaseAgreementStatus, RentPaymentFrequency, RentPaymentStatus,
    EvictionNoticeRecord, ClearanceCertificateRecord, DebtSettlementRecord, PropertyCategoryKuwait, PropertyUnitTypeKuwait, PropertyIntendedUseKuwait, LeaseTermType, RequestAttachment, Case, SettlementStatus,
    PaymentMethod
} from '../types';
import { 
    propertyTypeOptions, propertyUnitStatusOptions, leaseAgreementStatusOptions, 
    rentPaymentFrequencyOptions, rentPaymentStatusOptions, propertyCategoryKuwaitOptions, propertyUnitTypeKuwaitOptions,
    propertyIntendedUseKuwaitOptions, leaseTermTypeOptions, paymentMethodOptions
} from '../constants';
import { PropertyUnitStatusBadge, LeaseAgreementStatusBadge, RentPaymentStatusBadge, SettlementStatusBadge } from '../components/ui/Badge';
import { getMockSettlementRecords } from './DebtSettlementPage'; 
import { Link } from 'react-router-dom';
import { initialCases } from './CaseListPage';


// Enhanced Mock Data
export const mockTenants: Tenant[] = [ 
  { id: 't1', fullNameAr: 'أحمد عبدالله محمد', civilIdOrPassport: '280010112345', nationality: 'كويتي', phone: '98765432', email: 'ahmed.a@example.com', createdAt: '2023-01-01', updatedAt: '2023-01-01', occupation: 'مهندس', notes: 'مستأجر ملتزم بالدفعات، لديه قضية إخلاء سابقة بسبب سوء فهم تم تسويتها.' },
  { id: 't2', fullNameAr: 'شركة الأمل للتجارة والمقاولات', civilIdOrPassport: 'CR100200', nationality: 'كويتية (شركة)', phone: '22446688', email: 'info@alamal.com', createdAt: '2022-11-10', updatedAt: '2022-11-10', occupation: 'شركة تجارية', address: 'الشويخ الصناعية، قطعة 3، مبنى الأمل' },
  { id: 't3', fullNameAr: 'نورة خالد السالم', civilIdOrPassport: '295121200000', nationality: 'كويتية', phone: '50501010', email: 'noura.k@example.com', createdAt: '2024-02-15', updatedAt: '2024-02-15', occupation: 'طبيبة'},
  { id: 't4', fullNameAr: 'محمد جاسم الفهد', civilIdOrPassport: '288050599887', nationality: 'كويتي', phone: '51234567', email: 'mohd.j.alfahad@email.com', createdAt: '2023-08-01', occupation: 'محاسب أول', notes: 'يفضل التواصل عبر الواتساب.'}
];

export const mockProperties: Property[] = [ 
  { 
    id: 'prop1', name: 'بناية النخيل السكنية', type: PropertyType.BUILDING, propertyCategory: PropertyCategoryKuwait.INVESTMENT_RESIDENTIAL, address: 'السالمية، قطعة 5، شارع الخليج العربي، مبنى 20', paciNumber: '12345678', ownerName: 'شركة العقارات المتحدة', 
    units: [
      { id: 'u1a', propertyId: 'prop1', unitNumber: 'شقة 101 - دور أول', floor: '1', areaSqM: 85, bedrooms: 2, bathrooms: 2, status: PropertyUnitStatus.RENTED, currentLeaseId: 'lease1', unitType: PropertyUnitTypeKuwait.APARTMENT, intendedUse: PropertyIntendedUseKuwait.RESIDENTIAL, amenities: 'مكيفة بالكامل، شرفة جانبية، موقف سيارة خاص رقم 15، مطبخ مجهز جزئياً' },
      { id: 'u1b', propertyId: 'prop1', unitNumber: 'شقة 102 - دور أول', floor: '1', areaSqM: 78, bedrooms: 2, bathrooms: 1.5, status: PropertyUnitStatus.VACANT, unitType: PropertyUnitTypeKuwait.APARTMENT, intendedUse: PropertyIntendedUseKuwait.RESIDENTIAL, amenities: 'تكييف وحدات، موقف مشترك' },
      { id: 'u1c', propertyId: 'prop1', unitNumber: 'شقة 201 - دور ثاني', floor: '2', areaSqM: 120, bedrooms:3, bathrooms:2.5, status: PropertyUnitStatus.RENTED, currentLeaseId: 'lease4', unitType: PropertyUnitTypeKuwait.APARTMENT, intendedUse: PropertyIntendedUseKuwait.RESIDENTIAL, amenities: 'مكيفة بالكامل، إطلالة بحرية جزئية، موقفين سيارة، غرفة خادمة' },
      { id: 'u1d', propertyId: 'prop1', unitNumber: 'محل رقم 1 - أرضي', floor: 'أرضي', areaSqM: 60, status: PropertyUnitStatus.UNDER_MAINTENANCE, unitType: PropertyUnitTypeKuwait.SHOP, intendedUse: PropertyIntendedUseKuwait.COMMERCIAL_ACTIVITY, amenities: 'واجهة زجاجية كبيرة، دورة مياه خاصة' },
    ],
    createdAt: '2022-01-15',
    generalNotes: "تم تجديد دهانات المدخل والممرات مؤخرًا. يوجد عقد صيانة سنوي للمصاعد مع شركة الأمانة. تم تركيب نظام كاميرات مراقبة جديد للمداخل ومواقف السيارات."
  },
  { id: 'prop2', name: 'فيلا السعادة - السرة', type: PropertyType.VILLA, propertyCategory: PropertyCategoryKuwait.PRIVATE_RESIDENTIAL, address: 'السرة، قطعة 3، شارع الشهداء، فيلا 12', ownerName: 'خالد جاسم الأحمد', createdAt: '2021-06-20', status: PropertyUnitStatus.RENTED, currentLeaseId: 'lease_villa_01', generalNotes: 'الفيلا تحتوي على حديقة خاصة وحمام سباحة صغير. تم تجديد المطبخ بالكامل في 2023.'},
  { id: 'prop3', name: 'مجمع النور التجاري - محل 5', type: PropertyType.SHOP, propertyCategory: PropertyCategoryKuwait.COMMERCIAL, address: 'حولي، شارع تونس، مجمع النور، محل رقم 5', ownerName: 'شركة الأنوار العقارية', createdAt: '2023-03-01', status: PropertyUnitStatus.RENTED, currentLeaseId: 'lease2', generalNotes: 'المحل يقع في زاوية مميزة بالمجمع. الإيجار يشمل رسوم خدمات المجمع.'},
  { id: 'prop4', name: 'أرض فضاء - جنوب السرة', type: PropertyType.LAND, propertyCategory: PropertyCategoryKuwait.INVESTMENT_RESIDENTIAL, address: 'جنوب السرة، قطعة 2، قسيمة 150', ownerName: 'ورثة المرحوم/ صالح الحمدان', createdAt: '2020-01-01', status: PropertyUnitStatus.VACANT, description: 'أرض فضاء بمساحة 750 متر مربع، موقع مميز قرب الخدمات الرئيسية. تصلح لبناء فيلا أو بناية استثمارية صغيرة.', paciNumber: '87654321' },
  { id: 'prop5', name: 'برج الأعمال المركزي', type: PropertyType.BUILDING, propertyCategory: PropertyCategoryKuwait.COMMERCIAL, address: 'مدينة الكويت، شرق، شارع أحمد الجابر، برج رقم 77', ownerName: 'شركة الخليج للاستثمار العقاري', createdAt: '2019-05-01', paciNumber: '55551111',
    units: [
      { id: 'u5a', propertyId: 'prop5', unitNumber: 'مكتب 1201 - دور 12', floor: '12', areaSqM: 150, status: PropertyUnitStatus.RENTED, currentLeaseId: 'lease3', unitType: PropertyUnitTypeKuwait.OFFICE, intendedUse: PropertyIntendedUseKuwait.ADMINISTRATIVE_OFFICE, amenities: 'إطلالة بانورامية على المدينة، تشطيبات فاخرة، 3 مواقف سيارات، استقبال مشترك' },
      { id: 'u5b', propertyId: 'prop5', unitNumber: 'مكتب 1202 - دور 12', floor: '12', areaSqM: 90, status: PropertyUnitStatus.VACANT, unitType: PropertyUnitTypeKuwait.OFFICE, intendedUse: PropertyIntendedUseKuwait.ADMINISTRATIVE_OFFICE, amenities: 'مقسم جاهز، موقفين سيارة' },
      { id: 'u5c', propertyId: 'prop5', unitNumber: 'محل G03 - أرضي', floor: 'أرضي', areaSqM: 80, status: PropertyUnitStatus.RENTED, unitType: PropertyUnitTypeKuwait.SHOP, intendedUse: PropertyIntendedUseKuwait.COMMERCIAL_ACTIVITY, amenities: 'واجهة على الشارع الرئيسي مباشرة، يصلح لنشاط كافيه أو صرافة.'},
    ],
    generalNotes: 'البرج مجهز بأحدث أنظمة الأمن والسلامة. يتوفر لوبي استقبال فخم ومواقف سيارات متعددة الأدوار للزوار.'
  },
];

export const mockLeaseAgreements: LeaseAgreement[] = [ 
  { 
    id: 'lease1', contractNumber: 'LSE2023-NKL-101', propertyId: 'prop1', unitId: 'u1a', tenantId: 't1', 
    startDate: '2023-02-01', endDate: '2025-01-31', rentAmount: 450, rentFrequency: RentPaymentFrequency.MONTHLY, depositAmount: 450, 
    status: LeaseAgreementStatus.ACTIVE, createdAt: '2023-01-25',
    relatedCaseIds: ['RENT-EVICT-001-2024'], 
    debtSettlementId: 'set-001',
    paymentDueDateDay: 5,
    leaseTermType: LeaseTermType.FIXED,
    noticePeriodDays: 60,
    purposeOfLease: 'سكني عائلي',
    rentIncludes: ['ماء', 'صيانة المصعد', 'رسوم الحارس'],
    termsAndConditions: "يلتزم المستأجر بعدم إحداث أي تغييرات جوهرية في العين المؤجرة دون موافقة خطية مسبقة من المؤجر. يلتزم المستأجر بسداد فواتير الكهرباء الخاصة بالوحدة مباشرة.",
    notes: "تم تجديد العقد مرة واحدة. المستأجر يطلب تمديدًا إضافيًا."
  },
  {
    id: 'lease2', contractNumber: 'LSE2024-NOR-005', propertyId: 'prop3', tenantId: 't2', 
    startDate: '2024-04-01', endDate: '2026-03-31', rentAmount: 750, rentFrequency: RentPaymentFrequency.MONTHLY, depositAmount: 750,
    status: LeaseAgreementStatus.ACTIVE, createdAt: '2024-03-15',
    relatedCaseIds: ['CML-2024-101'], // Example of linking commercial case to a commercial lease
    paymentDueDateDay: 1,
    leaseTermType: LeaseTermType.FIXED,
    purposeOfLease: 'ممارسة نشاط تجاري (بيع ملابس جاهزة)',
    latePaymentFee: 25, 
    rentIncludes: ['رسوم خدمات المجمع']
  },
  {
    id: 'lease3', contractNumber: 'LSE2024-ABC-1201', propertyId: 'prop5', unitId: 'u5a', tenantId: 't3', 
    startDate: '2024-07-01', endDate: '2025-06-30', rentAmount: 1200, rentFrequency: RentPaymentFrequency.QUARTERLY, depositAmount: 1200,
    status: LeaseAgreementStatus.ACTIVE, createdAt: '2024-06-15',
    paymentDueDateDay: 1,
    leaseTermType: LeaseTermType.FIXED,
    purposeOfLease: 'مكتب استشارات إدارية وهندسية',
    noticePeriodDays: 90,
    rentIncludes: ['تكييف مركزي', 'نظافة المناطق المشتركة', 'أمن']
  },
  {
    id: 'lease4', contractNumber: 'LSE2024-NKL-201', propertyId: 'prop1', unitId: 'u1c', tenantId: 't4', 
    startDate: '2024-08-15', endDate: '2025-08-14', rentAmount: 650, rentFrequency: RentPaymentFrequency.MONTHLY, depositAmount: 650,
    status: LeaseAgreementStatus.PENDING_START, createdAt: '2024-07-20',
    paymentDueDateDay: 10,
    leaseTermType: LeaseTermType.FIXED,
    purposeOfLease: 'سكني خاص',
    rentIncludes: ['ماء', 'موقف سيارة']
  },
  {
    id: 'lease_villa_01', contractNumber: 'LSE2022-VIL-001', propertyId: 'prop2', tenantId: 't1', 
    startDate: '2022-09-01', endDate: '2024-08-31', rentAmount: 1100, rentFrequency: RentPaymentFrequency.MONTHLY, depositAmount: 1100,
    status: LeaseAgreementStatus.EXPIRED, 
    createdAt: '2022-08-15',
    purposeOfLease: 'سكني خاص عائلي',
    termsAndConditions: "يتحمل المستأجر تكاليف صيانة الحديقة وحمام السباحة.",
    notes: "انتهى العقد، تم إرسال إشعار بعدم الرغبة في التجديد من قبل المالك."
  }
];

export const mockRentPayments: RentPayment[] = [
  { id: 'pay1', leaseAgreementId: 'lease1', paymentDate: '2024-07-03', dueDate: '2024-07-05', amountPaid: 450, amountDue: 450, status: RentPaymentStatus.PAID, recordedAt: '2024-07-03', partOfSettlementId: 'set-001', paymentMethod: PaymentMethod.BANK_TRANSFER, referenceNumber: 'TRN123456', paymentForPeriod: 'إيجار يوليو 2024' },
  { id: 'pay2', leaseAgreementId: 'lease1', paymentDate: '2024-06-05', dueDate: '2024-06-05', amountPaid: 450, amountDue: 450, status: RentPaymentStatus.PAID, recordedAt: '2024-06-02', partOfSettlementId: 'set-001', paymentMethod: PaymentMethod.CASH, paymentForPeriod: 'إيجار يونيو 2024' },
  { id: 'pay3', leaseAgreementId: 'lease2', paymentDate: '2024-07-05', dueDate: '2024-07-01', amountPaid: 750, amountDue: 750, status: RentPaymentStatus.PAID, recordedAt: '2024-07-05', paymentMethod: PaymentMethod.CHEQUE, referenceNumber: 'CHQ001234', paymentForPeriod: 'إيجار يوليو 2024 لمحل النور' },
  { id: 'pay4', leaseAgreementId: 'lease2', paymentDate: '2024-08-01', dueDate: '2024-08-01', amountPaid: 300, amountDue: 750, status: RentPaymentStatus.PARTIALLY_PAID, recordedAt: '2024-08-01', paymentMethod: PaymentMethod.CASH, notes: 'دفعة جزئية، سيتم سداد الباقي خلال أسبوع.', paymentForPeriod: 'جزء من إيجار أغسطس 2024 لمحل النور' },
  { id: 'pay5', leaseAgreementId: 'lease3', paymentDate: '2024-07-01', dueDate: '2024-07-01', amountPaid: 1200, amountDue: 1200, status: RentPaymentStatus.PAID, recordedAt: '2024-07-01', paymentMethod: PaymentMethod.BANK_TRANSFER, referenceNumber: 'BT/CORP/Q3-2024', paymentForPeriod: 'إيجار الربع الثالث 2024 لمكتب برج الأعمال'},
  { id: 'pay6', leaseAgreementId: 'lease1', dueDate: '2024-05-05', amountPaid: 0, amountDue: 450, status: RentPaymentStatus.OVERDUE, recordedAt: '2024-05-06', paymentForPeriod: 'إيجار مايو 2024 - متأخر', paymentDate: '', isSettlement: false},
];

const mockEvictionNotices: EvictionNoticeRecord[] = [
    {
        id: 'evict1',
        leaseAgreementId: 'lease1', // linked to Ahmed Abdullah
        propertyId: 'prop1',
        unitId: 'u1a',
        tenantId: 't1',
        noticeDate: '2024-05-10',
        reason: 'تأخر متكرر في سداد الأجرة عن شهري مارس وأبريل 2024.',
        status: 'CourtCaseFiled',
        notes: 'تم رفع قضية إخلاء رقم RENT-EVICT-001-2024.',
    }
];

const mockClearanceCertificates: ClearanceCertificateRecord[] = [
    {
        id: 'clear1',
        leaseAgreementId: 'lease_villa_01', // linked to an expired lease
        propertyId: 'prop2',
        tenantId: 't1',
        issueDate: '2024-09-05',
        notes: 'تم تسليم الوحدة بحالة جيدة وسداد كافة المستحقات.',
    }
];


// Helper function for formatting dates
const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) { return dateString; }
};
const formatCurrency = (amount?: number) => amount !== undefined ? `${amount.toFixed(3)} د.ك` : '-';

// --- Property Form Modal ---
interface PropertyFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Property) => void;
    initialData?: Partial<Property> | null;
}

const PropertyFormModal: React.FC<PropertyFormModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const getInitialState = (): Partial<Property> & { unitsText?: string } => {
        const defaultState: Partial<Property> & { unitsText?: string } = {
            name: '',
            type: PropertyType.BUILDING,
            address: '',
            propertyCategory: PropertyCategoryKuwait.INVESTMENT_RESIDENTIAL,
            createdAt: new Date().toISOString(),
            units: [],
            unitsText: '', // For the text area
        };
        if (!initialData) return defaultState;

        return {
            ...defaultState,
            ...initialData,
            unitsText: initialData.units?.map(u => u.unitNumber).join('\n') || '',
        };
    };

    const [formData, setFormData] = useState(getInitialState());

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialState());
        }
    }, [isOpen, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.address || !formData.type) {
            alert("يرجى ملء الحقول الإلزامية: الاسم، العنوان، والنوع.");
            return;
        }

        const submittedData: Partial<Property> = { ...formData };
        const newPropertyId = submittedData.id || `prop-${Date.now()}`;

        // Process units from textarea if it's a building
        if (submittedData.type === PropertyType.BUILDING && formData.unitsText) {
            const unitNames = formData.unitsText.split('\n').map(u => u.trim()).filter(Boolean);
            submittedData.units = unitNames.map((name, index) => ({
                id: `u-${newPropertyId}-${index}`,
                propertyId: newPropertyId,
                unitNumber: name,
                status: PropertyUnitStatus.VACANT,
            }));
        } else {
            submittedData.units = [];
        }

        // Clean up temporary field
        delete (submittedData as any).unitsText;

        onSubmit(submittedData as Property);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData?.id ? "تعديل بيانات العقار" : "إضافة عقار جديد"} size="lg">
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto p-1">
                <Input name="name" label="اسم العقار (*)" value={formData.name || ''} onChange={handleChange} required />
                <Select name="type" label="نوع العقار (*)" value={formData.type} options={propertyTypeOptions} onChange={handleChange} required />
                <Input name="address" label="العنوان (*)" value={formData.address || ''} onChange={handleChange} required />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select name="propertyCategory" label="فئة العقار" value={formData.propertyCategory} options={propertyCategoryKuwaitOptions} onChange={handleChange} />
                    <Input name="ownerName" label="اسم المالك" value={formData.ownerName || ''} onChange={handleChange} />
                    <Input name="paciNumber" label="الرقم الآلي للعنوان (PACI)" value={formData.paciNumber || ''} onChange={handleChange} />
                </div>
                <TextArea name="description" label="وصف العقار" value={formData.description || ''} onChange={handleChange} rows={2}/>
                
                {formData.type === PropertyType.BUILDING && (
                    <TextArea name="unitsText" label="الوحدات التابعة للبناية (كل وحدة في سطر)" value={formData.unitsText || ''} onChange={handleChange} rows={5} placeholder="شقة 101&#10;شقة 102&#10;محل رقم 1"/>
                )}

                <TextArea name="generalNotes" label="ملاحظات عامة" value={formData.generalNotes || ''} onChange={handleChange} rows={3}/>

                <div className="flex justify-end space-x-3 space-x-reverse pt-2">
                    <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
                    <Button type="submit">{initialData?.id ? "حفظ التعديلات" : "إضافة العقار"}</Button>
                </div>
            </form>
        </Modal>
    );
}

export const PropertyManagementPage: React.FC = () => {
    // --- STATE MANAGEMENT ---
    const [properties, setProperties] = useState<Property[]>(mockProperties);
    const [tenants, setTenants] = useState<Tenant[]>(mockTenants);
    const [leaseAgreements, setLeaseAgreements] = useState<LeaseAgreement[]>(mockLeaseAgreements);
    const [rentPayments, setRentPayments] = useState<RentPayment[]>(mockRentPayments);
    const [evictionNotices, setEvictionNotices] = useState<EvictionNoticeRecord[]>(mockEvictionNotices);
    const [clearanceCertificates, setClearanceCertificates] = useState<ClearanceCertificateRecord[]>(mockClearanceCertificates);

    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal states for Add/Edit Property
    const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
    const [editingProperty, setEditingProperty] = useState<Partial<Property> | null>(null);

    // --- COMPUTED DATA & FILTERS ---
    const filteredProperties = useMemo(() => {
        return properties.filter(prop => 
            prop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            prop.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (prop.ownerName && prop.ownerName.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [properties, searchTerm]);

    const handleAddProperty = () => {
        setEditingProperty(null);
        setIsPropertyModalOpen(true);
    };

    const handleEditProperty = (property: Property) => {
        setEditingProperty(property);
        setIsPropertyModalOpen(true);
    };
    
    const handleDeleteProperty = useCallback((propertyId: string) => {
        if (window.confirm('هل أنت متأكد من حذف هذا العقار وجميع الوحدات التابعة له؟')) {
            setProperties(prev => prev.filter(p => p.id !== propertyId));
        }
    }, []);

    const handlePropertySubmit = (data: Property) => {
        if (editingProperty?.id) {
            setProperties(prev => prev.map(p => p.id === editingProperty.id ? {...p, ...data, updatedAt: new Date().toISOString()} : p));
        } else {
            setProperties(prev => [{ ...data, id: `prop-${Date.now()}`, createdAt: new Date().toISOString() }, ...prev]);
        }
        setIsPropertyModalOpen(false);
        setEditingProperty(null);
    };

    // --- RENDER FUNCTIONS ---

    const renderListView = () => (
        <>
            <Card>
                <div className="flex flex-col md:flex-row gap-4 items-center p-4 bg-gray-50 dark:bg-dm-card/50 rounded-lg">
                    <Input 
                        placeholder="ابحث بالاسم، العنوان، المالك..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        containerClassName="w-full mb-0"
                    />
                    <Button onClick={handleAddProperty} leftIcon={<PlusCircleIcon className="w-5"/>} className="w-full md:w-auto flex-shrink-0">إضافة عقار</Button>
                </div>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {filteredProperties.map(prop => {
                    const totalUnits = prop.units?.length || (prop.type !== PropertyType.LAND ? 1 : 0);
                    const rentedUnits = prop.type === PropertyType.BUILDING 
                        ? (prop.units?.filter(u => u.status === PropertyUnitStatus.RENTED).length || 0)
                        : (prop.status === PropertyUnitStatus.RENTED ? 1 : 0);
                    const occupancy = totalUnits > 0 ? (rentedUnits / totalUnits * 100).toFixed(0) + '%' : 'N/A';
                    return (
                        <Card key={prop.id} title={prop.name} className="hover:shadow-xl transition-shadow flex flex-col bg-neutral-card dark:bg-dm-card">
                            <div className="text-sm text-neutral-text-light dark:text-dm-text-light flex-grow mb-3">
                                <p><strong>النوع:</strong> {prop.type}</p>
                                <p><strong>العنوان:</strong> {prop.address}</p>
                                <p><strong>المالك:</strong> {prop.ownerName || '-'}</p>
                                {totalUnits > 0 && <p><strong>إجمالي الوحدات:</strong> {totalUnits}</p>}
                                {occupancy !== 'N/A' && <p><strong>نسبة الإشغال:</strong> {occupancy}</p>}
                            </div>
                            <div className="mt-auto border-t pt-3 flex justify-between items-center">
                                <Button onClick={() => setSelectedProperty(prop)}>عرض التفاصيل</Button>
                                <div className="space-x-1 space-x-reverse">
                                     <Button variant="ghost" size="sm" onClick={() => handleEditProperty(prop)} title="تعديل"><PencilIcon className="w-4 h-4 text-yellow-600" /></Button>
                                     <Button variant="ghost" size="sm" onClick={() => handleDeleteProperty(prop.id)} className="text-danger hover:text-red-700" title="حذف"><TrashIcon className="w-4 h-4" /></Button>
                                </div>
                            </div>
                        </Card>
                    );
                })}
                 {filteredProperties.length === 0 && (
                    <div className="col-span-full text-center py-10 text-gray-500">
                        <FolderIcon className="w-16 h-16 mx-auto text-gray-400 mb-2"/>
                        <p>لا توجد عقارات تطابق بحثك. حاول إضافة عقار جديد.</p>
                    </div>
                )}
            </div>
        </>
    );

    const renderDetailView = () => {
        if (!selectedProperty) return null;
        
        const propertyLeases = leaseAgreements.filter(l => l.propertyId === selectedProperty.id);
        const propertyLeaseIds = propertyLeases.map(l => l.id);
        const propertyPayments = rentPayments.filter(p => propertyLeaseIds.includes(p.leaseAgreementId));
        const propertyEvictions = evictionNotices.filter(e => e.propertyId === selectedProperty.id);
        const propertyClearances = clearanceCertificates.filter(c => c.propertyId === selectedProperty.id);
        const propertySettlements = getMockSettlementRecords().filter(s => s.propertyId === selectedProperty.id);
        const financialSummary = useMemo(() => {
            const expected = propertyLeases.reduce((sum, lease) => sum + (lease.rentAmount || 0), 0); // Simplified
            const collected = propertyPayments.reduce((sum, payment) => sum + (payment.amountPaid || 0), 0);
            return { expected, collected };
        }, [propertyLeases, propertyPayments]);


        return (
            <div className="space-y-4">
                <Button onClick={() => setSelectedProperty(null)} variant="outline" size="sm" leftIcon={<ArrowUturnLeftIcon className="w-4"/>}>العودة إلى قائمة العقارات</Button>

                <Card title={`ملف العقار: ${selectedProperty.name}`} actions={<Button size="sm" variant="outline" onClick={() => handleEditProperty(selectedProperty)}>تعديل بيانات العقار</Button>}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <p><strong>العنوان:</strong> {selectedProperty.address}</p>
                        <p><strong>المالك:</strong> {selectedProperty.ownerName || '-'}</p>
                        <p><strong>الرقم الآلي (PACI):</strong> {selectedProperty.paciNumber || '-'}</p>
                        <p><strong>النوع:</strong> {selectedProperty.type}</p>
                        <p><strong>الفئة:</strong> {selectedProperty.propertyCategory || '-'}</p>
                        <p><strong>الإيراد المتوقع (مبسط):</strong> {formatCurrency(financialSummary.expected)}</p>
                        <p><strong>الإيراد المحصل:</strong> {formatCurrency(financialSummary.collected)}</p>
                        <p className="col-span-full"><strong>ملاحظات عامة:</strong> {selectedProperty.generalNotes || 'لا يوجد'}</p>
                    </div>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Column 1 */}
                    <div className="space-y-4">
                        {selectedProperty.units && selectedProperty.units.length > 0 && (
                            <Card title="الوحدات التابعة" titleClassName="text-base" className="bg-gray-50 dark:bg-dm-card/50">
                                <ul className="space-y-2 text-xs max-h-60 overflow-y-auto scrollbar-thin">
                                {selectedProperty.units.map(unit => {
                                    const lease = leaseAgreements.find(l => l.unitId === unit.id && l.status === LeaseAgreementStatus.ACTIVE);
                                    const tenant = tenants.find(t => t.id === lease?.tenantId);
                                    return (
                                        <li key={unit.id} className="p-2 border dark:border-gray-700 rounded-md">
                                            <div className="flex justify-between items-center">
                                                <p><strong>وحدة:</strong> {unit.unitNumber}</p>
                                                <PropertyUnitStatusBadge status={unit.status}/>
                                            </div>
                                            {tenant && <p className="text-gray-500 dark:text-gray-400">المستأجر الحالي: {tenant.fullNameAr}</p>}
                                        </li>
                                    )
                                })}
                                </ul>
                            </Card>
                        )}
                        <Card title="سندات الإيجار (الدفعات المسجلة)" titleClassName="text-base" className="bg-gray-50 dark:bg-dm-card/50">
                            <ul className="space-y-1 text-xs max-h-60 overflow-y-auto scrollbar-thin">
                                {propertyPayments.length > 0 ? propertyPayments.slice(0, 10).map(p => (
                                    <li key={p.id} className="p-1.5 border-b dark:border-gray-700">
                                        {formatDate(p.paymentDate)}: <strong className="font-mono">{formatCurrency(p.amountPaid)}</strong> - {p.paymentForPeriod || 'دفعة إيجار'} (<RentPaymentStatusBadge status={p.status}/>)
                                    </li>
                                )) : <li className="text-gray-400">لا توجد دفعات مسجلة لهذا العقار.</li>}
                            </ul>
                        </Card>
                    </div>
                    {/* Column 2 */}
                    <div className="space-y-4">
                        <Card title="عقود الإيجار المرتبطة" titleClassName="text-base" className="bg-gray-50 dark:bg-dm-card/50">
                            <ul className="space-y-2 text-xs max-h-60 overflow-y-auto scrollbar-thin">
                                {propertyLeases.length > 0 ? propertyLeases.map(lease => {
                                    const tenant = tenants.find(t => t.id === lease.tenantId);
                                    return (
                                        <li key={lease.id} className="p-2 border dark:border-gray-700 rounded-md">
                                            <div className="flex justify-between items-center">
                                                <strong>{lease.contractNumber}</strong>
                                                <LeaseAgreementStatusBadge status={lease.status} />
                                            </div>
                                            <p className="text-gray-500 dark:text-gray-400"><strong>المستأجر:</strong> {tenant?.fullNameAr}</p>
                                            <p className="text-gray-500 dark:text-gray-400"><strong>المدة:</strong> من {formatDate(lease.startDate)} إلى {formatDate(lease.endDate)}</p>
                                            <p className="text-gray-500 dark:text-gray-400"><strong>الإيجار:</strong> {formatCurrency(lease.rentAmount)}/{lease.rentFrequency}</p>
                                        </li>
                                    )
                                }) : <li className="text-gray-400">لا توجد عقود إيجار مسجلة لهذا العقار.</li>}
                            </ul>
                        </Card>
                        <Card title="العمليات والتقارير" titleClassName="text-base" className="bg-gray-50 dark:bg-dm-card/50">
                            <div>
                                <h4 className="font-semibold text-xs mb-1">العمليات القانونية الأخرى</h4>
                                <ul className="list-disc ps-5 text-xs">
                                    <li>إشعارات الإخلاء: {propertyEvictions.length} | شهادات براءة الذمة: {propertyClearances.length}</li>
                                    <li>تسويات المديونية النشطة: {propertySettlements.filter(s=> s.status === SettlementStatus.ACTIVE).length}</li>
                                </ul>
                            </div>
                             <div className="mt-2 pt-2 border-t dark:border-gray-700">
                                <h4 className="font-semibold text-xs mb-1">روابط سريعة</h4>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                     <Link to="/property-management/maintenance" className="text-center text-xs p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors"><WrenchScrewdriverIcon className="w-4 h-4 mx-auto mb-1"/>سجل الصيانة</Link>
                                     <Link to="/property-management/debt-settlement" className="text-center text-xs p-2 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 rounded hover:bg-purple-200 dark:hover:bg-purple-900/60 transition-colors"><ReceiptPercentIcon className="w-4 h-4 mx-auto mb-1"/>تسوية المديونيات</Link>
                                     <Link to="/property-management/property-documents" className="text-center text-xs p-2 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-900/60 transition-colors"><FolderIcon className="w-4 h-4 mx-auto mb-1"/>مستندات العقار</Link>
                                     <Link to="/property-management/property-reports" className="text-center text-xs p-2 bg-yellow-100 dark:bg-yellow-800/40 text-yellow-800 dark:text-yellow-300 rounded hover:bg-yellow-200 dark:hover:bg-yellow-800/60 transition-colors"><PresentationChartLineIcon className="w-4 h-4 mx-auto mb-1"/>تقارير خاصة</Link>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <BuildingOffice2Icon className="w-8 h-8 text-primary dark:text-primary-light me-3" />
                    <h1 className="text-3xl font-bold text-primary-dark dark:text-primary-light">إدارة العقارات والإيجارات</h1>
                </div>
                {!selectedProperty && (
                    <Button onClick={handleAddProperty} leftIcon={<PlusCircleIcon className="w-5"/>}>إضافة عقار</Button>
                )}
            </div>
            
            {selectedProperty ? renderDetailView() : renderListView()}

            <PropertyFormModal 
                isOpen={isPropertyModalOpen} 
                onClose={() => setIsPropertyModalOpen(false)} 
                onSubmit={handlePropertySubmit}
                initialData={editingProperty}
            />
        </div>
    );
};