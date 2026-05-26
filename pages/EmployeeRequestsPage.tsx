import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
    MessageSquare, Plus, UserSquare2, ChevronRight, Search, Filter, Trash, Edit, 
    Printer, Eye, Copy, ArrowRightLeft, DollarSign, Award, BellRing, ClipboardCheck, 
    ShieldAlert, RefreshCw, FileText, CheckCircle2, Clock, Calendar, HelpCircle, 
    Building2, QrCode, Signature
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { useJurisdiction } from '../components/JurisdictionContext';

// --- ENUMS & TYPES ---
export enum RequestType {
    PROMOTION = 'Promotion Request',               // طلب ترقية / تعديل مالي
    JOB_TITLE_CHANGE = 'Job Title Change',         // تغيير مسمى وظيفي
    TRANSFER_REQUEST = 'Department Transfer',       // نقل قسم داخلي
    GRIEVANCE_FORM = 'Grievance Appeal',           // تظلم إداري
    RESIGNATION = 'Resignation / Relieving',       // استقالة وإخلاء طرف
    SALARY_CERTIFICATE = 'Salary Certificate',     // شهادة راتب
    TO_WHOM_IT_MAY_CONCERN = 'To Whom It May Concern', // شهادة لمن يهمه الأمر
}

export type RequestWorkflowStatus = 'Draft' | 'Pending Line Manager' | 'Under HR Review' | 'Under Financial Review' | 'Signed & Completed';

export interface EmployeeRequest {
    id: string;
    employeeId: string;
    employeeName: string;
    employeeJobTitle: string;
    employeeDepartment: string;
    requestType: RequestType;
    requestDate: string;
    status: RequestWorkflowStatus;
    referenceNumber: string;
    
    // Details relative to request types
    purposeType?: string;          // bank, embassy, general
    specificRecipient?: string;    // Name of Bank, Embassy, etc
    includeSalaryDetails?: boolean;
    language?: 'ar' | 'en';
    
    // Transfer fields
    currentDept: string;
    requestedDept: string;
    currentTitle: string;
    requestedTitle: string;
    reasonNote: string;

    // Grievance / Appeal
    grievanceTitle?: string;
    grievanceText?: string;
    isAppendedAppraisal?: boolean;
    appraisalScoreContested?: number;

    // Financial / Promotion Modifiers
    currentSalary: number;
    proposedSalary?: number;
    raisePercentage?: number;
    trainingAssigned?: string;
    retroactiveDate?: string;

    // General Audit
    notes?: string;
    hrNotes?: string;
    financialApprover?: string;
    completedAt?: string;

    // Compliance Flags auto-retrieved
    excellentForTwoYears?: boolean;
    previousWarningsCount: number;
    attendanceAbsencesYear: number;
    civilId: string;
    joiningDate: string;
    nationality: string;
}

// --- SEED EMPLOYEES BASE ---
const mockEmployeesList = [
    { id: 'emp-1', employeeId: 'EMP001', fullNameAr: 'أحمد محمود العبدالله', jobTitle: 'محاسب رئيسي', department: 'المالية', joiningDate: '2018-05-10', basicSalary: 1500, allowancesAmount: 300, civilId: '290010100123', nationality: 'كويتي', warningsCount: 0, attendanceAbsences: 0, attendanceDelays: 1, excellentForTwoYears: true },
    { id: 'emp-2', employeeId: 'EMP002', fullNameAr: 'سحر جاسم الفيلي', jobTitle: 'مساعد عمليات', department: 'العمليات', joiningDate: '2022-09-12', basicSalary: 750, allowancesAmount: 100, civilId: '295050500456', nationality: 'كويتية', warningsCount: 3, attendanceAbsences: 12, attendanceDelays: 14, excellentForTwoYears: false },
    { id: 'emp-3', employeeId: 'EMP003', fullNameAr: 'خالد عبدالمحسن الصايغ', jobTitle: 'منسق عمليات', department: 'العمليات', joiningDate: '2021-03-05', basicSalary: 1100, allowancesAmount: 150, civilId: '291030300789', nationality: 'كويتي', warningsCount: 0, attendanceAbsences: 2, attendanceDelays: 4, excellentForTwoYears: false },
    { id: 'emp-4', employeeId: 'EMP004', fullNameAr: 'بدر فهد المطيري', jobTitle: 'باحث قانوني', department: 'الشؤون القانونية', joiningDate: '2020-07-15', basicSalary: 1250, allowancesAmount: 200, civilId: '293040400321', nationality: 'كويتي', warningsCount: 1, attendanceAbsences: 1, attendanceDelays: 3, excellentForTwoYears: false },
    { id: 'emp-5', employeeId: 'EMP005', fullNameAr: 'سارة خالد الصباح', jobTitle: 'مستشار قانوني', department: 'الشركات', joiningDate: '2020-02-15', basicSalary: 1800, allowancesAmount: 400, civilId: '295090900111', nationality: 'كويتية', warningsCount: 0, attendanceAbsences: 0, attendanceDelays: 0, excellentForTwoYears: true },
];

// --- SEED REQUESTS (THE 4 INTERACTIVE LIVE DEMOS IN CONTEXT) ---
const initialRequestsSeed: EmployeeRequest[] = [
    {
        id: 'req-seed-1',
        employeeId: 'emp-1',
        employeeName: 'أحمد محمود العبدالله',
        employeeJobTitle: 'محاسب رئيسي',
        employeeDepartment: 'المالية',
        requestType: RequestType.PROMOTION,
        requestDate: '2025-12-15',
        status: 'Signed & Completed',
        referenceNumber: 'QA-REQ-2025-901',
        currentDept: 'المالية',
        requestedDept: 'المالية',
        currentTitle: 'محاسب رئيسي',
        requestedTitle: 'مدير مالي بالإنابة',
        reasonNote: 'تعديل مسمى وظيفي وترقية مالية مستحقة بناءً على الأداء الممتاز المستمر واستلامه مسؤوليات قطاع التدقيق المالي بالكامل.',
        currentSalary: 1800, // Basic +allowance
        proposedSalary: 2070, // 15% raise
        raisePercentage: 15,
        retroactiveDate: '2026-01-01',
        excellentForTwoYears: true,
        previousWarningsCount: 0,
        attendanceAbsencesYear: 0,
        civilId: '290010100123',
        joiningDate: '2018-05-10',
        nationality: 'كويتي',
        hrNotes: 'تم التحقق من تقييم الأداء لعامي 2024 و2025 وكلاهما بتقدير ممتاز. تمت الموافقة وتوقيع القرار رسمياً.',
        completedAt: '2025-12-20'
    },
    {
        id: 'req-seed-2',
        employeeId: 'emp-2',
        employeeName: 'سحر جاسم الفيلي',
        employeeJobTitle: 'مساعد عمليات',
        employeeDepartment: 'العمليات',
        requestType: RequestType.GRIEVANCE_FORM,
        requestDate: '2026-05-15',
        status: 'Under HR Review',
        referenceNumber: 'QA-REQ-2026-902',
        currentDept: 'العمليات',
        requestedDept: 'العمليات',
        currentTitle: 'مساعد عمليات',
        requestedTitle: 'مساعد عمليات',
        reasonNote: 'صياغة ورقة كتابية رداً على لائحة إنذار التقصير، التمس تسوية وضعي الحضور بسبب مرافقة مريض خارج البلاد.',
        currentSalary: 850,
        excellentForTwoYears: false,
        previousWarningsCount: 3,
        attendanceAbsencesYear: 12,
        civilId: '295050500456',
        joiningDate: '2022-09-12',
        nationality: 'كويتية',
        grievanceTitle: 'تظلم بخصوص انخفاض الكفاءة والحضور والغياب',
        grievanceText: 'أرجو إعادة تقييم الحضور والانصراف السنوي حيث كان الغيابات بسبب مرافقة والدتي للعلاج في المستشفيات في الخارج بموافقة شفهية سابقة من شؤون المستلمين.',
        hrNotes: 'قيد التحقق من المستندات والتقارير الطبية المعتمدة من وزارة الصحة لتسوية العقوبة كتابياً عمالياً.'
    },
    {
        id: 'req-seed-3',
        employeeId: 'emp-3',
        employeeName: 'خالد عبدالمحسن الصايغ',
        employeeJobTitle: 'منسق عمليات',
        employeeDepartment: 'العمليات',
        requestType: RequestType.TRANSFER_REQUEST,
        requestDate: '2026-05-18',
        status: 'Under Financial Review',
        referenceNumber: 'QA-REQ-2026-903',
        currentDept: 'العمليات',
        requestedDept: 'إدارة التدقيق القانوني',
        currentTitle: 'منسق عمليات',
        requestedTitle: 'مدقق مالي مشارك',
        reasonNote: 'نقل وظيفي وتغيير القسم للتوافق مع الشهادة القانونية والمالية الحاصل عليها مؤخراً.',
        currentSalary: 1250,
        proposedSalary: 1350,
        raisePercentage: 8,
        excellentForTwoYears: false,
        previousWarningsCount: 0,
        attendanceAbsencesYear: 2,
        civilId: '291030300789',
        joiningDate: '2021-03-05',
        nationality: 'كويتي',
        hrNotes: 'تمت مراجعة الهيكمل الإداري وتوافق القسم الجديد مع السعة الوظيفية. محال للمستشار المالي للمطابقة والاعتماد.'
    },
    {
        id: 'req-seed-4',
        employeeId: 'emp-4',
        employeeName: 'بدر فهد المطيري',
        employeeJobTitle: 'باحث قانوني',
        employeeDepartment: 'الشؤون القانونية',
        requestType: RequestType.GRIEVANCE_FORM,
        requestDate: '2026-05-20',
        status: 'Under HR Review',
        referenceNumber: 'QA-REQ-2026-904',
        currentDept: 'الشؤون القانونية',
        requestedDept: 'الشؤون القانونية',
        currentTitle: 'باحث قانوني',
        requestedTitle: 'باحث قانوني',
        reasonNote: 'تظلم إداري رسمي من تقييم أداء رئيس القسم السنوي (جيد) لكوني أنجزت مذكرات دفاع كسبنا على إثرها قضايا بمبالغ مالية كبيرة.',
        currentSalary: 1450,
        excellentForTwoYears: false,
        previousWarningsCount: 1,
        attendanceAbsencesYear: 1,
        civilId: '293040400321',
        joiningDate: '2020-07-15',
        nationality: 'كويتي',
        grievanceTitle: 'الطعن في تقييم أداء الشؤون القانونية السنوي الكلي',
        grievanceText: 'أوضح أنني صغت مذكرات بصفة شخصية في 14 قضية كلية عمالية وتجارية مكفولة بالنصوص وكسبنا معظمها، بينما حصلت على تقييم ضعيف في مخرجات العمل من رئيس القسم بسبب خلافات في وجهات النظر القانونية بصياغة الدفوع.',
        hrNotes: 'شؤون الموظفين بصدد عقد لجنة خاصة لمراجعة مذكرات وعرائض الدفاع المتظلم منها لمقارنتها بالأحكام المكتسبة.'
    }
];

const EmployeeRequestsPage: React.FC = () => {
    const { t } = useTranslation();

    // --- STATES ---
    const [requests, setRequests] = useState<EmployeeRequest[]>(initialRequestsSeed);
    const [employees, setEmployees] = useState(mockEmployeesList);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'allRequests' | 'requestForm'>('dashboard');
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');

    // Modals
    const [selectedRequest, setSelectedRequest] = useState<EmployeeRequest | null>(null);
    const [isDetailsIdOpen, setIsDetailsIdOpen] = useState(false);
    const [isPrintLayoutOpen, setIsPrintLayoutOpen] = useState(false);
    const [printCategory, setPrintCategory] = useState<'certificate' | 'transfer' | 'promotion' | 'warning' | 'grievance'>('certificate');

    // Edit and Form Mode States
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form inputs
    const [formEmployeeId, setFormEmployeeId] = useState('');
    const [formRequestType, setFormRequestType] = useState<RequestType>(RequestType.SALARY_CERTIFICATE);
    const [formRequestDate, setFormRequestDate] = useState(new Date().toISOString().split('T')[0]);
    const [formNotes, setFormNotes] = useState('');
    const [formHrNotes, setFormHrNotes] = useState('');
    
    // Custom sub forms inputs
    const [formPurpose, setFormPurpose] = useState('general');
    const [formRecipient, setFormRecipient] = useState('شركة تيسير البنك المالي');
    const [formIncludeSalary, setFormIncludeSalary] = useState(true);
    const [formLanguage, setFormLanguage] = useState<'ar' | 'en'>('ar');

    const [formTargetDept, setFormTargetDept] = useState('');
    const [formTargetTitle, setFormTargetTitle] = useState('');
    const [formReasonNote, setFormReasonNote] = useState('');

    const [formGrievanceTitle, setFormGrievanceTitle] = useState('');
    const [formGrievanceText, setFormGrievanceText] = useState('');

    const [formProposedSalary, setFormProposedSalary] = useState<number>(0);
    const [formRaisePercentage, setFormRaisePercentage] = useState<number>(5);

    // Selected metadata retrieval
    const selectedEmployeeMeta = useMemo(() => {
        return employees.find(emp => emp.id === formEmployeeId);
    }, [formEmployeeId, employees]);

    // Sync metadata
    useEffect(() => {
        if (!formEmployeeId && employees.length > 0) {
            setFormEmployeeId(employees[0].id);
        }
    }, [employees, formEmployeeId]);

    useEffect(() => {
        if (selectedEmployeeMeta && formMode === 'create') {
            setFormTargetDept(selectedEmployeeMeta.department);
            setFormTargetTitle(selectedEmployeeMeta.jobTitle);
            setFormProposedSalary(selectedEmployeeMeta.basicSalary + selectedEmployeeMeta.allowancesAmount);
        }
    }, [selectedEmployeeMeta, formMode]);

    // Promotion threshold rule alerts representation
    const promotionVettingAlertTrigger = useMemo(() => {
        return formRequestType === RequestType.PROMOTION && selectedEmployeeMeta && !selectedEmployeeMeta.excellentForTwoYears;
    }, [formRequestType, selectedEmployeeMeta]);

    const dashboardSummaryStats = useMemo(() => {
        const total = requests.length;
        const pendingValue = requests.filter(r => r.status === 'Pending Line Manager' || r.status === 'Under HR Review').length;
        const completeValue = requests.filter(r => r.status === 'Signed & Completed').length;
        const financialReviewValue = requests.filter(r => r.status === 'Under Financial Review').length;

        const promotionRequestsCount = requests.filter(r => r.requestType === RequestType.PROMOTION).length;
        const grievancesCount = requests.filter(r => r.requestType === RequestType.GRIEVANCE_FORM).length;
        const certificatesCount = requests.filter(r => r.requestType === RequestType.SALARY_CERTIFICATE || r.requestType === RequestType.TO_WHOM_IT_MAY_CONCERN).length;

        return {
            total, pendingValue, completeValue, financialReviewValue,
            promotionRequestsCount, grievancesCount, certificatesCount
        };
    }, [requests]);

    // --- CRUD WRITING ---
    const handleSwitchToForm = (mode: 'create' | 'edit', req?: EmployeeRequest) => {
        setFormMode(mode);
        if (mode === 'create') {
            setEditingId(null);
            setFormEmployeeId(employees[0]?.id || '');
            setFormRequestType(RequestType.SALARY_CERTIFICATE);
            setFormRequestDate(new Date().toISOString().split('T')[0]);
            setFormNotes('');
            setFormHrNotes('');
            setFormPurpose('general');
            setFormRecipient('');
            setFormIncludeSalary(true);
            setFormLanguage('ar');
            setFormTargetDept('');
            setFormTargetTitle('');
            setFormReasonNote('');
            setFormGrievanceTitle('');
            setFormGrievanceText('');
            setFormProposedSalary(0);
            setFormRaisePercentage(5);
        } else if (mode === 'edit' && req) {
            setEditingId(req.id);
            setFormEmployeeId(req.employeeId);
            setFormRequestType(req.requestType);
            setFormRequestDate(req.requestDate);
            setFormNotes(req.notes || '');
            setFormHrNotes(req.hrNotes || '');
            
            // Sub forms
            setFormPurpose(req.purposeType || 'general');
            setFormRecipient(req.specificRecipient || '');
            setFormIncludeSalary(!!req.includeSalaryDetails);
            setFormLanguage(req.language || 'ar');
            setFormTargetDept(req.requestedDept);
            setFormTargetTitle(req.requestedTitle);
            setFormReasonNote(req.reasonNote);
            setFormGrievanceTitle(req.grievanceTitle || '');
            setFormGrievanceText(req.grievanceText || '');
            setFormProposedSalary(req.proposedSalary || 0);
            setFormRaisePercentage(req.raisePercentage || 5);
        }
        setActiveTab('requestForm');
    };

    const handleDuplicate = (req: EmployeeRequest) => {
        const copy: EmployeeRequest = {
            ...req,
            id: `req-copy-${Date.now()}`,
            referenceNumber: `QA-REQ-${new Date().getFullYear()}-${Math.floor(Math.random() * 900) + 100}`,
            status: 'Draft',
            requestDate: new Date().toISOString().split('T')[0],
            employeeName: `${req.employeeName} (نسخة مسودة)`,
        };
        setRequests(prev => [copy, ...prev]);
        setActiveTab('allRequests');
    };

    const handleDelete = (id: string) => {
        if (confirm('هل ترغب في سحب وحذف هذا المعاملة أو الطلب الإداري نهائياً؟')) {
            setRequests(prev => prev.filter(r => r.id !== id));
        }
    };

    const handleFormSaveSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const activeEmp = employees.find(emp => emp.id === formEmployeeId);
        if (!activeEmp) return;

        const newRequestModel: EmployeeRequest = {
            id: formMode === 'create' ? `req-new-${Date.now()}` : (editingId || ''),
            employeeId: activeEmp.id,
            employeeName: activeEmp.fullNameAr,
            employeeJobTitle: activeEmp.jobTitle,
            employeeDepartment: activeEmp.department,
            requestType: formRequestType,
            requestDate: formRequestDate,
            status: formMode === 'create' ? 'Draft' : (requests.find(x => x.id === editingId)?.status || 'Under HR Review'),
            referenceNumber: formMode === 'create' ? `QA-REQ-2026-0${requests.length + 95}` : (requests.find(x => x.id === editingId)?.referenceNumber || `QA-REQ-2026-${Math.floor(Math.random()*200)}`),
            
            purposeType: formPurpose,
            specificRecipient: formRecipient,
            includeSalaryDetails: formIncludeSalary,
            language: formLanguage,
            
            currentDept: activeEmp.department,
            requestedDept: formTargetDept,
            currentTitle: activeEmp.jobTitle,
            requestedTitle: formTargetTitle,
            reasonNote: formReasonNote,

            grievanceTitle: formGrievanceTitle,
            grievanceText: formGrievanceText,

            currentSalary: activeEmp.basicSalary + activeEmp.allowancesAmount,
            proposedSalary: formProposedSalary,
            raisePercentage: formRaisePercentage,

            notes: formNotes,
            hrNotes: formHrNotes,
            
            excellentForTwoYears: activeEmp.excellentForTwoYears,
            previousWarningsCount: activeEmp.warningsCount,
            attendanceAbsencesYear: activeEmp.attendanceAbsences,
            civilId: activeEmp.civilId,
            joiningDate: activeEmp.joiningDate,
            nationality: activeEmp.nationality
        };

        if (formMode === 'create') {
            setRequests(prev => [newRequestModel, ...prev]);
        } else {
            setRequests(prev => prev.map(r => r.id === editingId ? newRequestModel : r));
        }

        setActiveTab('allRequests');
    };

    const handleUpdateWorkflowStatus = (requestId: string, status: RequestWorkflowStatus) => {
        setRequests(prev => prev.map(req => {
            if (req.id === requestId) {
                return {
                    ...req,
                    status,
                    completedAt: status === 'Signed & Completed' ? new Date().toISOString().split('T')[0] : req.completedAt
                };
            }
            return req;
        }));

        const fresh = requests.find(x => x.id === requestId);
        if (fresh) {
            setSelectedRequest(prev => prev && prev.id === requestId ? { ...prev, status } : prev);
        }
    };

    // Filter calculations
    const filteredRequestsList = useMemo(() => {
        return requests.filter(r => {
            const matchesSearch = r.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 r.employeeJobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 r.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 (r.notes && r.notes.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesType = typeFilter === 'All' || r.requestType === typeFilter;
            const matchesStatus = statusFilter === 'All' || r.status === statusFilter;

            return matchesSearch && matchesType && matchesStatus;
        });
    }, [requests, searchQuery, typeFilter, statusFilter]);

    const openPrintDocument = (req: EmployeeRequest, cat: 'certificate' | 'transfer' | 'promotion' | 'warning' | 'grievance') => {
        setSelectedRequest(req);
        setPrintCategory(cat);
        setIsPrintLayoutOpen(true);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-20">
            {/* --- CORE HEADER TRACK --- */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-primary/10 rounded-2xl text-primary">
                        <MessageSquare className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Link to="/employee-affairs" className="text-xs text-primary hover:underline font-bold">شؤون الموظفين</Link>
                            <span className="text-xs text-slate-300">/</span>
                            <span className="text-xs text-slate-400 font-bold">الطلبات والقرارات الإدارية وعلاقات الموظفين</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-800 dark:text-white">إصدار القرارات الإدارية والشهادات الرسمية</h1>
                        <p className="text-slate-400 text-xs font-bold mt-1">
                            توليد مستندات ترقية الموظفين، كتب النقل الداخلي المعتمدة، شهادات لمن يهمه الأمر للجهات المصرفية، وطلبات التظلم
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full lg:w-auto">
                    <Button variant="primary" onClick={() => handleSwitchToForm('create')} className="w-full lg:w-auto rounded-xl flex items-center justify-center gap-2">
                        <Plus className="w-5 h-5" />
                        تجهيز طلب / قرار إداري رسمي
                    </Button>
                </div>
            </div>

            {/* --- DASHBOARD QUICK METRICS GRID --- */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 bg-white dark:bg-slate-900 border-none shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-slate-400 text-xs font-black">إجمالي الطلبات والقرارات</div>
                        <div className="text-2xl font-black text-slate-800 dark:text-white mt-1">{dashboardSummaryStats.total}</div>
                    </div>
                    <FileText className="w-8 h-8 text-primary opacity-20" />
                </Card>
                <Card className="p-4 bg-white dark:bg-slate-900 border-none shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-slate-400 text-xs font-black">طلبات معلّقة وقيد المراجعة</div>
                        <div className="text-2xl font-black text-amber-500 mt-1">{dashboardSummaryStats.pendingValue}</div>
                    </div>
                    <Clock className="w-8 h-8 text-amber-500 opacity-20" />
                </Card>
                <Card className="p-4 bg-white dark:bg-slate-900 border-none shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-slate-400 text-xs font-black">الترقيات المالية المطروحة</div>
                        <div className="text-2xl font-black text-emerald-500 mt-1">{dashboardSummaryStats.promotionRequestsCount}</div>
                    </div>
                    <Award className="w-8 h-8 text-emerald-500 opacity-20" />
                </Card>
                <Card className="p-4 bg-white dark:bg-slate-900 border-none shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-slate-400 text-xs font-black font-sans">تظلمات أداء وشكاوى نشطة</div>
                        <div className="text-2xl font-black text-rose-500 mt-1">{dashboardSummaryStats.grievancesCount}</div>
                    </div>
                    <ShieldAlert className="w-8 h-8 text-rose-500 opacity-20" />
                </Card>
            </div>

            {/* --- TAB VIEW DESIGN --- */}
            <div className="flex border-b border-slate-100 dark:border-slate-800">
                <button onClick={() => setActiveTab('dashboard')} className={`px-6 py-4 text-sm font-black border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'dashboard' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                    <Signature className="w-4 h-4" />
                    الاحصائيات وموجز شؤون العلاقات
                </button>
                <button onClick={() => setActiveTab('allRequests')} className={`px-6 py-4 text-sm font-black border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'allRequests' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                    <ClipboardCheck className="w-4 h-4" />
                    جميع الطلبات والشهادات النشطة ({requests.length})
                </button>
                <button onClick={() => handleSwitchToForm('create')} className={`px-6 py-4 text-sm font-black border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'requestForm' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                    <FileText className="w-4 h-4" />
                    {formMode === 'create' ? 'صياغة وثيقة إلكترونية جديدة' : 'تحديث مسار القرار الإداري'}
                </button>
            </div>

            {/* --- TAB 1: DASHBOARD WRITING --- */}
            {activeTab === 'dashboard' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 border-none shadow-sm" title="النماذج الأربعة التفاعلية لشؤون الموظفين (Interactive Demos)">
                            <p className="text-xs text-slate-400 mb-6 font-bold">معاينة مباشرة ومثبتة لنماذج الترقيات ومستندات الإنذار وتقارير تظلمات مذكرات الدفاع عن أداء المحامين والباحثين القانونيين.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {requests.slice(0, 4).map((req) => (
                                    <div key={req.id} className="p-4 bg-slate-50 dark:bg-slate-800 border rounded-3xl space-y-3 hover:border-primary/20 hover:shadow-sm transition-all flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <Badge text={req.requestType} color="blue" />
                                                <span className="text-[10px] font-sans font-black text-slate-400">{req.referenceNumber}</span>
                                            </div>
                                            <h3 className="text-sm font-black text-slate-800 dark:text-white mt-1">{req.employeeName}</h3>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">{req.employeeJobTitle} • {req.employeeDepartment}</p>
                                            
                                            <div className="mt-4 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 space-y-1">
                                                <span className="text-[8px] uppercase tracking-wider text-slate-400 block font-black">مرحلة سير القرار الإداري:</span>
                                                <span className="text-[11px] font-black text-slate-700 dark:text-slate-200 block">{req.status}</span>
                                            </div>
                                        </div>

                                        <div className="pt-4 flex gap-1.5 justify-end">
                                            <Button variant="outline" size="sm" onClick={() => { setSelectedRequest(req); setIsDetailsIdOpen(true); }} className="py-2.5 text-xs">
                                                <Eye className="w-3.5 h-3.5 me-1" />
                                                تفاصيل خط الحفز
                                            </Button>
                                            <Button variant="ghost" className="bg-primary/5 hover:bg-primary/10 text-primary py-2.5 text-[10px]" onClick={() => openPrintDocument(req, req.requestType === RequestType.PROMOTION ? 'promotion' : req.requestType === RequestType.GRIEVANCE_FORM ? 'grievance' : req.requestType === RequestType.TRANSFER_REQUEST ? 'transfer' : 'certificate')}>
                                                <Printer className="w-3 h-3 me-1" />
                                                عرض للطباعة
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Right side compliance regulations */}
                        <div className="space-y-4">
                            <Card className="p-6 bg-white dark:bg-slate-900 border-none shadow-sm" title="فحوص الامتثال لشؤون الموظفين (Kuwait Laws)">
                                <div className="space-y-4 mt-4">
                                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/10 rounded-2xl border border-emerald-100 flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                                        <div className="text-xs">
                                            <h4 className="font-black text-emerald-800 dark:text-emerald-400">تدقيق شروط ترقية رئيس الحسابات</h4>
                                            <p className="text-[10px] text-emerald-600 dark:text-emerald-300 font-bold mt-1">
                                                الموظف أحمد العبدالله مستوفٍ لجميع شروط المادة 4 من اللائحة الاسترشادية الكويتية لحصوله على تقدير ممتاز للسنتين الماضيتين.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-rose-50 dark:bg-rose-950/10 rounded-2xl border border-rose-100 flex items-start gap-3">
                                        <ShieldAlert className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
                                        <div className="text-xs">
                                            <h4 className="font-black text-rose-800 dark:text-rose-400">تنظيم علاقات العمال والانذارات</h4>
                                            <p className="text-[10px] text-rose-600 dark:text-rose-300 font-bold mt-1">
                                                سجل الموظفة سحر الفيلي يعاني من 12 غياباً عمالياً كتابياً رسمياً. يقترح النظام إخطارها نهائياً لتبرير الموقف قبل تفعيل إجراءات المادة 41.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            )}

            {/* --- TAB 2: ALL REQUESTS GRID --- */}
            {activeTab === 'allRequests' && (
                <div className="space-y-4">
                    {/* Searches Panel */}
                    <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border">
                        <div className="relative flex-grow">
                            <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input 
                                type="text"
                                placeholder="ابحث برقم المعاملة، اسم الموظف، المسمى الوظيفي..."
                                className="w-full ps-12 pe-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none text-sm font-bold focus:ring-2 focus:ring-primary"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <select 
                                className="bg-slate-50 dark:bg-slate-800 rounded-2xl border-none text-xs font-black px-4 py-3 cursor-pointer outline-none focus:ring-2 focus:ring-primary"
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                            >
                                <option value="All">جميع أنواع الطلبات والقرارات</option>
                                <option value={RequestType.PROMOTION}>طلبات الترقية والزيادة</option>
                                <option value={RequestType.TRANSFER_REQUEST}>طلبات النقل من قسم لقسم</option>
                                <option value={RequestType.GRIEVANCE_FORM}>التظلمات الإدارية</option>
                                <option value={RequestType.SALARY_CERTIFICATE}>شهادات الراتب البنكية</option>
                                <option value={RequestType.TO_WHOM_IT_MAY_CONCERN}>شهادات لمن يهمه الأمر</option>
                            </select>

                            <select 
                                className="bg-slate-50 dark:bg-slate-800 rounded-2xl border-none text-xs font-black px-4 py-3 cursor-pointer outline-none focus:ring-2 focus:ring-primary"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="All">كل الحالات الحركية</option>
                                <option value="Draft">مسودة رئيس القسم</option>
                                <option value="Under HR Review">مرفوع للموارد البشرية</option>
                                <option value="Under Financial Review">قيد المطابقة المالية والبدلات</option>
                                <option value="Signed & Completed">معتمد، مختوم وموقع بالكامل</option>
                            </select>
                        </div>
                    </div>

                    {/* Table of all active operations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredRequestsList.map((req) => (
                            <Card key={req.id} className="p-6 bg-white dark:bg-slate-900 border border-slate-50 shadow-sm rounded-3xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16 group-hover:scale-150 transition-all duration-750"></div>
                                
                                <div className="flex justify-between items-start mb-4 relative">
                                    <div>
                                        <div className="flex items-center gap-1.5 mb-1 text-[10px] font-black font-sans text-slate-400">
                                            <span>#{req.referenceNumber}</span>
                                            <span>•</span>
                                            <span>{req.requestDate}</span>
                                        </div>
                                        <h3 className="text-base font-black text-slate-800 dark:text-white">{req.employeeName}</h3>
                                        <p className="text-[11px] text-slate-400 font-bold uppercase">{req.employeeJobTitle} | {req.employeeDepartment}</p>
                                    </div>
                                    <Badge text={req.requestType} color="indigo" />
                                </div>

                                <div className="my-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 flex items-center justify-between">
                                    <div>
                                        <span className="text-[8px] uppercase tracking-wider text-slate-400 block font-black">حالة التدقيق والمحاضر:</span>
                                        <span className="text-xs font-black text-slate-700 dark:text-slate-300 mt-0.5 inline-block">{req.status}</span>
                                    </div>
                                    <Badge text={req.status === 'Signed & Completed' ? 'مكتمل وموقع' : 'نشط'} color={req.status === 'Signed & Completed' ? 'green' : 'amber'} />
                                </div>

                                <p className="text-xs text-slate-500 font-medium leading-relaxed italic line-clamp-2 h-9 mb-4">
                                    "{req.reasonNote || 'لا تتوفر مبررات مفصلة.'}"
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                    <div>
                                        <span className="text-[8px] uppercase text-slate-400 block font-black">المستند القانوني</span>
                                        <span className="text-[10px] font-black text-primary">جاهز للبروكوراتور</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => { setSelectedRequest(req); setIsDetailsIdOpen(true); }} className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-xl" title="تفاصيل الحركة وتعديل التدفق">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDuplicate(req)} className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-slate-50 text-indigo-500 rounded-xl" title="تكرار وإنتاج نسخة مسودة">
                                            <Copy className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleSwitchToForm('edit', req)} className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-slate-50 rounded-xl" title="تعديل التفاصيل">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(req.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-50 rounded-xl" title="سحب وحذف المعاملة">
                                            <Trash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* --- TAB 3: FORM WRITING WORKPLACE --- */}
            {activeTab === 'requestForm' && (
                <form onSubmit={handleFormSaveSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 border-none shadow-sm space-y-6" title={formMode === 'create' ? 'صياغة معاملة أو قرار إداري أو شهادة رسمية' : 'تعديل وتعديل معاملات شؤون الموظفين'}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-black text-slate-500 block">الموظف المعني بالقرار / المعاملة</label>
                                    <select 
                                        className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border-none outline-none focus:ring-2 focus:ring-primary text-xs font-black"
                                        value={formEmployeeId}
                                        onChange={(e) => setFormEmployeeId(e.target.value)}
                                        required
                                        disabled={formMode === 'edit'}
                                    >
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>{emp.fullNameAr} ({emp.employeeId})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-black text-slate-500 block">تصنيف ونوع المستند الإداري والمالي</label>
                                    <select 
                                        className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border-none outline-none focus:ring-2 focus:ring-primary text-xs font-black"
                                        value={formRequestType}
                                        onChange={(e) => setFormRequestType(e.target.value as RequestType)}
                                        required
                                    >
                                        <option value={RequestType.SALARY_CERTIFICATE}>شهادة راتب رسمية (Salary Certificate)</option>
                                        <option value={RequestType.TO_WHOM_IT_MAY_CONCERN}>شهادة لمن يهمه الأمر موضح بها المسمى (To Whom It May concern)</option>
                                        <option value={RequestType.PROMOTION}>قرار ترقية إدارية وتعديل مالي (Promotion & Salary Raise)</option>
                                        <option value={RequestType.TRANSFER_REQUEST}>قرار نقل داخلي للموظف (Department Transfer)</option>
                                        <option value={RequestType.GRIEVANCE_FORM}>تقديم تظلم إداري رسمي من تقييم الأداء (Grievance Appeal)</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-black text-slate-500 block">تاريخ صدور المعاملة</label>
                                    <input 
                                        type="date" 
                                        className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border-none outline-none focus:ring-2 focus:ring-primary text-xs font-black"
                                        value={formRequestDate}
                                        onChange={(e) => setFormRequestDate(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Dynamic render sub forms relative to options */}
                            
                            {/* Option 1: Salaries or To whom certificates */}
                            {(formRequestType === RequestType.SALARY_CERTIFICATE || formRequestType === RequestType.TO_WHOM_IT_MAY_CONCERN) && (
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 space-y-4">
                                    <h4 className="text-xs font-black text-primary uppercase">تعديل بيانات شهادة الراتب لمن يهمه الأمر</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-500">الغرض المباشر (المقصد)</label>
                                            <select 
                                                className="w-full bg-white dark:bg-slate-900 p-2.5 rounded-xl border-none outline-none text-xs font-semibold"
                                                value={formPurpose}
                                                onChange={(e) => setFormPurpose(e.target.value)}
                                            >
                                                <option value="general">إلى من يهمه الأمر (عام)</option>
                                                <option value="bank">لبنك أو مؤسسة تمويل مصرفي بالكويت</option>
                                                <option value="embassy">لسفارات تمثيل دبلوماسي بالخارج</option>
                                            </select>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-500">اسم الجهة الموجه إليها المستند</label>
                                            <input 
                                                type="text" 
                                                className="w-full bg-white dark:bg-slate-900 p-2.5 rounded-xl border-none outline-none text-xs font-semibold"
                                                value={formRecipient}
                                                onChange={(e) => setFormRecipient(e.target.value)}
                                                placeholder="مثال: بنك بوبيان، البنك الوطني..."
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-500 block">لغة المستند المخرجات</label>
                                            <select 
                                                className="w-full bg-white dark:bg-slate-900 p-2.5 rounded-xl border-none outline-none text-xs font-semibold"
                                                value={formLanguage}
                                                onChange={(e) => setFormLanguage(e.target.value as 'ar' | 'en')}
                                            >
                                                <option value="ar">اللغة العربية (معتمدة وطنيا)</option>
                                                <option value="en">اللغة الإنجليزية (للسفارات والجهات المصرفية الأجنبية)</option>
                                            </select>
                                        </div>

                                        <div className="flex items-center gap-3 pt-4">
                                            <input 
                                                type="checkbox" 
                                                className="w-4 h-4 text-primary rounded focus:ring-0 outline-none"
                                                checked={formIncludeSalary}
                                                onChange={(e) => setFormIncludeSalary(e.target.checked)}
                                            />
                                            <span className="text-xs font-black text-slate-700">تضمين تفاصيل الراتب والبدلات بالكويت</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Option 2: Promotions SubForm */}
                            {formRequestType === RequestType.PROMOTION && (
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 space-y-4">
                                    <h4 className="text-xs font-black text-primary uppercase">معاودة صياغة البدلات والرواتب بعد الترقية</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold font-sans">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-500 block">المسمى الوظيفي المستهدف المقترح</label>
                                            <input 
                                                type="text" 
                                                className="w-full bg-white dark:bg-slate-900 p-3 rounded-xl border-none outline-none"
                                                value={formTargetTitle}
                                                onChange={(e) => setFormTargetTitle(e.target.value)}
                                                placeholder="مثال: مدير مالي تنفيذي، مستشار أول..."
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-500 block">الراتب الأساسي الجديد المقترح بعد التعديل لوزارة الشؤون (د.ك)</label>
                                            <input 
                                                type="number" 
                                                className="w-full bg-white dark:bg-slate-900 p-3 rounded-xl border-none outline-none font-mono font-black"
                                                value={formProposedSalary}
                                                onChange={(e) => setFormProposedSalary(parseFloat(e.target.value) || 0)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Option 3: Department Transfer SubForm */}
                            {formRequestType === RequestType.TRANSFER_REQUEST && (
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border space-y-4">
                                    <h4 className="text-xs font-black text-primary uppercase">المناقلة وتسكين الموارد الإدارية</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-slate-500 font-bold block">القسم الجديد المستهدف للنقل إليه</label>
                                            <input 
                                                type="text" 
                                                className="w-full bg-white dark:bg-slate-900 p-3 rounded-xl border-none outline-none"
                                                value={formTargetDept}
                                                onChange={(e) => setFormTargetDept(e.target.value)}
                                                placeholder="مثال: إدارة التدقيق القانوني"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[10px] text-slate-500 font-bold block">المسمى الوظيفي المستهدف</label>
                                            <input 
                                                type="text" 
                                                className="w-full bg-white dark:bg-slate-900 p-3 rounded-xl border-none outline-none"
                                                value={formTargetTitle}
                                                onChange={(e) => setFormTargetTitle(e.target.value)}
                                                placeholder="مثال: مدقق مشارك"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Option 4: Grievance Section */}
                            {formRequestType === RequestType.GRIEVANCE_FORM && (
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border space-y-4">
                                    <h4 className="text-xs font-black text-primary uppercase">تسجيل تفاصيل التظلم الإداري والمحاضر المتبادلة</h4>
                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-slate-500 block">عنوان أو ترويسة التظلم المالي أو الإداري</label>
                                            <input 
                                                type="text" 
                                                className="w-full bg-white dark:bg-slate-900 p-3 rounded-xl border-none outline-none text-xs font-black text-purple-800"
                                                value={formGrievanceTitle}
                                                onChange={(e) => setFormGrievanceTitle(e.target.value)}
                                                placeholder="مثال: الطعن في تقدير كفاءة باحث شؤون..."
                                                required
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[10px] text-slate-500 block">تفصيل مبررات الطعن والتظلم بالتفصيل القانوني</label>
                                            <textarea 
                                                rows={3}
                                                className="w-full bg-white dark:bg-slate-900 p-3 rounded-xl border-none outline-none text-xs font-medium text-slate-700"
                                                value={formGrievanceText}
                                                onChange={(e) => setFormGrievanceText(e.target.value)}
                                                placeholder="ادخل الملاحظات المعارضة مع سرد الأدلة وبنود القضايا..."
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Reason notes */}
                            <div className="space-y-1 pt-4">
                                <label className="text-xs font-black text-slate-500 block">مبررات تقديم المعاملة وحيثياتها بالتاريخ (Notes)</label>
                                <textarea 
                                    rows={2}
                                    className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border-none outline-none text-xs font-semibold"
                                    value={formReasonNote}
                                    onChange={(e) => setFormReasonNote(e.target.value)}
                                    placeholder="مبررات نقل من قسم لقسم، أو استلام بدلات إيقاف وغيرها الحركية..."
                                    required
                                />
                            </div>
                        </Card>

                        {/* Left sidebar info retrieval & checks */}
                        <div className="space-y-6">
                            <Card className="p-4 bg-slate-50 dark:bg-slate-900 border-none shadow-sm" title="فحوص التدقيق من أداء السنوات">
                                {selectedEmployeeMeta ? (
                                    <div className="space-y-3 mt-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                                        <div className="flex justify-between border-b pb-2">
                                            <span>الراتب المعتمد لديه:</span>
                                            <span className="font-mono font-black text-primary">{selectedEmployeeMeta.basicSalary} د.ك</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <span>هل أداؤه ممتاز متواتر؟</span>
                                            <span className={selectedEmployeeMeta.excellentForTwoYears ? 'text-emerald-500 font-black' : 'text-slate-500'}>
                                                {selectedEmployeeMeta.excellentForTwoYears ? 'نعم (مستوف السنتين امتياز)' : 'لا'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <span>إجمالي غيابه السنوي:</span>
                                            <span className={selectedEmployeeMeta.attendanceAbsences > 7 ? 'text-red-500 font-black' : ''}>{selectedEmployeeMeta.attendanceAbsences} أيام</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>عدد إنذاراته العمالية:</span>
                                            <span>{selectedEmployeeMeta.warningsCount} إنذار موثق</span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-400 mt-4 text-center">يرجى تحديد موظف أولاً.</p>
                                )}
                            </Card>

                            {/* Vetting Alerts with strict rules */}
                            {promotionVettingAlertTrigger && (
                                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-2 animate-pulse">
                                    <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                    <div className="text-[10px] text-amber-800 font-bold leading-relaxed">
                                        <strong>تنبيه ترقية:</strong> الموظف غير مستوفٍ لشرط الأداء "Excellent الممتاز" لآخر عامين متتاليين. يرجى إيضاح موافقة استثنائية من المدير الشريك لدعم المعاملة مالياً.
                                    </div>
                                </div>
                            )}

                            {/* Actions summary */}
                            <Card className="p-6 bg-white dark:bg-slate-900 border-none shadow-sm" title="اعتماد وحفظ المعاملة">
                                <div className="space-y-3 text-xs font-bold">
                                    <p className="text-slate-400 leading-relaxed text-[11px]">سيقوم النظام تلقائياً بتوليد كود تتبع (QR Verification) لتسهيل المصادقة الخارجية من المتصفحات.</p>
                                    
                                    <div className="flex gap-2 pt-4">
                                        <Button type="submit" variant="primary" className="flex-grow py-3 text-xs rounded-2xl font-black">
                                            {formMode === 'create' ? 'اعتماد المسودة وتوليد الرقم' : 'تحديث ملف القرار الإداري'}
                                        </Button>
                                        <Button type="button" variant="outline" onClick={() => setActiveTab('dashboard')} className="py-3 text-xs rounded-2xl">
                                            إلغاء
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </form>
            )}

            {/* --- DETAILED DIALOG MODEL WITH WORKFLOW ANIMATIONS --- */}
            <Modal isOpen={isDetailsIdOpen} onClose={() => setIsDetailsIdOpen(false)} title={`شاشة المتابعة وسير حركة المعاملة: ${selectedRequest?.employeeName}`} size="xl">
                {selectedRequest && (
                    <div className="space-y-6 max-h-[80vh] overflow-y-auto p-4 scrollbar-thin text-xs">
                        
                        {/* Interactive status selectors */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border border-slate-100">
                            <div>
                                <h4 className="font-black text-slate-400">التحكم التفاعلي في حالة المعاملة الحركية</h4>
                                <p className="text-[10px] text-slate-500 font-bold">تغيير الحالة يغذي خطوط التوقيع والأختام بالتواريخ المناسبة.</p>
                            </div>
                            <select 
                                className="bg-white dark:bg-slate-900 font-black p-2.5 rounded-xl border outline-none"
                                value={selectedRequest.status}
                                onChange={(e) => handleUpdateWorkflowStatus(selectedRequest.id, e.target.value as RequestWorkflowStatus)}
                            >
                                <option value="Draft">مسودة (Draft)</option>
                                <option value="Pending Line Manager">معلقة لموافقة المدير المباشر</option>
                                <option value="Under HR Review">مرفوعة للمراجعة والتدقيق الإداري</option>
                                <option value="Under Financial Review">قيد التدقيق والبدلات المالية</option>
                                <option value="Signed & Completed">مكتمل ومختوم بالكامل (Signed & Completed)</option>
                            </select>
                        </div>

                        {/* Interactive workflow stages timeline */}
                        <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border text-center">
                            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-6">سلسلة الموافقة الإدارية (Approval Chain Stages)</h3>
                            <div className="flex flex-col md:flex-row justify-between items-center relative gap-8 md:gap-2">
                                <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 hidden md:block"></div>
                                <div className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 hidden md:block transition-all duration-700" style={{
                                    width: selectedRequest.status === 'Signed & Completed' ? '100%' :
                                           selectedRequest.status === 'Under Financial Review' ? '75%' :
                                           selectedRequest.status === 'Under HR Review' ? '50%' :
                                           selectedRequest.status === 'Pending Line Manager' ? '25%' : '0%'
                                }}></div>

                                {[
                                    { s: 'Draft', label: 'مسودة الإعداد' },
                                    { s: 'Pending Line Manager', label: 'رئيس القسم' },
                                    { s: 'Under HR Review', label: 'الموارد البشرية' },
                                    { s: 'Under Financial Review', label: 'المستشار المالي' },
                                    { s: 'Signed & Completed', label: 'وقع واعتمده' }
                                ].map((step, i) => {
                                    const states = ['Draft', 'Pending Line Manager', 'Under HR Review', 'Under Financial Review', 'Signed & Completed'];
                                    const currIdx = states.indexOf(selectedRequest.status);
                                    const stepIdx = states.indexOf(step.s);
                                    const isPassed = stepIdx <= currIdx;
                                    const isActive = stepIdx === currIdx;

                                    return (
                                        <div key={i} className="flex md:flex-col items-center gap-4 md:gap-2 z-10 shrink-0">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-md transition-all duration-500 ${isPassed ? 'bg-primary text-white scale-110' : 'bg-white text-slate-400'}`}>
                                                {isPassed ? '✓' : i + 1}
                                            </div>
                                            <span className={`text-[9px] font-black uppercase text-center ${isActive ? 'text-primary' : isPassed ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}`}>
                                                {step.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Requests parameters summary */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                            <div>رقم القرار المطبوع: <span className="font-mono font-black text-slate-800 dark:text-slate-100">{selectedRequest.referenceNumber}</span></div>
                            <div>المرتب المالي للتعاقد: <span className="font-mono font-black text-slate-800 dark:text-slate-100">{selectedRequest.currentSalary} د.ك</span></div>
                            {selectedRequest.proposedSalary ? (
                                <div>المرتب المالي المقترح: <span className="font-mono font-black text-emerald-600">{selectedRequest.proposedSalary} د.ك</span></div>
                            ) : null}
                            <div>إنذارات وحالات الغياب: <span className="text-red-500 font-bold">{selectedRequest.attendanceAbsencesYear} غياب، {selectedRequest.previousWarningsCount} إنذارات</span></div>
                        </div>

                        {/* Action docs links and printing dispatch */}
                        <div className="p-6 bg-white dark:bg-slate-900 border rounded-3xl space-y-4">
                            <h4 className="font-black text-primary uppercase">الكتب والخطابات الإدارية المعتمدة للربط والتحميل للتسوية</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                <Button variant="outline" className="flex items-center gap-1.5 justify-center py-2.5 text-xs" onClick={() => openPrintDocument(selectedRequest, 'certificate')}>
                                    <Printer className="w-4 h-4 text-primary" />
                                    شهادة لمن يهمه الأمر / راتب
                                </Button>

                                {selectedRequest.requestType === RequestType.PROMOTION && (
                                    <Button variant="outline" className="flex items-center gap-1.5 justify-center py-2.5 text-xs border-emerald-500 hover:bg-emerald-50 text-emerald-600" onClick={() => openPrintDocument(selectedRequest, 'promotion')}>
                                        <Printer className="w-4 h-4" />
                                        قرار ترقية وتعديل مالي
                                    </Button>
                                )}

                                {selectedRequest.requestType === RequestType.TRANSFER_REQUEST && (
                                    <Button variant="outline" className="flex items-center gap-1.5 justify-center py-2.5 text-xs border-amber-500 hover:bg-amber-50 text-amber-600" onClick={() => openPrintDocument(selectedRequest, 'transfer')}>
                                        <Printer className="w-4 h-4" />
                                        قرار نقل موظف داخلي
                                    </Button>
                                )}

                                {selectedRequest.requestType === RequestType.GRIEVANCE_FORM && (
                                    <Button variant="outline" className="flex items-center gap-1.5 justify-center py-2.5 text-xs border-purple-500 hover:bg-purple-50 text-purple-600" onClick={() => openPrintDocument(selectedRequest, 'grievance')}>
                                        <Printer className="w-4 h-4" />
                                        تظلم ومذكرة رد قانونية
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t">
                            <Button variant="primary" onClick={() => setIsDetailsIdOpen(false)}>إغلاق لوحة التحكم</Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* --- COMPREHENSIVE LEGAL PRINT VIEW --- */}
            <Modal isOpen={isPrintLayoutOpen} onClose={() => setIsPrintLayoutOpen(false)} title="صياغة المستند لطباعة قانونية متطابقة" size="xl">
                {selectedRequest && (
                    <div className="space-y-6 max-h-[85vh] overflow-y-auto p-4 scrollbar-thin">
                        <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl flex items-center justify-between">
                            <div className="text-[11px] text-amber-800 font-bold">
                                <strong>توجيه طباعة الشهادات:</strong> مجهز بتنسيق الطباعة الرسمي. اضغط زر الطباعة ليقوم نظام التشغيل باقتصاص الأزرار الحركية وتثبيت الختم الرسمي لمجموعة عدالة.
                            </div>
                            <Button variant="primary" size="sm" onClick={() => window.print()} className="font-black text-xs shrink-0 flex items-center gap-1.5 ms-4">
                                <Printer className="w-4 h-4" />
                                إملاء أمر الطباعة (Print Document)
                            </Button>
                        </div>

                        {/* White paper layout with Kuwait watermarks */}
                        <div className="bg-white text-black p-10 border shadow-md font-sans rounded-3xl min-h-[29cm] relative select-text" style={{ direction: 'rtl' }}>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] select-none pointer-events-none z-0">
                                <div className="w-96 h-96 border-8 border-primary rounded-full flex items-center justify-center font-black text-3xl text-primary font-serif">
                                    ADALA PRO
                                </div>
                            </div>

                            {/* Company header */}
                            <div className="border-b-2 border-slate-300 pb-4 flex justify-between items-center z-10 relative">
                                <div className="text-right space-y-1">
                                    <h2 className="text-lg font-black text-slate-800 font-serif">مجموعة عدالة للمحاماة والاستشارت القانونية</h2>
                                    <p className="text-[10px] text-slate-500 font-bold font-sans">قسم شؤون العلاقات العامة • الموارد البشرية • دولة الكويت</p>
                                    <p className="text-[9px] text-slate-400 font-bold font-sans">هاتف: 965254000+ • ص.ب: 1547 الحزام الرقمي</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-14 h-14 bg-slate-100 rounded-full border flex items-center justify-center font-black text-xs text-slate-400 mb-1">
                                        شعـار
                                    </div>
                                    <span className="text-[9px] font-black text-slate-400 inline-block uppercase tracking-wider">ADALA LEGAL GROUP</span>
                                </div>
                            </div>

                            {/* Reference info */}
                            <div className="my-6 flex justify-between items-center text-[10px] text-slate-500 font-bold z-10 relative bg-slate-50 p-2.5 rounded-lg font-mono">
                                <span>الرقم المرجعي للدورة: {selectedRequest.referenceNumber}</span>
                                <span>تاريخ تقديم المعاملة: {selectedRequest.requestDate}</span>
                                <span>البلد: دولة الكويت • الهيئة العامة للقوى العاملة</span>
                            </div>

                            {/* Dynamic render sheets types */}
                            
                            {/* Sheet 1: Salary Certificate TO WHOM IT MAY CONCERN */}
                            {printCategory === 'certificate' && (
                                <div className="space-y-6 z-10 relative leading-relaxed font-semibold">
                                    <div className="text-center mb-8">
                                        <h1 className="text-xl font-black underline text-slate-900 leading-tight">شـهادة لمـن يهـمّه الأمـر وبـيان راتـب</h1>
                                    </div>

                                    <p className="text-sm font-black text-slate-900">
                                        إلى السادة الموقرين / {selectedRequest.specificRecipient || 'مؤسسات العمل المالي والمصرفي بدولة الكويت'} المحترمين
                                    </p>

                                    <p className="text-xs text-justify font-bold leading-8 text-slate-800">
                                        تشهد إدارة شؤون العلاقات العامة والموارد البشرية في <strong>مجموعة عدالة للمحاماة والاستشارات القانونية</strong> بدولة الكويت بأن السيد / <strong className="font-black text-primary text-sm">{selectedRequest.employeeName}</strong>، ويحمل البطاقة المدنية رقم <strong className="font-mono">{selectedRequest.civilId}</strong>، وجنسيته <strong className="font-black">{selectedRequest.nationality}</strong>، يعمل لدينا في قطاع الروابط بوظيفة <strong>{selectedRequest.employeeJobTitle}</strong> بإدارة <strong>{selectedRequest.employeeDepartment}</strong>، وذلك منذ تاريخ تعاقده المسجل في الهيئة <strong className="font-mono">{selectedRequest.joiningDate}</strong>، ولا يزال على رأس عمله حتى يومنا هذا.
                                    </p>

                                    {selectedRequest.includeSalaryDetails ? (
                                        <div className="border border-slate-300 rounded-2xl p-4 bg-slate-50 space-y-2">
                                            <h4 className="text-xs font-black text-center text-primary-dark underline mb-2">بيان وتفاصيل الراتب الشهري المسجل بالعمل والعمال</h4>
                                            <div className="grid grid-cols-2 gap-y-2 text-xs font-semibold text-slate-700">
                                                <div>أصل الراتب الأساسي المتعاقد عليه:</div>
                                                <div className="text-left font-mono font-black">{(selectedRequest.currentSalary - 150).toFixed(3)} د.ك</div>
                                                <div>الاتحادات وبدلات الحضور والتميز:</div>
                                                <div className="text-left font-mono font-black">150.000 د.ك</div>
                                                <div className="border-t pt-2 font-black">إجمالي الراتب الشهري الصافي الشامل:</div>
                                                <div className="border-t pt-2 text-left font-mono font-black text-primary text-sm">{(selectedRequest.currentSalary).toFixed(3)} د.ك</div>
                                            </div>
                                        </div>
                                    ) : null}

                                    <p className="text-xs text-justify font-bold text-slate-600 mt-4 leading-relaxed">
                                        وقد أعطيت له هذه الشهادة الرسمية بناءً على طلبه الشخصي لتقديمها لجهتكم الموقرة لإجراء معاملات إدارية أو مالية، دون أي أدنى أدنى التزام أو مسؤولية قانونية أو مالية تترتب على عاتق الشركة تجاه معاملات الغير.
                                    </p>
                                </div>
                            )}

                            {/* Sheet 2: Department Transfer Resolution */}
                            {printCategory === 'transfer' && (
                                <div className="space-y-6 z-10 relative">
                                    <div className="text-center">
                                        <h1 className="text-xl font-black underline text-slate-900 leading-tight block">قرار إداري داخلي رقم (QA-TRANS-26) بنقل وتسكين موظف</h1>
                                    </div>

                                    <p className="text-xs font-bold leading-relaxed text-slate-800 text-right">
                                        بناءً على تظلم أو طلب النقل الإداري المرفوع بشكل رسمي من الموظف السيد / <strong className="font-black text-primary">{selectedRequest.employeeName}</strong>، وتوصية شؤون الموظفين، تقرر الآتي:
                                    </p>

                                    <div className="ps-4 space-y-3 text-xs leading-relaxed font-semibold text-slate-800">
                                        <div>
                                            <strong>مادة (1):</strong> موافقة نقل السيد / <strong className="font-black">{selectedRequest.employeeName}</strong> وتعديل موقعه الإداري من إدارة <strong className="text-red-600">{selectedRequest.currentDept}</strong> وتسكينه بوظيفة مسمى <strong>{selectedRequest.requestedTitle}</strong> داخل <strong>{selectedRequest.requestedDept}</strong>.
                                        </div>
                                        <div>
                                            <strong>مادة (2):</strong> يربط الموظف المذكور بالهيكلة التنظيمية الجديدة وتحديد صلاحياته الإدارية والملفات القانونية تحت إشراف رئيس مصلحة التدقيق.
                                        </div>
                                        <div>
                                            <strong>مادة (3):</strong> تلتزم الإدارة القانونية بمطابقة السجلات المالية الموجه للتأمينات والجهات الموازية في الكويت.
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Sheet 3: Promotion adjustment */}
                            {printCategory === 'promotion' && (
                                <div className="space-y-6 z-10 relative">
                                    <div className="text-center">
                                        <h1 className="text-xl font-black underline text-slate-950 leading-tight block font-serif">قرار إداري رقم (QA-PROM-25) بإنزال الترقية وتعديل المستحقات</h1>
                                    </div>

                                    <div className="ps-4 space-y-3 text-xs leading-relaxed font-semibold text-slate-800">
                                        <div>
                                            <strong>مادة (1):</strong> ترقية الموظف مستوفي السنتين امتياز السيد / <strong className="font-black text-primary">{selectedRequest.employeeName}</strong> بمرتبة <strong className="text-emerald-600 font-bold">{selectedRequest.requestedTitle}</strong>.
                                        </div>
                                        <div>
                                            <strong>مادة (2):</strong> رفع المرتب التعاقدي الأساسي والمربوط ليصل إلى قيمة صافي شامل <strong className="font-black font-mono text-primary">{selectedRequest.proposedSalary || selectedRequest.currentSalary} د.ك</strong> اعتباراً من الشهر الجديد.
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Sheet 4: Appraisal Grievance contest */}
                            {printCategory === 'grievance' && (
                                <div className="space-y-6 z-10 relative">
                                    <div className="text-center">
                                        <h1 className="text-xl font-black underline text-slate-950 leading-tight block">مذكرة رد وقرار لجنة شؤون الموظفين في التظلم الإداري</h1>
                                    </div>

                                    <div className="space-y-4 text-xs leading-relaxed font-semibold text-slate-800 bg-slate-50 p-4 border rounded-2xl">
                                        <p>
                                            المتظلم: <strong>السيد / {selectedRequest.employeeName}</strong><br/>
                                            عنوان التظلم: {selectedRequest.grievanceTitle || 'الطعن في تقييم الأداء والتميز'}
                                        </p>
                                        <p className="border-t pt-2">
                                            <strong>الحيثيات المتظلم منها:</strong><br/>
                                            "{selectedRequest.grievanceText || 'تظلم بخصوص انخفاض الكفاءة والحضور والغياب.'}"
                                        </p>
                                    </div>

                                    <p className="text-xs leading-relaxed font-semibold text-slate-800 text-justify">
                                        <strong>رأي لجنة العلاقات والمراجعة الكلية:</strong><br/>
                                        بعد الاطلاع ومطابقة السجلات وتظلم الباحث وبند مصلحة العمل والملفات المنجزة للشركة، تبيّن توافر الكفاءة العالية لديه والنشاط المستحق. وعليه تقرر قبول التظلم شكلاً ومضموناً وتوجيه مدير القسم المباشر الشريك لتسكين المسمى وتعديل درجات معايير الكفاءة بمعدل (ممتاز) لمصلحة الموظف.
                                    </p>
                                </div>
                            )}

                            {/* Official double signature area */}
                            <div className="mt-16 pt-10 border-t-2 border-slate-100 grid grid-cols-4 gap-4 text-center text-xs font-semibold z-10 relative">
                                <div className="space-y-8">
                                    <div className="text-[10px] text-slate-400 block">توقيع الموظف المستلم</div>
                                    <div className="italic text-slate-400 font-serif h-12 flex items-end justify-center">
                                        {selectedRequest.status === 'Signed & Completed' ? 'موقّع وموافق' : '......................'}
                                    </div>
                                    <span className="text-[9px] text-slate-400 block">{selectedRequest.completedAt || ''}</span>
                                </div>

                                <div className="space-y-8">
                                    <div className="text-[10px] text-slate-400 block font-bold">المستشار القانوني المباشر</div>
                                    <div className="italic text-indigo-300 font-serif h-12 flex items-end justify-center font-bold">
                                        أبو الوفا الدسوقي
                                    </div>
                                    <span className="text-[9px] text-slate-400 block">معتمد بالرئيسية</span>
                                </div>

                                <div className="space-y-8">
                                    <div className="text-[10px] text-slate-400 block">المراجعة والامتثال العمالي</div>
                                    <div className="italic text-slate-300 font-serif h-12 flex items-end justify-center">
                                        ناصر السبيعي
                                    </div>
                                    <span className="text-[9px] text-slate-400 block">شؤون العلاقات</span>
                                </div>

                                <div className="space-y-4">
                                    <div className="text-[10px] text-slate-400 block">شعار وأختام مجموعة عدالة</div>
                                    <div className="flex justify-center items-center h-16">
                                        <div className="w-16 h-16 rounded-full border-4 border-dashed border-primary/45 flex items-center justify-center font-black text-[9px] text-primary/45 text-center uppercase tracking-tighter leading-tight p-1">
                                            مجموعة عدالة<br/>الكويت
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Verification bar */}
                            <div className="mt-16 pt-4 border-t border-slate-100 flex justify-between items-center text-[8px] text-slate-400 grayscale opacity-85 z-10 relative">
                                <span className="max-w-md leading-relaxed">
                                    هذا المستند صادر من مجموعة عدالة للمحاماة وتحت رقابة قانون العمل الكويتي. يعاقب القانون المحلي بتعديل الجزاء على أي تزوير أو تلاعب ومخالفة لوائح شؤون الموظفين.
                                </span>
                                <div className="flex items-center gap-2">
                                    <div className="space-y-1 font-sans text-right">
                                        <span className="block font-black">QR Verification Code</span>
                                        <span className="block text-[7px] text-slate-500 font-mono">REQ-ID: {selectedRequest.id}</span>
                                    </div>
                                    <div className="w-10 h-10 border bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-300 p-0.5 font-mono">
                                        QR CO
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t">
                            <Button variant="outline" onClick={() => setIsPrintLayoutOpen(false)}>إغلاق المعاينة</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default EmployeeRequestsPage;
