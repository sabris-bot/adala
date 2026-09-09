import { ContractTypeKuwait } from '../types';

export interface ExtendedEmployee {
    id: string;
    employeeId: string;
    fullNameAr: string;
    fullNameEn: string;
    gender: 'Male' | 'Female';
    socialStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed';
    bloodType: string;
    dateOfBirth: string;
    phone: string;
    email: string;
    address: string;
    
    // IDs, Nationality, Passport, Residency & Permits
    nationality: string;
    religion: string;
    civilId: string;
    civilIdExpiry: string;
    passportNumber: string;
    passportExpiry: string;
    residencyFileNumber?: string;
    residencyStatus?: string;
    residencyExpiry: string;
    workPermitNumber?: string;
    workPermitExpiry?: string;
    socialSecurityNumber?: string; // PIFSS for Kuwaitis
    drivingLicenseNumber?: string;
    drivingLicenseExpiry?: string;
    
    // Org & Career Structuring
    jobTitle: string;
    department: string;
    jobGrade: string;
    branch: string;
    managerName: string;
    workSystem: string;
    workHoursPerDay: number;
    joiningDate: string;
    hiringDate?: string;
    contractType: ContractTypeKuwait;
    contractStartDate?: string;
    contractEndDate?: string;
    contractDuration?: string;
    status: 'Active' | 'On Leave' | 'Suspended';
    
    // Monetary & Banking
    basicSalary: number;
    bankName: string;
    bankAccount: string;
    bankIban: string;
    allowances: Array<{ name: string; value: number }>;
    increments: Array<{ id: string; date: string; amount: number; type: string; notes: string }>;
    
    // Academic & Training
    degrees: Array<{ id: string; title: string; major: string; year: string; school: string }>;
    trainings: Array<{ id: string; title: string; provider: string; date: string; duration: string }>;
    
    // Multi-module elements or Linked tables
    leaveRequests: Array<{ id: string; type: string; startDate: string; endDate: string; days: number; reason: string; status: 'Pending' | 'Approved' | 'Rejected' }>;
    loans: Array<{ id: string; amount: number; balanceAmount: number; monthlyInstallment: number; startDate: string; status: 'Active' | 'Pending' | 'Completed' }>;
    evaluations: Array<{ id: string; period: string; score: number; feedback: string; date: string }>;
    investigations: Array<{ id: string; caseNumber: string; date: string; violations: string; details: string; status: 'Open' | 'Closed' }>;
    disciplinaryActions: Array<{ id: string; recordNumber: string; date: string; sanctionType: string; details: string; status: 'Approved' | 'Pending' }>;
    attachments: Array<{ id: string; title: string; category: string; expiryDate?: string; fileType: string; uploadDate?: string; fileSize?: string; notes?: string }>;
    historyTimeline: Array<{ id: string; date: string; titleAr: string; descriptionAr: string; category: string }>;
    annualLeaveEntitlement?: number;
    carriedOverBalance?: number;
    absenceDays?: number;
    emergencyContact?: {
        name: string;
        relationship: string;
        phone: string;
    };
    barCategory?: 'A' | 'B' | 'C' | 'D' | 'None'; // أ (كلي), ب (استئناف), ج (تمييز ودستورية), د (مستشار)، None (غير مقيد)
    barCardNumber?: string;
    barCardExpiry?: string;
    courtsLicensed?: string[];
    bylawsSigned?: boolean;
    bylawsSignedDate?: string;
    officeBylawsVersion?: string;
}

export const initialEmployees: ExtendedEmployee[] = [
    {
        id: 'emp-101',
        employeeId: 'K-101',
        fullNameAr: 'فاطمة علي حسين السيد',
        fullNameEn: 'Fatima Ali Husain Al-Sayed',
        gender: 'Female',
        socialStatus: 'Married',
        bloodType: 'O+',
        dateOfBirth: '1992-04-12',
        phone: '96598811223',
        email: 'f.alsayed@adala.com',
        address: 'الكويت، ضاحية عبد الله السالم، قطعة 2، شارع 21، منزل 5',
        nationality: 'كويتي',
        religion: 'الإسلام',
        civilId: '292021500123',
        civilIdExpiry: '2028-04-12',
        passportNumber: 'K0012345',
        passportExpiry: '2029-10-10',
        residencyExpiry: '2028-04-12',
        socialSecurityNumber: '556677889',
        jobTitle: 'Senior Legal Consultant',
        department: 'Consultation',
        jobGrade: 'A1',
        branch: 'المركز الرئيسي - برج الحمراء',
        managerName: 'أحمد محمود العبدالله',
        workSystem: 'دوام كامل رسمي',
        workHoursPerDay: 8,
        joiningDate: '2021-01-15',
        hiringDate: '2021-01-15',
        contractType: ContractTypeKuwait.UNLIMITED,
        contractStartDate: '2021-01-15',
        status: 'Active',
        basicSalary: 1850,
        bankName: 'بنك الكويت الوطني (NBK)',
        bankAccount: '101992283749',
        bankIban: 'KW89NBOK0000101992283749',
        emergencyContact: {
            name: 'علي حسين السيد',
            relationship: 'الأب',
            phone: '96599002233'
        },
        allowances: [
            { name: 'بدل تمثيل قضائي ومرافعة', value: 300 },
            { name: 'بدل هاتف وانتقال ميداني', value: 50 }
        ],
        increments: [
            { id: 'inc-1', date: '2025-01-01', amount: 150, type: 'ترقية أداء سنوي', notes: 'قرار إداري لتفوق المرافعة بقضايا التمييز بالمكتب' }
        ],
        degrees: [
            { id: 'deg-1', title: 'ليسانس الحقوق والشريعة', major: 'القانون الخاص المقارن', year: '2014', school: 'جامعة الكويت' }
        ],
        trainings: [
            { id: 'tr-1', title: 'صياغة مذكرات المحكمة الدستورية', provider: 'جمعية المحامين الكويتية', date: '2024-03-10', duration: '30 ساعة تخصصية' }
        ],
        leaveRequests: [
            { id: 'lv-1', type: 'إجازة سنوية اعتيادية', startDate: '2026-07-01', endDate: '2026-07-15', days: 15, reason: 'السفر السنوي والاستجمام العائلي', status: 'Pending' }
        ],
        loans: [
            { id: 'ln-1', amount: 3000, balanceAmount: 1800, monthlyInstallment: 200, startDate: '2025-05-01', status: 'Active' }
        ],
        evaluations: [
            { id: 'ev-1', period: 'الربع الأول 2026', score: 96, feedback: 'أداء قانوني استثنائي في كسب قضايا الشركاء والاستشارات الضريبية المتشعبة.', date: '2026-04-01' }
        ],
        investigations: [
            { id: 'inv-1', caseNumber: 'INV-2026-02', date: '2026-02-10', violations: 'تأخر غير مفعم في تسليم لائحة مرافعة الطعن 992', details: 'تم التحقق والمسامحة لظروف طارئة مع تعويض الزميلة للعمل المكتبي.', status: 'Closed' }
        ],
        disciplinaryActions: [],
        attachments: [
            { id: 'at-1', title: 'صورة البطاقة المدنية المعتمدة', category: 'البطاقة المدنية', expiryDate: '2028-04-12', fileType: 'pdf', uploadDate: '2021-01-20', fileSize: '1.4 MB' },
            { id: 'at-1b', title: 'صورة جواز السفر الدبلوماسي', category: 'جواز السفر', expiryDate: '2029-10-10', fileType: 'pdf', uploadDate: '2021-01-20', fileSize: '2.8 MB' },
            { id: 'at-1c', title: 'شهادة ليسانس الشريعة والقانون المعتمدة', category: 'شهادة المؤهل ودواعي التعيين', fileType: 'pdf', uploadDate: '2021-01-18', fileSize: '4.5 MB' },
            { id: 'at-1d', title: 'عقد العمل الموحد الأصلي', category: 'عقد العمل المعتمد', expiryDate: '2030-01-01', fileType: 'pdf', uploadDate: '2021-01-15', fileSize: '1.9 MB' }
        ],
        historyTimeline: [
            { id: 'ht-1', date: '2021-01-15', titleAr: 'مباشرة العمل والتثبيت', descriptionAr: 'انضمت للمكتب كمستشار قانوني أول بقسم الشركات.', category: 'Hiring' },
            { id: 'ht-audit-1', date: '2026-06-09', titleAr: 'تدقيق بيانات الجواز والمستندات', descriptionAr: 'تحديث تاريخ انتهاء جواز السفر بدقة من 2029-08-11 إلى 2029-10-10 تلافياً لأي تعارض مع المرفقات المصدقة والتحقق من جهة اتصال الطوارئ.', category: 'Request' }
        ],
        barCategory: 'C',
        barCardNumber: 'KBA-9921',
        barCardExpiry: '2027-12-31',
        courtsLicensed: ['المحكمة الكلية', 'محكمة الاستئناف', 'محكمة التمييز', 'المحكمة الدستورية'],
        bylawsSigned: true,
        bylawsSignedDate: '2026-01-15',
        officeBylawsVersion: 'v2.4-2026'
    },
    {
        id: 'emp-102',
        employeeId: 'E-102',
        fullNameAr: 'أحمد محمود مبارك',
        fullNameEn: 'Ahmed Mahmoud Mubarak',
        gender: 'Male',
        socialStatus: 'Married',
        bloodType: 'A+',
        dateOfBirth: '1988-05-12',
        phone: '96560099112',
        email: 'ahmed.m@adala.com',
        address: 'الكويت، السالمية، قطعة 4، شارع بغداد، جادة 3',
        nationality: 'مصري',
        religion: 'الإسلام',
        civilId: '288051200987',
        civilIdExpiry: '2026-05-15',
        passportNumber: 'E9988112',
        passportExpiry: '2028-10-15',
        residencyExpiry: '2026-05-15',
        jobTitle: 'Accountant',
        department: 'Finance',
        jobGrade: 'B2',
        branch: 'فرع العاصمة الرئيسي',
        managerName: 'أحمد محمود العبدالله',
        workSystem: 'دوام كامل مكتبي',
        workHoursPerDay: 8,
        joiningDate: '2020-03-01',
        hiringDate: '2020-03-01',
        contractType: ContractTypeKuwait.LIMITED,
        contractStartDate: '2020-03-01',
        contractEndDate: '2028-03-01',
        status: 'Active',
        basicSalary: 950,
        bankName: 'بيت التمويل الكويتي (KFH)',
        bankAccount: '202998811223',
        bankIban: 'KW71KUFN0000202998811223',
        emergencyContact: {
            name: 'محمود مبارك الألفي',
            relationship: 'شقيق (في مصر)',
            phone: '201012345678'
        },
        allowances: [
            { name: 'بدل سكن وانتقال عائلي', value: 150 },
            { name: 'بدل تدقيق حسابي دوري', value: 50 }
        ],
        increments: [],
        degrees: [
            { id: 'deg-2', title: 'بكالوريوس التجارة والمحاسبة', major: 'محاسبة مالية ومراجعة', year: '2010', school: 'جامعة عين شمس' }
        ],
        trainings: [],
        leaveRequests: [],
        loans: [],
        evaluations: [
            { id: 'ev-2', period: 'الربع الأول 2026', score: 88, feedback: 'مواظب ومنضبط جداً في الحسابات والتسوية القضائية اليومية للذمم المالية.', date: '2026-04-03' }
        ],
        investigations: [],
        disciplinaryActions: [],
        attachments: [
            { id: 'at-2a', title: 'البطاقة المدنية وتصريح الإقامة المعتمد', category: 'البطاقة المدنية', expiryDate: '2026-05-15', fileType: 'pdf', uploadDate: '2020-03-05', fileSize: '1.2 MB', notes: 'يرجى مراجعة الموظف فورا لتعبئة نماذج التجديد الحكومي حيث انتهت بطاقة إقامته المعتمدة.' },
            { id: 'at-2b', title: 'جواز السفر الدولي للعمالة المصرية', category: 'جواز السفر', expiryDate: '2028-10-15', fileType: 'pdf', uploadDate: '2020-03-05', fileSize: '2.5 MB' },
            { id: 'at-2c', title: 'عقد العمل المحدد المدة المصدق', category: 'عقد العمل المعتمد', expiryDate: '2028-03-01', fileType: 'pdf', uploadDate: '2020-03-01', fileSize: '2.1 MB' }
        ],
        historyTimeline: [
            { id: 'ht-3', date: '2020-03-01', titleAr: 'التعيين المباشر', descriptionAr: 'تم قبوله للعمل كمحاسب رئيسي لشؤون قضايا الموكلين.', category: 'Hiring' },
            { id: 'ht-audit-2', date: '2026-06-09', titleAr: 'مخالفة انتهاء الإقامة والإخطار', descriptionAr: 'تم رصد وتثبيت انتهاء بطاقة إقامة الموظف والالبطاقة المدنية بتاريخ 2026-05-15، وجرى تعميم إنذار لتحديث الملفات وتوثيق بيانات الطوارئ بالأرشيف.', category: 'Warning' }
        ],
        barCategory: 'None',
        barCardNumber: '',
        barCardExpiry: '',
        courtsLicensed: [],
        bylawsSigned: true,
        bylawsSignedDate: '2026-02-01',
        officeBylawsVersion: 'v2.4-2026'
    },
    {
        id: 'emp-103',
        employeeId: 'K-103',
        fullNameAr: 'بدر فهد المطيري',
        fullNameEn: 'Bader Fahad Al-Mutairi',
        gender: 'Male',
        socialStatus: 'Single',
        bloodType: 'B-',
        dateOfBirth: '1994-08-22',
        phone: '96555112233',
        email: 'bader@adala.com',
        address: 'الكويت، الفروانية، قطعة 5، شارع حبيب المناور، منزل 12',
        nationality: 'كويتي',
        religion: 'الإسلام',
        civilId: '294082200456',
        civilIdExpiry: '2026-06-25',
        passportNumber: 'K0099887',
        passportExpiry: '2030-05-10',
        residencyExpiry: '2026-06-25',
        socialSecurityNumber: '998866110',
        jobTitle: 'Legal Secretary',
        department: 'Litigation',
        jobGrade: 'C1',
        branch: 'برج الحمراء الرئيسي',
        managerName: 'أحمد محمود العبدالله',
        workSystem: 'دوام كامل مكتبي وميداني للمحاكم',
        workHoursPerDay: 8,
        joiningDate: '2023-05-10',
        hiringDate: '2023-05-10',
        contractType: ContractTypeKuwait.UNLIMITED,
        status: 'On Leave',
        basicSalary: 1100,
        bankName: 'بنك الخليج (Gulf Bank)',
        bankAccount: '404112233445',
        bankIban: 'KW22GULF0000404112233445',
        emergencyContact: {
            name: 'فهد المطيري',
            relationship: 'الأب',
            phone: '96555112244'
        },
        allowances: [
            { name: 'بدل مواصلات مندوب محكمة', value: 100 }
        ],
        increments: [],
        degrees: [
            { id: 'deg-3', title: 'دبلوم الدراسات القانونية التطبيقية', major: 'العلوم الإدارية والقانون العمالي', year: '2016', school: 'الهيئة العامة للتعليم التطبيقي والتدريب' }
        ],
        trainings: [],
        leaveRequests: [
            { id: 'lv-2', type: 'إجازة مرضية طارئة', startDate: '2026-05-25', endDate: '2026-05-30', days: 5, reason: 'عارض صحي معتمد بمستندات الشؤون الطبية', status: 'Approved' }
        ],
        loans: [],
        evaluations: [
            { id: 'ev-3', period: 'الربع الأول 2026', score: 82, feedback: 'مندوب ومتابع قضايا متميز، لكن يحتاج لرفع وتنسيق الالتزام بالمواعيد الصباحية للأرشفة.', date: '2026-04-10' }
        ],
        investigations: [],
        disciplinaryActions: [],
        attachments: [
            { id: 'at-3a', title: 'صورة البطاقة المدنية الوطنية', category: 'البطاقة المدنية', expiryDate: '2026-06-25', fileType: 'pdf', uploadDate: '2023-05-15', fileSize: '1.5 MB', notes: 'البطاقة منتهية قريباً، يرجى التنسيق لإجراء البصمة البيومترية والمطابقة قبل تاريخ ٢٥ يونيو لعدم إيقاف المعاش.' },
            { id: 'at-3b', title: 'رخصة القيادة الكويتية المعتمدة', category: 'الرخصة القيادية وتراخيص المركبة', expiryDate: '2029-11-15', fileType: 'pdf', uploadDate: '2023-05-15', fileSize: '0.9 MB' }
        ],
        historyTimeline: [
            { id: 'ht-4', date: '2023-05-10', titleAr: 'باقة المباشرة', descriptionAr: 'انضم كمتابع للمحاكم ولشؤون الإعلانات والتقاضي.', category: 'Hiring' },
            { id: 'ht-audit-3', date: '2026-06-09', titleAr: 'متابعة البصمة البيومترية والتجديد', descriptionAr: 'التنبيه على الموظف بضرورة حجز موعد للبصمة البيومترية وتجديد البطاقة المدنية قبل انتهاء المهلة لعدم تجميد الحساب وصك التأمينات، وتدوين جهة الاتصال الطارئة.', category: 'Warning' }
        ],
        barCategory: 'A',
        barCardNumber: 'KBA-10452',
        barCardExpiry: '2026-12-31',
        courtsLicensed: ['المحكمة الكلية'],
        bylawsSigned: false,
        officeBylawsVersion: 'v2.4-2026'
    }
];
