import React, { useState, useMemo, useEffect } from 'react';
import { 
    MessageSquare, Plus, UserSquare2, ChevronRight, Search, Filter, Trash, Edit, 
    Printer, Eye, Copy, ArrowRightLeft, DollarSign, Award, BellRing, ClipboardCheck, 
    ShieldAlert, RefreshCw, FileText, CheckCircle2, Clock, Calendar, HelpCircle, 
    Building2, QrCode, Signature, AlertTriangle, ArrowUpRight, Ban, Check, User, Sparkles, FilePen
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { useJurisdiction } from '../components/JurisdictionContext';

// Import modular types, mock data, and components
import { RequestType, RequestWorkflowStatus, EmployeeRequest, ApprovalStage, statusTranslations } from './employee-requests/request-types';
import { mockEmployeesList, initialRequestsSeed, getInitialApprovals, getDefaultDocumentText } from './employee-requests/mock-data';
import { PrintDocumentEditor } from './employee-requests/PrintDocumentEditor';

const EmployeeRequestsPage: React.FC = () => {
    // ----------------------------------------------------
    // 1. STATE INITIALIZATION (SYNCING WITH LOCALSTORAGE)
    // ----------------------------------------------------
    const [employees, setEmployees] = useState(() => {
        const stored = localStorage.getItem('alwagayan_employees');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            } catch(e) {}
        }
        return mockEmployeesList;
    });

    const [requests, setRequests] = useState<EmployeeRequest[]>(() => {
        const stored = localStorage.getItem('alwagayan_requests');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    // Check if they need migrations (missing approvals, etc)
                    return parsed.map((r: any) => {
                        // If it's a legacy simple request, migrate it gracefully
                        if (!r.requestType) {
                            let typeMapped = RequestType.CUSTOM;
                            if (r.type === 'شهادة راتب') typeMapped = RequestType.SALARY_CERTIFICATE;
                            if (r.type === 'شهادة خبرة') typeMapped = RequestType.CERTIFICATE;
                            if (r.type === 'تسييل إجازات سنوية' || r.type === 'طلب إجازة') typeMapped = RequestType.LEAVE;

                            return {
                                id: r.id || `req-mig-${Math.random()}`,
                                employeeId: r.employeeId || 'emp-3',
                                employeeName: r.employeeName || 'موظف مجهول',
                                employeeJobTitle: 'موظف',
                                employeeDepartment: 'العمليات',
                                requestType: typeMapped,
                                requestDate: r.date || '2026-05-31',
                                status: r.status === 'Completed' ? 'Signed & Completed' : 'Pending Line Manager',
                                referenceNumber: `AD-MIG-${Math.floor(10000 + Math.random() * 90000)}`,
                                approvals: getInitialApprovals(r.employeeName || 'موظف', r.date || '2026-05-31'),
                                reasonNote: r.purpose || r.detail || 'طلب إداري قديم تم ترحيله بامتثال لمجموعة عدالة.',
                                currentSalary: 1000,
                                civilId: '290000000000',
                                previousWarningsCount: 0,
                                attendanceAbsencesYear: 0,
                                nationality: 'كويتي',
                                joiningDate: '2022-01-01'
                            };
                        }
                        // If approvals are missing or empty
                        if (!r.approvals || r.approvals.length === 0) {
                            r.approvals = getInitialApprovals(r.employeeName, r.requestDate);
                        }
                        return r;
                    });
                }
            } catch(e) {}
        }
        return initialRequestsSeed;
    });

    const [disciplinaryLogs, setDisciplinaryLogs] = useState<any[]>(() => {
        const stored = localStorage.getItem('alwagayan_disciplinary');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) return parsed;
            } catch(e) {}
        }
        return [
            { id: 'disc1', employeeName: 'سحر جاسم الفيلي', type: 'إنذار كتابي ثاني', date: '2026-05-02', reason: 'مخالفة بند الحضور والغياب بشكل مستمر عمالياً.', authority: 'إدارة العمليات' },
            { id: 'disc2', employeeName: 'بدر فهد المطيري', type: 'تنبيه شفهي غياب', date: '2026-04-12', reason: 'التأخر في تسليم أوراق المدافعة بمحكمة الفروانية.', authority: 'مدير قسم التقاضي' }
        ];
    });

    const [activeTab, setActiveTab] = useState<'dashboard' | 'allRequests' | 'requestForm'>('dashboard');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('ALL');
    const [filterStatus, setFilterStatus] = useState<string>('ALL');

    // Drawer / Modal states
    const [selectedRequest, setSelectedRequest] = useState<EmployeeRequest | null>(null);
    const [isDetailsIdOpen, setIsDetailsIdOpen] = useState(false);
    const [isPrintLayoutOpen, setIsPrintLayoutOpen] = useState(false);

    // Form inputs state
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('emp-1');
    const [formRequestType, setFormRequestType] = useState<RequestType>(RequestType.LEAVE);
    const [formReason, setFormReason] = useState('');
    const [formCustomTitle, setFormCustomTitle] = useState('');
    const [formCustomContent, setFormCustomContent] = useState('');

    // Specific request sub-form inputs
    const [formLeaveType, setFormLeaveType] = useState<'annual' | 'sick' | 'emergency' | 'maternity' | 'pilgrimage' | 'special'>('annual');
    const [formStartDate, setFormStartDate] = useState('');
    const [formEndDate, setFormEndDate] = useState('');
    const [formLeaveDays, setFormLeaveDays] = useState(1);

    const [formPermDate, setFormPermDate] = useState('');
    const [formPermTime, setFormPermTime] = useState('08:00 - 10:00');
    const [formPermHours, setFormPermHours] = useState(2);

    const [formRecipient, setFormRecipient] = useState('');
    const [formIncludeSalary, setFormIncludeSalary] = useState(true);
    const [formLanguage, setFormLanguage] = useState<'ar' | 'en'>('ar');

    const [formFieldToUpdate, setFormFieldToUpdate] = useState('');
    const [formOldValue, setFormOldValue] = useState('');
    const [formNewValue, setFormNewValue] = useState('');

    const [formLoanAmount, setFormLoanAmount] = useState<number>(500);
    const [formInstallments, setFormInstallments] = useState<number>(10);
    const [formGuarantor, setFormGuarantor] = useState('');

    const [formCourseTitle, setFormCourseTitle] = useState('');
    const [formCourseProvider, setFormCourseProvider] = useState('');
    const [formCourseCost, setFormCourseCost] = useState<number>(150);

    const [formDeputLocation, setFormDeputLocation] = useState('');
    const [formDeputDays, setFormDeputDays] = useState<number>(3);
    const [formDeputPerDiem, setFormDeputPerDiem] = useState<number>(25);

    const [formReqDept, setFormReqDept] = useState('');
    const [formReqTitle, setFormReqTitle] = useState('');
    const [formReqSalary, setFormReqSalary] = useState<number>(0);

    const [formResumDate, setFormResumDate] = useState('');
    const [formResumRef, setFormResumRef] = useState('');

    // User Alerts State (Dynamic notifications for legal workflows)
    const [systemAlerts, setSystemAlerts] = useState<string[]>([]);

    // Save requests back to localStorage & synchronize with rest of app
    useEffect(() => {
        localStorage.setItem('alwagayan_requests', JSON.stringify(requests));
    }, [requests]);

    // ----------------------------------------------------
    // 2. RETRIEVE EMPLOYEE PROFILE & INTEGRATIONS
    // ----------------------------------------------------
    const currentSelectedEmployee = useMemo(() => {
        return employees.find(e => e.id === selectedEmployeeId) || employees[0];
    }, [employees, selectedEmployeeId]);

    // Auto-calculates system warning constraints based on Kuwait labor regulations & selected employee
    useEffect(() => {
        if (!currentSelectedEmployee) return;

        const alerts: string[] = [];
        // Integration 1: Disciplinary actions
        const activeDisc = disciplinaryLogs.filter(d => d.employeeName === currentSelectedEmployee.fullNameAr);
        if (activeDisc.length > 0) {
            alerts.push(`مخالفة نشطة: الموظف لديه ${activeDisc.length} شكوى/جزاء تأديبي مسجل عمالياً.`);
        }
        if (currentSelectedEmployee.hasActiveInvestigation) {
            alerts.push(`👮 تنبيه قانوني: الموظف قيد تحقيق عسكري أو إداري جارٍ. يرجى مراجعة إدارة الامتثال!`);
        }
        // Integration 2: Basic leaves balance
        if (currentSelectedEmployee.remainingLeaveDays < 5) {
            alerts.push(`⚠️ رصيد إجازات حرج: المتبقي للمستشار ${currentSelectedEmployee.remainingLeaveDays} أيام فقط.`);
        }
        // Integration 3: Banking files completeness
        const filesMissing = Object.entries(currentSelectedEmployee.filesStatus || {}).filter(([_, status]) => !status);
        if (filesMissing.length > 0) {
            alerts.push(`📁 مستندات مفقودة: العقد أو ثبوت الهوية بحاجة إلى مستجدات في ملف الموظف.`);
        }

        setSystemAlerts(alerts);
    }, [currentSelectedEmployee, disciplinaryLogs]);

    // Calculate interactive stats summaries
    const stats = useMemo(() => {
        const total = requests.length;
        const pending = requests.filter(r => r.status !== 'Signed & Completed' && r.status !== 'Rejected').length;
        const approved = requests.filter(r => r.status === 'Signed & Completed').length;
        const rejected = requests.filter(r => r.status === 'Rejected').length;
        
        return { total, pending, approved, rejected };
    }, [requests]);

    // Filter list
    const filteredRequests = useMemo(() => {
        return requests.filter(req => {
            const matchesQuery = 
                req.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                req.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                req.requestType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (req.reasonNote && req.reasonNote.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesType = filterType === 'ALL' || req.requestType === filterType;
            const matchesStatus = filterStatus === 'ALL' || req.status === filterStatus;

            return matchesQuery && matchesType && matchesStatus;
        });
    }, [requests, searchQuery, filterType, filterStatus]);

    // ----------------------------------------------------
    // 3. ACTION EVENT HANDLERS (CRUD & PRINT UTILS)
    // ----------------------------------------------------
    const handleCreateRequestSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentSelectedEmployee) return;

        const randRef = `QA-REQ-2026-${Math.floor(100 + Math.random() * 900)}`;
        const dateStr = new Date().toISOString().split('T')[0];

        // Core dynamic structure payload per RequestType
        const newRequest: EmployeeRequest = {
            id: `req-${Date.now()}`,
            employeeId: currentSelectedEmployee.id,
            employeeName: currentSelectedEmployee.fullNameAr,
            employeeJobTitle: currentSelectedEmployee.jobTitle,
            employeeDepartment: currentSelectedEmployee.department,
            requestType: formRequestType,
            requestDate: dateStr,
            status: 'Pending Line Manager',
            referenceNumber: randRef,
            reasonNote: formReason || `طلب ${formRequestType} مقدم لغايات تنظيم مهام العمل ومطابقة لوائح مجموعة عدالة.`,
            
            // Sub-form data assignments
            leaveType: formLeaveType,
            startDate: formStartDate,
            endDate: formEndDate,
            leaveDaysCount: formLeaveDays,
            
            permissionDate: formPermDate,
            permissionTimeRange: formPermTime,
            permissionHours: formPermHours,
            
            recipientName: formRecipient || 'من يهمه الأمر',
            includeSalaryDetails: formIncludeSalary,
            language: formLanguage,
            
            fieldToUpdate: formFieldToUpdate,
            oldValue: formOldValue,
            newValue: formNewValue,
            
            loanAmount: formLoanAmount,
            installmentsCount: formInstallments,
            monthlyInstallment: Math.round(formLoanAmount / (formInstallments || 1)),
            guarantorName: formGuarantor || 'مؤسسة التكافل المالي المباشر',
            
            trainingCourseTitle: formCourseTitle,
            trainingProvider: formCourseProvider,
            trainingCost: formCourseCost,
            
            deputationLocation: formDeputLocation,
            deputationDurationDays: formDeputDays,
            deputationPerDiem: formDeputPerDiem,
            
            currentDept: currentSelectedEmployee.department,
            requestedDept: formReqDept,
            currentTitle: currentSelectedEmployee.jobTitle,
            requestedTitle: formReqTitle,
            
            currentSalary: currentSelectedEmployee.basicSalary + currentSelectedEmployee.allowancesAmount,
            proposedSalary: formReqSalary || (currentSelectedEmployee.basicSalary + currentSelectedEmployee.allowancesAmount),
            
            resumptionDate: formResumDate,
            resumptionReferenceCode: formResumRef,
            
            customTitle: formCustomTitle,
            customContent: formCustomContent,

            // Snapshots integrations keys at submission
            warningsCountAtRequest: currentSelectedEmployee.warningsCount,
            hasActiveInvestigation: currentSelectedEmployee.hasActiveInvestigation,
            remainingLeaveDays: currentSelectedEmployee.remainingLeaveDays,
            joiningDate: currentSelectedEmployee.joiningDate,
            nationality: currentSelectedEmployee.nationality,
            civilId: currentSelectedEmployee.civilId,

            approvals: getInitialApprovals(currentSelectedEmployee.fullNameAr, dateStr)
        };

        const updated = [newRequest, ...requests];
        setRequests(updated);

        // Add to main system timeline if it exists
        const storedTimeline = localStorage.getItem('alwagayan_timeline');
        if (storedTimeline) {
            try {
                const timeline = JSON.parse(storedTimeline);
                timeline.unshift({
                    id: `timeline-${Date.now()}`,
                    date: dateStr,
                    employeeName: currentSelectedEmployee.fullNameAr,
                    action: `إرسال طلب إداري من نوع (${formRequestType}) برقم مرجعي ${randRef}`,
                    type: 'إداري'
                });
                localStorage.setItem('alwagayan_timeline', JSON.stringify(timeline));
            } catch(evt) {}
        }

        // Reset form inputs
        setFormReason('');
        setFormCustomTitle('');
        setFormCustomContent('');
        setActiveTab('allRequests');
    };

    const handleDeleteRequest = (id: string, refNum: string) => {
        if (!window.confirm(`هل أنت متأكد من رغبتك في حذف وإلغاء المعاملة الإدارية رقم ${refNum} نهائياً؟`)) return;
        
        const updated = requests.filter(r => r.id !== id);
        setRequests(updated);

        if (selectedRequest?.id === id) {
            setIsDetailsIdOpen(false);
            setSelectedRequest(null);
        }
    };

    // Simulate clicking & authorizing modular approval stages
    const handleToggleStageApproval = (requestId: string, roleId: string, status: 'approved' | 'rejected') => {
        const adminName = 'مستشار الموارد البشرية (صبري صبري)';
        const dateNow = new Date().toISOString().split('T')[0];

        const updated = requests.map(req => {
            if (req.id !== requestId) return req;

            const updatedApprovals = req.approvals.map(stage => {
                if (stage.roleId !== roleId) return stage;
                return {
                    ...stage,
                    status: status,
                    approverName: adminName,
                    actionDate: dateNow,
                    notes: `موافقة وامتثال قانوني صادر في ${dateNow} بقرار إداري.`
                };
            });

            // Re-evaluate requests status based on approval stages
            let newStatus: RequestWorkflowStatus = req.status;

            // Simple state machine
            if (status === 'rejected') {
                newStatus = 'Rejected';
            } else {
                // If HR approved, move to under finance
                if (roleId === 'hr') newStatus = 'Under Financial Review';
                if (roleId === 'finance') newStatus = 'Under Legal Review';
                if (roleId === 'final_approval') newStatus = 'Signed & Completed';
            }

            const updatedReq = {
                ...req,
                approvals: updatedApprovals,
                status: newStatus,
                completedAt: newStatus === 'Signed & Completed' ? dateNow : req.completedAt
            };

            if (selectedRequest && selectedRequest.id === requestId) {
                setSelectedRequest(updatedReq);
            }

            return updatedReq;
        });

        setRequests(updated);
    };

    // Advanced interactive Document custom text changes
    const handleSaveDocumentText = (requestId: string, updatedText: string) => {
        const updated = requests.map(req => {
            if (req.id !== requestId) return req;
            return {
                ...req,
                customPrintedDocContent: updatedText
            };
        });
        setRequests(updated);
        
        const target = updated.find(r => r.id === requestId);
        if (target) {
            setSelectedRequest(target);
        }
    };

    // Create a new independent duplicated copy from printed draft (محرر المستندات المتكامل)
    const handleDuplicateAsNewRequest = (req: EmployeeRequest, editedText: string) => {
        const randRef = `QA-REQ-COPY-${Math.floor(1000 + Math.random() * 9000)}`;
        const dateStr = new Date().toISOString().split('T')[0];

        const duplicatedCopy: EmployeeRequest = {
            ...req,
            id: `req-copy-${Date.now()}`,
            referenceNumber: randRef,
            requestDate: dateStr,
            status: 'Draft',
            customPrintedDocContent: editedText,
            reasonNote: `مستند إداري مكرر مستخلص ومعدل من الوثيقة المرجعية ${req.referenceNumber}`,
            approvals: getInitialApprovals(req.employeeName, dateStr)
        };

        setRequests([duplicatedCopy, ...requests]);
        setSelectedRequest(duplicatedCopy);
    };

    // Auto calculate loan maximum installments and warnings for legal compliance
    const isLoanCompliant = useMemo(() => {
        if (formRequestType !== RequestType.LOAN && formRequestType !== RequestType.ADVANCE) return true;
        if (!currentSelectedEmployee) return true;

        const maxLegalThreshold = currentSelectedEmployee.basicSalary * 2.5; // Custom internal ratio rule
        return formLoanAmount <= maxLegalThreshold;
    }, [formRequestType, formLoanAmount, currentSelectedEmployee]);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 font-sans" style={{ direction: 'rtl' }}>
            
            {/* Header section with brand identity */}
            <div className="bg-slate-900 text-white border-b border-gold-600/30 shadow-md">
                <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/20 text-indigo-300 border border-indigo-500/30">
                                <Building2 className="w-3.5 h-3.5 text-primary" />
                                بوابة عـدالة الكترونية للموارد البشرية
                            </span>
                            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                                نظام إدارة السجلات والطلبات الإدارية المتكامل
                            </h1>
                            <p className="text-xs text-slate-400">
                                مركز معالجة ومراجعة وتدقيق المعاملات وقرارات الترقية والرواتب والامتثال وفق لوائح قانون العمل بدولة الكويت.
                            </p>
                        </div>
                        
                        <div className="bg-slate-850 px-4 py-2.5 rounded-2xl border border-slate-700/80 text-right md:-mt-2">
                            <p className="text-[10px] text-slate-400 font-semibold block">المكتب الشريك المباشر</p>
                            <p className="text-xs font-black text-white">مكتب ألوقيان والعيبان للمحاماة</p>
                            <p className="text-[9px] text-indigo-400 font-mono font-bold mt-1">تاريخ المعاملات: {new Date().toLocaleDateString('ar-KW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dashboard Content Container */}
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
                
                {/* Visual statistics cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="hover:shadow-xl transition-all border-l-4 border-indigo-500 p-5 bg-white rounded-3xl relative overflow-hidden group">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1 text-right">
                                <span className="text-[10px] text-slate-500 font-bold block">إجمالي المعاملات الإدارية</span>
                                <span className="text-3xl font-black text-slate-900 group-hover:scale-105 transition-transform block">{stats.total}</span>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <FileText className="w-6 h-6" />
                            </div>
                        </div>
                    </Card>

                    <Card className="hover:shadow-xl transition-all border-l-4 border-amber-500 p-5 bg-white rounded-3xl relative overflow-hidden group">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1 text-right">
                                <span className="text-[10px] text-slate-500 font-bold block">طلبات قيد المراجعة والاعتماد</span>
                                <span className="text-3xl font-black text-amber-600 group-hover:scale-105 transition-transform block">{stats.pending}</span>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                                <Clock className="w-6 h-6" />
                            </div>
                        </div>
                    </Card>

                    <Card className="hover:shadow-xl transition-all border-l-4 border-emerald-500 p-5 bg-white rounded-3xl relative overflow-hidden group">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1 text-right">
                                <span className="text-[10px] text-slate-500 font-bold block">الطلبات المكتملة والموقّعة</span>
                                <span className="text-3xl font-black text-emerald-600 group-hover:scale-105 transition-transform block">{stats.approved}</span>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                        </div>
                    </Card>

                    <Card className="hover:shadow-xl transition-all border-l-4 border-red-500 p-5 bg-white rounded-3xl relative overflow-hidden group">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1 text-right">
                                <span className="text-[10px] text-slate-500 font-bold block">المعاملات المرفوضة قانونياً</span>
                                <span className="text-3xl font-black text-red-600 group-hover:scale-105 transition-transform block">{stats.rejected}</span>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-602">
                                <Ban className="w-6 h-6" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Sub Tab Navigation */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-1 border rounded-2xl bg-white p-1 shadow-sm">
                        <button 
                            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'dashboard' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'}`}
                            onClick={() => setActiveTab('dashboard')}
                        >
                            لوحة متابعة المؤشرات والتكامل
                        </button>
                        <button 
                            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'allRequests' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'}`}
                            onClick={() => setActiveTab('allRequests')}
                        >
                            جميع الطلبات والقرارات ({requests.length})
                        </button>
                        <button 
                            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${activeTab === 'requestForm' ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:text-slate-900'}`}
                            onClick={() => setActiveTab('requestForm')}
                        >
                            <Plus className="w-4 h-4" />
                            إنشاء طلب إلكتروني جديد
                        </button>
                    </div>

                    <div className="text-xs text-slate-400 font-semibold bg-slate-100 px-3 py-1.5 rounded-lg border">
                        رقم نسخة النظام الحالية: <span className="font-mono font-bold text-slate-700">v3.4.1-adala</span>
                    </div>
                </div>

                {/* ----------------------------------------------------
                    TAB 1: DASHBOARD INDEX
                   ---------------------------------------------------- */}
                {activeTab === 'dashboard' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Highlights alerts and integrations */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="p-6 bg-white rounded-3xl border shadow-sm">
                                <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-amber-500" />
                                    موجز تدقيق الامتثال والأنظمة العمالية الكويتية
                                </h3>
                                <div className="space-y-4">
                                    <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex gap-3 text-right">
                                        <Award className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5" />
                                        <div className="space-y-1">
                                            <h4 className="text-xs font-black text-indigo-900">ترقيات وتعديلات الكفاءة السنوية</h4>
                                            <p className="text-[11px] text-indigo-950 font-bold">
                                                يقوم نظام عدالة بمطابقة تقرير الأداء الربع سنوي والسنوي تلقائياً قبل ترقية أي موظف. يمنع النظام ترقية من لديه جزاءات تأديبية سارية ما لم يتم بت التظلم القانوني إيجابياً.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 flex gap-3 text-right">
                                        <ShieldAlert className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                                        <div className="space-y-1">
                                            <h4 className="text-xs font-black text-red-900">لوائح الاستقطاعات المالية وتحديد القروض</h4>
                                            <p className="text-[11px] text-red-950 font-bold">
                                                وفق أحكام قانون العمل الكويتي (الباب الرابع - مادة 59)، المجموع الكلي للخصومات أو الأقساط الشهرية يجب ألا يتعدى نسبة النصف من أساس مرتب الموظف، مع وجود سقف 10% بحد أقصى للقروض الحسنة بدون مرابحة.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Mini quick queue panel */}
                            <Card className="p-6 bg-white rounded-3xl border shadow-sm space-y-4">
                                <h3 className="text-sm font-black text-slate-950 flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <BellRing className="w-4 h-4 text-primary" />
                                        طابور الطلبات العاجلة بانتظار توقيعك
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono font-bold">آخر تحديث قبل دقيقة</span>
                                </h3>
                                <div className="divide-y divide-slate-100">
                                    {requests.slice(0, 3).map((req, index) => (
                                        <div 
                                            key={req.id} 
                                            onClick={() => {
                                                setSelectedRequest(req);
                                                setIsDetailsIdOpen(true);
                                            }}
                                            className="py-3.5 flex items-center justify-between hover:bg-slate-50 px-3 rounded-2xl transition-all cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700">
                                                    {index + 1}
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-black text-slate-900 group-hover:text-primary transition-colors">{req.employeeName}</p>
                                                    <p className="text-[10px] text-slate-400 font-semibold">{req.requestType} • {req.referenceNumber}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-slate-500 font-mono font-bold">{req.requestDate}</span>
                                                <ChevronRight className="w-4 h-4 text-slate-400" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>

                        {/* Integration Quick View Sidebar */}
                        <div className="space-y-6">
                            <Card className="p-6 bg-white rounded-3xl border border-primary/20 shadow-sm relative overflow-hidden bg-gradient-to-br from-indigo-50/10 via-white to-white">
                                <h3 className="text-xs font-black text-slate-900 mb-4 flex items-center gap-1.5">
                                    <ClipboardCheck className="w-4 h-4 text-indigo-600" />
                                    مؤشرات الحضور والمستندات الرقابية
                                </h3>
                                <div className="space-y-4">
                                    <div className="bg-slate-50 p-3.5 rounded-xl border space-y-2">
                                        <p className="text-[10px] text-slate-400 font-bold">حالة مستندات الموارد البشرية ككل:</p>
                                        <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-700">
                                            <div className="flex items-center gap-1 bg-white p-1.5 rounded border"><Check className="w-3 h-3 text-emerald-600 shrink-0" /> البطاقة المدنية</div>
                                            <div className="flex items-center gap-1 bg-white p-1.5 rounded border"><Check className="w-3 h-3 text-emerald-600 shrink-0" /> جواز السفر</div>
                                            <div className="flex items-center gap-1 bg-white p-1.5 rounded border"><Check className="w-3 h-3 text-emerald-600 shrink-0" /> إقامات الكويت</div>
                                            <div className="flex items-center gap-1 bg-white p-1.5 rounded border"><Check className="w-3 h-3 text-emerald-600 shrink-0" /> عقود مصدقة</div>
                                        </div>
                                    </div>

                                    {/* Warnings list on dashboard */}
                                    <div className="space-y-3">
                                        <p className="text-[10px] text-slate-500 font-black block">أحدث تنبيهات العقوبات التأديبية النشطة:</p>
                                        <div className="space-y-2 text-[10px] font-bold">
                                            {disciplinaryLogs.map(disc => (
                                                <div key={disc.id} className="p-3 bg-amber-50/70 border border-amber-250 rounded-xl flex items-start gap-2">
                                                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                                                    <div className="space-y-0.5 text-right">
                                                        <span className="font-black text-slate-900 block">{disc.employeeName}</span>
                                                        <span className="text-slate-500 block">{disc.type} • {disc.reason}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {/* ----------------------------------------------------
                    TAB 2: ALL REQUESTS DIRECTORY (LIST & FILTER)
                   ---------------------------------------------------- */}
                {activeTab === 'allRequests' && (
                    <div className="space-y-6">
                        {/* Search and Filters Hub */}
                        <div className="bg-white p-4 rounded-3xl border shadow-sm space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {/* Search input */}
                                <div className="md:col-span-2 relative">
                                    <input 
                                        type="text" 
                                        placeholder="ايجاد معاملة... (باسم الموظف أو الرقم المرجعي أو نوع المعاملة)"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full text-xs font-bold pr-10 pl-4 py-3 border rounded-xl focus:border-primary focus:ring-0 bg-slate-50/50"
                                    />
                                    <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                                </div>

                                {/* Type filter */}
                                <div>
                                    <select
                                        value={filterType}
                                        onChange={(e) => setFilterType(e.target.value)}
                                        className="w-full text-xs font-bold py-3 pr-8 border rounded-xl focus:border-primary focus:ring-0 bg-slate-50/50 text-slate-700"
                                    >
                                        <option value="ALL">جميع أنواع المعاملات (13 نوع)</option>
                                        {Object.values(RequestType).map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Status filter */}
                                <div>
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="w-full text-xs font-bold py-3 pr-8 border rounded-xl focus:border-primary focus:ring-0 bg-slate-50/50 text-slate-700"
                                    >
                                        <option value="ALL">جميع حالات الاعتماد والتدقيق</option>
                                        <option value="Draft">مسودة</option>
                                        <option value="Pending Line Manager">جديد / بانتظار المدير المباشر</option>
                                        <option value="Under HR Review">قيد المراجعة (الموارد البشرية)</option>
                                        <option value="Under Financial Review">قيد المراجعة (الإدارة المالية)</option>
                                        <option value="Under Legal Review">قيد المراجعة (الإدارة القانونية)</option>
                                        <option value="Signed & Completed">مكتمل ومعتمد نهائياً</option>
                                        <option value="Rejected">مرفوض</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Requests Grid Table */}
                        <div className="bg-white border rounded-3xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-right text-xs">
                                    <thead className="bg-slate-900 text-white font-bold text-[11px] uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4 text-right">الموظف المعني وقسمه</th>
                                            <th className="px-6 py-4">نوع الطلب</th>
                                            <th className="px-6 py-4">التاريخ والرقم المرجعي</th>
                                            <th className="px-6 py-4 text-center">حالة التدقيق الحالية</th>
                                            <th className="px-6 py-4 text-left">أدوات التحكم</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                                        {filteredRequests.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-bold space-y-2">
                                                    <AlertTriangle className="w-8 h-8 text-slate-300 mx-auto" />
                                                    <p>لم يتم العثور على أي طلبات أو قرارات إدارية تطابق الفلترة المحددة!</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredRequests.map((req) => {
                                                const uiStatus = statusTranslations[req.status] || req.status;
                                                let badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
                                                if (req.status === 'Signed & Completed') badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                                                if (req.status === 'Rejected') badgeColor = 'bg-red-50 text-red-700 border-red-200';
                                                if (req.status.startsWith('Under')) badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';

                                                return (
                                                    <tr key={req.id} className="hover:bg-slate-50/80 transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 group-hover:scale-105 transition-transform">
                                                                    {req.employeeName[0]}
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="font-black text-slate-900">{req.employeeName}</p>
                                                                    <p className="text-[10px] text-slate-400 font-bold">{req.employeeJobTitle} • {req.employeeDepartment}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 font-black text-slate-800">
                                                            {req.requestType}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <p className="font-mono text-slate-900 font-bold">{req.referenceNumber}</p>
                                                            <p className="text-[10px] text-slate-400 font-mono">{req.requestDate}</p>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <Badge text={uiStatus} className={`px-2.5 py-1 text-[10px] border rounded-lg font-black ${badgeColor}`} />
                                                        </td>
                                                        <td className="px-6 py-4 text-left">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <Button 
                                                                    variant="outline" 
                                                                    size="sm" 
                                                                    onClick={() => {
                                                                        setSelectedRequest(req);
                                                                        setIsDetailsIdOpen(true);
                                                                    }}
                                                                    className="px-2.5 py-1.5 text-[10px] flex items-center gap-1 font-bold"
                                                                    title="عرض مراحل الاعتماد والتفاصيل"
                                                                >
                                                                    <Eye className="w-3.5 h-3.5" />
                                                                    مراحل الاعتماد
                                                                </Button>
                                                                
                                                                <Button 
                                                                    variant="outline" 
                                                                    size="sm" 
                                                                    onClick={() => {
                                                                        setSelectedRequest(req);
                                                                        setIsPrintLayoutOpen(true);
                                                                    }}
                                                                    className="px-2.5 py-1.5 text-[10px] text-indigo-700 border-indigo-200 hover:bg-indigo-50 flex items-center gap-1 font-bold"
                                                                    title="تعديل وصياغة المستند قبل الطباعة"
                                                                >
                                                                    <Printer className="w-3.5 h-3.5" />
                                                                    تعديل وطباعة
                                                                </Button>

                                                                <button 
                                                                    onClick={() => handleDeleteRequest(req.id, req.referenceNumber)}
                                                                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                                                    title="حذف السجل الإداري"
                                                                >
                                                                    <Trash className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ----------------------------------------------------
                    TAB 3: CREATE REQUEST STEP FORM
                   ---------------------------------------------------- */}
                {activeTab === 'requestForm' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Selected Employee Checklist & Integration warnings */}
                        <div className="space-y-6">
                            <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-3xl space-y-4">
                                <h3 className="text-xs font-black text-slate-900 border-b pb-2 flex items-center gap-1.5">
                                    <User className="w-4 h-4 text-indigo-650" />
                                    تكامل هوية نظام عدالة وفحص الموظف حياً
                                </h3>
                                
                                {currentSelectedEmployee ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 border-b pb-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-center block">
                                                {currentSelectedEmployee.fullNameAr[0]}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-black text-slate-900 leading-tight">{currentSelectedEmployee.fullNameAr}</p>
                                                <p className="text-[10px] text-slate-400 font-bold">{currentSelectedEmployee.jobTitle} • {currentSelectedEmployee.department}</p>
                                            </div>
                                        </div>

                                        {/* Profile data integrations */}
                                        <div className="space-y-2 text-[10px] font-bold text-slate-700">
                                            <div className="flex justify-between p-2 rounded bg-slate-50">
                                                <span>الجنسية:</span>
                                                <span className="text-slate-900">{currentSelectedEmployee.nationality}</span>
                                            </div>
                                            <div className="flex justify-between p-2 rounded bg-slate-50">
                                                <span>رقم البطاقة المدنية:</span>
                                                <span className="text-slate-900 font-mono">{currentSelectedEmployee.civilId}</span>
                                            </div>
                                            <div className="flex justify-between p-2 rounded bg-slate-50">
                                                <span>الرواتب الحالي المستحق:</span>
                                                <span className="text-indigo-700 font-mono font-black">{currentSelectedEmployee.basicSalary + currentSelectedEmployee.allowancesAmount} د.ك</span>
                                            </div>
                                            <div className="flex justify-between p-2 rounded bg-slate-50">
                                                <span>رصيد الإجازات السنوية الحالي:</span>
                                                <span className="text-slate-900 font-bold">{currentSelectedEmployee.remainingLeaveDays} يوماً</span>
                                            </div>
                                            <div className="flex justify-between p-2 rounded bg-slate-50">
                                                <span>الحساب البنكي والآيبان:</span>
                                                <span className="text-slate-900 font-mono truncate max-w-[150px]" title={currentSelectedEmployee.bankIban}>{currentSelectedEmployee.bankIban}</span>
                                            </div>
                                        </div>

                                        {/* System Warnings Panel */}
                                        {systemAlerts.length > 0 && (
                                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl space-y-1.5">
                                                <span className="text-[10px] font-black text-amber-800 flex items-center gap-1">
                                                    <AlertTriangle className="w-3.5 h-3.5" />
                                                    ملاحظات شؤون الامتثال والتحقيقات:
                                                </span>
                                                <ul className="list-disc ps-4 space-y-1 text-[9px] text-slate-700 font-semibold">
                                                    {systemAlerts.map((alert, idx) => (
                                                        <li key={idx} className="text-red-600 font-bold">{alert}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-[11px] text-slate-400">الرجاء اختيار الموظف لبث بياناته المتكاملة.</p>
                                )}
                            </Card>

                            {/* Kuwait regulatory compliance banner */}
                            <Card className="p-5 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl shadow-md border-0 space-y-2">
                                <span className="inline-block p-1 bg-indigo-500/20 text-indigo-300 rounded text-[9px] font-bold">فحص الالتزام القانوني التلقائي</span>
                                <h4 className="text-xs font-black">مطابقة موازين قانون العمل الكويتي</h4>
                                <p className="text-[10px] text-slate-300 leading-normal">
                                    عند اختيار نوع الطلب من الـ 13 نوع المتاحة، مثل المباشرة، أو القروض، فإن محرك "عدالة" يقارن حقول الإدخال حياً بلائحة الجزاءات والحد الأقصى للاستقطاعات.
                                </p>
                            </Card>
                        </div>

                        {/* Complete Comprehensive Form - 13 Request Types */}
                        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
                            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b pb-3">
                                <FilePen className="w-5 h-5 text-indigo-600" />
                                صياغة وتوليد معاملة إدارية ذكية جديدة
                            </h3>

                            <form onSubmit={handleCreateRequestSubmit} className="space-y-6 text-xs text-right font-semibold">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* 1. Select employee */}
                                    <div className="space-y-1 text-right">
                                        <label className="text-[10px] text-slate-500 font-bold">1. اختر الموظف المعني بالطلب:</label>
                                        <select
                                            value={selectedEmployeeId}
                                            onChange={(e) => setSelectedEmployeeId(e.target.value)}
                                            className="w-full font-bold py-3 pr-8 border rounded-xl focus:border-indigo-500 focus:ring-0 bg-slate-50/50"
                                            required
                                        >
                                            {employees.map(emp => (
                                                <option key={emp.id} value={emp.id}>
                                                    {emp.fullNameAr} ({emp.jobTitle})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* 2. Request Type Selector (All 13 types) */}
                                    <div className="space-y-1 text-right">
                                        <label className="text-[10px] text-slate-500 font-bold">2. حدد نوع المعاملة الإدارية (13 خيار):</label>
                                        <select
                                            value={formRequestType}
                                            onChange={(e) => setFormRequestType(e.target.value as RequestType)}
                                            className="w-full font-bold py-3 pr-8 border border-primary/45 rounded-xl focus:border-indigo-500 focus:ring-0 bg-indigo-50/10 text-slate-800"
                                            required
                                        >
                                            {Object.values(RequestType).map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 pt-4 space-y-4">
                                    <h4 className="text-[11px] text-slate-400 font-bold mb-2">3. أدخل البيانات التكميلية النوعية للطلب:</h4>
                                    
                                    {/* Sub-form UI based on active RequestType */}
                                    
                                    {/* Type: Leave */}
                                    {formRequestType === RequestType.LEAVE && (
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border">
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 block">نوع الإجازة:</label>
                                                <select 
                                                    value={formLeaveType} 
                                                    onChange={(e: any) => setFormLeaveType(e.target.value)}
                                                    className="w-full font-bold py-2 border rounded-lg bg-white"
                                                >
                                                    <option value="annual">سنوية دورية مسجلة</option>
                                                    <option value="sick">مرضية معتمدة</option>
                                                    <option value="emergency">طارئة وعائلية</option>
                                                    <option value="maternity">أمومة ورعاية طفل</option>
                                                    <option value="pilgrimage">حج وعمرة (مرة واحدة)</option>
                                                    <option value="special">خاصة بدون راتب</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 block">تاريخ البدء:</label>
                                                <input type="date" value={formStartDate} onChange={e => setFormStartDate(e.target.value)} className="w-full font-bold py-2 border rounded-lg bg-white text-center" required />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 block">تاريخ الانتهاء:</label>
                                                <input type="date" value={formEndDate} onChange={e => setFormEndDate(e.target.value)} className="w-full font-bold py-2 border rounded-lg bg-white text-center" required />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 block">إجمالي الأيام المخصومة:</label>
                                                <input type="number" min="1" value={formLeaveDays} onChange={e => setFormLeaveDays(parseInt(e.target.value))} className="w-full font-bold py-2 border rounded-lg bg-white text-center font-mono" required />
                                            </div>
                                        </div>
                                    )}

                                    {/* Type: Permission (استئذان) */}
                                    {formRequestType === RequestType.PERMISSION && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border">
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 block">تاريخ الاستئذان المطلوب:</label>
                                                <input type="date" value={formPermDate} onChange={e => setFormPermDate(e.target.value)} className="w-full font-bold py-2 border rounded-lg bg-white text-center" required />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 block">الفترة والتوقيت (مثال: 08:00 - 10:00):</label>
                                                <input type="text" value={formPermTime} onChange={e => setFormPermTime(e.target.value)} className="w-full font-bold py-2 border rounded-lg bg-white text-center font-mono" required />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 block">عدد الساعات الكلي:</label>
                                                <input type="number" min="1" max="4" value={formPermHours} onChange={e => setFormPermHours(parseInt(e.target.value))} className="w-full font-bold py-2 border rounded-lg bg-white text-center font-mono" required />
                                            </div>
                                        </div>
                                    )}

                                    {/* Type: Salary Certificate (تعريف راتب) */}
                                    {formRequestType === RequestType.SALARY_CERTIFICATE && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border">
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 block">الجهة الموجه إليها الشهادة:</label>
                                                <input type="text" placeholder="مثال: بيت التمويل الكويتي / من يهمه الأمر" value={formRecipient} onChange={e => setFormRecipient(e.target.value)} className="w-full font-bold py-2 border rounded-lg bg-white px-2" required />
                                            </div>
                                            <div className="space-y-1 flex items-center gap-2 pt-6">
                                                <input type="checkbox" checked={formIncludeSalary} onChange={e => setFormIncludeSalary(e.target.checked)} className="w-4 h-4 text-primary rounded" />
                                                <label className="text-[10px] text-slate-600 block font-bold">تضمين تفاصيل وبدلات البدء الحالية مالياً</label>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 block">لغة الشهادة الصادرة للطباعة:</label>
                                                <select value={formLanguage} onChange={(e: any) => setFormLanguage(e.target.value)} className="w-full font-bold py-2 border rounded-lg bg-white">
                                                    <option value="ar">اللغة العربية (معتمدة حكومياً)</option>
                                                    <option value="en">English (Official Translation)</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    {/* Type: Certificate Request (شهادة) */}
                                    {formRequestType === RequestType.CERTIFICATE && (
                                        <div className="p-4 rounded-2xl bg-slate-50 border grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 block">نوع ومسمى الشهادة المطلوبة:</label>
                                                <input type="text" placeholder="مثال: شهادة خبرة متسلسلة / شهادة لمن يهمه الأمر عمالية" value={formRecipient} onChange={e => setFormRecipient(e.target.value)} className="w-full font-bold py-2 border rounded-lg bg-white px-2" required />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 block">لغة المستند:</label>
                                                <select value={formLanguage} onChange={(e: any) => setFormLanguage(e.target.value)} className="w-full font-bold py-2 border rounded-lg bg-white">
                                                    <option value="ar">العربية</option>
                                                    <option value="en">English</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    {/* Type: Data Update (تعديل بيانات) */}
                                    {formRequestType === RequestType.DATA_UPDATE && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border">
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 block">الحقل المرغوب في تعديله بملف الموظف:</label>
                                                <input type="text" placeholder="مثال: الآيبان البنكي / عنوان المنزل الحضور" value={formFieldToUpdate} onChange={e => setFormFieldToUpdate(e.target.value)} className="w-full font-bold py-2 border rounded-lg bg-white px-2" required />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 block">القيمة في السجلات السابقة (الحالية):</label>
                                                <input type="text" value={formOldValue} onChange={e => setFormOldValue(e.target.value)} className="w-full font-bold py-2 border rounded-lg bg-white px-2 font-mono text-center" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 block">القيمة المقترحة المعدلة الجديدة:</label>
                                                <input type="text" value={formNewValue} onChange={e => setFormNewValue(e.target.value)} className="w-full font-bold py-2 border rounded-lg bg-white px-2 font-mono text-center" required />
                                            </div>
                                        </div>
                                    )}

                                    {/* Type: Loan & Advance (قرض وسلفة) */}
                                    {(formRequestType === RequestType.LOAN || formRequestType === RequestType.ADVANCE) && (
                                        <div className="space-y-4 p-4 rounded-2xl bg-slate-50 border">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] text-slate-500 block">مبلغ التمويل المطلوب (د.ك):</label>
                                                    <input type="number" min="100" value={formLoanAmount} onChange={e => setFormLoanAmount(parseInt(e.target.value))} className="w-full font-bold py-2 border rounded-lg bg-white text-center font-mono" required />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] text-slate-500 block">عدد أشهر السداد (أقساط):</label>
                                                    <input type="number" min="1" max="24" value={formInstallments} onChange={e => setFormInstallments(parseInt(e.target.value))} className="w-full font-bold py-2 border rounded-lg bg-white text-center font-mono" required />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] text-slate-500 block">الضمان والمؤسسة الكفيلة للتعهد:</label>
                                                    <input type="text" placeholder="مثال: التعهد بالخصم من مكافأة نهاية الخدمة" value={formGuarantor} onChange={e => setFormGuarantor(e.target.value)} className="w-full font-bold py-2 border rounded-lg bg-white px-2" required />
                                                </div>
                                            </div>
                                            
                                            {/* Live labor check */}
                                            {!isLoanCompliant && (
                                                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-[10px] flex items-center gap-1.5 font-bold">
                                                    <ShieldAlert className="w-4 h-4 text-red-600 animate-bounce" />
                                                    <span>تنبيه امتثال كويتي: القيمة المطلوبة تتجاوز الحد الأقصى عمالياً براتب الموظف الحالي دون تصريح استثناء الشركاء!</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Type: Training Request (تدريب) */}
                                    {formRequestType === RequestType.TRAINING && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border">
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 block">اسم البرنامج / الدورة المهنية القانونية:</label>
                                                <input type="text" placeholder="مثال: التحكيم الكويتي وعرائض الطعون" value={formCourseTitle} onChange={e => setFormCourseTitle(e.target.value)} className="w-full font-bold py-2 border rounded-lg bg-white px-2" required />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 block">الجهة والمركز التعليمي الموفر للدورة:</label>
                                                <input type="text" placeholder="مثال: معهد الدراسات القضائية" value={formCourseProvider} onChange={e => setFormCourseProvider(e.target.value)} className="w-full font-bold py-2 border rounded-lg bg-white px-2" required />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 block">التكلفة والرسوم المغطاة (د.ك):</label>
                                                <input type="number" min="0" value={formCourseCost} onChange={e => setFormCourseCost(parseInt(e.target.value))} className="w-full font-bold py-2 border rounded-lg bg-white text-center font-mono" required />
                                            </div>
                                        </div>
                                    )}

                                    {/* Type: Deputation Request (انتداب) */}
                                    {formRequestType === RequestType.DEPUTATION && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border">
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 block">الجهة والموقع الخارجي التكليف بها:</label>
                                                <input type="text" placeholder="مثال: هيئة الاستثمار / قصر العدل بالمرقاب" value={formDeputLocation} onChange={e => setFormDeputLocation(e.target.value)} className="w-full font-bold py-2 border rounded-lg bg-white px-2" required />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 block">فترة الانتداب الإجمالية (أيام عمالية):</label>
                                                <input type="number" min="1" value={formDeputDays} onChange={e => setFormDeputDays(parseInt(e.target.value))} className="w-full font-bold py-2 border rounded-lg bg-white text-center font-mono" required />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 block">مخصص البدل واليومية المقررة (د.ك):</label>
                                                <input type="number" min="0" value={formDeputPerDiem} onChange={e => setFormDeputPerDiem(parseInt(e.target.value))} className="w-full font-bold py-2 border rounded-lg bg-white text-center font-mono" required />
                                            </div>
                                        </div>
                                    )}

                                    {/* Type: Transfer (نقل قسم وظيفي) */}
                                    {formRequestType === RequestType.TRANSFER && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border">
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 block">القسم المستهدف الجديد للموظف:</label>
                                                <input type="text" placeholder="مثال: إدارة المدافعة الكلية والتدقيق" value={formReqDept} onChange={e => setFormReqDept(e.target.value)} className="w-full font-bold py-2 border rounded-lg bg-white px-2" required />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 block">المسمى الوظيفي المرغوب فيه تسكينه:</label>
                                                <input type="text" placeholder="مثال: مدقق أول إداري" value={formReqTitle} onChange={e => setFormReqTitle(e.target.value)} className="w-full font-bold py-2 border rounded-lg bg-white px-2" required />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 block">الراتب الجديد المطلوب للقسم الجديد (د.ك):</label>
                                                <input type="number" min="0" value={formReqSalary} onChange={e => setFormReqSalary(parseInt(e.target.value))} className="w-full font-bold py-2 border rounded-lg bg-white text-center font-mono" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Type: Promotion (ترقية) */}
                                    {formRequestType === RequestType.PROMOTION && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border">
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 block">المسمى والدرجة الجديدة المستهدفة للتسكين:</label>
                                                <input type="text" placeholder="مثال: مستشار قانوني شريك / باحث أول كفاءة" value={formReqTitle} onChange={e => setFormReqTitle(e.target.value)} className="w-full font-bold py-2 border rounded-lg bg-white px-2" required />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 block">الراتب المقترح الشامل الكلي الجديد (د.ك):</label>
                                                <input type="number" min="100" value={formReqSalary} onChange={e => setFormReqSalary(parseInt(e.target.value))} className="w-full font-bold py-2 border rounded-lg bg-white text-center font-mono" required />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 block">تاريخ أثر الزيادة القانونية (تاريخ المعاملة):</label>
                                                <input type="date" value={formResumDate} onChange={e => setFormResumDate(e.target.value)} className="w-full font-bold py-2 border rounded-lg bg-white text-center" required />
                                            </div>
                                        </div>
                                    )}

                                    {/* Type: Duty Resumption (مباشرة عمل) */}
                                    {formRequestType === RequestType.DUTY_RESUMPTION && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border">
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 block">تاريخ المباشرة الفعلي في الحضور بالبصمة:</label>
                                                <input type="date" value={formResumDate} onChange={e => setFormResumDate(e.target.value)} className="w-full font-bold py-2 border rounded-lg bg-white text-center" required />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 block">رقم ورقم كود معاملة الإجازة الصادر المنقضية:</label>
                                                <input type="text" placeholder="مثال: QA-REQ-2026-003" value={formResumRef} onChange={e => setFormResumRef(e.target.value)} className="w-full font-bold py-2 border rounded-lg bg-white text-center font-mono" required />
                                            </div>
                                        </div>
                                    )}

                                    {/* Type: Custom customizable request (طلب مخصص آخر) */}
                                    {formRequestType === RequestType.CUSTOM && (
                                        <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border text-right">
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-400 block">عنوان أو مسمى المستند المطلوب:</label>
                                                <input type="text" placeholder="مثال: تصريح استخدام حاسب آلي وعهد قانونية خاصة" value={formCustomTitle} onChange={e => setFormCustomTitle(e.target.value)} className="w-full font-bold py-2 border rounded-lg bg-white px-2" required />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-400 block">نص أو شروط التخصيص والمطلوب:</label>
                                                <textarea placeholder="اكتب شروط الاستخدام أو تفاصيل وتخصيص البنود كاملة للطباعة..." value={formCustomContent} onChange={e => setFormCustomContent(e.target.value)} className="w-full h-24 p-2.5 border rounded-lg bg-white" required />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Text Reason Note */}
                                <div className="space-y-1 text-right">
                                    <label className="text-[10px] text-slate-500 font-bold block">4. المسوغ القانوني والملاحظات العامة (اختياري للتدقيق):</label>
                                    <textarea 
                                        rows={3} 
                                        placeholder="اكتب أسباب وحقائق تقديم الطلب لتسجيلها في دورة المستند عمالياً..."
                                        value={formReason}
                                        onChange={e => setFormReason(e.target.value)}
                                        className="w-full p-3 border rounded-xl focus:border-indigo-500 focus:ring-0 bg-slate-50/50 font-bold"
                                    />
                                </div>

                                <div className="flex justify-end pt-4 border-t">
                                    <Button 
                                        type="submit" 
                                        variant="primary" 
                                        size="lg"
                                        className="px-8 py-3.5 rounded-2xl flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all font-black"
                                    >
                                        <ClipboardCheck className="w-5 h-5 text-indigo-200" />
                                        توليد طلب إلكتروني وإدراج دورة الموافقات
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            {/* ----------------------------------------------------
                MODAL 1: STAGE APPROVAL TIMELINE DETAILS
               ---------------------------------------------------- */}
            <Modal 
                isOpen={isDetailsIdOpen} 
                onClose={() => setIsDetailsIdOpen(false)}
                title={`مسار الموافقات والامتثال لطلب: (${selectedRequest?.referenceNumber})`}
                size="lg"
            >
                {selectedRequest && (
                    <div className="space-y-6 text-right" style={{ direction: 'rtl' }}>
                        
                        {/* Header details of requested items */}
                        <div className="bg-slate-50 p-4 rounded-2xl border flex items-center justify-between">
                            <div className="space-y-1 text-right">
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">الموظف صاحب الطلب</span>
                                <h4 className="text-sm font-black text-slate-900">{selectedRequest.employeeName}</h4>
                                <p className="text-[10px] text-slate-500 font-semibold">{selectedRequest.employeeJobTitle} • قسم {selectedRequest.employeeDepartment}</p>
                            </div>

                            <div className="text-left font-mono text-[10px] space-y-0.5 text-slate-600">
                                <p>نوع المعاملة: <span className="font-bold underline text-slate-800">{selectedRequest.requestType}</span></p>
                                <p>تاريخ الإرسال: <span>{selectedRequest.requestDate}</span></p>
                                <p>الرقم المرجعي: <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-bold">{selectedRequest.referenceNumber}</span></p>
                            </div>
                        </div>

                        {/* Interactive Warning check in approvals */}
                        {selectedRequest.hasActiveInvestigation && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-[10px] flex items-start gap-2 font-bold animate-pulse">
                                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                                <span className="text-right leading-relaxed">
                                    تنبيه الكفاءة عسكرياً وعمالياً: هذا الموظف خاضع حالياً لتحقيق إداري مفتوح في الشؤون القانونية بالمنشأة. يرجى توخي الحذر الشديد وعدم اعتماد أي ترقيات مالية أو قروض إلا بموافقة صريحة ومكتوبة من الشركاء!
                                </span>
                            </div>
                        )}

                        {/* Description Text */}
                        <div className="bg-white p-4 rounded-2xl border space-y-2">
                            <h5 className="text-[11px] text-slate-400 font-black block">نص أو غاية ومبرر الطلب:</h5>
                            <p className="text-xs font-semibold text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-xl border border-dashed text-justify">"{selectedRequest.reasonNote}"</p>
                        </div>

                        {/* Dynamic Horizontal/Vertical Approval Chain */}
                        <div className="space-y-4 pt-2">
                            <h5 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                                <Signature className="w-4 h-4 text-primary" />
                                دورة الموافقات الاحترافية المتعاقبة (الستة مستويات):
                            </h5>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {selectedRequest.approvals.map((stage) => {
                                    let statusColor = 'bg-slate-50 text-slate-400 border-slate-200';
                                    let statusTextAr = 'قيد الانتظار لموافقتك';

                                    if (stage.status === 'approved') {
                                        statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                                        statusTextAr = `تم الاعتماد بواسطة: ${stage.approverName || 'مدير القسم'}`;
                                    } else if (stage.status === 'rejected') {
                                        statusColor = 'bg-red-50 text-red-700 border-red-200';
                                        statusTextAr = 'تم الرفض عمالياً';
                                    } else if (stage.status === 'not_required') {
                                        statusColor = 'bg-gray-100 text-slate-400 border-gray-200';
                                        statusTextAr = 'غير مطلوب ومستثنى';
                                    }

                                    return (
                                        <div key={stage.roleId} className={`p-4 border rounded-2xl space-y-2.5 flex flex-col justify-between ${statusColor}`}>
                                            <div className="flex items-center justify-between border-b pb-2">
                                                <span className="font-black text-xs text-slate-900 block">{stage.roleAr}</span>
                                                <Badge text={stage.roleEn} className="text-[9px] font-bold px-1.5 py-0.5 rounded-lg border bg-white shadow-sm" />
                                            </div>
                                            
                                            <div className="space-y-1">
                                                <p className="text-[10px] leading-relaxed font-bold block">{statusTextAr}</p>
                                                {stage.actionDate && (
                                                    <span className="text-[8px] text-slate-400 block font-mono">تاريخ الإجراء: {stage.actionDate}</span>
                                                )}
                                                {stage.notes && (
                                                    <p className="text-[9px] text-slate-500 italic font-medium leading-normal bg-white/40 p-1 rounded">"{stage.notes}"</p>
                                                )}
                                            </div>

                                            {/* Action Simulator buttons for HR Admin */}
                                            {stage.status === 'pending' && (
                                                <div className="flex items-center gap-1.5 pt-2">
                                                    <button 
                                                        onClick={() => handleToggleStageApproval(selectedRequest.id, stage.roleId, 'approved')}
                                                        className="px-2 py-1 text-[9px] font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors block w-full text-center"
                                                    >
                                                        اعتماد المرحلة ✔️
                                                    </button>
                                                    <button 
                                                        onClick={() => handleToggleStageApproval(selectedRequest.id, stage.roleId, 'rejected')}
                                                        className="px-2 py-1 text-[9px] font-black bg-red-600 hover:bg-red-700 text-white rounded transition-colors block w-full text-center"
                                                    >
                                                        رفض المرحلة ❌
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t gap-2">
                            <Button variant="outline" onClick={() => setIsDetailsIdOpen(false)}>إغلاق النافذة</Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* ----------------------------------------------------
                MODAL 2: DOCUMENT INTUITIVE PRINT & ADVANCED EDITOR
               ---------------------------------------------------- */}
            <Modal
                isOpen={isPrintLayoutOpen}
                onClose={() => setIsPrintLayoutOpen(false)}
                title="محرر المستندات والامتثال لنموذج الطباعة"
                size="xl"
            >
                {selectedRequest && (
                    <PrintDocumentEditor 
                        request={selectedRequest}
                        onClose={() => setIsPrintLayoutOpen(false)}
                        onSaveDocumentText={handleSaveDocumentText}
                        onDuplicateAsNewRequest={handleDuplicateAsNewRequest}
                    />
                )}
            </Modal>
        </div>
    );
};

export default EmployeeRequestsPage;
