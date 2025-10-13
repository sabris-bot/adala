
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Case, CaseStatus, RiskLevel, CaseMainType, CasePriority, CourtLevel, Hearing, CaseFile, CaseNote, ExecutionAction, ExecutionActionType, ExecutionActionStatus, ExpertAction, ExpertActionStatus, ExpertField } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import { CaseStatusBadge, RiskLevelBadge, PriorityBadge } from '../components/ui/Badge'; 
import { BriefcaseIcon, PlusCircleIcon, EyeIcon, PencilIcon, TrashIcon, FolderIcon, PrinterIcon, DocumentDuplicateIcon } from '../constants'; 
import { 
    caseStatusOptions, 
    courtDegreeOptions,
    caseGroupOptions,
    partyRoleOptions,
    hearingTypeOptions,
    reportTypeOptions,
    caseMainTypeOptions,
    riskLevelOptions,
    casePriorityOptions,
    caseFilterStatusOptions,
    KUWAIT_COURTS_LIST,
    courtLevelOptions
} from '../constants';


export const initialCases: Case[] = [ 
  { 
    id: '1', 
    title: 'مطالبة بتعويضات عن إخلال تعاقدي', 
    caseNumber: 'CML-2024-101',
    internalCaseNumber: 'MSA-C-001',
    clientName: 'شركة الأمل للتجارة', 
    clientRole: 'مدعي',
    group: 'قضايا هامة',
    caseMainType: CaseMainType.COMMERCIAL,
    caseSubType: 'خرق عقد توريد',
    status: CaseStatus.IN_PROGRESS, 
    priority: CasePriority.HIGH,
    riskLevel: RiskLevel.MEDIUM, 
    assignedLawyer: 'أ. أحمد محمود', 
    courtName: 'المحكمة الكلية - تجاري', 
    courtLevel: CourtLevel.FIRST_INSTANCE,
    opposingPartyName: 'شركة المقاولون المتحدون',
    opponentRole: 'مدعى عليه',
    filingDate: '2024-03-15',
    hearings: [
      { id: 'h1-1', date: '2024-04-20', type: 'مرافعة', status: 'Completed'},
      { id: 'h1-2', date: '2024-06-10', type: 'مرافعة', status: 'Completed'},
      { id: 'h1-3', date: '2024-09-15', type: 'تقديم مستندات', status: 'Scheduled' }
    ],
    judgmentSummary: 'لم يصدر حكم بعد',
    createdDate: '2024-03-01',
  },
  { 
    id: '2', 
    title: 'نزاع عمالي - فصل تعسفي', 
    caseNumber: 'LAB-2024-055',
    internalCaseNumber: 'MSA-L-002',
    clientName: 'سارة عبدالله أحمد', 
    clientRole: 'مدعي',
    group: 'قضايا مكتب الرياض',
    caseMainType: CaseMainType.LABOR,
    status: CaseStatus.OPEN, 
    priority: CasePriority.NORMAL,
    riskLevel: RiskLevel.LOW, 
    assignedLawyer: 'أ. فاطمة علي', 
    courtName: 'المحكمة العمالية', 
    courtLevel: CourtLevel.FIRST_INSTANCE,
    opposingPartyName: 'شركة الخدمات الحديثة',
    opponentRole: 'مدعى عليه',
    filingDate: '2024-05-10',
    hearings: [{id: 'h2-1', date: '2024-08-25', type: 'تبادل مذكرات', status: 'Scheduled'}],
    createdDate: '2024-05-01',
  },
  { 
    id: '3', 
    title: 'استئناف حكم إخلاء عقار', 
    caseNumber: 'RE-APP-2024-088', 
    internalCaseNumber: 'MSA-R-003',
    clientName: 'مجموعة الأنوار العقارية', 
    clientRole: 'مستأنف',
    group: 'قضايا هامة',
    caseMainType: CaseMainType.REAL_ESTATE,
    status: CaseStatus.APPEALED, 
    priority: CasePriority.HIGH,
    riskLevel: RiskLevel.MEDIUM, 
    assignedLawyer: 'أ. خالد جاسم', 
    courtName: 'محكمة الاستئناف - إيجارات', 
    courtLevel: CourtLevel.APPEALS_COURT, 
    opposingPartyName: 'المستأجر (س)',
    opponentRole: 'مستأنف ضده',
    filingDate: '2024-03-01', 
    hearings: [{id: 'h3-1', date: '2024-09-10', type: 'مرافعة', status: 'Scheduled'}],
    judgmentSummary: 'الحكم الابتدائي: رفض الدعوى',
    judgmentOutcome: 'Lost', 
    createdDate: '2023-10-20', 
  },
  {
    id: '4',
    title: 'جنحة شيك بدون رصيد',
    caseNumber: 'CRIM-2024-789',
    internalCaseNumber: 'MSA-CR-004',
    clientName: 'شركة التمويل السريع',
    clientRole: 'مجني عليه',
    caseMainType: CaseMainType.CRIMINAL,
    status: CaseStatus.OPEN,
    priority: CasePriority.HIGH,
    riskLevel: RiskLevel.MEDIUM,
    assignedLawyer: 'أ. ناصر عبدالله القحطاني',
    courtName: 'محكمة الجنح (مجمع محاكم الفروانية)',
    courtLevel: CourtLevel.FIRST_INSTANCE,
    opposingPartyName: 'المتهم (ع.ص.م)',
    opponentRole: 'متهم',
    filingDate: '2024-06-20',
    hearings: [{id: 'h4-1', date: '2024-09-05', type: 'أولى جلسات', status: 'Scheduled'}],
    createdDate: '2024-06-15',
  },
  {
    id: '5',
    title: 'مطالبة مالية بقيمة 15,000 د.ك',
    caseNumber: 'CIV-2023-1234',
    internalCaseNumber: 'MSA-CV-005',
    clientName: 'مؤسسة البناء الحديث',
    clientRole: 'مدعي',
    caseMainType: CaseMainType.CIVIL,
    status: CaseStatus.CLOSED,
    priority: CasePriority.NORMAL,
    riskLevel: RiskLevel.LOW,
    assignedLawyer: 'أ. أحمد محمود',
    courtName: 'المحكمة الكلية - مدني',
    courtLevel: CourtLevel.FIRST_INSTANCE,
    opposingPartyName: 'شركة المقاولات الهندسية',
    opponentRole: 'مدعى عليه',
    filingDate: '2023-09-01',
    judgmentDate: '2024-05-30',
    judgmentSummary: 'الحكم بإلزام المدعى عليه بسداد كامل المبلغ المطالب به.',
    judgmentOutcome: 'Won',
    createdDate: '2023-08-20',
  },
  {
    id: '6',
    title: 'دعوى إلغاء قرار إداري (ترقية)',
    caseNumber: 'ADM-2024-012',
    internalCaseNumber: 'MSA-AD-006',
    clientName: 'الموظف (خ.ع.س)',
    clientRole: 'مدعي',
    caseMainType: CaseMainType.ADMINISTRATIVE,
    status: CaseStatus.PENDING,
    priority: CasePriority.NORMAL,
    riskLevel: RiskLevel.MEDIUM,
    assignedLawyer: 'أ. ليلى منصور الهاجري',
    courtName: 'المحكمة الإدارية - الدائرة الأولى',
    courtLevel: CourtLevel.ADMINISTRATIVE_COURT,
    opposingPartyName: 'وزارة (س)',
    opponentRole: 'مدعى عليه',
    filingDate: '2024-07-01',
    hearings: [{id: 'h6-1', date: '2024-09-20', type: 'تبادل مذكرات', status: 'Scheduled'}],
    createdDate: '2024-06-25',
  },
  {
    id: '7',
    title: 'دعوى طلاق للضرر ونفقة وحضانة',
    caseNumber: 'PS-FAM-2024-333',
    internalCaseNumber: 'MSA-PS-007',
    clientName: 'السيدة (ف.خ.م)',
    clientRole: 'مدعية',
    caseMainType: CaseMainType.PERSONAL_STATUS,
    status: CaseStatus.IN_PROGRESS,
    priority: CasePriority.HIGH,
    riskLevel: RiskLevel.HIGH,
    assignedLawyer: 'أ. هند سعد العتيبي',
    courtName: 'محكمة الأسرة بمحافظة الأحمدي',
    courtLevel: CourtLevel.FIRST_INSTANCE,
    opposingPartyName: 'الزوج (ع.أ.ج)',
    opponentRole: 'مدعى عليه',
    filingDate: '2024-04-10',
    hearings: [{id: 'h7-1', date: '2024-07-15', type: 'جلسة تحقيق', status: 'Completed'}, {id: 'h7-2', date: '2024-09-12', type: 'مرافعة', status: 'Scheduled'}],
    createdDate: '2024-04-01',
  },
  {
    id: '8',
    title: 'تنفيذ حكم مطالبة مالية',
    caseNumber: 'EXEC-2024-001',
    internalCaseNumber: 'MSA-EX-008',
    clientName: 'مؤسسة البناء الحديث',
    clientRole: 'مدعي',
    caseMainType: CaseMainType.CIVIL,
    status: CaseStatus.IN_PROGRESS, 
    priority: CasePriority.HIGH,
    riskLevel: RiskLevel.LOW, 
    assignedLawyer: 'أ. خالد جاسم',
    courtName: 'إدارة التنفيذ المدني',
    courtLevel: CourtLevel.SPECIALIZED_COURT,
    opposingPartyName: 'شركة المقاولات الهندسية',
    opponentRole: 'مدعى عليه',
    filingDate: '2024-07-01',
    judgmentDate: '2024-05-30',
    judgmentSummary: 'تم فتح ملف تنفيذ للحكم الصادر في القضية CIV-2023-1234.',
    judgmentOutcome: 'Won',
    createdDate: '2024-07-01',
    executionActions: [
      {
        id: 'exec1',
        actionType: ExecutionActionType.BANK_ACCOUNT_FREEZE,
        applicationDate: '2024-07-05',
        status: ExecutionActionStatus.ACTIVE,
        effectiveDate: '2024-07-10',
        notes: 'تم الحجز على الحسابات البنكية للمدين.'
      },
      {
        id: 'exec2',
        actionType: ExecutionActionType.TRAVEL_BAN,
        applicationDate: '2024-07-05',
        status: ExecutionActionStatus.PENDING_SUBMISSION,
        notes: 'طلب منع السفر قيد التقديم.'
      }
    ]
  },
  {
    id: '9',
    title: 'نزاع محاسبي بين شركاء',
    caseNumber: 'COM-EXP-2024-112',
    internalCaseNumber: 'MSA-C-009',
    clientName: 'شريك (أ)',
    clientRole: 'مدعي',
    caseMainType: CaseMainType.COMMERCIAL,
    status: CaseStatus.ON_HOLD,
    priority: CasePriority.HIGH,
    riskLevel: RiskLevel.HIGH,
    assignedLawyer: 'أ. ليلى منصور الهاجري',
    courtName: 'المحكمة الكلية - تجاري',
    courtLevel: CourtLevel.FIRST_INSTANCE,
    opposingPartyName: 'شريك (ب)',
    opponentRole: 'مدعى عليه',
    filingDate: '2024-02-10',
    createdDate: '2024-02-01',
    expertActions: [
      {
        id: 'exp1',
        referralDate: '2024-06-15',
        expertField: ExpertField.ACCOUNTING,
        assignedTask: 'فحص دفاتر الشركة وتحديد حصة كل شريك من الأرباح والخسائر عن السنة المالية 2023.',
        status: ExpertActionStatus.IN_PROGRESS,
        expertName: 'مكتب الخبرة المحاسبية',
        notes: 'تم ندب خبير من إدارة الخبراء، ومن المتوقع إيداع التقرير خلال 3 أشهر.'
      }
    ],
    hearings: [
        { id: 'h9-1', date: '2024-06-15', type: 'إحالة للخبرة', status: 'Completed'},
        { id: 'h9-2', date: '2024-09-20', type: 'بانتظار ورود تقرير الخبير', status: 'Scheduled'}
    ]
  },
  {
    id: '10',
    title: 'طعن بالتمييز - إلغاء قرار إداري',
    caseNumber: 'CASS-ADM-2024-005',
    internalCaseNumber: 'MSA-AD-010',
    clientName: 'شركة المقاولات الوطنية',
    clientRole: 'طاعن',
    caseMainType: CaseMainType.ADMINISTRATIVE,
    status: CaseStatus.APPEALED,
    priority: CasePriority.URGENST,
    riskLevel: RiskLevel.CRITICAL,
    assignedLawyer: 'أ. أحمد محمود',
    courtName: 'محكمة التمييز - الدائرة الإدارية',
    courtLevel: CourtLevel.CASSATION_COURT,
    opposingPartyName: 'الجهاز المركزي للمناقصات العامة',
    opponentRole: 'مطعون ضده',
    filingDate: '2024-07-22',
    createdDate: '2024-07-20',
    judgmentSummary: 'حكم الاستئناف: تأييد الحكم الابتدائي برفض الدعوى.',
    judgmentOutcome: 'Lost',
    hearings: [
        { id: 'h10-1', date: '2024-10-05', type: 'مرافعة', status: 'Scheduled'}
    ],
    description: 'قضية هامة تتعلق بترسية مناقصة بمبلغ كبير. نتيجة الطعن حاسمة لمستقبل الشركة.'
  },
  {
    id: '11',
    title: 'دعوى عمالية - مطالبة بمكافأة نهاية خدمة',
    caseNumber: 'LAB-2023-910',
    internalCaseNumber: 'MSA-L-011',
    clientName: 'العامل (م.ح)',
    clientRole: 'مدعي',
    caseMainType: CaseMainType.LABOR,
    status: CaseStatus.CLOSED,
    priority: CasePriority.NORMAL,
    riskLevel: RiskLevel.LOW,
    assignedLawyer: 'أ. فاطمة علي',
    courtName: 'المحكمة العمالية',
    courtLevel: CourtLevel.FIRST_INSTANCE,
    opposingPartyName: 'شركة الأغذية المتحدة',
    opponentRole: 'مدعى عليه',
    filingDate: '2023-11-05',
    createdDate: '2023-11-01',
    closedDate: '2024-02-15',
    judgmentOutcome: 'Settled',
    judgmentSummary: 'تمت التسوية بين الطرفين خارج المحكمة بمبلغ 2500 د.ك، وتم التنازل عن الدعوى وشطبها.'
  }
];


const initialFilters = {
    internalCaseNumber: '',
    clientName: '',
    clientRole: '',
    opponentName: '',
    opponentRole: '',
    consultant: '',
    court: '',
    hearingType: '',
    courtLevel: '',
    status: '',
    reportType: '',
    group: '',
    automatedNo: '',
    caseSubject: '',
    caseNumber: '',
    fromDate: '',
    toDate: '',
};

const CaseListPage: React.FC = () => {
    const [cases, setCases] = useState<Case[]>(initialCases);
    const [filters, setFilters] = useState(initialFilters);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedCase, setSelectedCase] = useState<Case | null>(null);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({...prev, [name]: value}));
    };
    
    const clearFilters = () => {
        setFilters(initialFilters);
    };

    const filteredCases = useMemo(() => {
        return cases.filter(c => {
            return Object.entries(filters).every(([key, value]) => {
                if (!value) return true;
                if (key === 'caseSubject') {
                    return c.title.toLowerCase().includes(String(value).toLowerCase());
                }
                const caseValue = (c as any)[key];
                // --- FIX START ---
                // Cast 'value' to String when creating a Date object to avoid type errors.
                if (key === 'fromDate') return new Date(c.filingDate) >= new Date(String(value));
                if (key === 'toDate') return new Date(c.filingDate) <= new Date(String(value));
                // --- FIX END ---
                if(typeof caseValue === 'string') return caseValue.toLowerCase().includes(String(value).toLowerCase());
                return true;
            });
        });
    }, [cases, filters]);

    const handleAddCase = () => {
        setSelectedCase(null);
        setIsFormModalOpen(true);
    };

    const handleEditCase = (caseToEdit: Case) => {
        setSelectedCase(caseToEdit);
        setIsFormModalOpen(true);
    };

    const handleDeleteCase = useCallback((caseId: string) => {
        if (window.confirm("هل أنت متأكد من حذف هذه القضية؟")) {
            setCases(prev => prev.filter(c => c.id !== caseId));
        }
    }, []);

    const handleFormSubmit = (caseData: Case) => {
        if (selectedCase && selectedCase.id) {
            setCases(prev => prev.map(c => c.id === selectedCase.id ? { ...c, ...caseData, lastModifiedDate: new Date().toISOString() } : c));
        } else {
            const newCase: Case = { ...caseData, id: `case-${Date.now()}`, createdDate: new Date().toISOString() };
            setCases(prev => [newCase, ...prev]);
        }
        setIsFormModalOpen(false);
        setSelectedCase(null);
    };
    
    // Create dynamic options for filters based on data
    const clientOptions = useMemo(() => Array.from(new Set(cases.map(c => c.clientName))).map(name => ({value: name, label: name})), [cases]);
    const opponentOptions = useMemo(() => Array.from(new Set(cases.map(c => c.opposingPartyName))).filter(Boolean).map(name => ({value: name as string, label: name as string})), [cases]);
    const consultantOptions = useMemo(() => Array.from(new Set(cases.map(c => c.assignedLawyer))).map(name => ({value: name, label: name})), [cases]);
    

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-primary-dark">إدارة القضايا</h1>
            
            <Card>
                 <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-primary">خيارات البحث والتصفية</h2>
                        <div className="flex space-x-2 space-x-reverse">
                             <Button size="sm" variant="primary" leftIcon={<PrinterIcon className="w-4 h-4" />}>طباعة طويل</Button>
                             <Button size="sm" variant="primary" leftIcon={<PrinterIcon className="w-4 h-4" />}>طباعة عرض</Button>
                             <Button size="sm" variant="primary" leftIcon={<DocumentDuplicateIcon className="w-4 h-4" />}>تصدير إكسيل</Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-2 text-sm">
                        <Input label="الكود" name="internalCaseNumber" value={filters.internalCaseNumber} onChange={handleFilterChange} containerClassName="mb-0"/>
                        <Select label="الموكل" name="clientName" value={filters.clientName} onChange={handleFilterChange} options={[{value:'', label: 'اختر من القائمة'},...clientOptions]} containerClassName="mb-0"/>
                        <Select label="صفة الموكل" name="clientRole" value={filters.clientRole} onChange={handleFilterChange} options={[{value:'', label: 'اختر من القائمة'},...partyRoleOptions]} containerClassName="mb-0"/>
                        <Select label="الخصم" name="opponentName" value={filters.opponentName} onChange={handleFilterChange} options={[{value:'', label: 'اختر من القائمة'},...opponentOptions]} containerClassName="mb-0"/>
                        <Select label="صفة الخصم" name="opponentRole" value={filters.opponentRole} onChange={handleFilterChange} options={[{value:'', label: 'اختر من القائمة'},...partyRoleOptions]} containerClassName="mb-0"/>
                        <Select label="المستشار" name="consultant" value={filters.consultant} onChange={handleFilterChange} options={[{value:'', label: 'اختر من القائمة'},...consultantOptions]} containerClassName="mb-0"/>
                        <Select label="المحكمة" name="court" value={filters.court} onChange={handleFilterChange} options={[{value:'', label: 'اختر من القائمة'},...KUWAIT_COURTS_LIST]} containerClassName="mb-0"/>
                        <Select label="نوع الجلسة" name="hearingType" value={filters.hearingType} onChange={handleFilterChange} options={[{value:'', label: 'اختر من القائمة'},...hearingTypeOptions]} containerClassName="mb-0"/>
                        <Select label="الدرجة" name="courtLevel" value={filters.courtLevel} onChange={handleFilterChange} options={[{value:'', label: 'اختر من القائمة'},...courtDegreeOptions]} containerClassName="mb-0"/>
                        <Select label="الحالة" name="status" value={filters.status} onChange={handleFilterChange} options={[{value:'', label: 'اختر من القائمة'},...caseFilterStatusOptions]} containerClassName="mb-0"/>
                        <Select label="نوع التقرير" name="reportType" value={filters.reportType} onChange={handleFilterChange} options={[{value:'', label: 'اختر من القائمة'},...reportTypeOptions]} containerClassName="mb-0"/>
                        <Select label="المجموعة" name="group" value={filters.group} onChange={handleFilterChange} options={[{value:'', label: 'اختر من القائمة'},...caseGroupOptions]} containerClassName="mb-0"/>
                        <Input label="الرقم الالي" name="automatedNo" value={filters.automatedNo} onChange={handleFilterChange} containerClassName="mb-0"/>
                        <Input label="موضوع القضية" name="caseSubject" value={filters.caseSubject} onChange={handleFilterChange} containerClassName="mb-0"/>
                        <Input label="رقم القضية" name="caseNumber" value={filters.caseNumber} onChange={handleFilterChange} containerClassName="mb-0"/>
                        <Input label="من تاريخ" name="fromDate" type="date" value={filters.fromDate} onChange={handleFilterChange} containerClassName="mb-0"/>
                        <Input label="الى تاريخ" name="toDate" type="date" value={filters.toDate} onChange={handleFilterChange} containerClassName="mb-0"/>
                    </div>
                    <div className="mt-4 flex justify-end space-x-2 space-x-reverse">
                         <Button onClick={clearFilters} variant="outline" size="sm">تفريغ</Button>
                         <Button onClick={() => {}} size="sm">عرض النتائج</Button>
                    </div>
                </div>
            </Card>

            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    {['القضية/الكود', 'الموكل/صفته الخصم/صفته', 'المحكمة/الدرجة', 'الرقم الالي/رقم القضية', 'الحالة/نوع الجلسة', 'قرار اخر جلسة/تاريخ اخر جلسة', 'المجموعة', 'المستشار', 'عمليات'].map(h => (
                       <th key={h} className="px-3 py-2 text-right font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCases.length > 0 ? filteredCases.map(c => {
                    const lastHearing = c.hearings && c.hearings.length > 0 ? c.hearings[c.hearings.length-1] : null;
                    return (
                        <tr key={c.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 align-top"><div>{c.title}</div><div className="text-xs text-gray-500">{c.internalCaseNumber}</div></td>
                            <td className="px-3 py-2 align-top"><div>{c.clientName} / {c.clientRole}</div><div className="text-xs text-gray-500">{c.opposingPartyName} / {c.opponentRole}</div></td>
                            <td className="px-3 py-2 align-top"><div>{c.courtName}</div><div className="text-xs text-gray-500">{c.courtLevel}</div></td>
                            <td className="px-3 py-2 align-top"><div>{c.internalCaseNumber}</div><div className="text-xs text-gray-500">{c.caseNumber}</div></td>
                            <td className="px-3 py-2 align-top"><div><CaseStatusBadge status={c.status} /></div><div className="text-xs text-gray-500">{lastHearing?.type}</div></td>
                            <td className="px-3 py-2 align-top"><div>{c.judgmentSummary || lastHearing?.notes}</div><div className="text-xs text-gray-500">{lastHearing?.date ? new Date(lastHearing.date).toLocaleDateString('ar-EG') : ''}</div></td>
                            <td className="px-3 py-2 align-top">{c.group}</td>
                            <td className="px-3 py-2 align-top">{c.assignedLawyer}</td>
                            <td className="px-3 py-2 align-top whitespace-nowrap">
                                <Button variant="ghost" size="sm" onClick={() => {}} title="عرض"><EyeIcon className="w-4 h-4 text-primary"/></Button>
                                <Button variant="ghost" size="sm" onClick={() => handleEditCase(c)} title="تعديل"><PencilIcon className="w-4 h-4 text-yellow-600"/></Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteCase(c.id)} title="حذف" className="text-danger"><TrashIcon className="w-4 h-4 text-danger"/></Button>
                            </td>
                        </tr>
                    )
                  }) : (
                    <tr>
                      <td colSpan={9} className="text-center py-10 text-gray-500">
                        <FolderIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        لا توجد قضايا تطابق معايير البحث.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {isFormModalOpen && <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={selectedCase ? "تعديل قضية" : "إضافة قضية"}>
                {/* A proper form component would go here */}
                <p>نموذج إضافة/تعديل القضية يظهر هنا.</p>
            </Modal>}
        </div>
    );
};

export default CaseListPage;
