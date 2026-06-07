import React, { useState, useMemo, useEffect } from 'react';
import { 
    User, Briefcase, FileText, Calendar, ShieldCheck, Scale, Award, Folder, 
    Mail, Phone, MapPin, Printer, Edit, Trash2, Plus, Clock, Search, 
    CheckCircle, AlertTriangle, CreditCard, ChevronRight, Send, X, FilePlus, 
    RefreshCcw, GraduationCap, ShieldAlert, HeartHandshake, History, HelpCircle, 
    Archive, TrendingUp, DollarSign, Key, AlertCircle, Eye, Check, FileCheck, Landmark
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
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
    attachments: Array<{ id: string; title: string; category: string; expiryDate?: string; fileType: string }>;
    historyTimeline: Array<{ id: string; date: string; titleAr: string; descriptionAr: string; category: string }>;
    annualLeaveEntitlement?: number;
    carriedOverBalance?: number;
    absenceDays?: number;
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
        passportExpiry: '2029-08-11',
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
            { id: 'at-1', title: 'صورة البطاقة المدنية المعتمدة', category: 'البطاقة المدنية', expiryDate: '2028-04-12', fileType: 'pdf' }
        ],
        historyTimeline: [
            { id: 'ht-1', date: '2021-01-15', titleAr: 'مباشرة العمل والتثبيت', descriptionAr: 'انضمت للمكتب كمستشار قانوني أول بقسم الشركات.', category: 'Hiring' }
        ]
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
        civilIdExpiry: '2027-11-20',
        passportNumber: 'E9988112',
        passportExpiry: '2028-10-15',
        residencyExpiry: '2027-11-20',
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
        attachments: [],
        historyTimeline: [
            { id: 'ht-3', date: '2020-03-01', titleAr: 'التعيين المباشر', descriptionAr: 'تم قبوله للعمل كمحاسب رئيسي لشؤون قضايا الموكلين.', category: 'Hiring' }
        ]
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
        attachments: [],
        historyTimeline: [
            { id: 'ht-4', date: '2023-05-10', titleAr: 'باقة المباشرة', descriptionAr: 'انضم كمتابع للمحاكم ولشؤون الإعلانات والتقاضي.', category: 'Hiring' }
        ]
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

أولاً: الطرف الأول (صاحب العمل): مكتب الوقيان والعبدالله للمحاماة والاستشارات القانونية، ومقره الرئيسي برج الحمراء، دولة الكويت.
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
إلى إدارة شؤون الكوادر ومراقبة القوى العاملة بمكتب الوقيان والعبدالله للمحاماة:

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
- الطرف الأول: مكتب الوقيان والعبدالله للمحاماة والاستشارات القانونية.
- الطرف الثاني: السيد/ ${e.fullNameAr}، الرقم المدني: ${e.civilId}.

تم التوافق الإداري والقانوني بين الطرفين المبرمين على تعديل بنود الأجر والبدلات عمالياً وفق الالتزام المالي والتنظيمي المعمول به بالمكتب:
أولاً: يُعدل الراتب الأساسي الشهري للطرف الثاني ليصبح (${e.basicSalary}) دينار كويتي.
ثانياً: تضاف البدلات المقررة رسمياً وهي: بدل تمثيل وتكليف وتدريب وقدرها (${e.allowances?.reduce((sum, item) => sum + item.value, 0) || 150} د.ك)، لتدرج في حساب الرواتب المعتمد.
ثالثاً: تبقى وتظل كافة البنود التعاقدية واللوائح الداخلية الأخرى بمكتب الشريك المفوّض أحمد محمود العبدالله سارية بالكامل دون أي مساس بها.`
    },
    {
        id: 'renew_contract',
        name: '4. قرار تجديد عقد العمل تلقائياً',
        text: (e: ExtendedEmployee) => `قرار إداري رقم (${Math.floor(Math.random() * 900) + 100}/2026) بتجديد عقد عمل أهلي:

الموضوع: تجديد عقد الموظف السيد/ ${e.fullNameAr}
الرقم الوظيفي: ${e.employeeId} | الرقم المدني الكويتي: ${e.civilId}

بناءً على التقرير السنوي الإيجابي ومصلحة العمل اللائحية بمكتب الوقيان والعبدالله للمحاماة، تقرر:
1- تجديد عقد العمل الفردي المبرم مع الموظف المذكور أعلاه لمدة سنة ميلادية أخرى تبدأ من منقضى مدة الخدمة القديمة وتخضع للائحة الجزاءات والامتيازات القانونية.
2- تلتزم الإدارة المالية في "عدالة" بدفع وصرف الرواتب المقررة وإعلام التأمينات الاجتماعية بالاستمرارية بدولة الكويت.`
    },
    {
        id: 'asset_receipt',
        name: '5. إقرار وبراءة تسلم عهدة وممتلكات للمكتب',
        text: (e: ExtendedEmployee) => `صحيفة إقرار وحيازة عهدة إدارية وتقنية:

أقر أنا الموقع أدناه السيد/ ${e.fullNameAr} الموظف بقسم (${e.department}) بمكتب الوقيان والعبدالله للمحاماة، بأنني قد استلمت وحزت من إدارة تقنية المعلومات والتجهيزات العهدة الموصوفة بالتالي:
1- جهاز حاسوب لوحي متنقل وقواعد تشغيل مبرمجة للنظام الرسمي لبرنامج "عدالة".
2- بطاقة دخول ذكية وبوابة البصمة للتحقق وعضوية برج الحمراء بدولة الكويت.
3- ملفات وسجلات رسمية خاصة بقضايا الموكلين التابعة لإدارتنا.

وألتزم شخصياً وقانونياً بالمحافظة التامة على هذه المستندات والعهد من التلف أو الفقد، وفي حالة انتهاء عملي يلتزم ملفي القانوني بإرجاعها براءة ذمة مطلقة.`
    },
    {
        id: 'salary_receipt',
        name: '6. إقرار وبراءة ذمة باستلام كافة الأجور والرواتب',
        text: (e: ExtendedEmployee) => `مستند إخلاء وبراءة ذمة عمالية دورية:

أقر أنا الموظف/ ${e.fullNameAr}، الحامل للرقم المدني (${e.civilId}) والرقم الوظيفي (${e.employeeId})، بأنني قد استلمت من مكتب الوقيان والعبدالله للمحاماة والاستشارات كافة مستحقاتي العمالية عن رواتب شهرية، بدلات مرافعة، ومخصصات مالية دورية بالتحويل المصرفي المعتمد لغاية يوم التوقيع أدناه.
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
بالموافقة مع المصلحة الفنية لإشعارات ومرافعات القضايا الكبرى بمكتب الوقيان والعبدالله للمحاماة:
أولاً: يُنقل السيد/ ${e.fullNameAr} من قسمه السابق إلى قسم (${e.department}) للعمل بوظيفة (${e.jobTitle}) بمقرنا في برج الحمراء الرئيسي بدولة الكويت.
ثانياً: يقوم الموظف المذكور بتسليم كافة القضايا والملفات القانونية العالقة بحوزته لمدير القسم القديم ومباشرة الالتزام في مقره الجديد اعتباراً من تاريخ الغد.`
    },
    {
        id: 'emp_promotion',
        name: '9. قرار ترقية الكفاءة وصعود الدرجة المهنية والمالية',
        text: (e: ExtendedEmployee) => `قرار ترقية جدارة واستحقاق الموظف الفني بالمكتب:

بناءً على التقارير السنوية المرتفعة وتقديراً للإخلاص والسيرة والجهود القضائية المعمول بها من الزميل/ ${e.fullNameAr}، قررت الإدارة العليا للمكتب ما يلي:
أولاً: ترشيح الموظف المذكور وصعوده إلى الدرجة المهنية الرائدة وتعديل الكادر اللائحي ليصبح مسمّاه (${e.jobTitle}) بقسم (${e.department}).
ثانياً: تعديل الراتب الأساسي الشهري في بوابة حماية الأجور والرواتب وإعلام إدارة الموارد البشرية لتوثيق السند والملف الإداري.`
    },
    {
        id: 'title_change',
        name: '10. طلب وإقرار تعديل المسمى الوظيفي الرسمي للقوى العاملة',
        text: (e: ExtendedEmployee) => `إشعار تعديل المسميات والاعتمادات اللائحية بالمكتب:

إلى الهيئة العامة للقوى العاملة بدولة الكويت (مراقبة تسجيل وتصديق الكفاءات):
يفيد مكتب الوقيان والعبدالله للمحاماة والاستشارات القانونية بطلب توجيه المسمى الفني للموظف المعني بالتبويب رقم (${e.employeeId}) — السيد/ ${e.fullNameAr} ليصبح رسمياً: (${e.jobTitle}) وتوجيه اللائحة لإيداع المستند بالملف الشخصي وتعديل رخصة القوى العاملة تبعاً للقرارات ذات الصلة للضمان والربط المهني.`
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

const EmployeeProfilePage: React.FC = () => {
    const { addToast } = useToast();

    // ==========================================
    // 4. SYNCHRONIZED STORAGE SYSTEM
    // ==========================================
    const [employees, setEmployees] = useState<ExtendedEmployee[]>(() => {
        const stored = localStorage.getItem('alwagayan_employees');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            } catch (e) {}
        }
        return initialEmployees;
    });

    useEffect(() => {
        localStorage.setItem('alwagayan_employees', JSON.stringify(employees));
    }, [employees]);

    // Multi-module databases loaded in real-time
    const [leaveRequestsDetailed, setLeaveRequestsDetailed] = useState<any[]>(() => {
        try { return JSON.parse(localStorage.getItem('alwagayan_leave_requests_detailed') || '[]'); } catch(e) { return []; }
    });
    const [loansDetailed, setLoansDetailed] = useState<any[]>(() => {
        try { return JSON.parse(localStorage.getItem('alwagayan_loans') || '[]'); } catch(e) { return []; }
    });
    const [investigationsDetailed, setInvestigationsDetailed] = useState<any[]>(() => {
        try { return JSON.parse(localStorage.getItem('alwagayan_investigations') || '[]'); } catch(e) { return []; }
    });
    const [disciplinaryDetailed, setDisciplinaryDetailed] = useState<any[]>(() => {
        try { return JSON.parse(localStorage.getItem('alwagayan_disciplinary') || '[]'); } catch(e) { return []; }
    });
    const [appraisalsDetailed, setAppraisalsDetailed] = useState<any[]>(() => {
        try { return JSON.parse(localStorage.getItem('adala_perf_appraisals_v3') || '[]'); } catch(e) { return []; }
    });
    const [timelineLogs, setTimelineLogs] = useState<any[]>(() => {
        try { return JSON.parse(localStorage.getItem('alwagayan_timeline') || '[]'); } catch(e) { return []; }
    });

    // Save linked data to reflect in other portals
    const saveLeaveRequests = (newList: any[]) => {
        setLeaveRequestsDetailed(newList);
        localStorage.setItem('alwagayan_leave_requests_detailed', JSON.stringify(newList));
    };
    const saveLoans = (newList: any[]) => {
        setLoansDetailed(newList);
        localStorage.setItem('alwagayan_loans', JSON.stringify(newList));
    };
    const saveInvestigations = (newList: any[]) => {
        setInvestigationsDetailed(newList);
        localStorage.setItem('alwagayan_investigations', JSON.stringify(newList));
    };
    const saveDisciplinary = (newList: any[]) => {
        setDisciplinaryDetailed(newList);
        localStorage.setItem('alwagayan_disciplinary', JSON.stringify(newList));
    };
    const saveTimeline = (newList: any[]) => {
        setTimelineLogs(newList);
        localStorage.setItem('alwagayan_timeline', JSON.stringify(newList));
    };

    // States
    const [searchTerm, setSearchTerm] = useState('');
    const [deptFilter, setDeptFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedEmpId, setSelectedEmpId] = useState<string>(employees[0]?.id || '');
    const [activeTab, setActiveTab] = useState('profile_personal');

    // Document Modal State
    const [isDocModalOpen, setIsDocModalOpen] = useState(false);
    const [selectedFormId, setSelectedFormId] = useState('labor_contract');
    const [editorText, setEditorText] = useState('');
    const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');

    // Add / Edit Modal States
    const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [empFormState, setEmpFormState] = useState<Partial<ExtendedEmployee>>({});

    const selectedEmployee = useMemo(() => {
        return employees.find(e => e.id === selectedEmpId) || employees[0];
    }, [employees, selectedEmpId]);

    // Handle template reload
    useEffect(() => {
        if (selectedEmployee) {
            const currentTpl = OFFICIAL_FORM_TEMPLATES.find(t => t.id === selectedFormId);
            if (currentTpl) {
                setEditorText(currentTpl.text(selectedEmployee));
            }
        }
    }, [selectedEmployee, selectedFormId, isDocModalOpen]);

    // Filtering
    const filteredEmployees = useMemo(() => {
        return employees.filter(e => {
            const matchesSearch = e.fullNameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
                e.fullNameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
                e.civilId.includes(searchTerm) ||
                e.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                e.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDept = deptFilter === 'All' || e.department === deptFilter;
            const matchesStatus = statusFilter === 'All' || e.status === statusFilter;
            return matchesSearch && matchesDept && matchesStatus;
        });
    }, [employees, searchTerm, deptFilter, statusFilter]);

    // Sync arrays from other portals for active employee
    const activeLeaveRequests = useMemo(() => {
        if (!selectedEmployee) return [];
        const combined = [...(selectedEmployee.leaveRequests || [])];
        leaveRequestsDetailed.filter(lr => lr.employeeId === selectedEmployee.id).forEach(lr => {
            if (!combined.some(c => c.id === lr.id)) {
                combined.push({
                    id: lr.id,
                    type: lr.leaveType || lr.type,
                    startDate: lr.startDate,
                    endDate: lr.endDate,
                    days: lr.numberOfDays || lr.days,
                    reason: lr.reason || '',
                    status: lr.status
                });
            }
        });
        return combined;
    }, [selectedEmployee, leaveRequestsDetailed]);

    const activeLoans = useMemo(() => {
        if (!selectedEmployee) return [];
        const combined = [...(selectedEmployee.loans || [])];
        loansDetailed.filter(l => l.employeeId === selectedEmployee.id).forEach(l => {
            if (!combined.some(c => c.id === l.id)) {
                combined.push({
                    id: l.id,
                    amount: l.principalAmount || l.amount,
                    balanceAmount: l.balanceAmount,
                    monthlyInstallment: l.monthlyInstallment,
                    startDate: l.issueDate || l.startDate,
                    status: l.status
                });
            }
        });
        return combined;
    }, [selectedEmployee, loansDetailed]);

    const activeInvestigations = useMemo(() => {
        if (!selectedEmployee) return [];
        const combined = [...(selectedEmployee.investigations || [])];
        investigationsDetailed.filter(inv => inv.employeeId === selectedEmployee.id).forEach(inv => {
            if (!combined.some(c => c.id === inv.id)) {
                combined.push({
                    id: inv.id,
                    caseNumber: inv.caseNumber || 'INV-TEMP',
                    date: inv.date || inv.violationDate || new Date().toISOString().split('T')[0],
                    violations: inv.subject || inv.violations || 'مخالفة لائحية',
                    details: inv.results || inv.details || 'بانتظار التحقيق المكتبي المكتمل',
                    status: inv.status === 'Closed' || inv.status === 'Archived' ? 'Closed' : 'Open'
                });
            }
        });
        return combined;
    }, [selectedEmployee, investigationsDetailed]);

    const activeDisciplinary = useMemo(() => {
        if (!selectedEmployee) return [];
        const combined = [...(selectedEmployee.disciplinaryActions || [])];
        disciplinaryDetailed.filter(d => d.employeeId === selectedEmployee.id).forEach(d => {
            if (!combined.some(c => c.id === d.id)) {
                combined.push({
                    id: d.id,
                    recordNumber: d.recordNumber || d.id || 'DIS-TEMP',
                    date: d.date || d.violationDate || new Date().toISOString().split('T')[0],
                    sanctionType: d.sanctionType || d.penalty || 'إنذار كتابي',
                    details: d.details || d.violationDetails || 'تفاصيل تهم المصلحة والالتزام',
                    status: d.status === 'Approved' ? 'Approved' : 'Pending'
                });
            }
        });
        return combined;
    }, [selectedEmployee, disciplinaryDetailed]);

    const activeAppraisals = useMemo(() => {
        if (!selectedEmployee) return [];
        const combined = [...(selectedEmployee.evaluations || [])];
        appraisalsDetailed.filter(ap => ap.employeeId === selectedEmployee.id).forEach(ap => {
            if (!combined.some(c => c.id === ap.id)) {
                combined.push({
                    id: ap.id,
                    period: ap.period || 'الربع السنوي',
                    score: ap.overallScore || ap.score || 90,
                    feedback: ap.qualitativeFeedback || ap.feedback || '',
                    date: ap.date || new Date().toISOString().split('T')[0]
                });
            }
        });
        return combined;
    }, [selectedEmployee, appraisalsDetailed]);

    // Date expiries check for alerts (State of Kuwait residency, Civil ID & Passport)
    const activeExpiriesAlerts = useMemo(() => {
        const warnings: Array<{ name: string; date: string; daysLeft: number; type: 'civil' | 'passport' | 'residency' }> = [];
        if (!selectedEmployee) return warnings;
        
        const checkExpiry = (dateStr: string, name: string, type: 'civil' | 'passport' | 'residency') => {
            if (!dateStr) return;
            const diff = new Date(dateStr).getTime() - new Date().getTime();
            const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
            if (days <= 60) {
                warnings.push({ name, date: dateStr, daysLeft: days, type });
            }
        };

        checkExpiry(selectedEmployee.civilIdExpiry, 'البطاقة المدنية', 'civil');
        checkExpiry(selectedEmployee.passportExpiry, 'جواز السفر الدولي', 'passport');
        checkExpiry(selectedEmployee.residencyExpiry, 'إقامة العمل (وزارة الشؤون)', 'residency');
        return warnings;
    }, [selectedEmployee]);

    // Kuwait Law indemnity calculator (Article 51 of Labor Law No. 6/2010)
    const computedIndemnity = useMemo(() => {
        if (!selectedEmployee) return { totalYears: 0, totalMonths: 0, sum: 0, breakdown: '' };
        
        const join = new Date(selectedEmployee.joiningDate);
        const exit = new Date(); // Simulated exit today
        const diffYears = (exit.getTime() - join.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        
        const totalYears = Math.floor(diffYears);
        const totalMonths = Math.floor((diffYears - totalYears) * 12);
        
        const monthly = selectedEmployee.basicSalary + (selectedEmployee.allowances?.reduce((t, c) => t + c.value, 0) || 0);
        const dailyWage = monthly / 26; // Under Kuwait Labor law daily wage is salary/26

        let multiplierDays = 0;
        let breakdown = '';
        
        // Under Article 51:
        // Monthly wage paid employees are entitled to:
        // - 15 days of salary for each of the first 5 years
        // - 30 days of salary for each subsequent year
        // Provided the total indemnity does not exceed one year's wage.
        
        if (diffYears <= 5) {
            multiplierDays = diffYears * 15;
            breakdown = `مدة الخدمة لغاية 5 سنوات: ${diffYears.toFixed(2)} سنة في غضونها 15 يوماً أجر يومي عن كل سنة.`;
        } else {
            multiplierDays = (5 * 15) + ((diffYears - 5) * 30);
            breakdown = `الخمس سنوات الأولى: 75 يوماً عمالياً. السنوات الإضافية: ${(diffYears - 5).toFixed(2)} سنة في غضونها 30 يوماً أجر يومي عن كل سنة.`;
        }

        let totalEligibleAmount = multiplierDays * dailyWage;

        // In case of resignation/voluntary exit (Article 53 scaling):
        // Duration < 3 years: no indemnity
        // Duration 3 - 5 years: half indemnity (50%)
        // Duration 5 - 10 years: two-thirds indemnity (66.6%)
        // Duration > 10 years: full indemnity (100%)
        // Since we calculate absolute direct entitlement as maximum boundary:
        let resignationAmount = totalEligibleAmount;
        if (diffYears < 3) {
            resignationAmount = 0;
        } else if (diffYears >= 3 && diffYears < 5) {
            resignationAmount = totalEligibleAmount * 0.5;
        } else if (diffYears >= 5 && diffYears < 10) {
            resignationAmount = totalEligibleAmount * (2/3);
        }

        // Maximum boundary is 1 year's total salary
        const maxEntlement = monthly * 12;
        const sumFinal = Math.min(totalEligibleAmount, maxEntlement);

        return {
            totalYears,
            totalMonths,
            sum: Math.round(sumFinal),
            resignationSum: Math.round(resignationAmount),
            dailyWage: Math.round(dailyWage * 100) / 100,
            breakdown
        };
    }, [selectedEmployee]);

    // Department labels
    const getDeptLabel = (dept: string) => {
        const arDepts: Record<string, string> = {
            'Consultation': 'الاستشارات والمرافعات',
            'Litigation': 'التقاضي والإعلانات',
            'Finance': 'الحسابات والشؤون المالية',
            'Senior Management': 'الإدارة العليا والشراكة',
            'HR': 'شؤون الكوادر والموظفين'
        };
        return arDepts[dept] || dept;
    };

    // Actions
    const handleDeleteEmployee = (id: string, name: string) => {
        if (window.confirm(`هل أنت واثق برغبتك في حذف ملف الموظف [${name}] نهائياً من سجلات عدالة؟`)) {
            const newList = employees.filter(e => e.id !== id);
            setEmployees(newList);
            addToast({ type: 'success', title: 'تمت العملية', message: `تم حذف ملف الموظف ${name} من قاعدة البيانات.` });
            
            // Add to timeline log
            const newLog = {
                id: `ht-del-${Date.now()}`,
                employeeId: id,
                date: new Date().toISOString().split('T')[0],
                titleAr: 'حذف ملف موظف',
                descriptionAr: `تم تصفية وحذف قيد الموظف ${name} من المنظومة بالكامل.`,
                category: 'Archive'
            };
            saveTimeline([newLog, ...timelineLogs]);

            if (newList.length > 0) {
                setSelectedEmpId(newList[0].id);
            }
        }
    };

    // Open add / edit form
    const openEmpModal = (mode: 'add' | 'edit', emp?: ExtendedEmployee) => {
        setModalMode(mode);
        if (mode === 'edit' && emp) {
            setEmpFormState({ ...emp });
        } else {
            setEmpFormState({
                id: `emp-${Date.now()}`,
                employeeId: `K-${Math.floor(Math.random() * 900) + 100}`,
                fullNameAr: '',
                fullNameEn: '',
                gender: 'Male',
                socialStatus: 'Single',
                bloodType: 'O+',
                dateOfBirth: '1995-01-01',
                phone: '',
                email: '',
                address: '',
                nationality: 'كويتي',
                religion: 'الإسلام',
                civilId: '',
                civilIdExpiry: '2028-01-01',
                passportNumber: '',
                passportExpiry: '2029-01-01',
                residencyExpiry: '2028-01-01',
                jobTitle: '',
                department: 'Consultation',
                jobGrade: 'B1',
                branch: 'المركز الرئيسي - برج الحمراء',
                managerName: 'أحمد محمود العبدالله',
                workSystem: 'دوام كامل',
                workHoursPerDay: 8,
                joiningDate: new Date().toISOString().split('T')[0],
                contractType: ContractTypeKuwait.UNLIMITED,
                status: 'Active',
                basicSalary: 800,
                bankName: 'بنك الكويت الوطني (NBK)',
                bankAccount: '',
                bankIban: '',
                allowances: [],
                increments: [],
                degrees: [],
                trainings: [],
                leaveRequests: [],
                loans: [],
                evaluations: [],
                investigations: [],
                disciplinaryActions: [],
                attachments: [],
                historyTimeline: []
            });
        }
        setIsEmpModalOpen(true);
    };

    // Save Modal Emp
    const handleSaveEmp = (e: React.FormEvent) => {
        e.preventDefault();
        const f = empFormState as ExtendedEmployee;
        if (!f.fullNameAr || !f.civilId) {
            alert('يرجى ملاءمة اسم العامل الكامل باللغة العربية والرقم المدني الكويتي.');
            return;
        }

        // Mirror hiringDate
        f.hiringDate = f.joiningDate;

        if (modalMode === 'add') {
            const newList = [...employees, f];
            setEmployees(newList);
            setSelectedEmpId(f.id);
            setIsEmpModalOpen(false);
            addToast({ type: 'success', title: 'تم تعيين موظف جديد', message: `تم قيد السيد/ة ${f.fullNameAr} وإلحاق مباشرة العمل آلياً.` });

            const newLog = {
                id: `ht-add-${Date.now()}`,
                employeeId: f.id,
                date: new Date().toISOString().split('T')[0],
                titleAr: 'قيد وتثبيت بالعمل',
                descriptionAr: `تم إنشاء كشف وتثبيت ملف عمالي للموظف ${f.fullNameAr} بالرقم المدني ${f.civilId}.`,
                category: 'Hiring'
            };
            saveTimeline([newLog, ...timelineLogs]);
        } else {
            const newList = employees.map(emp => emp.id === f.id ? f : emp);
            setEmployees(newList);
            setIsEmpModalOpen(false);
            addToast({ type: 'success', title: 'تم التعديل بسلام', message: `تم حفظ تحديثات ملف السيد/ة ${f.fullNameAr} وتخزينها.` });

            const newLog = {
                id: `ht-edit-${Date.now()}`,
                employeeId: f.id,
                date: new Date().toISOString().split('T')[0],
                titleAr: 'تحديث القيود الأساسية',
                descriptionAr: 'تمت صيانة وتحديث عناوين الاتصال وسيرة الرخص ورصيد الهويات الشخصية.',
                category: 'Request'
            };
            saveTimeline([newLog, ...timelineLogs]);
        }
    };

    return (
        <div className="absolute inset-0 bg-[#f8fafc] overflow-y-auto text-slate-800 pb-16 font-sans text-right" style={{ direction: 'rtl' }}>
            
            {/* Header bar */}
            <div className="bg-slate-950 text-white border-b-2 border-amber-500/20 shadow-md">
                <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="space-y-1.5">
                            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                                بوابـة عـدالة الكبرى لشؤون وتاريخ الموظفين
                            </span>
                            <h1 className="text-3xl font-black tracking-tight text-white m-0">قاعدة ملفات وسيرة الموظفين القضائية واللوائح</h1>
                            <p className="text-xs text-slate-400 m-0">ملفات متكاملة مطابقة عمالياً لقانون العمل الكويتي رقم 6 لسنة 2010 ومقررات الهيئة العامة للقوى العاملة بدولة الكويت.</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 pt-2 md:pt-0">
                            <button 
                                onClick={() => openEmpModal('add')}
                                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 border-none px-4 py-2.5 rounded-2xl text-xs font-black text-slate-950 transition-all select-none shadow-md shadow-amber-500/10 cursor-pointer"
                            >
                                <Plus className="w-4 h-4 text-slate-950" />
                                <span>إضافة موظف جديد للمكتب</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content grid */}
            <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* Side Directory (Filter and Search) */}
                <div className="lg:col-span-1 space-y-4">
                    <Card className="p-4 bg-white border border-slate-200/80 rounded-3xl shadow-sm text-right space-y-4">
                        <div className="space-y-1">
                            <h3 className="text-xs font-black text-slate-900 m-0 flex items-center gap-1.5">
                                <Folder className="w-4 h-4 text-indigo-600" />
                                سجل وبطاقات العاملين بالمكتب
                            </h3>
                            <p className="text-[10px] text-slate-500 m-0">البحث باستخدام المسمى الوظيفي، الرقم أو الاسم</p>
                        </div>

                        {/* Search input */}
                        <div className="relative">
                            <input 
                                placeholder="ابحث الموظف، اللقب..." 
                                value={searchTerm} 
                                onChange={e => setSearchTerm(e.target.value)} 
                                className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-right focus:bg-white focus:outline-none"
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        </div>

                        {/* Dropdown Filters */}
                        <div className="grid grid-cols-1 gap-2 border-t pt-3">
                            <div>
                                <label className="text-[9px] text-slate-400 font-bold block mb-1">تصفية حسب القسم المهني:</label>
                                <select 
                                    className="w-full text-[11px] font-bold bg-slate-50 border rounded-lg px-2 py-1.5 cursor-pointer text-right"
                                    value={deptFilter}
                                    onChange={e => setDeptFilter(e.target.value)}
                                >
                                    <option value="All">جميع الأقسام</option>
                                    <option value="Consultation">الاستشارات والمرافعات</option>
                                    <option value="Litigation">التقاضي والإعلانات</option>
                                    <option value="Finance">الحسابات والشؤون المالية</option>
                                    <option value="Senior Management">الإدارة العليا</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[9px] text-slate-400 font-bold block mb-1">تصفية حسب حالة الدوام:</label>
                                <select 
                                    className="w-full text-[11px] font-bold bg-slate-50 border rounded-lg px-2 py-1.5 cursor-pointer text-right"
                                    value={statusFilter}
                                    onChange={e => setStatusFilter(e.target.value)}
                                >
                                    <option value="All">جميع المباشرين وغيرهم</option>
                                    <option value="Active">مباشر العمل بالخدمة</option>
                                    <option value="On Leave">في إجازة معتمدة</option>
                                    <option value="Suspended">موقوف مؤقتاً</option>
                                </select>
                            </div>
                        </div>

                        {/* Employees Directory List */}
                        <div className="space-y-2 max-h-[350px] overflow-y-auto pt-2 border-t">
                            {filteredEmployees.length === 0 ? (
                                <p className="text-[11px] text-slate-400 py-4 text-center">لا توجد سجلات مطابقة للمعايير.</p>
                            ) : (
                                filteredEmployees.map(emp => {
                                    const isSelected = emp.id === selectedEmpId;
                                    return (
                                        <div 
                                            key={emp.id}
                                            onClick={() => setSelectedEmpId(emp.id)}
                                            className={`p-3 rounded-2xl border text-right cursor-pointer transition-all ${isSelected ? 'bg-indigo-50/70 border-indigo-500 shadow-sm' : 'bg-white hover:bg-slate-50 border-slate-150'}`}
                                        >
                                            <h4 className="text-xs font-black text-slate-900 m-0 leading-tight">{emp.fullNameAr}</h4>
                                            <p className="text-[10px] text-slate-500 font-semibold m-0 mt-1">{emp.jobTitle} • {getDeptLabel(emp.department)}</p>
                                            
                                            <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
                                                <span className="text-[9px] font-mono text-slate-400 font-bold">{emp.employeeId}</span>
                                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${emp.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                                    {emp.status === 'Active' ? 'نشط بالخدمة' : emp.status === 'On Leave' ? 'في إجازة' : 'موقوف'}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </Card>

                    {/* Expiry Warning Box (State of Kuwait Regulation check) */}
                    {selectedEmployee && activeExpiriesAlerts.length > 0 && (
                        <Card className="p-4 bg-red-500/5 border border-red-200 rounded-3xl text-right space-y-2">
                            <h4 className="text-[11px] font-black text-red-800 m-0 flex items-center gap-1.5">
                                <AlertTriangle className="w-4 h-4 text-red-650 animate-bounce" />
                                تنبيهات حكومية وحظر رخص العمل:
                            </h4>
                            <div className="space-y-2">
                                {activeExpiriesAlerts.map((al, idx) => (
                                    <div key={idx} className="p-2 bg-white rounded-xl border border-red-100 space-y-0.5">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black text-red-950">{al.name}</span>
                                            <span className="text-[9px] bg-red-100 text-red-700 px-1 py-0.5 rounded font-black font-mono">{al.daysLeft} يوم</span>
                                        </div>
                                        <p className="text-[9px] text-slate-500 m-0">تاريخ الانتهاء: {al.date}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>

                {/* Main Workspace Frame */}
                <div className="lg:col-span-3 space-y-6">
                    {selectedEmployee ? (
                        <div className="space-y-6">
                            
                            {/* Branded Profile Banner */}
                            <div className="bg-slate-950 text-white rounded-[2rem] p-6 shadow-md relative overflow-hidden border border-slate-800 text-right">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full filter blur-3xl"></div>
                                <div className="relative flex flex-col md:flex-row items-center gap-6 justify-between">
                                    <div className="flex flex-col md:flex-row items-center gap-5 justify-start">
                                        <div className="w-16 h-16 rounded-2xl bg-indigo-900/60 border border-slate-700 flex items-center justify-center font-black text-amber-400 text-xl shadow-inner">
                                            {selectedEmployee.fullNameAr[0]}
                                        </div>
                                        <div className="space-y-1">
                                            <h2 className="text-xl font-black text-white m-0">{selectedEmployee.fullNameAr}</h2>
                                            <p className="text-xs font-bold text-amber-400 m-0">{selectedEmployee.jobTitle} • {getDeptLabel(selectedEmployee.department)} • {selectedEmployee.branch}</p>
                                            <p className="text-[10px] text-slate-400 m-0">الرقم المدني: {selectedEmployee.civilId} | رقم الموظف: {selectedEmployee.employeeId} | تاريخ الانتساب: {selectedEmployee.joiningDate}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-2 pt-2 md:pt-0">
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="bg-white border text-xs h-9 px-4 rounded-xl font-bold hover:bg-slate-100 text-slate-900 border-slate-300"
                                            onClick={() => openEmpModal('edit', selectedEmployee)}
                                            leftIcon={<Edit className="w-3.5 h-3.5 text-slate-700" />}
                                        >
                                            تعديل بيانات القيد
                                        </Button>
                                        <Button 
                                            variant="primary" 
                                            size="sm" 
                                            className="bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/20 font-black text-xs h-9 px-4 rounded-xl"
                                            onClick={() => {
                                                setSelectedFormId('labor_contract');
                                                setIsDocModalOpen(true);
                                            }}
                                            leftIcon={<Printer className="w-3.5 h-3.5 text-amber-400" />}
                                        >
                                            إصدار التقارير والنماذج الـ 11
                                        </Button>
                                        <button
                                            onClick={() => handleDeleteEmployee(selectedEmployee.id, selectedEmployee.fullNameAr)}
                                            className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl border border-rose-350/25 bg-white cursor-pointer transition-all"
                                            title="حذف الموظف نهائياً"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Bento navigation tabs */}
                            <div className="flex gap-1 overflow-x-auto p-1.5 bg-white border border-slate-200/80 rounded-2xl shadow-sm scrollbar-none">
                                {[
                                    { id: 'profile_personal', label: 'البيانات الشخصية والمدنية', icon: <User className="w-4 h-4" /> },
                                    { id: 'profile_career', label: 'العقود والتوظيف والـ PIFSS', icon: <Briefcase className="w-4 h-4" /> },
                                    { id: 'profile_compensation', label: 'الرواتب والبدلات والـ WPS', icon: <DollarSign className="w-4 h-4" /> },
                                    { id: 'profile_leaves', label: `رصيد الإجازات والغياب (${activeLeaveRequests.length})`, icon: <Calendar className="w-4 h-4" /> },
                                    { id: 'profile_eval', label: `تطوير التدريب والتقييم (${activeAppraisals.length})`, icon: <Award className="w-4 h-4" /> },
                                    { id: 'profile_legal', label: `الملف القانوني والتحقيقات (${activeInvestigations.length + activeDisciplinary.length})`, icon: <Scale className="w-4 h-4" /> },
                                    { id: 'profile_indemnity', label: 'نهاية الخدمة والملفات السحابية', icon: <History className="w-4 h-4" /> }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all border border-transparent cursor-pointer ${activeTab === tab.id ? 'bg-indigo-650 text-white shadow-sm border-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                                    >
                                        {tab.icon}
                                        <span>{tab.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Tab Panels */}
                            <div className="space-y-6">
                                
                                {/* TAB 1: PERSONAL & CIVIL INFO */}
                                {activeTab === 'profile_personal' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        
                                        {/* Card 1: Personal Info */}
                                        <Card className="p-5 bg-white border border-slate-200 rounded-3xl space-y-4">
                                            <h3 className="text-xs font-black text-indigo-950 m-0 border-b pb-2 flex items-center gap-1.5">
                                                <User className="w-4 h-4 text-indigo-600" />
                                                البيانات الشخصية والعائلية
                                            </h3>
                                            <div className="grid grid-cols-2 gap-4 text-xs font-bold leading-normal text-slate-700">
                                                <div>
                                                    <span className="text-[10px] text-slate-400 block font-semibold">الاسم الإنجليزي الكامل:</span>
                                                    <p className="text-slate-900 font-mono m-0 mt-0.5">{selectedEmployee.fullNameEn || 'FATIMA AL-SAYED'}</p>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-slate-400 block font-semibold">الجنس:</span>
                                                    <p className="text-slate-900 m-0 mt-0.5">{selectedEmployee.gender === 'Female' ? 'أنثى' : 'ذكر'}</p>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-slate-400 block font-semibold">تاريخ الميلاد:</span>
                                                    <p className="text-slate-900 font-mono m-0 mt-0.5">{selectedEmployee.dateOfBirth}</p>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-slate-400 block font-semibold">الحالة الاجتماعية:</span>
                                                    <p className="text-slate-900 m-0 mt-0.5">
                                                        {selectedEmployee.socialStatus === 'Married' ? 'متزوج' : selectedEmployee.socialStatus === 'Single' ? 'أعزب' : selectedEmployee.socialStatus === 'Divorced' ? 'مطلق' : 'أرمل'}
                                                    </p>
                                                </div>
                                                <div className="col-span-2 border-t pt-2 mt-1">
                                                    <span className="text-[10px] text-slate-400 block font-semibold">عنوان السكن الدائم بدولة الكويت:</span>
                                                    <p className="text-slate-900 leading-relaxed font-sans m-0 mt-0.5">{selectedEmployee.address}</p>
                                                </div>
                                            </div>
                                        </Card>

                                        {/* Card 2: Identity & National IDs */}
                                        <Card className="p-5 bg-white border border-slate-200 rounded-3xl space-y-4">
                                            <h3 className="text-xs font-black text-indigo-950 m-0 border-b pb-2 flex items-center gap-1.5">
                                                <Eye className="w-4 h-4 text-indigo-100/50 fill-indigo-600" />
                                                بيانات هوية السكن والجنسية
                                            </h3>
                                            <div className="grid grid-cols-2 gap-4 text-xs font-bold leading-normal text-slate-700">
                                                <div>
                                                    <span className="text-[10px] text-slate-400 block font-semibold">الجنسية:</span>
                                                    <p className="text-slate-900 font-extrabold m-0 mt-0.5">{selectedEmployee.nationality}</p>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-slate-400 block font-semibold">الديانة المعترف بها:</span>
                                                    <p className="text-slate-900 m-0 mt-0.5">{selectedEmployee.religion || 'الإسلام'}</p>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-slate-400 block font-semibold">الرقم المدني الكويتي:</span>
                                                    <p className="text-indigo-950 font-black font-mono m-0 mt-0.5">{selectedEmployee.civilId}</p>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-slate-400 block font-semibold">انقضاء قيد البطاقة الهوية:</span>
                                                    <p className="text-slate-900 font-mono m-0 mt-0.5">{selectedEmployee.civilIdExpiry}</p>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-slate-400 block font-semibold font-mono">فصيلة الدم الطبية:</span>
                                                    <p className="text-slate-900 font-mono m-0 mt-0.5">{selectedEmployee.bloodType || 'O+'}</p>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-slate-400 block font-semibold">منفذ الطوارئ والاتصال:</span>
                                                    <p className="text-slate-900 font-mono m-0 mt-0.5">{selectedEmployee.phone}</p>
                                                </div>
                                            </div>
                                        </Card>

                                        {/* Card 3: Passport, Residency and Licenses */}
                                        <Card className="p-5 bg-white border border-slate-200 rounded-3xl space-y-4 col-span-1 md:col-span-2">
                                            <div className="flex justify-between items-center border-b pb-2">
                                                <h3 className="text-xs font-black text-indigo-950 m-0 flex items-center gap-1.5">
                                                    <FileText className="w-4 h-4 text-indigo-600" />
                                                    بيانات الجواز، رخصة العمل، والإقامة المقررة بالدولة الوافدية
                                                </h3>
                                                <span className="text-[9px] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded font-black text-slate-600 border">مراجعة حكومية معتمدة</span>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-bold text-slate-700 leading-normal">
                                                <div>
                                                    <span className="text-[10px] text-slate-400 block font-semibold">رقم جواز السفر الدولي:</span>
                                                    <p className="text-slate-900 font-mono uppercase m-0 mt-0.5">{selectedEmployee.passportNumber || 'K009988'}</p>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-slate-400 block font-semibold">انقضاء جواز السفر:</span>
                                                    <p className="text-slate-900 font-mono m-0 mt-0.5">{selectedEmployee.passportExpiry || '2030-01-01'}</p>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-slate-400 block font-semibold">رقم ملف الإقامة (وزارة الداخلية):</span>
                                                    <p className="text-slate-900 font-mono m-0 mt-0.5">{selectedEmployee.residencyFileNumber || 'RE-992283-KW'}</p>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-slate-400 block font-semibold">نوع وحالة رخصة الإقامة:</span>
                                                    <p className="text-slate-900 m-0 mt-0.5">{selectedEmployee.nationality === 'كويتي' ? 'معجل للمواطنين كلياً' : 'إقامة مادة 18 (عمل أهلي)'}</p>
                                                </div>
                                                <div className="border-t pt-2 mt-1">
                                                    <span className="text-[10px] text-slate-400 block font-semibold">رقم تصريح القوى العاملة:</span>
                                                    <p className="text-slate-900 font-mono m-0 mt-0.5">{selectedEmployee.workPermitNumber || 'WP-01992-Active'}</p>
                                                </div>
                                                <div className="border-t pt-2 mt-1">
                                                    <span className="text-[10px] text-slate-400 block font-semibold">انقضاء رخصة العمل (الهيئة):</span>
                                                    <p className="text-slate-900 font-mono m-0 mt-0.5">{selectedEmployee.workPermitExpiry || '2028-04-12'}</p>
                                                </div>
                                                <div className="border-t pt-2 mt-1">
                                                    <span className="text-[10px] text-slate-400 block font-semibold">رخصة القيادة المرورية (المرور):</span>
                                                    <p className="text-slate-900 font-mono m-0 mt-0.5">{selectedEmployee.drivingLicenseNumber || 'DL-8822941'}</p>
                                                </div>
                                                <div className="border-t pt-2 mt-1">
                                                    <span className="text-[10px] text-slate-400 block font-semibold">انقضاء رخصة قيادة المرور:</span>
                                                    <p className="text-slate-900 font-mono m-0 mt-0.5">{selectedEmployee.drivingLicenseExpiry || '2029-10-15'}</p>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                )}

                                {/* TAB 2: CAREER STRUCTURE & CONTRACTS */}
                                {activeTab === 'profile_career' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        
                                        {/* Card 1: Job Structural details */}
                                        <Card className="p-5 bg-white border border-slate-200 rounded-3xl space-y-4">
                                            <h3 className="text-xs font-black text-indigo-950 m-0 border-b pb-2 flex items-center gap-1.5">
                                                <Briefcase className="w-4 h-4 text-indigo-600" />
                                                الهيكل الإداري والمسمى المهني
                                            </h3>
                                            <div className="grid grid-cols-2 gap-4 text-xs font-bold leading-normal text-slate-700">
                                                <div>
                                                    <span className="text-[10px] text-slate-400 block font-semibold">المسمى الوظيفي المسجل:</span>
                                                    <p className="text-indigo-950 font-black m-0 mt-0.5">{selectedEmployee.jobTitle}</p>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-slate-400 block font-semibold">القسم التوظيفي الفني:</span>
                                                    <p className="text-slate-900 m-0 mt-0.5">{getDeptLabel(selectedEmployee.department)}</p>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-slate-400 block font-semibold">الدرجة الوظيفية (اللائحة):</span>
                                                    <p className="text-slate-900 font-mono uppercase m-0 mt-0.5">{selectedEmployee.jobGrade || 'A1'}</p>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-slate-400 block font-semibold">الفرع أو إدارة المرفق:</span>
                                                    <p className="text-slate-900 m-0 mt-0.5">{selectedEmployee.branch}</p>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-slate-400 block font-semibold">المدير أو الشريك المفوّض:</span>
                                                    <p className="text-slate-900 m-0 mt-0.5">{selectedEmployee.managerName || 'أحمد محمود العبدالله'}</p>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-slate-400 block font-semibold">نظام وجداول الدوام الرسمي:</span>
                                                    <p className="text-slate-900 m-0 mt-0.5">{selectedEmployee.workSystem || 'دوام كامل رسمي 8 ساعات'}</p>
                                                </div>
                                            </div>
                                        </Card>

                                        {/* Card 2: Legal Contracts Status */}
                                        <Card className="p-5 bg-white border border-slate-200 rounded-3xl space-y-3">
                                            <h3 className="text-xs font-black text-indigo-950 m-0 border-b pb-2 flex items-center gap-1.5">
                                                <Key className="w-4 h-4 text-indigo-600" />
                                                عقد العمل والأثر التقاعدي (تأمينات القوى العاملة)
                                            </h3>
                                            
                                            <div className="space-y-2 text-xs font-bold text-slate-700 leading-normal">
                                                <div className="flex justify-between border-b pb-1.5">
                                                    <span className="text-slate-400">نوع وهيكل العقد:</span>
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-50 text-indigo-700">{selectedEmployee.contractType}</span>
                                                </div>
                                                <div className="flex justify-between border-b pb-1.5">
                                                    <span className="text-slate-400">تاريخ مباشرة التعاقد الفعلي:</span>
                                                    <span className="font-mono text-slate-900">{selectedEmployee.contractStartDate || selectedEmployee.joiningDate}</span>
                                                </div>
                                                <div className="flex justify-between border-b pb-1.5">
                                                    <span className="text-slate-400">تاريخ الانتهاء المجدول (للمحدود):</span>
                                                    <span className="font-mono text-slate-900">{selectedEmployee.contractEndDate || 'عقد غير محدد المدة'}</span>
                                                </div>
                                                <div className="flex justify-between border-b pb-1.5">
                                                    <span className="text-slate-400">رقم الضمان والاشتراك (PIFSS كويت):</span>
                                                    <span className="font-mono font-black text-emerald-700">{selectedEmployee.socialSecurityNumber || 'معفى (وافد / متعاقد أهلي صريح)'}</span>
                                                </div>
                                                <p className="text-[10px] text-slate-400 m-0 leading-relaxed font-normal">يجب أن تُقيد عقود الموظفين غير الكويتيين لدى الهيئة العامة للقوى العاملة كشرط أساسي لضخ الإقامة وصرف التمكين القضائي للمرافعة بدولة الكويت.</p>
                                            </div>
                                        </Card>
                                    </div>
                                )}

                                {/* TAB 3: SALARY AND BENEFITS & WPS */}
                                {activeTab === 'profile_compensation' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        
                                        {/* Salaries and Allowance Sheet */}
                                        <Card className="p-5 bg-white border border-slate-200 rounded-3xl space-y-4">
                                            <h3 className="text-xs font-black text-indigo-950 m-0 border-b pb-2 flex items-center gap-1.5">
                                                <DollarSign className="w-4 h-4 text-emerald-600" />
                                                تفصيل الراتب الشهري القياسي والبدلات العمالية
                                            </h3>
                                            
                                            <div className="space-y-3 font-bold text-xs leading-normal">
                                                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border">
                                                    <span className="text-slate-500 font-bold text-xs">الأجر الأساسي الموثق بالمكتب:</span>
                                                    <span className="text-base font-black text-indigo-950 font-mono">{selectedEmployee.basicSalary.toLocaleString()} د.ك</span>
                                                </div>
                                                
                                                {selectedEmployee.allowances?.length > 0 ? (
                                                    selectedEmployee.allowances.map((al, idx) => (
                                                        <div key={idx} className="flex justify-between items-center px-4 py-1.5 border-b border-dashed">
                                                            <span className="text-slate-400 font-semibold">{al.name}:</span>
                                                            <span className="text-emerald-700 font-extrabold">+{al.value} د.ك</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-[10px] text-slate-400 text-center m-0 py-2">لا توجد بدلات عينية مضافة للراتب الأساسي.</p>
                                                )}

                                                <div className="flex justify-between items-center bg-indigo-50 text-indigo-900/90 p-3 rounded-2xl border">
                                                    <span className="font-black text-xs">إجمالي الدخل الشهري المستحق:</span>
                                                    <span className="font-mono font-black text-base">
                                                        {(selectedEmployee.basicSalary + (selectedEmployee.allowances?.reduce((sum, item) => sum + item.value, 0) || 0)).toLocaleString()} دينار كويتي
                                                    </span>
                                                </div>
                                            </div>
                                        </Card>

                                        {/* Bank Accounts and WPS certification */}
                                        <Card className="p-5 bg-white border border-slate-200 rounded-3xl space-y-4">
                                            <h3 className="text-xs font-black text-indigo-950 m-0 border-b pb-2 flex items-center gap-1.5">
                                                <CreditCard className="w-4 h-4 text-indigo-650" />
                                                الحساب المصرفي (نظام حماية الأجور الكويتي - WPS)
                                            </h3>
                                            
                                            <div className="grid grid-cols-1 gap-3 leading-relaxed text-xs font-bold text-slate-700">
                                                <div className="p-2 bg-slate-50 rounded-xl space-y-1">
                                                    <span className="text-[9px] text-slate-400 block font-semibold">البنك المعتمد:</span>
                                                    <p className="text-slate-900 font-black m-0">{selectedEmployee.bankName || 'بيت التمويل الكويتي'}</p>
                                                </div>
                                                <div className="p-2 bg-slate-50 rounded-xl space-y-1">
                                                    <span className="text-[9px] text-slate-400 block font-semibold">رقم الحساب الشخصي:</span>
                                                    <p className="text-slate-900 font-mono m-0">{selectedEmployee.bankAccount || '202998811223'}</p>
                                                </div>
                                                <div className="p-2 bg-slate-50 rounded-xl space-y-1">
                                                    <span className="text-[9px] text-slate-400 block font-semibold">الآيبان البنكي الصريح (IBAN Certified):</span>
                                                    <p className="text-indigo-950 font-black font-mono tracking-widest text-[11px] m-0">{selectedEmployee.bankIban || 'KW71KUFN00002029988112'}</p>
                                                </div>
                                                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-2xl text-[10px] font-semibold leading-relaxed">
                                                    <strong>الامتناع من الغرامات:</strong> تُضخ رواتب العاملين إلكترونياً بالتنسيق التلقائي المباشر مع البنك المركزي الكويتي لتفادي مخالفات شؤون القوى العاملة.
                                                </div>
                                            </div>
                                        </Card>

                                        {/* Inter-portal Loans list */}
                                        <Card className="p-5 bg-white border border-slate-200 rounded-3xl space-y-3 col-span-1 md:col-span-2">
                                            <h3 className="text-xs font-black text-indigo-950 m-0 border-b pb-2 flex items-center justify-between">
                                                <span className="flex items-center gap-1.5">
                                                    <Clock className="w-4 h-4 text-indigo-600" />
                                                    الربط المالي للقروض والسلف الجارية (التحويل البيني)
                                                </span>
                                                <span className="text-[9px] bg-indigo-50 hover:bg-indigo-100 rounded-xl px-2.5 py-1 text-indigo-800 font-black border">سجل السلف والتسويات</span>
                                            </h3>
                                            
                                            <div className="space-y-2">
                                                {activeLoans.length === 0 ? (
                                                    <p className="text-[11px] text-slate-400 py-6 text-center">لا توجد سلف أو قروض جارية مسجلة على ذمة الموظف.</p>
                                                ) : (
                                                    activeLoans.map((ln, idx) => (
                                                        <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-bold leading-normal">
                                                            <div>
                                                                <p className="text-slate-900 m-0 font-black">أصل السلفة: ({ln.amount} د.ك)</p>
                                                                <span className="text-[9px] text-slate-400 block font-semibold leading-none mt-1">القسط الشهري: {ln.monthlyInstallment} د.ك | تاريخ البدء: {ln.startDate}</span>
                                                            </div>
                                                            <div className="text-left">
                                                                <p className="text-slate-900 m-0 font-black">المتبقي للتسوية: <span className="text-rose-600 font-mono font-black">{ln.balanceAmount} دينار كويتي</span></p>
                                                                <span className="text-[8px] bg-emerald-50 text-emerald-700 font-extrabold px-2 py-0.5 rounded leading-none mt-1 inline-block uppercase">{ln.status}</span>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </Card>
                                    </div>
                                )}

                                {/* TAB 4: LEAVE REQUESTS */}
                                {activeTab === 'profile_leaves' && (
                                    <Card className="p-5 bg-white border border-slate-200 rounded-3xl space-y-4">
                                        <div className="border-b pb-3 flex justify-between items-center">
                                            <div className="space-y-0.5">
                                                <h3 className="text-xs font-black text-indigo-950 m-0 flex items-center gap-1.5">
                                                    <Calendar className="w-4 h-4 text-indigo-600" />
                                                    رصيد وسيرة الإجازات القانونية والغياب غير المبرر
                                                </h3>
                                                <p className="text-[10px] text-slate-400 m-0">الحقوق السنوية منصوص عليها بالمادة 70 من قانون العمل الكويتي (30 يوماً مأجورة سنوياً).</p>
                                            </div>
                                            <div className="flex gap-2 text-xs font-bold leading-none">
                                                <div className="p-2 bg-emerald-50 text-emerald-800 rounded-lg text-center">
                                                    <span className="text-[9px] block text-slate-400 font-semibold mb-0.5">رصيد سنوي متاح:</span>
                                                    <span className="font-mono font-black">{(selectedEmployee.annualLeaveEntitlement || 30) + (selectedEmployee.carriedOverBalance || 0)} يوم</span>
                                                </div>
                                                <div className="p-2 bg-rose-50 text-rose-800 rounded-lg text-center">
                                                    <span className="text-[9px] block text-slate-400 font-semibold mb-0.5">الغياب المثبت:</span>
                                                    <span className="font-mono font-black text-rose-600">{selectedEmployee.absenceDays || 0} يوم</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            {activeLeaveRequests.length === 0 ? (
                                                <p className="text-[11px] text-slate-400 py-8 text-center bg-slate-50 rounded-2xl">سجل إجازات الموظف خالٍ من الطلبات النشطة أو السابقة.</p>
                                            ) : (
                                                activeLeaveRequests.map((lv, idx) => (
                                                    <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-bold leading-normal">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="px-1.5 py-0.5 rounded text-[8px] bg-indigo-50 text-indigo-700 font-black">{lv.type}</span>
                                                                <p className="text-slate-900 m-0 font-black">المدة: {lv.days} يوماً عمالياً</p>
                                                            </div>
                                                            <span className="text-[9px] text-slate-400 block font-semibold leading-none mt-1">تاريخ المغادرة والعودة: من {lv.startDate} إلى {lv.endDate}</span>
                                                        </div>
                                                        <div className="text-left space-y-1">
                                                            <p className="text-slate-500 text-[10px] m-0 max-w-xs">{lv.reason || 'إجازة للاستجمام السنوي'}</p>
                                                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${lv.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : lv.status === 'Pending' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                                                                {lv.status === 'Approved' ? 'مقبولة ومعتمدة' : lv.status === 'Pending' ? 'معلقة للاعتماد' : 'مرفوضة'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </Card>
                                )}

                                {/* TAB 5: APPRAISALS & TRAININGS */}
                                {activeTab === 'profile_eval' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        
                                        {/* Appraisals reports */}
                                        <Card className="p-5 bg-white border border-slate-200 rounded-3xl space-y-4">
                                            <h3 className="text-xs font-black text-indigo-950 m-0 border-b pb-2 flex items-center gap-1.5">
                                                <Award className="w-4 h-4 text-indigo-650" />
                                                سجل تقييم الأداء الكفاءتي (التقاير الدورية لعدالة)
                                            </h3>
                                            
                                            <div className="space-y-3">
                                                {activeAppraisals.length === 0 ? (
                                                    <p className="text-[11px] text-slate-400 py-8 text-center bg-slate-50 rounded-2xl">لم يُقيد أي تقييم أداء رسمي ضد الموظف خلال هذا الربع.</p>
                                                ) : (
                                                    activeAppraisals.map((ev, idx) => (
                                                        <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border space-y-2 text-xs font-bold leading-normal text-slate-700">
                                                            <div className="flex justify-between items-center bg-white p-2 border rounded-xl">
                                                                <div>
                                                                    <p className="text-slate-900 m-0 font-black">{ev.period}</p>
                                                                    <span className="text-[8px] text-slate-400 block font-semibold leading-none mt-1">تاريخ المعاينة: {ev.date}</span>
                                                                </div>
                                                                <span className="text-base font-black text-indigo-650 font-mono bg-indigo-50 text-indigo-800 px-2.5 py-1 rounded-xl">
                                                                    {ev.score} / 100
                                                                </span>
                                                            </div>
                                                            <p className="text-[11px] text-slate-500 font-normal leading-relaxed m-0 mt-1"><strong>الحيثيات والتغذية الراجعة:</strong> {ev.feedback || 'أداء مستقر وملائم للتوقعات الوظيفية.'}</p>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </Card>

                                        {/* Academic and Training */}
                                        <Card className="p-5 bg-white border border-slate-200 rounded-3xl space-y-4">
                                            <h3 className="text-xs font-black text-indigo-950 m-0 border-b pb-2 flex items-center gap-1.5">
                                                <GraduationCap className="w-4 h-4 text-indigo-650" />
                                                المؤهلات العلمية والدورات التدريبية المعتمدة
                                            </h3>
                                            
                                            <div className="space-y-3">
                                                {selectedEmployee.degrees?.map((deg, idx) => (
                                                    <div key={idx} className="p-3 bg-white border rounded-xl space-y-1 text-xs font-bold leading-normal">
                                                        <p className="text-slate-900 m-0 font-black">{deg.title} في {deg.major}</p>
                                                        <p className="text-[10px] text-slate-400 font-semibold m-0 leading-none mt-1">{deg.school} • سنة التخرج: {deg.year}</p>
                                                    </div>
                                                ))}

                                                {selectedEmployee.trainings?.length > 0 ? (
                                                    selectedEmployee.trainings.map((tr, idx) => (
                                                        <div key={idx} className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-1 text-xs font-bold leading-normal">
                                                            <p className="text-amber-900 m-0 font-black">دورة: {tr.title}</p>
                                                            <p className="text-[10px] text-amber-950/75 m-0 leading-none mt-1">الجهة: {tr.provider} • المدة: {tr.duration}</p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-3 bg-slate-50 rounded-xl text-[10px] font-semibold text-slate-500 leading-relaxed text-right">
                                                        لا توجد شهادات دورات تدريبية معتمدة ملحقة بملفه الرقمي مؤخراً.
                                                    </div>
                                                )}
                                            </div>
                                        </Card>
                                    </div>
                                )}

                                {/* TAB 6: LEGAL & DISCIPLINARY */}
                                {activeTab === 'profile_legal' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        
                                        {/* Active and historical investigations (From alwagayan_investigations) */}
                                        <Card className="p-5 bg-white border border-slate-200 rounded-3xl space-y-4">
                                            <div className="flex justify-between items-center border-b pb-2">
                                                <h3 className="text-xs font-black text-rose-950 m-0 flex items-center gap-1.5">
                                                    <Scale className="w-4 h-4 text-rose-650" />
                                                    التحقيقات الإدارية والشكاوى النشطة والمسواة
                                                </h3>
                                                <span className="text-[10px] bg-rose-50 border border-rose-200 rounded-full px-2 py-0.5 font-black font-mono text-rose-700">
                                                    شكوى ({activeInvestigations.length})
                                                </span>
                                            </div>

                                            <div className="space-y-3 max-h-[300px] overflow-y-auto">
                                                {activeInvestigations.length === 0 ? (
                                                    <p className="text-[11px] text-slate-400 py-8 text-center bg-slate-50 rounded-2xl">لم تُسجل أي تحقيقات إدارية ضد الموظف في لوحة "عدالة" سابقاً.</p>
                                                ) : (
                                                    activeInvestigations.map((inv, idx) => (
                                                        <div key={idx} className="p-3.5 bg-slate-50 border rounded-2xl space-y-2 text-xs font-bold leading-normal">
                                                            <div className="flex justify-between items-center bg-white p-2 border rounded-xl">
                                                                <span className="font-mono text-slate-900 font-extrabold">{inv.caseNumber}</span>
                                                                <span className="text-[9px] text-slate-400">{inv.date}</span>
                                                            </div>
                                                            <p className="text-slate-900 m-0"><strong>مضمون الشكوى:</strong> {inv.violations}</p>
                                                            <p className="text-[10px] text-slate-500 font-normal leading-relaxed m-0 mt-1"><strong>النتيجة النهائية والشهود:</strong> {inv.details}</p>
                                                            <div className="flex justify-end pt-1">
                                                                <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded ${inv.status === 'Closed' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                                                    {inv.status === 'Closed' ? '✓ مغلقة ومنتهية' : '● شكوى مفتوحة وتحقيق جارٍ'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </Card>

                                        {/* Disciplinary records (From alwagayan_disciplinary) */}
                                        <Card className="p-5 bg-white border border-slate-200 rounded-3xl space-y-4">
                                            <div className="flex justify-between items-center border-b pb-2">
                                                <h3 className="text-xs font-black text-amber-950 m-0 flex items-center gap-1.5">
                                                    <ShieldAlert className="w-4 h-4 text-amber-650" />
                                                    سجل الجزاءات والتظلمات والإنذارات المفروضة لائحياً
                                                </h3>
                                                <span className="text-[10px] bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 font-black font-mono text-amber-700">
                                                    جزاء ({activeDisciplinary.length})
                                                </span>
                                            </div>

                                            <div className="space-y-3 max-h-[300px] overflow-y-auto">
                                                {activeDisciplinary.length === 0 ? (
                                                    <p className="text-[11px] text-slate-400 py-8 text-center bg-slate-50 rounded-2xl">ملف عقوبات الموظف خالٍ تماماً من الإنذارات أو لفت النظر المكتبي.</p>
                                                ) : (
                                                    activeDisciplinary.map((disc, idx) => (
                                                        <div key={idx} className="p-3.5 bg-amber-500/5 border border-amber-500/10 rounded-2xl space-y-2 text-xs font-bold leading-normal text-amber-950">
                                                            <div className="flex justify-between items-center">
                                                                <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-amber-500/20">{disc.recordNumber}</span>
                                                                <span className="text-[9px] font-black">{disc.date}</span>
                                                            </div>
                                                            <p className="m-0"><strong>الجزاء المفروض:</strong> <span className="underline">{disc.sanctionType}</span></p>
                                                            <p className="text-[10px] text-amber-900/80 font-normal leading-relaxed m-0 mt-1"><strong>السبب القانوني:</strong> {disc.details}</p>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </Card>
                                    </div>
                                )}

                                {/* TAB 7: INDEMNITY & DIGITAL FILES ARCHIVE */}
                                {activeTab === 'profile_indemnity' && (
                                    <div className="space-y-6">
                                        
                                        {/* State of Kuwait Indemnity calculations preview card */}
                                        <Card className="p-6 bg-white border border-indigo-100 rounded-[2rem] shadow-sm space-y-4">
                                            <div className="border-b pb-3 space-y-1">
                                                <h3 className="text-sm font-black text-indigo-950 m-0 flex items-center gap-2">
                                                    <History className="w-5 h-5 text-indigo-650 animate-pulse" />
                                                    تصفية وحساب مستحقات مكافأة نهاية الخدمة (قانون العمل الكويتي مادة 51)
                                                </h3>
                                                <p className="text-xs text-slate-500 m-0">آلية تصفية الحسابات والتعاقدات عمالياً في مكاتب دولة الكويت وفق المدة الأساسية للراتب والبدلات.</p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-right">
                                                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
                                                    <span className="text-[10px] text-slate-400 font-extrabold block">المديات الإجمالية للخدمة الفنية بالمكتب:</span>
                                                    <p className="text-xl font-black text-indigo-950 font-mono m-0 mt-1">{computedIndemnity.totalYears} سنة • {computedIndemnity.totalMonths} شهور</p>
                                                    <span className="text-[9px] text-slate-400 block pt-1 border-t border-dashed mt-2 leading-none">تُقرأ كلياً من تاريخ المباشرة {selectedEmployee.joiningDate}</span>
                                                </div>

                                                <div className="p-4 bg-indigo-600 text-white rounded-2xl space-y-1 shadow-md shadow-indigo-600/10">
                                                    <span className="text-[10px] text-indigo-200 font-extrabold block">قيمة التصفية التقديرية (إنهاء الخدمة):</span>
                                                    <p className="text-2xl font-black font-mono m-0 mt-1">{computedIndemnity.sum.toLocaleString()} دينار كويتي</p>
                                                    <span className="text-[9px] text-amber-300 font-black block pt-1 border-t border-indigo-500 mt-2 leading-none">مكافأة تامة بنسبة 100% وفق المادة 51</span>
                                                </div>

                                                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
                                                    <span className="text-[10px] text-slate-400 font-extrabold block">قيمة المكافأة في حال الاستقالة الطوعية:</span>
                                                    <p className="text-xl font-black text-rose-600 font-mono m-0 mt-1">{computedIndemnity.resignationSum.toLocaleString()} د.ك</p>
                                                    <span className="text-[9px] text-rose-900/60 font-black block pt-1 border-t border-dashed mt-2 leading-none">مُعدلة بموجب المادة 53 من الرصيد والنسب</span>
                                                </div>
                                            </div>

                                            <div className="p-3.5 bg-amber-500/5 rounded-2xl border border-amber-500/10 text-xs text-amber-900 leading-relaxed font-bold">
                                                💡 <strong>حاشية قانونية عاجلة:</strong> يتساوى أساس حساب مكافأة التصفية عمالياً بدولة الكويت بالأجر الشامل (الراتب الأساسي بالإضافة لكافة المخصصات والبدلات ذات الطابع الثابت والمستمر التي يصرفها مكتب المحاماة للموظف). احتساب الراتب اليومي يقسم على 26 يوماً (مستوى المحكمة العمالية بدولة الكويت).
                                            </div>
                                        </Card>

                                        {/* Digital locker (Documents attachments archive) */}
                                        <Card className="p-5 bg-white border border-slate-200 rounded-3xl space-y-4">
                                            <div className="flex justify-between items-center border-b pb-2">
                                                <h3 className="text-xs font-black text-indigo-950 m-0 flex items-center gap-1.5">
                                                    <Folder className="w-4 h-4 text-indigo-600" />
                                                    خزانة المستندات والمرفقات الرقمية الذاتية للبطاقات والرخص
                                                </h3>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="h-8 rounded-lg text-[10px] font-black"
                                                    onClick={() => {
                                                        const docTitle = window.prompt("أدخل عنوان أو اسم المستند المراد إلحاقه بالملف:");
                                                        if (docTitle) {
                                                            const newAttach = {
                                                                id: `at-${Date.now()}`,
                                                                title: docTitle,
                                                                category: 'مستندات عامة للمكتب',
                                                                uploadDate: new Date().toISOString().split('T')[0],
                                                                fileType: 'pdf'
                                                            };
                                                            const updatedEmp = {
                                                                ...selectedEmployee,
                                                                attachments: [...(selectedEmployee.attachments || []), newAttach]
                                                            };
                                                            setEmployees(employees.map(e => e.id === selectedEmployee.id ? updatedEmp : e));
                                                            addToast({ type: 'success', title: 'تم رفع السند', message: `تم إدراج سند [${docTitle}] في ملف الموظف الرقمي بسلام.` });
                                                        }
                                                    }}
                                                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                                                >
                                                    إرفاق مستند جديد
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {(!selectedEmployee.attachments || selectedEmployee.attachments.length === 0) ? (
                                                    <p className="text-[11px] text-slate-400 py-6 text-center col-span-2">لا توجد صور أو ملفات هويات مرفقة بملف الموظف حالياً.</p>
                                                ) : (
                                                    selectedEmployee.attachments.map((at, idx) => (
                                                        <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center text-xs font-bold leading-normal">
                                                            <div className="flex items-center gap-2">
                                                                <FileText className="w-4 h-4 text-rose-600" />
                                                                <div>
                                                                    <p className="text-slate-900 m-0 font-black">{at.title}</p>
                                                                    <span className="text-[8px] text-slate-400 block font-semibold leading-none mt-1">تاريخ الرفع: {new Date().toLocaleDateString('ar-KW')}</span>
                                                                </div>
                                                            </div>
                                                            <button 
                                                                onClick={() => {
                                                                    const updatedAttach = selectedEmployee.attachments.filter(a => a.id !== at.id);
                                                                    const updatedEmp = { ...selectedEmployee, attachments: updatedAttach };
                                                                    setEmployees(employees.map(e => e.id === selectedEmployee.id ? updatedEmp : e));
                                                                    addToast({ type: 'success', title: 'تم الحذف', message: 'تم إزالة المرفق السحابي من ملف الهويات.' });
                                                                }}
                                                                className="text-rose-600 hover:text-rose-700 p-1.5 hover:bg-rose-50 rounded-lg border-transparent border transition-all cursor-pointer"
                                                                title="حذف المرفق"
                                                            >
                                                                <X className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </Card>

                                        {/* Audit Logs Trail Checklist */}
                                        <Card className="p-5 bg-white border border-slate-200 rounded-3xl space-y-3">
                                            <h3 className="text-xs font-black text-indigo-950 m-0 border-b pb-2 flex items-center gap-1.5">
                                                <History className="w-4 h-4 text-indigo-605" />
                                                سجل الحركات والإجراءات اللائحة لعضويات المحامين بالمجموعة
                                            </h3>
                                            
                                            <div className="space-y-2 max-h-[180px] overflow-y-auto">
                                                {selectedEmployee.historyTimeline?.length === 0 && timelineLogs.filter(t => t.employeeId === selectedEmployee.id).length === 0 ? (
                                                    <p className="text-[11px] text-slate-400 py-4 text-center">لا توجد حركات إدارية مسبقة مسجلة على هذه البطاقة.</p>
                                                ) : (
                                                    [...(selectedEmployee.historyTimeline || []), ...timelineLogs.filter(t => t.employeeId === selectedEmployee.id)]
                                                        .sort((a,b) => b.id.localeCompare(a.id))
                                                        .map((lg, idx) => (
                                                            <div key={idx} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold leading-normal flex items-start gap-2.5">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0 mt-1.5"></div>
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-mono text-[9px] text-slate-400">{lg.date}</span>
                                                                        <p className="text-slate-900 m-0 font-bold">{lg.titleAr}</p>
                                                                    </div>
                                                                    <p className="text-[10px] text-slate-500 m-0 leading-relaxed font-normal">{lg.descriptionAr}</p>
                                                                </div>
                                                            </div>
                                                        ))
                                                )}
                                            </div>
                                        </Card>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white p-12 rounded-[2rem] text-center border text-slate-400 font-bold">يرجى قيد واختيار موظف من القوائم الجانبية لعرض وتعديل ملفه التفصيلي.</div>
                    )}
                </div>
            </div>

            {/* ====================================================
                MODAL 1: 11 PRINTABLE DOCUMENT BUILDER & WRITING CORNER
            ==================================================== */}
            <Modal
                isOpen={isDocModalOpen}
                onClose={() => setIsDocModalOpen(false)}
                title="عدالة — محرر ومعاينة المستندات والصياغة القانونية قبل الطباعة"
                size="lg"
            >
                <div className="space-y-4 pt-1 text-right" style={{ direction: 'rtl' }}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        
                        {/* Selector of 11 printable forms */}
                        <div className="lg:col-span-1 space-y-3">
                            <Card className="p-3 bg-slate-50 border rounded-2xl space-y-2">
                                <h4 className="text-xs font-black text-slate-900 border-b pb-1.5 m-0 flex items-center gap-1">
                                    <FilePlus className="w-4 h-4 text-indigo-600" />
                                    اختر نموذج الخطاب الـ 11:
                                </h4>
                                <div className="space-y-1 max-h-[220px] overflow-y-auto">
                                    {OFFICIAL_FORM_TEMPLATES.map(form => (
                                        <button
                                            key={form.id}
                                            onClick={() => {
                                                setSelectedFormId(form.id);
                                                if (selectedEmployee) {
                                                    setEditorText(form.text(selectedEmployee));
                                                }
                                            }}
                                            className={`w-full text-right px-2.5 py-1.5 text-[10px] font-black rounded-lg transition-all border block cursor-pointer ${selectedFormId === form.id ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'}`}
                                        >
                                            {form.name}
                                        </button>
                                    ))}
                                </div>
                            </Card>

                            {/* Editing Corner Controls */}
                            <Card className="p-3 bg-slate-50 border rounded-2xl space-y-2">
                                <span className="text-[10px] text-slate-500 block font-semibold">محرر الصياغة الفورية قبل الطباعة:</span>
                                
                                <div className="flex flex-wrap gap-1 border-b pb-1.5">
                                    <button 
                                        onClick={() => setEditorText(prev => prev + '\n**فقرة مهمة مكتوبة:**\n')}
                                        className="px-1.5 py-0.5 bg-white text-[9px] font-bold border rounded hover:bg-slate-150 cursor-pointer"
                                    >
                                        فقرة غليظة
                                    </button>
                                    <button 
                                        onClick={() => setEditorText(prev => prev + '\n[تاريخ المليّن: ' + new Date().toLocaleDateString('ar-KW') + ']\n')}
                                        className="px-1.5 py-0.5 bg-white text-[9px] font-bold border rounded hover:bg-slate-150 cursor-pointer"
                                    >
                                        إدراج تاريخ اليوم
                                    </button>
                                    <button 
                                        onClick={() => setEditorText(prev => prev + '\n«حرر في مكاتبنا الرئيسية ببرج الحمراء بدولة الكويت»\n')}
                                        className="px-1.5 py-0.5 bg-white text-[9px] font-bold border rounded hover:bg-slate-150 cursor-pointer"
                                    >
                                        إمضاء المرفق
                                    </button>
                                </div>

                                <textarea 
                                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-white min-h-[140px] font-medium leading-relaxed"
                                    value={editorText}
                                    onChange={e => setEditorText(e.target.value)}
                                ></textarea>
                                
                                <div className="flex gap-1">
                                    <select 
                                        className="text-[9px] font-bold bg-white border rounded px-1.5 py-1 cursor-pointer"
                                        value={fontSize}
                                        onChange={e => setFontSize(e.target.value as any)}
                                    >
                                        <option value="sm">خط صغير</option>
                                        <option value="md">خط متوسط</option>
                                        <option value="lg">خط عريض كبير</option>
                                    </select>
                                    <button 
                                        onClick={() => {
                                            if (selectedEmployee) {
                                                const currentTpl = OFFICIAL_FORM_TEMPLATES.find(t => t.id === selectedFormId);
                                                if (currentTpl) setEditorText(currentTpl.text(selectedEmployee));
                                            }
                                        }}
                                        className="px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded text-[9px] font-bold cursor-pointer text-slate-800"
                                    >
                                        إعادة ضبط نموذج
                                    </button>
                                </div>
                            </Card>
                        </div>

                        {/* Letterhead Preview Arena (Compliant with Adala Corporate) */}
                        <div className="lg:col-span-2">
                            <div className="flex justify-between items-center bg-slate-900 p-2.5 rounded-t-2xl border-b border-amber-550/25">
                                <span className="text-[10px] text-amber-400 font-bold">بوابة السندات المطبوعة لـ "عدالة"</span>
                                <Button 
                                    variant="primary" 
                                    size="sm" 
                                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 border-none font-black text-[10px] h-7 px-3 rounded" 
                                    onClick={() => {
                                        window.print();
                                        addToast({ type: 'success', title: 'تمت الطباعة', message: 'يرسل السند لإعدادات ورأس الطباعة بالبوابة.' });
                                    }}
                                    leftIcon={<Printer className="w-3.5 h-3.5" />}
                                >
                                    طباعة المستند الموثق
                                </Button>
                            </div>
                            
                            <div id="printableArea" className="bg-white p-6 rounded-b-2xl border text-slate-900 border-slate-200 overflow-y-auto max-h-[350px] font-sans">
                                
                                {/* Corporate Header */}
                                <div className="flex justify-between items-start border-b-2 border-slate-950 pb-4 mb-4 text-xs text-slate-700 leading-normal gap-4">
                                    <div className="text-left font-sans font-medium">
                                        <p className="font-extrabold uppercase text-slate-950 mb-0.5 text-[10px]">AlWagayan, AlAbdullah & Partners</p>
                                        <p className="m-0 text-[9px] text-slate-500">Law Firm & Legal Consultants - Kuwait</p>
                                        <p className="font-mono text-[9px] tracking-widest mt-1 m-0">Ref: <span className="font-black text-slate-950">ADL-REP-2026-{selectedEmployee?.employeeId || '992'}</span></p>
                                    </div>
                                    <div className="text-center shrink-0">
                                        <div className="w-9 h-9 bg-slate-950 text-white rounded-full flex items-center justify-center font-black mx-auto mb-1 text-xs border border-amber-500 shadow-sm">عـدالة</div>
                                        <p className="font-black text-slate-900 text-[10px] m-0">مكتب ألوقيان والعبدالله للمحاماة</p>
                                        <p className="text-[8px] text-slate-500 font-semibold m-0">بوابة الكوادر والامتثال المتبادل</p>
                                    </div>
                                    <div className="text-right font-medium">
                                        <p className="font-extrabold text-slate-950 mb-0.5 text-[10px]">تاريخ الصياغة: {new Date().toLocaleDateString('ar-KW')}</p>
                                        <p className="m-0 text-[9px] text-slate-500">الكويت، برج الحمراء الدولي، دور 35</p>
                                        <p className="text-[9px] text-slate-500 font-black m-0">هاتف: +965 1800112</p>
                                    </div>
                                </div>

                                {/* Text content printed directly */}
                                <div className={`min-h-[160px] leading-relaxed text-slate-800 whitespace-pre-wrap font-medium pb-4 ${fontSize === 'sm' ? 'text-[10px]' : fontSize === 'lg' ? 'text-sm' : 'text-xs'}`}>
                                    {editorText}
                                </div>

                                {/* Signatures fields */}
                                <div className="grid grid-cols-2 text-center mt-6 pt-4 border-t border-dashed border-slate-200 text-[9px] font-black text-slate-500 leading-relaxed">
                                    <div>
                                        <p className="m-0">الشريك المدير / الطرف الأول المفوّض</p>
                                        <p className="mt-2 text-indigo-700 italic font-black text-[10px] m-0">أحمد محمود العبدالله</p>
                                        <span className="text-[7px] text-slate-400 block font-normal mt-1 leading-none">توقيع وختم رعاية الكوادر عمالياً</span>
                                    </div>
                                    <div>
                                        <p className="m-0">الموظف المعني / الطرف الثاني بالولاية</p>
                                        <p className="mt-4 text-slate-350 m-0 text-[10px]">............................................................</p>
                                        <span className="text-[7px] text-slate-400 block font-normal mt-1 leading-none">اسم وتوقيع الموظف للاستلام والقبول يدوياً</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </Modal>

            {/* ====================================================
                MODAL 2: ADD / EDIT EMPLOYEE DETAILED PROFILE
            ==================================================== */}
            <Modal
                isOpen={isEmpModalOpen}
                onClose={() => setIsEmpModalOpen(false)}
                title={modalMode === 'add' ? 'إضافة موظف جديد وتثبيت بطاقة كادر' : 'تحديث ملف الموظف وسجل الهويات'}
                size="lg"
            >
                <form onSubmit={handleSaveEmp} className="space-y-4 pt-1 text-right" style={{ direction: 'rtl' }}>
                    
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                        <h4 className="text-xs font-black text-indigo-950 border-b pb-1 m-0">1. البيانات الشخصية والاسمية والمدنية (کويت)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                                <label className="text-[10px] text-slate-500 font-bold block mb-1">الاسم الكامل (بالعربية)*</label>
                                <input 
                                    className="w-full text-xs font-bold bg-white border rounded-xl px-2.5 py-1.5 focus:outline-none"
                                    required
                                    value={empFormState.fullNameAr || ''}
                                    onChange={e => setEmpFormState({...empFormState, fullNameAr: e.target.value})}
                                    placeholder="فاطمة علي حسين"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-500 font-bold block mb-1">الاسم الكامل (بالإنجليزية)</label>
                                <input 
                                    className="w-full text-xs font-bold bg-white border rounded-xl px-2.5 py-1.5 focus:outline-none"
                                    value={empFormState.fullNameEn || ''}
                                    onChange={e => setEmpFormState({...empFormState, fullNameEn: e.target.value})}
                                    placeholder="FATIMA ALI HUSAIN"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-500 font-bold block mb-1">الرقم المدني الكويتي*</label>
                                <input 
                                    className="w-full text-xs font-bold bg-white border rounded-xl px-2.5 py-1.5 focus:outline-none font-mono text-left"
                                    required
                                    value={empFormState.civilId || ''}
                                    onChange={e => setEmpFormState({...empFormState, civilId: e.target.value})}
                                    placeholder="292021500123"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-500 font-bold block mb-1">انقضاء قيد البطاقة المدنية</label>
                                <input 
                                    type="date"
                                    className="w-full text-xs font-bold bg-white border rounded-xl px-2 py-1 focus:outline-none font-mono"
                                    value={empFormState.civilIdExpiry || ''}
                                    onChange={e => setEmpFormState({...empFormState, civilIdExpiry: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-500 font-bold block mb-1">الجنسية</label>
                                <input 
                                    className="w-full text-xs font-bold bg-white border rounded-xl px-2.5 py-1.5 focus:outline-none"
                                    value={empFormState.nationality || ''}
                                    onChange={e => setEmpFormState({...empFormState, nationality: e.target.value})}
                                    placeholder="كويتي"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-500 font-bold block mb-1">رقم الهاتف النقال</label>
                                <input 
                                    className="w-full text-xs font-bold bg-white border rounded-xl px-2.5 py-1.5 focus:outline-none font-mono"
                                    value={empFormState.phone || ''}
                                    onChange={e => setEmpFormState({...empFormState, phone: e.target.value})}
                                    placeholder="965988112"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                        <h4 className="text-xs font-black text-indigo-950 border-b pb-1 m-0">2. البيانات السلوكية، التوظيف المالي والعهد</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                                <label className="text-[10px] text-slate-500 font-bold block mb-1">المسمى الوظيفي المسجل</label>
                                <input 
                                    className="w-full text-xs font-bold bg-white border rounded-xl px-2.5 py-1.5 focus:outline-none"
                                    value={empFormState.jobTitle || ''}
                                    onChange={e => setEmpFormState({...empFormState, jobTitle: e.target.value})}
                                    placeholder="محام ومستشار"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-500 font-bold block mb-1">القسم الفني والتوظيفي</label>
                                <select 
                                    className="w-full text-xs font-bold bg-white border rounded-xl px-2 py-1.5 focus:outline-none cursor-pointer"
                                    value={empFormState.department || 'Consultation'}
                                    onChange={e => setEmpFormState({...empFormState, department: e.target.value})}
                                >
                                    <option value="Consultation">الاستشارات والمرافعات</option>
                                    <option value="Litigation">التقاضي والإعلانات</option>
                                    <option value="Finance">الحسابات والمالية</option>
                                    <option value="HR">الموارد البشرية</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-500 font-bold block mb-1">الراتب الأساسي الشهري (د.ك)*</label>
                                <input 
                                    type="number"
                                    className="w-full text-xs font-bold bg-white border rounded-xl px-2.5 py-1.5 focus:outline-none font-mono"
                                    required
                                    value={empFormState.basicSalary || ''}
                                    onChange={e => setEmpFormState({...empFormState, basicSalary: Number(e.target.value)})}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-500 font-bold block mb-1">انضمام ومباشرة أول دوام</label>
                                <input 
                                    type="date"
                                    className="w-full text-xs font-bold bg-white border rounded-xl px-2 py-1 focus:outline-none font-mono"
                                    value={empFormState.joiningDate || ''}
                                    onChange={e => setEmpFormState({...empFormState, joiningDate: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-500 font-bold block mb-1">نوع التعاقد عمالياً</label>
                                <select 
                                    className="w-full text-xs font-bold bg-white border rounded-xl px-2 py-1.5 focus:outline-none cursor-pointer"
                                    value={empFormState.contractType || ContractTypeKuwait.UNLIMITED}
                                    onChange={e => setEmpFormState({...empFormState, contractType: e.target.value as any})}
                                >
                                    <option value={ContractTypeKuwait.UNLIMITED}>غير محدد المدة</option>
                                    <option value={ContractTypeKuwait.LIMITED}>محدد المدة</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-500 font-bold block mb-1">البنك لتوطين الراتب (WPS)</label>
                                <input 
                                    className="w-full text-xs font-bold bg-white border rounded-xl px-2.5 py-1.5 focus:outline-none"
                                    value={empFormState.bankName || ''}
                                    onChange={e => setEmpFormState({...empFormState, bankName: e.target.value})}
                                    placeholder="بيت التمويل الكويتي"
                                />
                            </div>
                            <div className="col-span-1 md:col-span-3">
                                <label className="text-[10px] text-slate-500 font-bold block mb-1">العنوان والمرفق المدني بالمحافظة</label>
                                <input 
                                    className="w-full text-xs font-bold bg-white border rounded-xl px-2.5 py-1.5 focus:outline-none"
                                    value={empFormState.address || ''}
                                    onChange={e => setEmpFormState({...empFormState, address: e.target.value})}
                                    placeholder="الكويت، الفروانية، قطعة 5، شارع حبيب المناور، منزل 12"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t">
                        <Button variant="outline" size="sm" type="button" onClick={() => setIsEmpModalOpen(false)}>إلغاء الأمر</Button>
                        <Button variant="primary" size="sm" className="bg-slate-950 hover:bg-slate-900 text-amber-400 border-none font-black px-6" type="submit">حفظ وتأمين السجل</Button>
                    </div>
                </form>
            </Modal>

        </div>
    );
};

export default EmployeeProfilePage;
