import React, { useState, useMemo, useEffect } from 'react';
import { Building2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Modal from '../components/ui/Modal';

// Import modular types, mock data, and components
import { RequestType, RequestWorkflowStatus, EmployeeRequest } from './employee-requests/request-types';
import { mockEmployeesList, initialRequestsSeed, getInitialApprovals } from './employee-requests/mock-data';
import { PrintDocumentEditor } from './employee-requests/PrintDocumentEditor';

// Import newly refactored components
import { RequestStats } from './employee-requests/RequestStats';
import { RequestDashboard } from './employee-requests/RequestDashboard';
import { RequestList } from './employee-requests/RequestList';
import { RequestForm } from './employee-requests/RequestForm';
import { ApprovalModal } from './employee-requests/ApprovalModal';

const EmployeeRequestsPage: React.FC = () => {
    // ----------------------------------------------------
    // 1. STATE INITIALIZATION (SYNCING WITH LOCALSTORAGE)
    // ----------------------------------------------------
    const [employees] = useState(() => {
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

    const [disciplinaryLogs] = useState<any[]>(() => {
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

    // Form selection inputs state
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('emp-1');

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
    const handleCreateRequestSubmit = (payload: any) => {
        if (!currentSelectedEmployee) return;

        const randRef = `QA-REQ-2026-${Math.floor(100 + Math.random() * 900)}`;
        const dateStr = new Date().toISOString().split('T')[0];

        const newRequest: EmployeeRequest = {
            id: `req-${Date.now()}`,
            employeeId: currentSelectedEmployee.id,
            employeeName: currentSelectedEmployee.fullNameAr,
            employeeJobTitle: currentSelectedEmployee.jobTitle,
            employeeDepartment: currentSelectedEmployee.department,
            requestType: payload.requestType,
            requestDate: dateStr,
            status: 'Pending Line Manager',
            referenceNumber: randRef,
            reasonNote: payload.reasonNote || `طلب ${payload.requestType} مقدم لغايات تنظيم مهام العمل ومطابقة لوائح مجموعة عدالة.`,
            
            // Sub-form data assignments
            leaveType: payload.leaveType,
            startDate: payload.startDate,
            endDate: payload.endDate,
            leaveDaysCount: payload.leaveDaysCount,
            
            permissionDate: payload.permissionDate,
            permissionTimeRange: payload.permissionTimeRange,
            permissionHours: payload.permissionHours,
            
            recipientName: payload.recipientName || 'من يهمه الأمر',
            includeSalaryDetails: payload.includeSalaryDetails,
            language: payload.language,
            
            fieldToUpdate: payload.fieldToUpdate,
            oldValue: payload.oldValue,
            newValue: payload.newValue,
            
            loanAmount: payload.loanAmount,
            installmentsCount: payload.installmentsCount,
            monthlyInstallment: payload.loanAmount ? Math.round(payload.loanAmount / (payload.installmentsCount || 1)) : 0,
            guarantorName: payload.guarantorName || 'مؤسسة التكافل المالي المباشر',
            
            trainingCourseTitle: payload.trainingCourseTitle,
            trainingProvider: payload.trainingProvider,
            trainingCost: payload.trainingCost,
            
            deputationLocation: payload.deputationLocation,
            deputationDurationDays: payload.deputationDurationDays,
            deputationPerDiem: payload.deputationPerDiem,
            
            currentDept: currentSelectedEmployee.department,
            requestedDept: payload.requestedDept,
            currentTitle: currentSelectedEmployee.jobTitle,
            requestedTitle: payload.requestedTitle,
            
            currentSalary: currentSelectedEmployee.basicSalary + currentSelectedEmployee.allowancesAmount,
            proposedSalary: payload.proposedSalary || (currentSelectedEmployee.basicSalary + currentSelectedEmployee.allowancesAmount),
            
            resumptionDate: payload.resumptionDate,
            resumptionReferenceCode: payload.resumptionReferenceCode,
            
            customTitle: payload.customTitle,
            customContent: payload.customContent,

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
                    action: `إرسال طلب إداري من نوع (${payload.requestType}) برقم مرجعي ${randRef}`,
                    type: 'إداري'
                });
                localStorage.setItem('alwagayan_timeline', JSON.stringify(timeline));
            } catch(evt) {}
        }

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

    // Create a new independent duplicated copy from printed draft
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

    return (
        <div className="min-h-screen bg-[#F5F7FA] dark:bg-[#102A3A] text-slate-800 dark:text-[#E0E7EF] pb-12 font-sans transition-colors duration-300" style={{ direction: 'rtl' }}>
            
            {/* --- CORE WORKSPACE WELCOME HEADER --- */}
            <div className="relative overflow-hidden bg-gradient-to-l from-slate-900 via-slate-950 to-primary-light/10 dark:from-dm-card dark:via-dm-background dark:to-accent/5 p-6 sm:p-8 rounded-b-[2.5rem] border-b border-slate-100 dark:border-slate-800/80 shadow-md mb-8">
                {/* Visual Glow Ornamentations */}
                <div className="absolute top-[-200px] left-[-200px] w-96 h-96 rounded-full bg-[#00796B]/15 blur-[120px]" />
                <div className="absolute bottom-[-150px] right-[-100px] w-80 h-80 rounded-full bg-[#C5A880]/10 blur-[100px]" />

                <div className="relative z-10 max-w-7xl mx-auto flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                    <div className="flex items-center gap-5">
                        <div className="p-1 border border-white/10 dark:border-slate-800 rounded-[2rem] shadow-xl shrink-0">
                            <div className="bg-slate-950 p-4 rounded-[1.8rem] border border-white/5 flex items-center justify-center">
                                <Building2 className="w-9 h-9 text-accent" />
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                <span className="px-3 py-0.5 bg-[#00796B] text-white font-black rounded-lg text-[9px] uppercase tracking-wide">
                                    بوابة عـدالة الإلكترونية للموارد البشرية والامتثال
                                </span>
                                <span className="px-2.5 py-0.5 bg-accent text-primary-dark font-black rounded-lg text-[9px] uppercase tracking-wide">
                                    قانون العمل الكويتي رقم (6/2010)
                                </span>
                            </div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight font-tajawal mt-1">
                                إدارة السجلات والطلبات الإدارية المتكاملة
                            </h1>
                            <p className="text-xs text-slate-400 font-medium mt-1">
                                مركز مراجعة وتدقيق المعاملات وقرارات الترقية والرواتب عمالياً وفقاً لأحكام القانون والامتثال الذكي للمستندات والقرارات.
                            </p>
                        </div>
                    </div>
                    
                    <div className="bg-slate-950/40 backdrop-blur-md px-5 py-4 rounded-[1.8rem] border border-white/10 text-right shrink-0 w-full xl:w-auto">
                        <p className="text-[10px] text-slate-400 font-bold block">مكتب الاستشارة والامتثال الشريك</p>
                        <p className="text-xs font-black text-accent">مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية</p>
                        <p className="text-[10px] text-emerald-400 font-bold mt-2 flex items-center gap-1 justify-end">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            تحديث تلقائي للمستندات متصل
                        </p>
                    </div>
                </div>
            </div>

            {/* Dashboard Content Container */}
            <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 space-y-8">
                
                {/* Visual statistics cards component */}
                <RequestStats stats={stats} />

                {/* Sub Tab Navigation */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-[#1E3C50] p-1 shadow-sm">
                        <button 
                            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all border-none cursor-pointer ${activeTab === 'dashboard' ? 'bg-[#00796B] text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-transparent'}`}
                            onClick={() => setActiveTab('dashboard')}
                        >
                            لوحة متابعة المؤشرات والتكامل
                        </button>
                        <button 
                            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all border-none cursor-pointer ${activeTab === 'allRequests' ? 'bg-[#00796B] text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-transparent'}`}
                            onClick={() => setActiveTab('allRequests')}
                        >
                            جميع الطلبات والقرارات ({requests.length})
                        </button>
                        <button 
                            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border-none cursor-pointer ${activeTab === 'requestForm' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-transparent'}`}
                            onClick={() => setActiveTab('requestForm')}
                        >
                            <Plus className="w-3.5 h-3.5" />
                            إنشاء طلب إلكتروني جديد
                        </button>
                    </div>

                    <div className="text-xs text-slate-400 dark:text-slate-500 font-bold bg-white dark:bg-[#1E3C50] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                        إصدار نظام الامتثال: <span className="font-mono font-black text-[#00796B] dark:text-accent">v3.5.0-adalah</span>
                    </div>
                </div>

                {/* Bespoke Interactive Tab Viewports with framer-motion */}
                <AnimatePresence mode="wait">
                    {/* TAB 1: DASHBOARD INDEX */}
                    {activeTab === 'dashboard' && (
                        <motion.div
                            key="dashboard"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3 }}
                        >
                            <RequestDashboard 
                                requests={requests}
                                disciplinaryLogs={disciplinaryLogs}
                                onViewRequest={(req) => {
                                    setSelectedRequest(req);
                                    setIsDetailsIdOpen(true);
                                }}
                            />
                        </motion.div>
                    )}

                    {/* TAB 2: ALL REQUESTS DIRECTORY */}
                    {activeTab === 'allRequests' && (
                        <motion.div
                            key="allRequests"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3 }}
                        >
                            <RequestList 
                                requests={requests}
                                filteredRequests={filteredRequests}
                                searchQuery={searchQuery}
                                setSearchQuery={setSearchQuery}
                                filterType={filterType}
                                setFilterType={setFilterType}
                                filterStatus={filterStatus}
                                setFilterStatus={setFilterStatus}
                                onViewDetails={(req) => {
                                    setSelectedRequest(req);
                                    setIsDetailsIdOpen(true);
                                }}
                                onViewPrint={(req) => {
                                    setSelectedRequest(req);
                                    setIsPrintLayoutOpen(true);
                                }}
                                onDeleteRequest={handleDeleteRequest}
                            />
                        </motion.div>
                    )}

                    {/* TAB 3: CREATE REQUEST STEP FORM */}
                    {activeTab === 'requestForm' && (
                        <motion.div
                            key="requestForm"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3 }}
                        >
                            <RequestForm 
                                employees={employees}
                                currentSelectedEmployee={currentSelectedEmployee}
                                selectedEmployeeId={selectedEmployeeId}
                                onSelectEmployee={setSelectedEmployeeId}
                                systemAlerts={systemAlerts}
                                onSubmit={handleCreateRequestSubmit}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* MODAL 1: STAGE APPROVAL TIMELINE DETAILS */}
            <ApprovalModal 
                isOpen={isDetailsIdOpen}
                onClose={() => setIsDetailsIdOpen(false)}
                selectedRequest={selectedRequest}
                onToggleStageApproval={handleToggleStageApproval}
            />

            {/* MODAL 2: DOCUMENT INTUITIVE PRINT & ADVANCED EDITOR */}
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
