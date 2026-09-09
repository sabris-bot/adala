import { ContractTypeKuwait } from '../types';

// ==========================================
// 1. COMPREHENSIVE TYPE DEFINITION
// ==========================================
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
    basicSalary: number;
    bankName: string;
    bankAccount: string;
    bankIban: string;
    allowances: Array<{ name: string; value: number }>;
    increments: Array<{ id: string; date: string; amount: number; type: string; notes: string }>;
    degrees: Array<{ id: string; title: string; major: string; year: string; school: string }>;
    trainings: Array<{ id: string; title: string; provider: string; date: string; duration: string }>;
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
    barCategory?: 'A' | 'B' | 'C' | 'D' | 'None';
    barCardNumber?: string;
    barCardExpiry?: string;
    courtsLicensed?: string[];
    bylawsSigned?: boolean;
    bylawsSignedDate?: string;
    officeBylawsVersion?: string;
}

// ==========================================
// 2. STATIC HIGH-QUALITY INITIAL DATA SEED
// ==========================================
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
        officeBylawsVersion: 'v2.4-2026',
        annualLeaveEntitlement: 30,
        carriedOverBalance: 5,
        absenceDays: 2
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
            { id: 'at-2a', title: 'البطاقة المدنية وتصريح الإقامة المعتمد', category: 'البطاقة المدنية', expiryDate: '2026-05-15', fileType: 'pdf', uploadDate: '2020-03-05', fileSize: '1.2 MB', notes: 'البطاقة منتهية قريباً، يرجى التنسيق للتجديد.' },
            { id: 'at-2b', title: 'جواز السفر الدولي للعمالة المصرية', category: 'جواز السفر', expiryDate: '2028-10-15', fileType: 'pdf', uploadDate: '2020-03-05', fileSize: '2.5 MB' },
            { id: 'at-2c', title: 'عقد العمل المحدد المدة المصدق', category: 'عقد العمل المعتمد', expiryDate: '2028-03-01', fileType: 'pdf', uploadDate: '2020-03-01', fileSize: '2.1 MB' }
        ],
        historyTimeline: [
            { id: 'ht-3', date: '2020-03-01', titleAr: 'التعيين المباشر', descriptionAr: 'تم قبوله للعمل كمحاسب رئيسي لشؤون قضايا الموكلين.', category: 'Hiring' },
            { id: 'ht-audit-2', date: '2026-06-09', titleAr: 'مخالفة انتهاء الإقامة والإخطار', descriptionAr: 'تم رصد وتثبيت انتهاء بطاقة إقامة الموظف والبطاقة المدنية بتاريخ 2026-05-15، وجرى تعميم إنذار لتحديث الملفات.', category: 'Warning' }
        ],
        barCategory: 'None',
        barCardNumber: '',
        barCardExpiry: '',
        courtsLicensed: [],
        bylawsSigned: true,
        bylawsSignedDate: '2026-02-01',
        officeBylawsVersion: 'v2.4-2026',
        annualLeaveEntitlement: 30,
        carriedOverBalance: 0,
        absenceDays: 4
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
            { id: 'ev-3', period: 'الربع الأول 2026', score: 82, feedback: 'مندوب ومتابع قضايا متميز.', date: '2026-04-10' }
        ],
        investigations: [],
        disciplinaryActions: [],
        attachments: [
            { id: 'at-3a', title: 'صورة البطاقة المدنية الوطنية', category: 'البطاقة المدنية', expiryDate: '2026-06-25', fileType: 'pdf', uploadDate: '2023-05-15', fileSize: '1.5 MB', notes: 'البطاقة منتهية قريباً، يرجى التجديد.' },
            { id: 'at-3b', title: 'رخصة القيادة الكويتية المعتمدة', category: 'الرخصة القيادية وتراخيص المركبة', expiryDate: '2029-11-15', fileType: 'pdf', uploadDate: '2023-05-15', fileSize: '0.9 MB' }
        ],
        historyTimeline: [
            { id: 'ht-4', date: '2023-05-10', titleAr: 'باقة المباشرة', descriptionAr: 'انضم كمتابع للمحاكم ولشؤون الإعلانات والتقاضي.', category: 'Hiring' },
            { id: 'ht-audit-3', date: '2026-06-09', titleAr: 'متابعة البصمة البيومترية والتجديد', descriptionAr: 'التنبيه على الموظف بضرورة تجديد البطاقة المدنية قبل انتهاء المهلة.', category: 'Warning' }
        ],
        barCategory: 'A',
        barCardNumber: 'KBA-10452',
        barCardExpiry: '2026-12-31',
        courtsLicensed: ['المحكمة الكلية'],
        bylawsSigned: false,
        officeBylawsVersion: 'v2.4-2026',
        annualLeaveEntitlement: 30,
        carriedOverBalance: 10,
        absenceDays: 5
    }
];

// ==========================================
// 3. 11 OFFICIAL ARABIC CORRESPONDENCE TEMPLATES DECK
// ==========================================
export const OFFICIAL_FORM_TEMPLATES = [
    {
        id: 'labor_contract',
        name: '1. عقد العمل الموحد بالقطاع الأهلي (وزارة الشؤون)',
        text: (e: ExtendedEmployee) => `عقد عمل أهلي قياسي بدولة الكويت (مادة 6/2010):

أولاً: الطرف الأول (صاحب العمل): مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية، ومقره الرئيسي دولة الكويت.
ثانياً: الطرف الثاني (الموظف): السيد/ ${e.fullNameAr}، الجنسية: ${e.nationality}، الرقم المدني: ${e.civilId}، المقيم في دولة الكويت.

بالنظر لامتلاك الطرف الثاني للمهارات القانونية والمهنية المقررة للوظيفة، تم الاتفاق على ما يلي:
البند الأول: يعين الطرف الثاني بوظيفة (${e.jobTitle}) بقسم (${e.department}) بإجمالي راتب أساسي قدره (${e.basicSalary}) دينار كويتي، بالإضافة للبدلات المتوافق عليها عمالياً وقيمتها (${e.allowances?.reduce((sum, item) => sum + item.value, 0) || 0} د.ك).
البند الثاني: يخضع هذا العقد بالكامل لأحكام قانون العمل الكويتي بالقطاع الأهلي رقم 6 لسنة 2010 وتعديلاته والقرارات الإدارية المنفذة له لدى الهيئة العامة للقوى العاملة.
البند الثالث: يلتزم الطرف الثاني بالمحافظة على صون كتمان أسرار العملاء، ومباشرة مهام وظيفته بكل أمانة وإخلاص ودقة.`
    },
    {
        id: 'resume_work',
        name: '2. إشعار وثيقة مباشرة وبدء عمل رسمي',
        text: (e: ExtendedEmployee) => `إشعار وثيقة مباشرة عمل رسمي (إشعار رسمي):

تاريخ الإصدار: ${new Date().toLocaleDateString('ar-KW')}
إلى إدارة شؤون الكوادر ومراقبة القوى العاملة بمكتب المحامي صبري شطا للمحاماة والاستشارات القانونية:

نفيدكم علماً بأن الموظف المذكور أدناه:
الاسـم الكامل: ${e.fullNameAr}
الرقم الوظيفي: ${e.employeeId} - المسمى الفني: ${e.jobTitle}
قد باشر مهام عمله بالمنشأة رسمياً وقام بالدخول في جدول الحضور والانصراف اعتباراً من تاريخ اليوم ${new Date().toLocaleDateString('ar-KW')}، وحرصاً على تفعيل الأثر الإداري والمالي لملفه وصرف كامل المخصصات المقررة عمالياً.`
    },
    {
        id: 'amend_contract',
        name: '3. ملحق تعديل وتحديث عقد العمل والأجر',
        text: (e: ExtendedEmployee) => `ملحق تعديل فني لعقد العمل الفردي المبرم:

أطراف السند:
- الطرف الأول: مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية.
- الطرف الثاني: السيد/ ${e.fullNameAr}، الرقم المدني: ${e.civilId}.

تم التوافق الإداري والقانوني بين الطرفين المبرمين على تعديل بنود الأجر والبدلات عمالياً وفق الالتزام المالي والتنظيمي المعمول به بالمكتب:
أولاً: يُعدل الراتب الأساسي الشهري للطرف الثاني ليصبح (${e.basicSalary}) دينار كويتي.
ثانياً: تضاف البدلات المقررة رسمياً وهي: بدل تمثيل وتكليف وتدريب وقدرها (${e.allowances?.reduce((sum, item) => sum + item.value, 0) || 150} د.ك)، لتدرج في حساب الرواتب المعتمد.
ثالثاً: تبقى وتظل كافة البنود التعاقدية واللوائح الداخلية الأخرى بمكتب المحامي صبري شطا للمحاماة والاستشارات القانونية سارية بالكامل دون أي مساس بها.`
    },
    {
        id: 'renew_contract',
        name: '4. قرار تجديد عقد العمل تلقائياً',
        text: (e: ExtendedEmployee) => `قرار إداري رقم (${Math.floor(Math.random() * 900) + 100}/2026) بتجديد عقد عمل أهلي:

الموضوع: تجديد عقد الموظف السيد/ ${e.fullNameAr}
الرقم الوظيفي: ${e.employeeId} | الرقم المدني الكويتي: ${e.civilId}

بناءً على التقرير السنوي الإيجابي ومصلحة العمل اللائحية بمكتب المحامي صبري شطا للمحاماة والاستشارات القانونية، تقرر:
1- تجديد عقد العمل الفردي المبرم مع الموظف المذكور أعلاه لمدة سنة ميلادية أخرى تبدأ من منقضى مدة الخدمة القديمة وتخضع للائحة الجزاءات والامتيازات القانونية.
2- تلتزم الإدارة المالية في "عدالة" بدفع وصرف الرواتب المقررة وإعلام التأمينات الاجتماعية بالاستمرارية بدولة الكويت.`
    },
    {
        id: 'asset_receipt',
        name: '5. إقرار وبراءة تسلم عهدة وممتلكات للمكتب',
        text: (e: ExtendedEmployee) => `صحيفة إقرار وحيازة عهدة إدارية وتقنية:

أقر أنا الموقع أدناه السيد/ ${e.fullNameAr} الموظف بقسم (${e.department}) بمكتب المحامي صبري شطا للمحاماة والاستشارات القانونية، بأنني قد استلمت وحزت من إدارة تقنية المعلومات والتجهيزات العهدة الموصوفة بالتالي:
1- جهاز حاسوب لوحي متنقل وقواعد تشغيل مبرمجة للنظام الرسمي لبرنامج "عدالة".
2- بطاقة دخول ذكية وبوابة البصمة للتحقق وعضوية بوابة برج المكتب بدولة الكويت.
3- ملفات وسجلات رسمية خاصة بقضايا الموكلين التابعة لإدارتنا.

وألتزم شخصياً وقانونياً بالمحافظة التامة على هذه المستندات والعهد من التلف أو الفقد، وفي حالة انتهاء عملي يلتزم ملفي القانوني بإرجاعها براءة ذمة مطلقة.`
    },
    {
        id: 'salary_receipt',
        name: '6. إقرار وبراءة ذمة باستلام كافة الأجور والرواتب',
        text: (e: ExtendedEmployee) => `مستند إخلاء وبراءة ذمة عمالية دورية:

أقر أنا الموظف/ ${e.fullNameAr}، الحامل للرقم المدني (${e.civilId}) والرقم الوظيفي (${e.employeeId})، بأنني قد استلمت من مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية كافة مستحقاتي العمالية عن رواتب شهرية، بدلات مرافعة، ومخصصات مالية دورية بالتحويل المصرفي المعتمد لغاية يوم التوقيع أدناه.
وأشهد بموجب هذا السند براءة ذمة المنشأة براءة مطلقة وشاملة مانعة من أي رجوع قانوني أو دعوى قضائية عمالية مستقبلية.`
    },
    {
        id: 'data_update',
        name: '7. استمارة تحديث البيانات وعناوين الموظف المعتمدة',
        text: (e: ExtendedEmployee) => `استمارة تجديد وتحديث بيانات الهوية الشخصية والاتصال:

بناءً على توجيهات قسم الموارد البشرية والامتثال الإداري في "عدالة" للمحاماة، تم قيد التعديلات التالية على ملف العامل:
- الاسم الكامل الموثق: ${e.fullNameAr} / ${e.fullNameEn}
- العنوان المدني المعتمد بدولة الكويت: ${e.address}
- هاتف الاتصال النقال وهاتف الطوارئ المعتمد: ${e.phone}
- البريد والصفحة البنكية المسجلة: ${~~e.basicSalary} د.ك لدى ${e.bankName} ومثبت بالآيبان: ${e.bankIban}.

تم تحديث هذه القيود رسمياً وإلحاق صور البطاقات المدنية للتأكد من الرخص والإقامة.`
    },
    {
        id: 'emp_transfer',
        name: '8. قرار نقل الموظف داخلياً بين الإدارات في عدالة',
        text: (e: ExtendedEmployee) => `قرار نقل وصلاحيات إدارية داخلية بمكتب المحاماة:

الموضوع: نقل وتكليف إداري وقانوني داخلي
بالموافقة مع المصلحة الفنية لإشعارات ومرافعات القضايا الكبرى بمكتب المحامي صبري شطا للمحاماة والاستشارات القانونية:
أولاً: يُنقل السيد/ ${e.fullNameAr} من قسمه السابق إلى قسم (${e.department}) للعمل بوظيفة (${e.jobTitle}) بمقرنا الرئيسي بدولة الكويت.
ثانياً: يقوم الموظف المذكور بتسليم كافة القضايا والملفات القانونية العالقة بحوزته لمدير القسم القديم ومباشرة الالتزام في مقره الجديد اعتباراً من تاريخ الغد.`
    },
    {
        id: 'emp_promotion',
        name: '9. قرار ترقية الكفاءة وصعود الدرجة المهنية والمالية',
        text: (e: ExtendedEmployee) => `قرار ترقية جراءة واستحقاق الموظف الفني بالمكتب:

بناءً على التقارير السنوية المرتفعة وتقديراً للإخلاص والسيرة والجهود القضائية المعمول بها من الزميل/ ${e.fullNameAr}، قررت الإدارة العليا للمكتب ما يلي:
أولاً: ترشيح الموظف المذكور وصعوده إلى الدرجة المهنية الرائدة وتعديل الكادر اللائحي ليصبح مسمّاه (${e.jobTitle}) بقسم (${e.department}).
ثانياً: تعديل الراتب الأساسي الشهري في بوابة حماية الأجور والرواتب وإعلام إدارة الموارد البشرية لتوثيق السند والملف الإداري.`
    },
    {
        id: 'title_change',
        name: '10. طلب وإقرار تعديل المسمى الوظيفي الرسمي للقوى العاملة',
        text: (e: ExtendedEmployee) => `إشعار تعديل المسميات والاعتمادات اللائحية بالمكتب:

إلى الهيئة العامة للقوى العاملة بدولة الكويت (مراقبة تسجيل وتصديق الكفاءات):
يفيد مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية بطلب توجيه المسمى الفني للموظف المعني بالتبويب رقم (${e.employeeId}) — السيد/ ${e.fullNameAr} ليصبح رسمياً: (${e.jobTitle}) وتوجيه اللائحة لإيداع المستند بالملف الشخصي وتعديل رخصة القوى العاملة تبعاً للقرارات ذات الصلة للضمان والربط المهني.`
    },
    {
        id: 'service_termination',
        name: '11. قرار إنهاء خدمات وتصفية مخالصة نهاية الخدمة',
        text: (e: ExtendedEmployee) => `مستند تسوية براءة ذمة وإنهاء عقد لوظيفة:

بموجب المادة 51 من قانون العمل الكويتي رقم 6 لسنة 2010 للمؤسسات الأهلية، تم تسوية وإنهاء العلاقة التعاقدية للموظف السيد/ ${e.fullNameAr}، الحامل للرقم المدني (${e.civilId}):
- الراتب الأساسي لأغراض التصفية: ${e.basicSalary} د.ك.
- مستحقات نهاية الخدمة والبدلات المسواة لغوياً والمدققة: (الرجوع لتقرير تصفية نهاية الخدمة على الموقع).

يقرر مدير الموارد البشرية تسليم الموظف شهادة براءة الذمة ومكتوب الخدمة المعتمد بختم المنشأة.`
    }
];
