
import { 
    Property, Tenant, LeaseAgreement, RentPayment,
    PropertyType, PropertyUnitStatus, LeaseAgreementStatus, RentPaymentFrequency, RentPaymentStatus,
    PropertyCategoryKuwait, PropertyUnitTypeKuwait, LeaseTermType, PaymentMethod,
    EvictionNoticeRecord, MaintenanceRequest, PropertyDocument,
    MaintenanceCategory, MaintenancePriority, MaintenanceStatus, PropertyDocumentType
} from '../types';

export const mockTenants: Tenant[] = [
    { 
        id: 't1', 
        fullNameAr: 'أحمد عبدالله محمد', 
        civilIdOrPassport: '280010112345', 
        nationality: 'كويتي', 
        phone: '98765432', 
        email: 'ahmed@example.com', 
        createdAt: '2023-01-01', 
        updatedAt: '2023-01-01', 
        occupation: 'موظف حكومي', 
        status: 'Current',
        emergencyContact: { name: 'محمد عبدالله', phone: '99887766', relation: 'أخ' },
        previousLandlord: { name: 'مكتب السالم العقاري', phone: '22441234', rentalPeriod: '2019-2022', notes: 'ملتزم بالسداد، لا توجد مشاكل.' }
    },
    { 
        id: 't2', 
        fullNameAr: 'شركة الأمل للتجارة والمقاولات', 
        civilIdOrPassport: '100200300', 
        nationality: 'كويتية (شركة)', 
        phone: '22445566', 
        email: 'info@alamal.com', 
        createdAt: '2022-11-15', 
        updatedAt: '2022-11-15', 
        occupation: 'شركة تجارية',
        status: 'Current',
        emergencyContact: { name: 'مدير العلاقات العامة', phone: '66554433', relation: 'موظف' }
    },
    { 
        id: 't3', 
        fullNameAr: 'سالم مبارك العازمي', 
        civilIdOrPassport: '290050512345', 
        nationality: 'كويتي', 
        phone: '55667788', 
        email: 'salem@example.com', 
        createdAt: '2023-05-10', 
        updatedAt: '2023-05-10', 
        occupation: 'قطاع خاص',
        status: 'Current',
        previousLandlord: { name: 'بوحمد العقارية', phone: '22223333', rentalPeriod: '2020-2023', notes: 'كان يتأخر أحياناً في السداد.' }
    },
    { 
        id: 't4', 
        fullNameAr: 'محمد السيد علي', 
        civilIdOrPassport: '285102033445', 
        nationality: 'مصري', 
        phone: '66998877', 
        email: 'm.ali@example.com', 
        createdAt: '2023-06-01', 
        updatedAt: '2023-06-01', 
        occupation: 'مهندس',
        status: 'Current',
        emergencyContact: { name: 'زوجته', phone: '50505050', relation: 'زوجة' }
    },
    { 
        id: 't5', 
        fullNameAr: 'شركة كويت فودز للحلويات', 
        civilIdOrPassport: '444555666', 
        nationality: 'كويتية', 
        phone: '24488888', 
        email: 'legal@kfoods.com', 
        createdAt: '2024-01-10', 
        updatedAt: '2024-01-10', 
        occupation: 'شركة صناعية غذائية',
        status: 'Current'
    },
    { 
        id: 't6', 
        fullNameAr: 'فاطمة خالد الرشيدي', 
        civilIdOrPassport: '295010144556', 
        nationality: 'كويتية', 
        phone: '90001111', 
        email: 'fatma.k@example.com', 
        createdAt: '2024-02-15', 
        updatedAt: '2024-02-15', 
        occupation: 'محامية',
        status: 'Current'
    },
];

export const mockProperties: Property[] = [
    {
        id: 'prop1', 
        name: 'برج ناصر السكني الفاخر', 
        type: PropertyType.BUILDING, 
        address: 'السالمية، شارع الخليج العربي، قطعة 2', 
        propertyCategory: PropertyCategoryKuwait.INVESTMENT_RESIDENTIAL,
        ownerName: 'الشيخ ناصر المحمد الصباح',
        paciNumber: '99887766',
        description: 'برج سكني فاخر يطل على الخليج العربي، يتميز بتشطيبات عالية الجودة ونظام حماية متطور وفريق صيانة على مدار الساعة.',
        imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800',
        units: [
            { id: 'u1a', propertyId: 'prop1', unitNumber: '101', floor: '1', status: PropertyUnitStatus.RENTED, unitType: PropertyUnitTypeKuwait.APARTMENT, bedrooms: 3, bathrooms: 4, rentAmount: 850 },
            { id: 'u1b', propertyId: 'prop1', unitNumber: '102', floor: '1', status: PropertyUnitStatus.VACANT, unitType: PropertyUnitTypeKuwait.APARTMENT, bedrooms: 2, bathrooms: 2, rentAmount: 650 },
            { id: 'u1c', propertyId: 'prop1', unitNumber: '201', floor: '2', status: PropertyUnitStatus.RENTED, unitType: PropertyUnitTypeKuwait.APARTMENT, bedrooms: 4, bathrooms: 5, rentAmount: 1200 },
            { id: 'u1d', propertyId: 'prop1', unitNumber: '202', floor: '2', status: PropertyUnitStatus.UNDER_MAINTENANCE, unitType: PropertyUnitTypeKuwait.APARTMENT, bedrooms: 2, bathrooms: 2, rentAmount: 600 },
        ],
        createdAt: '2022-01-01'
    },
    {
        id: 'prop2', 
        name: 'قصر السعادة الملكي', 
        type: PropertyType.VILLA, 
        address: 'السرة، قطعة 4، شارع 101، قسيمة 5', 
        propertyCategory: PropertyCategoryKuwait.PRIVATE_RESIDENTIAL,
        ownerName: 'عائلة الروضان الكرام',
        description: 'فيلا فاخرة بتصميم معماري حديث، تحتوي على مسبح خاص وحديقة واسعة ونظام تحكم ذكي.',
        imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=800',
        units: [
            { id: 'u2a', propertyId: 'prop2', unitNumber: 'الفيلا بالكامل', floor: '0', status: PropertyUnitStatus.RENTED, unitType: PropertyUnitTypeKuwait.VILLA, rentAmount: 2500 }
        ], 
        createdAt: '2022-03-10'
    },
    {
        id: 'prop3', 
        name: 'مجمع ميريديان التجاري', 
        type: PropertyType.BUILDING, 
        address: 'العاصمة، منطقة الشويخ الصناعية، شارع بيبسي', 
        propertyCategory: PropertyCategoryKuwait.COMMERCIAL,
        ownerName: 'شركة العقارات المتحدة',
        imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
        units: [
             { id: 'u3a', propertyId: 'prop3', unitNumber: 'Showroom A1', floor: 'أرضي', status: PropertyUnitStatus.RENTED, unitType: PropertyUnitTypeKuwait.SHOP, rentAmount: 3200 },
             { id: 'u3b', propertyId: 'prop3', unitNumber: 'Showroom B2', floor: 'أرضي', status: PropertyUnitStatus.VACANT, unitType: PropertyUnitTypeKuwait.SHOP, rentAmount: 2800 },
             { id: 'u3c', propertyId: 'prop3', unitNumber: 'Office 1001', floor: '10', status: PropertyUnitStatus.RENTED, unitType: PropertyUnitTypeKuwait.OFFICE, rentAmount: 1100 },
        ],
        createdAt: '2021-06-15'
    },
    {
        id: 'prop4', 
        name: 'عمارة اللؤلؤة الاستثمارية', 
        type: PropertyType.BUILDING, 
        address: 'حولي، قطعة 10، شارع بن خلدون', 
        propertyCategory: PropertyCategoryKuwait.INVESTMENT_RESIDENTIAL,
        ownerName: 'فهد الوقيان',
        imageUrl: 'https://images.unsplash.com/photo-1460317442991-0ec239fe326a?auto=format&fit=crop&q=80&w=800',
        units: [
            { id: 'u4a', propertyId: 'prop4', unitNumber: 'A11', floor: '3', status: PropertyUnitStatus.RENTED, unitType: PropertyUnitTypeKuwait.APARTMENT, bedrooms: 1, bathrooms: 1, rentAmount: 380 },
            { id: 'u4b', propertyId: 'prop4', unitNumber: 'A12', floor: '3', status: PropertyUnitStatus.RENTED, unitType: PropertyUnitTypeKuwait.APARTMENT, bedrooms: 1, bathrooms: 1, rentAmount: 380 },
        ],
        createdAt: '2023-10-01'
    }
];

export const mockLeaseAgreements: LeaseAgreement[] = [
    {
        id: 'lse1', contractNumber: 'LSE-2023-001', propertyId: 'prop1', unitId: 'u1a', tenantId: 't1',
        startDate: '2023-05-01', endDate: '2024-05-01', rentAmount: 450, rentFrequency: RentPaymentFrequency.MONTHLY,
        status: LeaseAgreementStatus.EXPIRED, leaseTermType: LeaseTermType.RENEWABLE,
        createdAt: '2023-04-01'
    },
    {
        id: 'lse2', contractNumber: 'LSE-2023-005', propertyId: 'prop3', unitId: 'u3a', tenantId: 't2',
        startDate: '2023-06-01', endDate: '2024-05-31', rentAmount: 1200, rentFrequency: RentPaymentFrequency.MONTHLY,
        status: LeaseAgreementStatus.ACTIVE, leaseTermType: LeaseTermType.FIXED,
        createdAt: '2023-05-20'
    },
    {
        id: 'lse3', contractNumber: 'LSE-2023-010', propertyId: 'prop1', unitId: 'u1c', tenantId: 't4',
        startDate: '2023-07-01', endDate: '2024-08-30', rentAmount: 500, rentFrequency: RentPaymentFrequency.MONTHLY,
        status: LeaseAgreementStatus.ACTIVE, leaseTermType: LeaseTermType.RENEWABLE,
        createdAt: '2023-06-25'
    },
    {
        id: 'lse4', contractNumber: 'LSE-2024-002', propertyId: 'prop2', unitId: 'u2a', tenantId: 't3',
        startDate: '2024-01-01', endDate: '2024-12-31', rentAmount: 1500, rentFrequency: RentPaymentFrequency.MONTHLY,
        status: LeaseAgreementStatus.ACTIVE, leaseTermType: LeaseTermType.RENEWABLE,
        createdAt: '2023-12-15'
    },
    {
        id: 'lse5', contractNumber: 'LSE-2024-115', propertyId: 'prop4', unitId: 'u4a', tenantId: 't6',
        startDate: '2024-03-01', endDate: '2025-02-28', rentAmount: 350, rentFrequency: RentPaymentFrequency.MONTHLY,
        status: LeaseAgreementStatus.ACTIVE, leaseTermType: LeaseTermType.RENEWABLE,
        createdAt: '2024-02-20'
    }
];

export const mockRentPayments: RentPayment[] = [
    {
        id: 'pay1', leaseAgreementId: 'lse1', paymentDate: '2024-04-01', dueDate: '2024-04-01', amountDue: 450, amountPaid: 450,
        status: RentPaymentStatus.PAID, paymentMethod: PaymentMethod.KNET, paymentForPeriod: 'أبريل 2024', recordedAt: '2024-04-01'
    },
    {
        id: 'pay2', leaseAgreementId: 'lse3', paymentDate: '', dueDate: '2024-07-01', amountDue: 500, amountPaid: 0,
        status: RentPaymentStatus.OVERDUE, paymentForPeriod: 'يوليو 2024', recordedAt: '2024-07-01'
    },
    {
        id: 'pay3', leaseAgreementId: 'lse2', paymentDate: '2024-05-05', dueDate: '2024-05-01', amountDue: 1200, amountPaid: 1200,
        status: RentPaymentStatus.PAID, paymentMethod: PaymentMethod.CASH, paymentForPeriod: 'مايو 2024', recordedAt: '2024-05-05'
    },
    {
        id: 'pay4', leaseAgreementId: 'lse4', paymentDate: '2024-05-02', dueDate: '2024-05-01', amountDue: 1500, amountPaid: 1500,
        status: RentPaymentStatus.PAID, paymentMethod: PaymentMethod.KNET, paymentForPeriod: 'مايو 2024', recordedAt: '2024-05-02'
    },
    {
        id: 'pay5', leaseAgreementId: 'lse3', paymentDate: '2024-05-10', dueDate: '2024-05-01', amountDue: 500, amountPaid: 200,
        status: RentPaymentStatus.PARTIALLY_PAID, paymentMethod: PaymentMethod.BANK_TRANSFER, paymentForPeriod: 'مايو 2024', recordedAt: '2024-05-10',
        notes: 'دفع جزء من الإيجار وسيتم السداد لاحقاً.'
    }
];

export const mockEvictionNotices: EvictionNoticeRecord[] = [
    {
        id: 'not-001',
        leaseAgreementId: 'lse3',
        propertyId: 'prop1',
        unitId: 'u1c',
        tenantId: 't4',
        noticeDate: '2024-05-10',
        reason: 'تأخر في سداد الأجرة الإيجارية ومخالفة بنود العقد.',
        status: 'Sent',
        notes: 'تم إرسال الإنذار عبر مندوب الإعلان.'
    },
    {
        id: 'not-002',
        leaseAgreementId: 'lse1',
        propertyId: 'prop1',
        unitId: 'u1a',
        tenantId: 't1',
        noticeDate: '2024-05-15',
        reason: 'انتهاء مدة العقد والامتناع عن التسليم.',
        status: 'Delivered',
        notes: 'تم تسليم الإخطار رسمياً باليد.'
    },
    {
        id: 'not-003',
        leaseAgreementId: 'lse2',
        propertyId: 'prop3',
        unitId: 'u3a',
        tenantId: 't2',
        noticeDate: '2024-04-01',
        reason: 'إزعاج الجيران ومخالفة قوانين البلدية في الاستخدام التجاري.',
        status: 'LegalActionInProgress',
        notes: 'تم البدء في إجراءات دعوى الإخلاء القانوني.'
    }
];

export const mockMaintenanceRequests: MaintenanceRequest[] = [
    {
        id: 'mreq1',
        propertyId: 'prop1',
        propertyName: 'بناية النخيل السكنية',
        unitId: 'u1a',
        propertyUnitName: 'شقة 1',
        reportedBy: 'أحمد عبدالله (المستأجر)',
        reporterContact: '98765432',
        requestDate: '2024-04-15',
        description: 'تسريب مياه من صنبور المطبخ.',
        category: MaintenanceCategory.PLUMBING,
        priority: MaintenancePriority.URGENT,
        status: MaintenanceStatus.ASSIGNED_TO_VENDOR,
        assignedToVendorName: 'شركة الصيانة السريعة',
        scheduledDate: '2024-04-16',
        estimatedCost: 25,
        createdAt: '2024-04-15',
    },
    {
        id: 'mreq2',
        propertyId: 'prop3',
        propertyName: 'مجمع النور التجاري',
        unitId: 'u3c',
        propertyUnitName: 'مكتب 101',
        reportedBy: 'شركة الأمل (المستأجر)',
        requestDate: '2024-04-20',
        description: 'صيانة دورية لجهاز التكييف.',
        category: MaintenanceCategory.HVAC,
        priority: MaintenancePriority.MEDIUM,
        status: MaintenanceStatus.COMPLETED_CLOSED,
        assignedToVendorName: 'فني التكييف المعتمد',
        scheduledDate: '2024-04-22',
        completionDate: '2024-04-23',
        cost: 40,
        estimatedCost: 35,
        createdAt: '2024-04-20',
    },
     {
        id: 'mreq3',
        propertyId: 'prop2',
        propertyName: 'فيلا السعادة - السرة',
        reportedBy: 'حارس الفيلا',
        requestDate: '2024-05-01',
        description: 'إصلاح باب الكراج الرئيسي.',
        category: MaintenanceCategory.STRUCTURAL,
        priority: MaintenancePriority.LOW,
        status: MaintenanceStatus.PENDING_APPROVAL,
        createdAt: '2024-05-01',
    }
];

export const mockPropertyDocuments: PropertyDocument[] = [
    {
        id: 'doc1',
        propertyId: 'prop1',
        documentName: 'وثيقة ملكية بناية النخيل',
        documentType: PropertyDocumentType.DEED,
        issueDate: '2010-05-15',
        referenceNumber: 'REG-DEED-2010-12345',
        filePathOrLink: '/docs/prop1/deed.pdf',
        description: 'وثيقة الملكية الأصلية لبناية النخيل السكنية.',
        uploadedBy: 'المسؤول الإداري',
        uploadedAt: '2022-01-20',
        tags: ['ملكية', 'بناية النخيل'],
        relatedCaseIds: ['3'], // Link to "استئناف حكم إخلاء عقار"
    },
    {
        id: 'doc2',
        propertyId: 'prop3',
        documentName: 'وثيقة تأمين مجمع النور',
        documentType: PropertyDocumentType.INSURANCE_POLICY,
        issueDate: '2024-03-01',
        expiryDate: '2025-02-28',
        referenceNumber: 'INS/PROP/NOOR/2024/001',
        filePathOrLink: '/docs/prop3/insurance.pdf',
        description: 'وثيقة تأمين شامل على مجمع النور التجاري.',
        uploadedBy: 'مسؤول التأمين',
        uploadedAt: '2024-03-05',
        tags: ['تأمين', 'مجمع النور'],
        relatedCaseIds: ['1'], // Link to "مطالبة بتعويضات عن إخلال تعاقدي"
    }
];
