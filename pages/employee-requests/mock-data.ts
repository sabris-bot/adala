import { RequestType, EmployeeRequest, ApprovalStage } from './request-types';

export const mockEmployeesList = [
    { 
        id: 'emp-1', 
        employeeId: 'EMP001', 
        fullNameAr: 'أحمد محمود العبدالله', 
        jobTitle: 'محاسب رئيسي', 
        department: 'المالية', 
        joiningDate: '2018-05-10', 
        basicSalary: 1500, 
        allowancesAmount: 300, 
        civilId: '290010100123', 
        nationality: 'كويتي', 
        warningsCount: 0, 
        attendanceAbsences: 0, 
        attendanceDelays: 1, 
        excellentForTwoYears: true,
        hasActiveInvestigation: false,
        remainingLeaveDays: 28,
        bankName: 'بيت التمويل الكويتي (KFH)',
        bankIban: 'KW45KFH0000000123456789',
        filesStatus: { civilId: true, passport: true, residency: true, contract: true }
    },
    { 
        id: 'emp-2', 
        employeeId: 'EMP002', 
        fullNameAr: 'سحر جاسم الفيلي', 
        jobTitle: 'مساعد عمليات', 
        department: 'العمليات', 
        joiningDate: '2022-09-12', 
        basicSalary: 750, 
        allowancesAmount: 100, 
        civilId: '295050500456', 
        nationality: 'كويتية', 
        warningsCount: 2, 
        attendanceAbsences: 12, 
        attendanceDelays: 14, 
        excellentForTwoYears: false,
        hasActiveInvestigation: true, // Under Investigation!
        remainingLeaveDays: 4,
        bankName: 'بنك الكويت الوطني (NBK)',
        bankIban: 'KW12NBK0054320000987654',
        filesStatus: { civilId: true, passport: true, residency: false, contract: true }
    },
    { 
        id: 'emp-3', 
        employeeId: 'EMP003', 
        fullNameAr: 'خالد عبدالمحسن الصايغ', 
        jobTitle: 'منسق عمليات', 
        department: 'العمليات', 
        joiningDate: '2021-03-05', 
        basicSalary: 1100, 
        allowancesAmount: 150, 
        civilId: '291030300789', 
        nationality: 'كويتي', 
        warningsCount: 0, 
        attendanceAbsences: 2, 
        attendanceDelays: 4, 
        excellentForTwoYears: false,
        hasActiveInvestigation: false,
        remainingLeaveDays: 19,
        bankName: 'بنك بوبيان (Boubyan)',
        bankIban: 'KW67BOUB0000456789123456',
        filesStatus: { civilId: true, passport: true, residency: true, contract: true }
    },
    { 
        id: 'emp-4', 
        employeeId: 'EMP004', 
        fullNameAr: 'بدر فهد المطيري', 
        jobTitle: 'باحث قانوني', 
        department: 'الشؤون القانونية', 
        joiningDate: '2020-07-15', 
        basicSalary: 1250, 
        allowancesAmount: 200, 
        civilId: '293040400321', 
        nationality: 'كويتي', 
        warningsCount: 1, 
        attendanceAbsences: 1, 
        attendanceDelays: 3, 
        excellentForTwoYears: false,
        hasActiveInvestigation: false,
        remainingLeaveDays: 14,
        bankName: 'بنك الخليج (Gulf Bank)',
        bankIban: 'KW98GULF0000112233445566',
        filesStatus: { civilId: true, passport: false, residency: true, contract: true }
    },
    { 
        id: 'emp-5', 
        employeeId: 'EMP005', 
        fullNameAr: 'سارة خالد الصباح', 
        jobTitle: 'مستشار قانوني', 
        department: 'الشركات', 
        joiningDate: '2020-02-15', 
        basicSalary: 2200, 
        allowancesAmount: 400, 
        civilId: '295090900111', 
        nationality: 'كويتية', 
        warningsCount: 0, 
        attendanceAbsences: 0, 
        attendanceDelays: 0, 
        excellentForTwoYears: true,
        hasActiveInvestigation: false,
        remainingLeaveDays: 32,
        bankName: 'بنك الكويت التجاري (CBK)',
        bankIban: 'KW33COMB0009876543210011',
        filesStatus: { civilId: true, passport: true, residency: true, contract: true }
    }
];

export const getInitialApprovals = (empName: string, requestDate: string): ApprovalStage[] => [
    {
        roleId: 'applicant',
        roleAr: 'مقدم الطلب',
        roleEn: 'Applicant',
        status: 'approved',
        approverName: empName,
        actionDate: requestDate,
        notes: 'تم تقديم الطلب إلكترونياً عبر البوابة الذاتية لنظام عدالة.'
    },
    {
        roleId: 'line_manager',
        roleAr: 'المدير المباشر',
        roleEn: 'Direct/Line Manager',
        status: 'pending',
        notes: 'بانتظار مراجعة توصية مصلحة العمل في القسم.'
    },
    {
        roleId: 'hr',
        roleAr: 'الموارد البشرية',
        roleEn: 'Human Resources',
        status: 'pending',
        notes: 'بانتظار التحقق من الملف عمالياً.'
    },
    {
        roleId: 'finance',
        roleAr: 'الإدارة المالية',
        roleEn: 'Financial Administration',
        status: 'pending',
        notes: 'بانتظار فحص كفايات الرواتب والسيولة.'
    },
    {
        roleId: 'legal',
        roleAr: 'الإدارة القانونية',
        roleEn: 'Legal Administration',
        status: 'pending',
        notes: 'بانتظار المطابقة مع قانون العمل الكويتي رقم 6 لعام 2010.'
    },
    {
        roleId: 'final_approval',
        roleAr: 'الاعتماد النهائي',
        roleEn: 'Final Approval',
        status: 'pending',
        notes: 'بانتظار كلمة الشركاء لإصدار القرار الختامي.'
    }
];

export const initialRequestsSeed: EmployeeRequest[] = [
    // 1. طلب ترقية (Promotion)
    {
        id: 'ad-req-1',
        employeeId: 'emp-1',
        employeeName: 'أحمد محمود العبدالله',
        employeeJobTitle: 'محاسب رئيسي',
        employeeDepartment: 'المالية',
        requestType: RequestType.PROMOTION,
        requestDate: '2026-05-10',
        status: 'Signed & Completed',
        referenceNumber: 'QA-REQ-2026-001',
        currentDept: 'المالية',
        requestedDept: 'المالية',
        currentTitle: 'محاسب رئيسي',
        requestedTitle: 'مدير قطاع الحسابات والمتابعة المالية الكلية',
        currentSalary: 1800,
        proposedSalary: 2150,
        raisePercentage: 19.4,
        warningsCountAtRequest: 0,
        outstandingLoansCount: 0,
        hasActiveInvestigation: false,
        remainingLeaveDays: 28,
        joiningDate: '2018-05-10',
        nationality: 'كويتي',
        civilId: '290010100123',
        reasonNote: 'نظرًا للأداء الاستثنائي المستمر طوال السنتين الماضيتين واجتياز نظام تقييم الكفاءة بنسبة تزيد عن 95%، يرجى الترقية لتولي قيادة شؤون الميزانيات والتدقيق الكلي.',
        completedAt: '2026-05-15',
        approvals: [
            { roleId: 'applicant', roleAr: 'مقدم الطلب', roleEn: 'Applicant', status: 'approved', approverName: 'أحمد محمود العبدالله', actionDate: '2026-05-10', notes: 'طلب ترقية مالية وإدارية قانونية.' },
            { roleId: 'line_manager', roleAr: 'المدير المباشر', roleEn: 'Direct Manager', status: 'approved', approverName: 'سليمان العدساني', actionDate: '2026-05-11', notes: 'الموظف يتميز بكفاءة نادرة ودقة مهنية عالية، يوصى بالترقية وبشدة.' },
            { roleId: 'hr', roleAr: 'الموارد البشرية', roleEn: 'Human Resources', status: 'approved', approverName: 'خالد جاسم', actionDate: '2026-05-12', notes: 'تم التحقق من ملف الموظف، يمتلك تقرير امتياز متتالي لمدة سنتين، ولا توجد عقوبات.' },
            { roleId: 'finance', roleAr: 'الإدارة المالية', roleEn: 'Financial Administration', status: 'approved', approverName: 'مبارك حماد', actionDate: '2026-05-13', notes: 'تم إدراج زيادة راتب بقيمة 350 د.ك ضمن مخصص الميزانية.' },
            { roleId: 'legal', roleAr: 'الإدارة القانونية', roleEn: 'Legal Administration', status: 'approved', approverName: 'أبو الوفا الدسوقي', actionDate: '2026-05-14', notes: 'الزيادة والترقية تتوافق تماماً مع أحكام قانون العمل الكويتي ولائحة المكتب.' },
            { roleId: 'final_approval', roleAr: 'الاعتماد النهائي', roleEn: 'Final Approval', status: 'approved', approverName: 'عبدالوهاب العيبان', actionDate: '2026-05-15', notes: 'يعتمد القرار رسمياً ويبلغ الموظف مع بدء الشهر المقبل.' }
        ]
    },
    // 2. طلب سلفة (Salary Advance)
    {
        id: 'ad-req-2',
        employeeId: 'emp-3',
        employeeName: 'خالد عبدالمحسن الصايغ',
        employeeJobTitle: 'منسق عمليات',
        employeeDepartment: 'العمليات',
        requestType: RequestType.ADVANCE,
        requestDate: '2026-05-28',
        status: 'Under Financial Review',
        referenceNumber: 'QA-REQ-2026-002',
        loanAmount: 1100, // One basic salary
        installmentsCount: 11,
        monthlyInstallment: 100,
        warningsCountAtRequest: 0,
        outstandingLoansCount: 0,
        hasActiveInvestigation: false,
        remainingLeaveDays: 19,
        joiningDate: '2021-03-05',
        nationality: 'كويتي',
        civilId: '291030300789',
        reasonNote: 'أرجو التكرم بالموافقة على منحي سلفة اجتماعية تعادل راتب شهر واحد أساسي لمعالجة التزامات أسرية طارئة، على أن يخصم القسط الشهري بانتظام.',
        approvals: [
            { roleId: 'applicant', roleAr: 'مقدم الطلب', roleEn: 'Applicant', status: 'approved', approverName: 'خالد عبدالمحسن الصايغ', actionDate: '2026-05-28', notes: 'سلفة بقيمة 1100 د.ك.' },
            { roleId: 'line_manager', roleAr: 'المدير المباشر', roleEn: 'Direct Manager', status: 'approved', approverName: 'أنس المطوع', actionDate: '2026-05-29', notes: 'لا مانع عمالياً من الموافقة.' },
            { roleId: 'hr', roleAr: 'الموارد البشرية', roleEn: 'Human Resources', status: 'approved', approverName: 'خالد جاسم', actionDate: '2026-05-30', notes: 'الموظف مستمر بالمنشأة منذ 5 سنوات ولديه ملف ائتماني ممتاز وخالي من الرهونات السابقة.' },
            { roleId: 'finance', roleAr: 'الإدارة المالية', roleEn: 'Financial Administration', status: 'pending', notes: 'قيد احتساب قسط الخصم الشهري وصياغة إقرار استقطاع الراتب.' },
            { roleId: 'legal', roleAr: 'الإدارة القانونية', roleEn: 'Legal Administration', status: 'pending', notes: 'في انتظار توقيع التعهد بالسداد الكلي من المقترض.' },
            { roleId: 'final_approval', roleAr: 'الاعتماد النهائي', roleEn: 'Final Approval', status: 'pending', notes: 'يعلق بالاعتماد والامتثال المصرفي.' }
        ]
    },
    // 3. طلب إجازة (Leave)
    {
        id: 'ad-req-3',
        employeeId: 'emp-5',
        employeeName: 'سارة خالد الصباح',
        employeeJobTitle: 'مستشار قانوني',
        employeeDepartment: 'الشركات',
        requestType: RequestType.LEAVE,
        requestDate: '2026-05-25',
        status: 'Under HR Review',
        referenceNumber: 'QA-REQ-2026-003',
        leaveType: 'annual',
        startDate: '2026-07-01',
        endDate: '2026-07-30',
        leaveDaysCount: 30,
        warningsCountAtRequest: 0,
        outstandingLoansCount: 0,
        hasActiveInvestigation: false,
        remainingLeaveDays: 32,
        joiningDate: '2020-02-15',
        nationality: 'كويتية',
        civilId: '295090900111',
        reasonNote: 'يرجى التكرم بالموافقة على منحي الإجازة الدورية السنوية المعتادة لمدة 30 يوماً لقضائها مع العائلة في الخارج برصيد مستحق كامل الأجر.',
        approvals: [
            { roleId: 'applicant', roleAr: 'مقدم الطلب', roleEn: 'Applicant', status: 'approved', approverName: 'سارة خالد الصباح', actionDate: '2026-05-25', notes: 'طلب إجازة سنوية.' },
            { roleId: 'line_manager', roleAr: 'المدير المباشر', roleEn: 'Direct Manager', status: 'approved', approverName: 'لؤي الخالد', actionDate: '2026-05-26', notes: 'تمت مراجعة خطة تسليم الملفات وتأمين باحث قانوني كبديل مؤقت أثناء الإجازة.' },
            { roleId: 'hr', roleAr: 'الموارد البشرية', roleEn: 'Human Resources', status: 'pending', notes: 'قيد مراجعة الرصيد الفعلي للمستشار ومطابقة رصيد كشف رواتب مايو.' },
            { roleId: 'finance', roleAr: 'الإدارة المالية', roleEn: 'Financial Administration', status: 'pending', notes: 'بانتظار تحديد استحقاق الراتب المقدم للإجازة.' },
            { roleId: 'legal', roleAr: 'الإدارة القانونية', roleEn: 'Legal Administration', status: 'not_required', notes: 'الدور غير مطلوب لهذه المعاملة الروتينية.' },
            { roleId: 'final_approval', roleAr: 'الاعتماد النهائي', roleEn: 'Final Approval', status: 'pending', notes: 'القرار النهائي رهين تقييم التدقيق.' }
        ]
    },
    // 4. طلب انتداب (Deputation)
    {
        id: 'ad-req-4',
        employeeId: 'emp-4',
        employeeName: 'بدر فهد المطيري',
        employeeJobTitle: 'باحث قانوني',
        employeeDepartment: 'الشؤون القانونية',
        requestType: RequestType.DEPUTATION,
        requestDate: '2026-05-29',
        status: 'Pending Line Manager',
        referenceNumber: 'QA-REQ-2026-004',
        deputationLocation: 'هيئة تشجيع الاستثمار المباشر ومجمع المحاكم بالفروانية',
        deputationDurationDays: 15,
        deputationPerDiem: 25,
        warningsCountAtRequest: 1,
        outstandingLoansCount: 0,
        hasActiveInvestigation: false,
        remainingLeaveDays: 14,
        joiningDate: '2020-07-15',
        nationality: 'كويتي',
        civilId: '293040400321',
        reasonNote: 'تكليف بمهمة عمل والتدريب والبحث الميداني بمقر هيئة المحاكم للاستعلام وفحص القضايا ومطابقتها قانونياً.',
        approvals: [
            { roleId: 'applicant', roleAr: 'مقدم الطلب', roleEn: 'Applicant', status: 'approved', approverName: 'بدر فهد المطيري', actionDate: '2026-05-29', notes: 'تقديم طلب انتداب رسمي لمصلحة ومتابعة قضايا المنشأة.' },
            { roleId: 'line_manager', roleAr: 'المدير المباشر', roleEn: 'Direct Manager', status: 'pending', notes: 'بانتظار موافقة مدير قطاع الشؤون القانونية.' },
            { roleId: 'hr', roleAr: 'الموارد البشرية', roleEn: 'Human Resources', status: 'pending', notes: 'شؤون الموظفين بانتظار موافقة المدير المباشر.' },
            { roleId: 'finance', roleAr: 'الإدارة المالية', roleEn: 'Financial Administration', status: 'pending', notes: 'بانتظار الموافقة لاعتماد وإدراج بدل الانتداب اليومي.' },
            { roleId: 'legal', roleAr: 'الإدارة القانونية', roleEn: 'Legal Administration', status: 'pending', notes: 'بانتظار مراجعة الامتثال والتوافق عمالياً.' },
            { roleId: 'final_approval', roleAr: 'الاعتماد النهائي', roleEn: 'Final Approval', status: 'pending', notes: 'بانتظار الكلمة النهائية من الشركاء بمجموعة عدالة الكلية.' }
        ]
    }
];

// Template texts for the dynamic document editor (100% editable Arabic)
export const getDefaultDocumentText = (req: EmployeeRequest): string => {
    const today = new Date().toLocaleDateString('ar-KW', { year: 'numeric', month: 'long', day: 'numeric' });
    const ref = req.referenceNumber || `AD-REF-${Math.floor(100000 + Math.random() * 900000)}`;
    const emp = req.employeeName;
    const title = req.employeeJobTitle;
    const dept = req.employeeDepartment;

    switch (req.requestType) {
        case RequestType.SALARY_CERTIFICATE:
            return `تشهد إدارة الموارد البشرية والرواتب بمجموعة عدالة للمحاماة والاستشارات القانونية بأن السيد / ${emp}، الحامل للبطاقة المدنية الكويتية رقم (${req.civilId || ".............."})، يعمل لدينا بمسمى وظيفي (${title}) في قسم (${dept}) اعتباراً من تاريخ انضمامه في ${req.joiningDate || ".............."}.\n\nويبلغ إجمالي صافي راتبه الشهري المستلم قيمة قدرها: {الراتب الشامـل د.ك} د.ك يودع شهرياً لدى البنك المحال إليه بالآيبان المعتمد.\n\nوقد أعطيت له هذه الشهادة بناءً على طلبه لتقديمها إلى جهة: (${req.recipientName || "من يهمه الأمر"})، دون أدنى مسؤولية مالية أو التزام على المكتب.\n\nصدر في الكويت بتاريخ: ${today}\nالرقم المرجعي: ${ref}`;
            
        case RequestType.LEAVE:
            return `طلب إجازة دورية بموجب قانون العمل الكويتي رقم 6/2010\n\nالسيد مستشار إدارة شؤون الموظفين بمجموعة عدالة للمحاماة،\nتحية طيبة وبعد،\n\nيرجى التكرم بالموافقة على منحي إجازة نوع (${req.leaveType === 'sick' ? 'مرضية' : 'دورية سنوية'}) صالحة للموظف المسمى: ${emp} بوصفه ${title} في إدارة ${dept}.\nوتبدأ الإجازة المطلوبة من تاريخ: ${req.startDate || "........."} ولغاية تاريخ: ${req.endDate || "........."} بإجمالي عدد أيام قدره (${req.leaveDaysCount || "30"}) يوماً عمالياً.\n\nأتعهد بالالتزام بالعودة والمباشرة بالعمل فور صيرورة الإجازة منتهية وتقديم المستندات والتقارير الطبية اللازمة حال كون الإجازة مرضية.\n\nمقدم الطلب: ${emp}\nالتاريخ: ${req.requestDate}\nالمرجع الإداري: ${ref}`;
            
        case RequestType.PROMOTION:
            return `قرار إداري داخلي رقم (QA-ADM-${ref}) بترقية وتسوية وظيفية\n\nبناءً على الصلاحيات المخولة لشركاء مكتب المحامي صبري شطا (مجموعة عدالة للمحاماة والاستشارات القانونية)، وبعد الاطلاع على تقارير الأداء المتميزة واستكمال الموظف الأقدمية اللازمة، تقرر الآتي:\n\nمادة (1): يرقّى السيد / ${emp} من مسمى (${req.currentTitle || title}) لتسكينه بوظيفة مسمى: (${req.requestedTitle || "............"}) في إدارة (${req.requestedDept || dept}).\n\nمادة (2): يربط المرتب الأساسي والمستحقات والبدلات وتصرف مخصصات مالية جديدة صافية بإجمالي شامل قدره: (${req.proposedSalary || req.currentSalary || ".............."}) د.ك من كشف مصرفي مالي معتمد.\n\nمادة (3): يبلغ هذا القرار لكافة قيادات المنشأة ويعمل به اعتباراً من تاريخ: ${req.retroactiveDate || today}.\n\nالاعتماد والختم الرسمي: مكتب الشركاء بمجموعة عدالة الكلية`;
            
        case RequestType.LOAN:
        case RequestType.ADVANCE:
            return `إقرار وتعهد قانوني بالسداد والخصم من الراتب الشهري المربوط\n\nأقر أنا الموقع أدناه السيد / ${emp}، الحامل للجنسية (${req.nationality || "كويتي"}) وبطاقة مدنية رقم (${req.civilId || ".........."})، وبصفتي موظف بمجموعة عدالة للمحاماة والأعمال القانونية:\nبأنني تسلمت مبلغاً من المال كقرض حسن/سلفة مالية طارئة وقدرها (${req.loanAmount || "........."}) د.ك (دينار كويتي فقط لا غير).\n\nبموجب هذا المستند، أتعهد بالسداد التام والالتزام بدفع هذا القرض على أقساط شهرية متتالية بعدد (${req.installmentsCount || "10"}) أقساط، على أن يخصم شهرياً من راتبي مباشرة مبلغ وقدره (${req.monthlyInstallment || "...."}) د.ك بدءاً من شهر الاستحقاق.\nكما أوافق صراحة على استقطاع أي رصيد متبقي من السلفة من مستحقاتي ونهاية الخدمة في حال تركت العمل لعذر قاهر أو اختياري.\n\nالمستلم المقترض: ${emp}\nالضامن المعتمد: ${req.guarantorName || "إدارة التكافل العمالي"}\nالرقم الإداري للمستند: ${ref}`;
            
        case RequestType.TRANSFER:
            return `قرار وتوصية إدارية بنقل موقع عمل موظف داخلي\n\nالسادة في هيئة الموارد البشرية والامتثال بمكتب المحامي صبري شطا،\n\nقررت إدارة مجموعة عدالة للمحاماة والاستشارات القانونية الموافقة على رغبة بنقل وتغيير مقر العمل للموظف السيد / ${emp} من إدارة وتسكين مسمى الحالي (${req.currentTitle || title}) التابع لقسم (${req.currentDept || dept})، ليصبح في مسمى جديد وصلاحيات جديدة وهي: (${req.requestedTitle || "........."}) في إدارة قسم: (${req.requestedDept || "........."}).\n\nيسلم الموظف جميع العهد والعهد الرقمية والملفات التابعة لقطاعه السابق، وتعتبر صلاحياته سارية في القسم الجديد من تاريخ المباشرة.\n\nرئيس المصلحة المباشر: ....................\nالتوقيع والاعتماد والتحقق: مجموعة عدالة الكويت`;

        case RequestType.PERMISSION:
            return `طلب وتصريح استئذان خروج مؤقت أثناء الدوام الرسمي\n\nمقدم إلى: مدير قسم ${dept} الشريك\nاسم الموظف: ${emp}\nالمسمى الوظيفي: ${title}\n\nيرجى التفضل بموافقة الإذن لي بالخروج المؤقت وتصريح إذن غياب في يوم (${req.permissionDate || today}) من الساعة (${req.permissionTimeRange || ".........."}) لفترة زمنية لا تتعدى (${req.permissionHours || "2"}) ساعات.\nالسبب والمسوغ الإداري: (${req.reasonNote || "ظروف عائلية مرورية طارئة"}).\n\nموافقة وعناية المدير المباشر: ....................\nمذكرة الضبط والامتثال البصري: مكتب عدالة للمحاماة`;

        case RequestType.DUTY_RESUMPTION:
            return `إشعار ونموذج إثبات مباشرة عمل رسمي بعد الإجازة\n\nالسيد مدير إدارة الموارد البشرية بمجموعة عدالة الكلية،\nتحية طيبة وبعد،\n\nبموجب هذا، نود إخطاركم بأن الموظف السيد / ${emp}، الحامل لوظيفة (${title}) في إدارة (${dept})، قد باشر عمله رسمياً في التاريخ الفعلي: (${req.resumptionDate || today}) وذلك بعد انقضاء إجازته الرسمية الصادرة بموجب القرار الإداري رقم (${req.resumptionReferenceCode || ref}).\n\nتثبت إدارة الحضور والبصمة انتظام الموظف مجدداً في جدول المهام المعتاد دون رصد أي غياب إضافي.\n\nمسؤول الحضور والانصراف: ....................\nتوقيع الموظف المباشر: ....................\nالمرجع التدقيقي: ${ref}`;

        case RequestType.TRAINING:
            return `موافقة وتوجيه تدريبي رسمي لتنمية الخبرة المهنية\n\nبناءً على طلب الموافقة للتأهيل المهني والتدريب المرفوع، وافقت مجموعة عدالة للمحاماة على رعاية وتوفير فرصة لتدريب الموظف السيد / ${emp}، الحاصل على مسمى (${title}) في قسم (${dept}).\n\nتفاصيل الدورة التدريبية المعتمدة:\n- اسم البرنامج: (${req.trainingCourseTitle || "..............."})\n- الجهة المزودة للتعليم: (${req.trainingProvider || "..............."})\n- التكلفة المغطاة للمكتب: (${req.trainingCost || "0"}) د.ك.\n\nيلتزم المتدرب بتقديم شهادة اجتياز رسمية فور إتمام الدورة لتسجيلها في ملفه الدائم بالموارد البشرية.\n\nتوجيه شؤون التطوير والتأهيل: ....................\nالرقم التدريبي: ${ref}`;

        case RequestType.DEPUTATION:
            return `قرار وتكليف بمهمة عمل وانتداب خارجي رسمي\n\nبموجب مقتضيات مصلحة العمل في مكتب المحامي صبري شطا (مجموعة عدالة للمحاماة والاستشارات القانونية والتحكيم)، يُكلف الموظف الباحث / ${emp} بالانتداب الرسمي والمهمة لتمثيل المكتب لدى جهة: (${req.deputationLocation || "..............."}) وذلك لفترة زمنية قدرها (${req.deputationDurationDays || "1"}) أيام.\n\nيصرف للمنتدب المذكور بدل انتداب ومصروفات يومية مقدرة بـ: (${req.deputationPerDiem || "0"}) د.ك لتغطية متطلبات التنقل والمواصلات وإنجاز المهام القانونية.\n\nالمستشار العام والشركاء: ....................\nالرقم القانوني للتكليف: ${ref}`;

        case RequestType.CERTIFICATE:
            return `شهادة صادرة من مجموعة عدالة - مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية\n\nتشهد مجموعة عدالة للمحاماة والاستشارات القانونية بأن السيد / ${emp} الحامل للبطاقة المدنية الكويتية رقم (${req.civilId || ".........."})، قد عمل لدينا في وظيفة (${title}) بقسم (${dept})، وهو مستمر في عمله وتأدية خدماته بكل تفان وإخلاص قانوني.\n\nأعطيت له هذه الشهادة بناء على رغبته في تأييد ملفاته الرسمية لدى السلطات والهيئات المعنية بدولة الكويت دون أدنى مسؤولية تقع على عاتق المكتب.\n\nمسؤول السجلات الرسمية: ....................\nالرقم المسلسل: ${ref}`;

        case RequestType.DATA_UPDATE:
            return `طلب وتعديل في ملف الموظف وسجلاته الإدارية والمالية\n\nإلى قسم تكنولوجيا المعلومات والسجلات بمجموعة عدالة الكلية،\n\nبناء على رغبة الموظف: ${emp} وتوثيقه للمستندات الداعمة، تم طلب تعديل الحقل ذو المسمى (${req.fieldToUpdate || "الحساب المصرفي/رقم التواصل"}).\nالبيان القديم في السجلات: (${req.oldValue || "..........."})\nالبيان الجديد المقترح والمدعوم: (${req.newValue || "..........."})\n\nتم التحقق من الوثائق الرسمية والموافقة على إدراج وصك البيانات الجديدة في قاعدة شؤون الموظفين بصفة دائمة.\n\nمدير الملفات والوثائق: ....................\nالتدقيق المرجعي: ${ref}`;

        default:
            return `مستند إداري مخصص صادر عن مجموعة عدالة\n\nالتاريخ: ${req.requestDate}\nالمرجع الموثوق: ${ref}\n\nإلى الإدارة المعنية في مكتب المحامي صبري شطا للمحاماة تؤكد مضمون الطلب للموظف السيد / ${emp} بموجب البيانات المسجلة:\nالعنوان والموضوع: ${req.customTitle || req.reasonNote}\n\nنص المذكرة المتكامل التفصيلي:\n${req.customContent || req.reasonNote || "الرجاء المراجعة والاعتماد عمالياً من الجهات المختصة في المكتب."}\n\nالاعتماد الرسمي: مجموعة عدالة الكويت للمحاماة\nالملاحظات الإشرافية الإيجابية: ....................`;
    }
};
