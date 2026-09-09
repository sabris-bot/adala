import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    User, Edit, Plus, X, Upload, Download, Eye, Copy, 
    ShieldCheck, AlertCircle, FileCheck, RotateCcw, FileText, Briefcase
} from 'lucide-react';
import { ContractTypeKuwait } from '../types';
import { initialEmployees, OFFICIAL_FORM_TEMPLATES, ExtendedEmployee } from './EmployeeProfileData';
import { EmployeeKpiSummaryBar } from '../components/employee-affairs/EmployeeKpiSummaryBar';
import { EmployeeFilterBar } from '../components/employee-affairs/EmployeeFilterBar';
import { EmployeeCard } from '../components/employee-affairs/EmployeeCard';
import { EmployeeListView } from '../components/employee-affairs/EmployeeListView';
import { EmployeeDetailPanel } from '../components/employee-affairs/EmployeeDetailPanel';

export { initialEmployees } from './EmployeeProfileData';

export const EmployeeProfilePage: React.FC = () => {
    // Core state loaded from LocalStorage
    const [employees, setEmployees] = useState<ExtendedEmployee[]>(() => {
        const stored = localStorage.getItem('alwagayan_employees');
        if (stored) {
            try { return JSON.parse(stored); } catch (e) { console.error('Error loading employees: ', e); }
        }
        return initialEmployees;
    });

    useEffect(() => {
        localStorage.setItem('alwagayan_employees', JSON.stringify(employees));
    }, [employees]);

    // Active Selection, View Mode and Details Drawer Modal
    const [selectedId, setSelectedId] = useState<string>('emp-101');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showDetailPanel, setShowDetailPanel] = useState<boolean>(false);

    // Filters State
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [filterDept, setFilterDept] = useState<string>('ALL');
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [filterContractType, setFilterContractType] = useState<string>('ALL');

    // Toasts state
    const [toasts, setToasts] = useState<Array<{ id: string; type: 'success' | 'error' | 'info'; title: string; message: string }>>([]);
    const addToast = (toast: { type: 'success' | 'error' | 'info'; title: string; message: string }) => {
        const id = `toast-${Date.now()}`;
        setToasts(prev => [...prev, { id, ...toast }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    };

    // Find Selected Employee
    const selectedEmployee = useMemo(() => {
        return employees.find(e => e.id === selectedId) || employees[0] || initialEmployees[0];
    }, [employees, selectedId]);

    // Document Alerts count helper
    const getEmployeeAlertsCount = (emp: ExtendedEmployee) => {
        let count = 0;
        const today = new Date();
        if (emp.civilIdExpiry && new Date(emp.civilIdExpiry) < today) count++;
        if (emp.passportExpiry && new Date(emp.passportExpiry) < today) count++;
        if (emp.residencyExpiry && emp.nationality !== 'كويتي' && new Date(emp.residencyExpiry) < today) count++;
        return count;
    };

    // Filter employees logic
    const filteredEmployees = useMemo(() => {
        return employees.filter(emp => {
            const query = searchQuery.trim().toLowerCase();
            const matchesSearch = query === '' || 
                emp.fullNameAr.toLowerCase().includes(query) ||
                emp.fullNameEn.toLowerCase().includes(query) ||
                emp.employeeId.toLowerCase().includes(query) ||
                emp.civilId.toLowerCase().includes(query);
            const matchesDept = filterDept === 'ALL' || emp.department === filterDept;
            const matchesStatus = filterStatus === 'ALL' || emp.status === filterStatus;
            const matchesContract = filterContractType === 'ALL' || emp.contractType === filterContractType;
            return matchesSearch && matchesDept && matchesStatus && matchesContract;
        });
    }, [employees, searchQuery, filterDept, filterStatus, filterContractType]);

    // Add and Edit Employee Modal State
    const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
    const [empFormState, setEmpFormState] = useState<Partial<ExtendedEmployee>>({});

    const handleOpenEdit = (emp?: ExtendedEmployee) => {
        const target = emp || selectedEmployee;
        setEmpFormState({ ...target });
        setIsEmpModalOpen(true);
    };

    const handleOpenAdd = () => {
        setEmpFormState({
            id: `emp-${Date.now()}`,
            employeeId: `K-${Math.floor(Math.random() * 900) + 100}`,
            fullNameAr: '',
            fullNameEn: '',
            gender: 'Male',
            socialStatus: 'Single',
            dateOfBirth: '1990-01-01',
            phone: '965',
            email: '',
            nationality: 'كويتي',
            civilId: '',
            civilIdExpiry: '',
            passportNumber: '',
            passportExpiry: '',
            residencyExpiry: '',
            jobTitle: 'محامي استشارات',
            department: 'Consultation',
            jobGrade: 'A1',
            branch: 'الفرع الرئيسي',
            managerName: 'صبري شطا',
            workSystem: 'دوام كامل',
            workHoursPerDay: 8,
            joiningDate: new Date().toISOString().split('T')[0],
            contractType: ContractTypeKuwait.UNLIMITED,
            status: 'Active',
            basicSalary: 800,
            bankName: 'بنك الكويت الوطني',
            bankAccount: '',
            bankIban: 'KW00NBOK00000000000000',
            allowances: [{ name: 'بدل مرافعة وهاتف', value: 100 }],
            attachments: []
        });
        setIsEmpModalOpen(true);
    };

    const handleSaveEmployee = (e: React.FormEvent) => {
        e.preventDefault();
        if (!empFormState.fullNameAr || !empFormState.civilId) {
            addToast({ type: 'error', title: 'بيانات ناقصة', message: 'يرجى كتابة الاسم باللغة العربية والرقم المدني الكويتي.' });
            return;
        }

        const listCopy = [...employees];
        const matchIdx = listCopy.findIndex(emp => emp.id === empFormState.id);
        if (matchIdx > -1) {
            listCopy[matchIdx] = { ...listCopy[matchIdx], ...empFormState } as ExtendedEmployee;
            addToast({ type: 'success', title: 'تم الحفظ والمزامنة', message: `تم تحديث ملف الموظف ${empFormState.fullNameAr} بنجاح.` });
        } else {
            listCopy.push(empFormState as ExtendedEmployee);
            addToast({ type: 'success', title: 'تم التثبيت بالمنظومة', message: `تم إضافة الموظف الجديد ${empFormState.fullNameAr} بالهيكل الإداري.` });
            setSelectedId(empFormState.id!);
            setShowDetailPanel(true);
        }
        setEmployees(listCopy);
        setIsEmpModalOpen(false);
    };

    // Document Generation Studio Modal State
    const [isDocModalOpen, setIsDocModalOpen] = useState(false);
    const [selectedDocId, setSelectedDocId] = useState<string>('labor_contract');
    const [liveTemplateText, setLiveTemplateText] = useState('');

    useEffect(() => {
        const found = OFFICIAL_FORM_TEMPLATES.find(t => t.id === selectedDocId);
        if (found && selectedEmployee) {
            setLiveTemplateText(found.text(selectedEmployee));
        } else {
            setLiveTemplateText('');
        }
    }, [selectedDocId, selectedEmployee, isDocModalOpen]);

    // Document Upload Modal State
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploadForm, setUploadForm] = useState({ title: '', category: 'البطاقة المدنية', notes: '', expiry: '' });

    const handleUploadFile = (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadForm.title) {
            addToast({ type: 'error', title: 'تسمية خاطئة', message: 'يرجى كتابة عنوان المستند المرفوع.' });
            return;
        }

        const newDoc = {
            id: `doc-${Date.now()}`,
            title: uploadForm.title,
            category: uploadForm.category,
            expiryDate: uploadForm.expiry || undefined,
            fileType: 'pdf'
        };

        const updatedEmp = {
            ...selectedEmployee,
            attachments: [newDoc, ...(selectedEmployee.attachments || [])]
        };

        setEmployees(employees.map(emp => emp.id === selectedEmployee.id ? updatedEmp : emp));
        setIsUploadModalOpen(false);
        setUploadForm({ title: '', category: 'البطاقة المدنية', notes: '', expiry: '' });
        addToast({ type: 'success', title: 'تم رفع المستند', message: 'تم إدراج المستند بنجاح في المحفظة الشخصية للموظف.' });
    };

    // Viewing Document Modal State
    const [viewingDocument, setViewingDocument] = useState<any | null>(null);

    const handleResetFilters = () => {
        setSearchQuery('');
        setFilterDept('ALL');
        setFilterStatus('ALL');
        setFilterContractType('ALL');
    };

    return (
        <div className="space-y-5 text-right font-sans min-h-screen p-4 md:p-6 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 transition-colors">
            
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-slate-800">
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5 m-0">
                        <Briefcase className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                        <span>سجلات وملفات الموظفين والكوادر</span>
                    </h1>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 m-0">
                        إدارة السجلات الوظيفية، البيانات المالية، العقود الرسمية، والجزاءات التابعة لمكتب أ. صبري شطا
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            if (confirm('هل تود بالفعل إعادة ضبط بيانات الموظفين لبيانات النظام الأساسية؟')) {
                                setEmployees(initialEmployees);
                                setSelectedId('emp-101');
                                addToast({ type: 'info', title: 'تمت الاستعادة', message: 'تم إعادة ضبط كشوف وسجلات الموظفين بنجاح.' });
                            }
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all border-none cursor-pointer"
                        title="إعادة ضبط المصنع"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>إعادة ضبط البيانات</span>
                    </button>
                </div>
            </div>

            {/* 1. KPI SUMMARY BAR */}
            <EmployeeKpiSummaryBar employees={employees} />

            {/* 2. FILTER & ACTION HEADER */}
            <EmployeeFilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                filterDept={filterDept}
                onDeptChange={setFilterDept}
                filterStatus={filterStatus}
                onStatusChange={setFilterStatus}
                filterContractType={filterContractType}
                onContractTypeChange={setFilterContractType}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onResetFilters={handleResetFilters}
                onAddEmployee={handleOpenAdd}
                totalCount={employees.length}
                filteredCount={filteredEmployees.length}
            />

            {/* 3. EMPLOYEES CARDS GRID OR LIST VIEW */}
            <div className="space-y-4">
                {filteredEmployees.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-12 text-center space-y-3 shadow-2xs">
                        <User className="w-10 h-10 text-slate-400 mx-auto" />
                        <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 m-0">لم يتم العثور على أية موظفين مطابقين لشروط البحث</h3>
                        <p className="text-xs text-slate-400 font-bold max-w-sm mx-auto">
                            جرب البحث باسم آخر أو اضغط على إلغاء الفلترة لعرض كافة كوادر المكتب.
                        </p>
                        <button
                            type="button"
                            onClick={handleResetFilters}
                            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-all border-none cursor-pointer inline-flex items-center gap-1.5"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>إلغاء الفلترة</span>
                        </button>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredEmployees.map((emp) => (
                            <EmployeeCard
                                key={emp.id}
                                employee={emp}
                                isSelected={emp.id === selectedId && showDetailPanel}
                                alertsCount={getEmployeeAlertsCount(emp)}
                                onSelect={(e) => {
                                    setSelectedId(e.id);
                                    setShowDetailPanel(true);
                                }}
                                onEdit={handleOpenEdit}
                                onOpenDocs={() => {
                                    setSelectedId(emp.id);
                                    setIsDocModalOpen(true);
                                }}
                                onOpenUpload={() => {
                                    setSelectedId(emp.id);
                                    setIsUploadModalOpen(true);
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <EmployeeListView
                        employees={filteredEmployees}
                        selectedEmployeeId={showDetailPanel ? selectedId : undefined}
                        getAlertsCount={getEmployeeAlertsCount}
                        onSelect={(e) => {
                            setSelectedId(e.id);
                            setShowDetailPanel(true);
                        }}
                        onEdit={handleOpenEdit}
                        onOpenDocs={() => {
                            setSelectedId(selectedId);
                            setIsDocModalOpen(true);
                        }}
                        onOpenUpload={() => {
                            setSelectedId(selectedId);
                            setIsUploadModalOpen(true);
                        }}
                    />
                )}
            </div>

            {/* 4. SLIDE-OVER DRAWER MODAL FOR FULL EMPLOYEE DETAILS */}
            <AnimatePresence>
                {showDetailPanel && selectedEmployee && (
                    <div className="fixed inset-0 z-50 flex justify-start bg-slate-900/50 backdrop-blur-xs text-right">
                        <motion.div
                            initial={{ x: '100%', opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '100%', opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                            className="w-full max-w-3xl h-full bg-white dark:bg-slate-900 shadow-2xl overflow-y-auto border-l border-slate-200 dark:border-slate-800"
                        >
                            <EmployeeDetailPanel
                                employee={selectedEmployee}
                                onClose={() => setShowDetailPanel(false)}
                                onEdit={handleOpenEdit}
                                onOpenDocsModal={() => setIsDocModalOpen(true)}
                                onOpenUploadModal={() => setIsUploadModalOpen(true)}
                                onViewDoc={(doc) => setViewingDocument(doc)}
                            />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL 1: ADD / EDIT EMPLOYEE */}
            <AnimatePresence>
                {isEmpModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs text-right">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl text-right"
                        >
                            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                                <h3 className="text-sm font-black m-0">
                                    {empFormState.id ? `تعديل ملف الموظف: ${empFormState.fullNameAr}` : 'إضافة موظف جديد بالهيكل الإداري'}
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setIsEmpModalOpen(false)}
                                    className="p-1 rounded-lg hover:bg-white/10 text-slate-300 border-none cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleSaveEmployee} className="p-5 space-y-4 text-xs font-bold max-h-[80vh] overflow-y-auto">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-slate-600 dark:text-slate-400 mb-1">الاسم الكامل (بالعربي)*</label>
                                        <input
                                            type="text"
                                            required
                                            value={empFormState.fullNameAr || ''}
                                            onChange={e => setEmpFormState({ ...empFormState, fullNameAr: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-600 dark:text-slate-400 mb-1">الاسم الكامل (بالإنجليزية)</label>
                                        <input
                                            type="text"
                                            value={empFormState.fullNameEn || ''}
                                            onChange={e => setEmpFormState({ ...empFormState, fullNameEn: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-mono text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-600 dark:text-slate-400 mb-1">الرقم المدني الكويتي*</label>
                                        <input
                                            type="text"
                                            required
                                            value={empFormState.civilId || ''}
                                            onChange={e => setEmpFormState({ ...empFormState, civilId: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-mono text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-600 dark:text-slate-400 mb-1">المسمى الوظيفي</label>
                                        <input
                                            type="text"
                                            value={empFormState.jobTitle || ''}
                                            onChange={e => setEmpFormState({ ...empFormState, jobTitle: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-600 dark:text-slate-400 mb-1">القسم والإدارة</label>
                                        <select
                                            value={empFormState.department || 'Consultation'}
                                            onChange={e => setEmpFormState({ ...empFormState, department: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white"
                                        >
                                            <option value="Consultation">الاستشارات والمرافعات</option>
                                            <option value="Litigation">التقاضي والإعلانات</option>
                                            <option value="Finance">الحسابات والمالية</option>
                                            <option value="HR">الموارد البشرية</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-slate-600 dark:text-slate-400 mb-1">الراتب الأساسي (د.ك)</label>
                                        <input
                                            type="number"
                                            value={empFormState.basicSalary || 0}
                                            onChange={e => setEmpFormState({ ...empFormState, basicSalary: Number(e.target.value) })}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-mono text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-600 dark:text-slate-400 mb-1">تاريخ المباشرة</label>
                                        <input
                                            type="date"
                                            value={empFormState.joiningDate || ''}
                                            onChange={e => setEmpFormState({ ...empFormState, joiningDate: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-mono text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-600 dark:text-slate-400 mb-1">الحالة الوظيفية</label>
                                        <select
                                            value={empFormState.status || 'Active'}
                                            onChange={e => setEmpFormState({ ...empFormState, status: e.target.value as any })}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white"
                                        >
                                            <option value="Active">على رأس العمل</option>
                                            <option value="On Leave">في إجازة</option>
                                            <option value="Suspended">موقوف</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsEmpModalOpen(false)}
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl border-none cursor-pointer"
                                    >
                                        إلغاء
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl border-none cursor-pointer shadow-3xs"
                                    >
                                        حفظ الملف
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL 2: CONTRACT & FORM GENERATOR STUDIO */}
            <AnimatePresence>
                {isDocModalOpen && selectedEmployee && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs text-right">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl text-right flex flex-col max-h-[85vh]"
                        >
                            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-2">
                                    <FileCheck className="w-5 h-5 text-teal-400" />
                                    <h3 className="text-sm font-black m-0">
                                        توليد العقود والنماذج الرسمية لـ {selectedEmployee.fullNameAr}
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsDocModalOpen(false)}
                                    className="p-1 rounded-lg hover:bg-white/10 text-slate-300 border-none cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shrink-0">
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">اختر نموذج العقد / النموذج الإداري المطلوب:</label>
                                <select
                                    value={selectedDocId}
                                    onChange={e => setSelectedDocId(e.target.value)}
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-bold text-slate-900 dark:text-white"
                                >
                                    {OFFICIAL_FORM_TEMPLATES.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="p-4 overflow-y-auto flex-1 font-mono text-xs bg-slate-100 dark:bg-slate-950/80 leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap rounded-xl border border-slate-200 dark:border-slate-800 m-4">
                                {liveTemplateText}
                            </div>

                            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
                                <button
                                    type="button"
                                    onClick={() => {
                                        navigator.clipboard.writeText(liveTemplateText);
                                        addToast({ type: 'success', title: 'تم النسخ', message: 'تم نسخ نص العقد للمحافظة على التدوين.' });
                                    }}
                                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl border-none cursor-pointer inline-flex items-center gap-1.5"
                                >
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>نسخ النص</span>
                                </button>

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsDocModalOpen(false)}
                                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl border-none cursor-pointer"
                                    >
                                        إغلاق
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            window.print();
                                        }}
                                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs rounded-xl border-none cursor-pointer shadow-3xs inline-flex items-center gap-1.5"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>طباعة الرسمية</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL 3: UPLOAD DOCUMENT */}
            <AnimatePresence>
                {isUploadModalOpen && selectedEmployee && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs text-right">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl text-right"
                        >
                            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                                <h3 className="text-sm font-black m-0">رفع وثيقة بمحفظة {selectedEmployee.fullNameAr}</h3>
                                <button
                                    type="button"
                                    onClick={() => setIsUploadModalOpen(false)}
                                    className="p-1 rounded-lg hover:bg-white/10 text-slate-300 border-none cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleUploadFile} className="p-5 space-y-3 text-xs font-bold">
                                <div>
                                    <label className="block text-slate-600 dark:text-slate-400 mb-1">اسم/تسمية المستند*</label>
                                    <input
                                        type="text"
                                        required
                                        value={uploadForm.title}
                                        onChange={e => setUploadForm({ ...uploadForm, title: e.target.value })}
                                        placeholder="مثال: شهادة المؤهل العلمي / البطاقة المدنية"
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-600 dark:text-slate-400 mb-1">تصنيف المستند</label>
                                    <select
                                        value={uploadForm.category}
                                        onChange={e => setUploadForm({ ...uploadForm, category: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white"
                                    >
                                        <option value="البطاقة المدنية">البطاقة المدنية</option>
                                        <option value="جواز السفر">جواز السفر</option>
                                        <option value="عقد العمل">عقد العمل</option>
                                        <option value="المؤهلات">المؤهلات والشهادات</option>
                                        <option value="مستندات متنوعة">مستندات متنوعة</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-slate-600 dark:text-slate-400 mb-1">تاريخ الانتهاء (إن وجد)</label>
                                    <input
                                        type="date"
                                        value={uploadForm.expiry}
                                        onChange={e => setUploadForm({ ...uploadForm, expiry: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-mono text-slate-900 dark:text-white"
                                    />
                                </div>

                                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsUploadModalOpen(false)}
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl border-none cursor-pointer"
                                    >
                                        إلغاء
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl border-none cursor-pointer shadow-3xs inline-flex items-center gap-1.5"
                                    >
                                        <Upload className="w-3.5 h-3.5" />
                                        <span>رفع وتخزين</span>
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL 4: VIEW DOCUMENT PREVIEW */}
            <AnimatePresence>
                {viewingDocument && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs text-right">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-right p-6 space-y-4"
                        >
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-teal-600" />
                                    <h3 className="text-sm font-black text-slate-900 dark:text-white m-0">{viewingDocument.title}</h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setViewingDocument(null)}
                                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 border-none cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="p-8 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
                                <ShieldCheck className="w-10 h-10 text-teal-600 mx-auto" />
                                <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 m-0">المستند موثق ومعتمد رقمياً</h4>
                                <p className="text-[11px] text-slate-400 font-bold m-0">التصنيف: {viewingDocument.category} | انتهاء الصلاحية: {viewingDocument.expiryDate || 'غير محدد'}</p>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setViewingDocument(null)}
                                    className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl border-none cursor-pointer"
                                >
                                    إغلاق المعاينة
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* TOAST NOTIFICATIONS */}
            <div className="fixed bottom-4 left-4 z-50 space-y-2">
                {toasts.map(t => (
                    <div
                        key={t.id}
                        className={`p-3.5 rounded-xl text-xs font-bold shadow-lg flex items-start gap-2.5 max-w-sm text-right text-white ${
                            t.type === 'success' ? 'bg-emerald-600' : t.type === 'error' ? 'bg-rose-600' : 'bg-slate-800'
                        }`}
                    >
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                            <div className="font-black">{t.title}</div>
                            <div className="text-[11px] opacity-90">{t.message}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EmployeeProfilePage;
