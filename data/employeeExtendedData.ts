import { Employee, ContractTypeKuwait } from '../types';

export interface ExtendedEmployee extends Employee {
  // Enhanced arrays
  leaveRequests: Array<{
    id: string;
    type: string;
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    requestedAt: string;
    approvals: Array<{ role: string; name: string; date: string }>;
  }>;
  attendanceLogs: Array<{
    date: string;
    checkIn: string;
    checkOut: string;
    status: 'Present' | 'Late' | 'Absent' | 'OnLeave';
    delayMinutes: number;
  }>;
  disciplinaryActions: Array<{
    id: string;
    violationDate: string;
    violationType: string;
    violationDetails: string;
    penalty: string;
    authorityDeciding: string;
    status: 'Pending' | 'Approved' | 'Appealed';
    penaltyAmount?: number;
    warningsIssued?: string;
  }>;
  investigations: Array<{
    id: string;
    caseNumber: string;
    date: string;
    subject: string;
    investigator: string;
    results: string;
    recommendations: string;
    status: 'Open' | 'Closed' | 'Archived';
    penaltyProposed?: string;
    approvedBy?: string;
  }>;
  loans: Array<{
    id: string;
    principalAmount: number;
    monthlyInstallment: number;
    balanceAmount: number;
    issueDate: string;
    maturityDate: string;
    status: 'Active' | 'Paid' | 'Delayed';
    payments: Array<{ date: string; amount: number; installmentNum: number }>;
  }>;
  evaluations: Array<{
    id: string;
    period: string;
    date: string;
    overallScore: number;
    qualitativeFeedback: string;
    objectivesMet: string[];
    criteriaScores: {
      communication: number;
      teamwork: number;
      qualityOfWork: number;
      speed: number;
      adherenceToLaw: number;
    };
    evaluatorName: string;
  }>;
  administrativeRequests: Array<{
    id: string;
    type: string;
    details: string;
    requestedDate: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    hrNotes?: string;
  }>;
  historyTimeline: Array<{
    id: string;
    date: string;
    category: 'Hiring' | 'Promotion' | 'Bonus' | 'Investigation' | 'Warning' | 'Request' | 'Upload' | 'Leave' | 'Loan';
    titleAr: string;
    titleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    performedBy: string;
  }>;
  legalNotes: Array<{
    id: string;
    date: string;
    author: string;
    noteText: string;
  }>;
}

export const initialExtendedEmployees: ExtendedEmployee[] = [
  {
    id: 'emp-101',
    employeeId: 'EMP-1001',
    fullNameAr: 'أحمد محمود العبدالله',
    fullNameEn: 'Ahmed Mahmoud Al-Abdullah',
    civilId: '285010112345',
    nationality: 'كويتي',
    jobTitle: 'Managing Partner',
    department: 'Senior Management',
    joiningDate: '2010-01-01',
    contractType: ContractTypeKuwait.UNLIMITED,
    basicSalary: 4500,
    allowances: [{ name: 'بدل مدير شريك', value: 1500, subjectToIndemnity: true }],
    email: 'ahmed.m@alwagayan.com',
    phone: '99001122',
    status: 'Active',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    gender: 'Male',
    socialStatus: 'Married',
    dateOfBirth: '1980-05-15',
    address: 'الخالدية، قطعة 2، شارع 21، منزل 5',
    bankName: 'بنك الكويت الوطني (NBK)',
    bankIban: 'KW65NBOK0000000123456789',
    branch: 'Main',
    jobGrade: 'A1',
    contractStartDate: '2010-01-01',
    workHoursPerDay: 8,
    workSystem: 'دوام كامل',
    restDays: ['Friday', 'Saturday'],
    civilIdExpiry: '2026-12-30',
    passportExpiry: '2028-01-01',
    residencyExpiry: '2026-12-30',
    workPermitExpiry: '2026-12-30',
    socialSecurityNumber: 'SS-90087711',
    healthInsuranceNumber: 'HI-Kuwait-5544',
    bloodType: 'O+',
    managerName: 'مجلس الإدارة',
    emergencyContact: {
      name: 'محمود العبدالله (الأب)',
      phone: '99887766'
    },
    // Sub-records
    leaveRequests: [
      {
        id: 'lv-101',
        type: 'إجازة سنوية',
        startDate: '2026-07-01',
        endDate: '2026-07-15',
        days: 15,
        reason: 'إجازة الصيف السنوية العادية',
        status: 'Approved',
        requestedAt: '2026-05-10',
        approvals: [
          { role: 'شريك أول', name: 'خالد المنصور', date: '2026-05-12' }
        ]
      }
    ],
    attendanceLogs: [
      { date: '2026-05-22', checkIn: '08:00', checkOut: '16:00', status: 'Present', delayMinutes: 0 },
      { date: '2026-05-21', checkIn: '08:15', checkOut: '16:00', status: 'Late', delayMinutes: 15 },
      { date: '2026-05-20', checkIn: '07:55', checkOut: '16:05', status: 'Present', delayMinutes: 0 }
    ],
    disciplinaryActions: [],
    investigations: [],
    loans: [
      {
        id: 'ln-101',
        principalAmount: 5000,
        monthlyInstallment: 500,
        balanceAmount: 1500,
        issueDate: '2025-10-01',
        maturityDate: '2026-08-01',
        status: 'Active',
        payments: [
          { date: '2025-11-01', amount: 500, installmentNum: 1 },
          { date: '2025-12-01', amount: 500, installmentNum: 2 },
          { date: '2026-01-01', amount: 500, installmentNum: 3 },
          { date: '2026-02-01', amount: 500, installmentNum: 4 },
          { date: '2026-03-01', amount: 500, installmentNum: 5 },
          { date: '2026-04-01', amount: 500, installmentNum: 6 },
          { date: '2026-05-01', amount: 500, installmentNum: 7 }
        ]
      }
    ],
    evaluations: [
      {
        id: 'ev-101',
        period: 'التقييم السنوي لعام 2025',
        date: '2025-12-15',
        overallScore: 98,
        qualitativeFeedback: 'قيادة استثنائية للقسم وتطور ملحوظ في الفوز بالقضايا الكبرى وكتابة الاستشارات بالغة الأهمية.',
        objectivesMet: ['تخطيط الإيرادات العامة وبناء محفظة العملاء', 'متابعة شؤون الموظفين والامتثال'],
        criteriaScores: {
          communication: 5,
          teamwork: 5,
          qualityOfWork: 5,
          speed: 4.8,
          adherenceToLaw: 5
        },
        evaluatorName: 'اللجنة العليا لتقييم الشركاء'
      }
    ],
    administrativeRequests: [
      {
        id: 'req-101',
        type: 'شهادة راتب',
        details: 'لتقديمها للهيئة العامة للقوى العاملة في الكويت',
        requestedDate: '2026-05-18',
        status: 'Approved',
        hrNotes: 'تم تسليم الشهادة الرسمية مختومة بختم الشركة وموقعة.'
      }
    ],
    historyTimeline: [
      {
        id: 'h-1',
        date: '2010-01-01',
        category: 'Hiring',
        titleAr: 'التعيين بالمنشأة',
        titleEn: 'Hired at Company',
        descriptionAr: 'الانضمام إلى المكتب وتأسيس الشراكة الإدارية',
        descriptionEn: 'Joined company as managing partner and registered at chamber of commerce',
        performedBy: 'تأسيس المنشأة'
      },
      {
        id: 'h-2',
        date: '2025-10-01',
        category: 'Loan',
        titleAr: 'سلفة مالية معتمدة',
        titleEn: 'Approved Salary Advance',
        descriptionAr: 'الموافقة على صرف سلفة إدارية بقيمة 5000 دينار كويتي بقرار مجلس الإدارة',
        descriptionEn: 'Approved administrative cash advance of 5000 KWD payable in installments',
        performedBy: 'الشؤون المالية'
      }
    ],
    legalNotes: [
      {
        id: 'note-101',
        date: '2026-05-15',
        author: 'خالد المنصور (شريك)',
        noteText: 'متابعة دورية ممتازة لكافة ملفات الاستشارات مع الالتزام التام بالتعليمات واللوائح العقدية.'
      }
    ]
  },
  {
    id: 'emp-102',
    employeeId: 'EMP-1002',
    fullNameAr: 'مريم ناصر الصقر',
    fullNameEn: 'Maryam Nasser Al-Saqer',
    civilId: '292040556789',
    nationality: 'كويتي',
    jobTitle: 'Senior Consultant',
    department: 'Consultation',
    joiningDate: '2015-06-15',
    contractType: ContractTypeKuwait.LIMITED,
    contractDuration: '2 سنة',
    contractStartDate: '2024-06-15',
    contractEndDate: '2026-06-15',
    basicSalary: 2800,
    allowances: [
      { name: 'بدل سكن', value: 400, subjectToIndemnity: true },
      { name: 'بدل انتقال', value: 100, subjectToIndemnity: false }
    ],
    email: 'm.alsaqer@alwagayan.com',
    phone: '66554433',
    status: 'Active',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
    gender: 'Female',
    socialStatus: 'Single',
    dateOfBirth: '1992-04-05',
    address: 'شبه المنحرف، السالمية، قطعة 4، شارع 12',
    bankName: 'بنك بوبيان (Boubyan)',
    bankIban: 'KW45BBYN0000000234567890',
    branch: 'Main',
    jobGrade: 'B1',
    workHoursPerDay: 8,
    workSystem: 'دوام كامل',
    restDays: ['Friday', 'Saturday'],
    civilIdExpiry: '2026-12-30',
    passportExpiry: '2028-01-01',
    residencyExpiry: '2026-12-30',
    workPermitExpiry: '2026-12-30',
    socialSecurityNumber: 'SS-81203049',
    healthInsuranceNumber: 'HI-Kuwait-1209',
    bloodType: 'A-',
    managerName: 'أحمد محمود العبدالله',
    emergencyContact: {
      name: 'ناصر الصقر (الأب)',
      phone: '66005544'
    },
    leaveRequests: [
      {
        id: 'lv-102',
        type: 'إجازة مرضية',
        startDate: '2026-03-10',
        endDate: '2026-03-12',
        days: 3,
        reason: 'عارض صحي مفاجئ مع تقديم تقرير طبي مصدق',
        status: 'Approved',
        requestedAt: '2026-03-10',
        approvals: [
          { role: 'HR Manager', name: 'سارة خالد العتيبي', date: '2026-03-10' }
        ]
      }
    ],
    attendanceLogs: [
      { date: '2026-05-22', checkIn: '08:00', checkOut: '16:00', status: 'Present', delayMinutes: 0 }
    ],
    disciplinaryActions: [],
    investigations: [],
    loans: [],
    evaluations: [
      {
        id: 'ev-102',
        period: 'التقييم النصفي لعام 2026',
        date: '2026-04-15',
        overallScore: 94,
        qualitativeFeedback: 'أخصائية قانونية متمكنة، مذكرات الاستشارات التي تقدمها تتميز بالدقة الشديدة والاستقصاء الوافي للثغرات.',
        objectivesMet: ['إتمام صياغة 20 عقد تأسيس لشركات مساهمة مقفلة', 'تقليص زمن الاستجابة للاستشارات العاجلة'],
        criteriaScores: {
          communication: 4.8,
          teamwork: 4.5,
          qualityOfWork: 5,
          speed: 4.5,
          adherenceToLaw: 5
        },
        evaluatorName: 'أحمد محمود العبدالله'
      }
    ],
    administrativeRequests: [
      {
        id: 'req-102',
        type: 'طلب تجديد العقد السنوي',
        details: 'الرغبة في المتابعة وتجديد العقد لمدة سنتين إضافيتين بمزايا إضافية',
        requestedDate: '2026-05-02',
        status: 'Pending'
      }
    ],
    historyTimeline: [
      {
        id: 'h-3',
        date: '2015-06-15',
        category: 'Hiring',
        titleAr: 'تاريخ التعيين المعتمد',
        titleEn: 'Hired in Consultation',
        descriptionAr: 'الانضمام كباحث استشاري قانوني بالقسم المالي',
        descriptionEn: 'Joined Consultation department as a legal researcher',
        performedBy: 'إدارة الموارد البشرية'
      }
    ],
    legalNotes: []
  },
  {
    id: 'emp-103',
    employeeId: 'EMP-1003',
    fullNameAr: 'فهد محمد الشمري',
    fullNameEn: 'Fahad Mohammed Al-Shammari',
    civilId: '295080811223',
    nationality: 'كويتي',
    jobTitle: 'Appeals Lawyer',
    department: 'Litigation',
    joiningDate: '2019-09-01',
    contractType: ContractTypeKuwait.UNLIMITED,
    basicSalary: 1900,
    allowances: [{ name: 'بدل ترافع', value: 350, subjectToIndemnity: true }],
    email: 'f.alshammari@alwagayan.com',
    phone: '55443322',
    status: 'Active',
    gender: 'Male',
    socialStatus: 'Single',
    dateOfBirth: '1995-08-08',
    address: 'الجهراء، قطعة 3، شارع 4، قسيمة 19',
    bankName: 'بيت التمويل الكويتي (KFH)',
    bankIban: 'KW23KFH00000003456789012',
    branch: 'Jahra',
    jobGrade: 'C2',
    workHoursPerDay: 8,
    workSystem: 'دوام كامل',
    restDays: ['Friday', 'Saturday'],
    civilIdExpiry: '2026-08-08',
    passportExpiry: '2029-05-11',
    residencyExpiry: '2026-08-08',
    workPermitExpiry: '2026-08-08',
    socialSecurityNumber: 'SS-90038822',
    healthInsuranceNumber: 'HI-Kuwait-4889',
    bloodType: 'B+',
    managerName: 'أحمد محمود العبدالله',
    emergencyContact: {
      name: 'محمد الشمري (الأب)',
      phone: '55667788'
    },
    // Adding active elements like an investigation and warnings
    disciplinaryActions: [
      {
        id: 'disc-101',
        violationDate: '2026-05-02',
        violationType: 'تأخر متكرر وعدم تسليم المستندات',
        violationDetails: 'التأخر عن حضور جلسة الاستماع بمحكمة مرور حولي مما تسبب في غياب دفاع الموكل وتأجيل الدعوى.',
        penalty: 'إنذار كتابي أول مع خصم راتب يومين من البدلات',
        authorityDeciding: 'الشؤون القانونية والموارد البشرية',
        status: 'Approved',
        penaltyAmount: 120
      }
    ],
    investigations: [
      {
        id: 'inv-101',
        caseNumber: 'INV-2026-042',
        date: '2026-05-04',
        subject: 'تأخير متعمد في صياغة مذكرة محكمة التمييز',
        investigator: 'أحمد محمود العبدالله (الشريك المدير)',
        results: 'ثبت تقاعس الموظف عن صياغة المذكرة لأسابيع مع توفر كافة الملفات القضائية وتقديم معلومات مضللة.',
        recommendations: 'توجيه إنذار رسمي كتابي لعدم الإخلال بواجب الدفاع تحت طائلة المساءلة القانونية.',
        status: 'Closed',
        penaltyProposed: 'خصم يومين من الراتب الأساسي',
        approvedBy: 'سارة خالد العتيبي (HR)'
      }
    ],
    leaveRequests: [
      {
        id: 'lv-103',
        type: 'إجازة طارئة',
        startDate: '2026-05-24',
        endDate: '2026-05-25',
        days: 2,
        reason: 'ظروف عائلية حرجة وصيانة طارئة للمنزل',
        status: 'Pending',
        requestedAt: '2026-05-21',
        approvals: []
      }
    ],
    attendanceLogs: [
      { date: '2026-05-22', checkIn: '08:02', checkOut: '16:00', status: 'Present', delayMinutes: 0 }
    ],
    loans: [
      {
        id: 'ln-102',
        principalAmount: 1500,
        monthlyInstallment: 150,
        balanceAmount: 1050,
        issueDate: '2026-05-15',
        maturityDate: '2027-03-15',
        status: 'Active',
        payments: []
      }
    ],
    evaluations: [
      {
        id: 'ev-103',
        period: 'التقييم السنوي لعام 2025',
        date: '2025-12-20',
        overallScore: 82,
        qualitativeFeedback: 'محام واعد ذو مهارة متميزة في الترافع الشفهي، لكنه غير ملتزم بمواعيد تقديم المذكرات التحريرية.',
        objectivesMet: ['تمثيل العملاء في 40 جلسة محكمة استئناف بمعدل كفاءة مرضٍ'],
        criteriaScores: {
          communication: 4.5,
          teamwork: 4.0,
          qualityOfWork: 3.8,
          speed: 3.5,
          adherenceToLaw: 4.5
        },
        evaluatorName: 'مدير قطاع التقاضي'
      }
    ],
    administrativeRequests: [],
    historyTimeline: [
      {
        id: 'h-4',
        date: '2019-09-01',
        category: 'Hiring',
        titleAr: 'تاريخ المباشرة بالعمل',
        titleEn: 'Hired in Litigation Department',
        descriptionAr: 'التعيين بصفة محامٍ معتمد للترافع أمام المحاكم الكلية والاستئناف',
        descriptionEn: 'Signed contract as Appeals Lawyer inside Court defense team',
        performedBy: 'HR Department'
      },
      {
        id: 'h-5',
        date: '2026-05-04',
        category: 'Investigation',
        titleAr: 'إحالة إلى تحقيق إداري',
        titleEn: 'Sent to HR Investigation',
        descriptionAr: 'بسبب الإخلال بميعاد دفاع وغياب عن جلسة مرورية مصيرية بتقرير مستشار القسم',
        descriptionEn: 'Formally referred to legal counsel investigation on court absence charges',
        performedBy: 'إدارة شؤون الموظفين'
      }
    ],
    legalNotes: [
      {
        id: 'note-102',
        date: '2026-05-10',
        author: 'أحمد محمود العبدالله',
        noteText: 'تم التنبيه على الموظف بضرورة الانضباط والالتزام بالمواعيد، والشمري وعد ببذل طاقة قصوى واستثمار مرونته الشفهية لصالح المحاكم.'
      }
    ]
  }
];
