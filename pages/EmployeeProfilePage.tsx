import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import { useTranslation } from 'react-i18next';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import { 
    UserCircleIcon, PlusCircleIcon, EyeIcon, PencilIcon, TrashIcon, 
    FolderIcon, InformationCircleIcon, PrinterIcon, UsersIcon, 
    BanknotesIcon, DocumentTextIcon, CheckCircleIcon, ListBulletIcon, 
    ViewColumnsIcon, BuildingOffice2Icon, PhoneIcon, EnvelopeIcon,
    CloudArrowUpIcon, ArrowDownTrayIcon, ExclamationTriangleIcon,
    BriefcaseIcon, IdentificationIcon, ShieldCheckIcon, CalendarDaysIcon,
    AcademicCapIcon, CreditCardIcon, ClockIcon, MapPinIcon, MagnifyingGlassIcon,
    ClipboardDocumentCheckIcon, BeakerIcon, ChartBarIcon, BellIcon,
    TableCellsIcon, DocumentDuplicateIcon, HistoryIcon, ArrowPathIcon, GlobeAltIcon,
    ArrowRightIcon, ArrowLeftIcon, CheckIcon, XMarkIcon, ShieldExclamationIcon
} from '../constants';
import { ContractTypeKuwait } from '../types';
import { initialExtendedEmployees, ExtendedEmployee } from '../data/employeeExtendedData';

export const initialEmployees = initialExtendedEmployees;

// --- Multi-lingual Settings ---
const DEPARTMENTS_LIST = [
    { value: 'Senior Management', label: 'الإدارة العليا' },
    { value: 'Litigation', label: 'قسم التقاضي والمحاكم' },
    { value: 'Consultation', label: 'قسم الاستشارات والعقود' },
    { value: 'Corporate', label: 'قسم الشركات والتجاري' },
    { value: 'HR', label: 'إدارة الموارد البشرية' },
    { value: 'Finance', label: 'الإدارة المالية' },
    { value: 'Admin', label: 'الشؤون الإدارية والسكرتارية' }
];

const JOB_TITLES_LIST = [
    { value: 'Managing Partner', label: 'شريك مدير' },
    { value: 'Senior Consultant', label: 'مستشار قانوني أول' },
    { value: 'Cassation Lawyer', label: 'محام (تمييز ودستورية)' },
    { value: 'Appeals Lawyer', label: 'محام (استئناف)' },
    { value: 'Trainee Lawyer', label: 'محام تحت التدريب' },
    { value: 'HR Manager', label: 'مدير الموارد البشرية' },
    { value: 'Accountant', label: 'محاسب' },
    { value: 'Legal Secretary', label: 'سكرتير قانوني' }
];

const EmployeeProfilePage: React.FC = () => {
    const { addToast } = useToast();
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar' || document.documentElement.dir === 'rtl';

    // State
    const [employees, setEmployees] = useState<ExtendedEmployee[]>(() => {
        const stored = localStorage.getItem('alwagayan_employees');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error("Local storage employee parse error:", e);
            }
        }
        return initialExtendedEmployees;
    });

    useEffect(() => {
        localStorage.setItem('alwagayan_employees', JSON.stringify(employees));
    }, [employees]);

    // UI Configuration States
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDept, setSelectedDept] = useState('All');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [viewMode, setViewMode] = useState<'grid' | 'table' | 'dashboard'>('grid');
    const [selectedEmployee, setSelectedEmployee] = useState<ExtendedEmployee | null>(null);
    const [activeDetailTab, setActiveDetailTab] = useState<string>('overview');
    
    // Dialog/Modal States
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<ExtendedEmployee | null>(null);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [printDocType, setPrintDocType] = useState<'contract' | 'payslip' | 'warning' | 'id'>('contract');
    const [previewDocContent, setPreviewDocContent] = useState<any>(null);

    // Interactive Document Upload State
    const [isPreviewDocOpen, setIsPreviewDocOpen] = useState(false);
    const [previewFileMeta, setPreviewFileMeta] = useState<{ title: string; type: string; url?: string; content?: string } | null>(null);

    // Employee Form Data
    const [formData, setFormData] = useState<Partial<ExtendedEmployee>>({
        fullNameAr: '',
        fullNameEn: '',
        civilId: '',
        employeeId: '',
        nationality: 'كويتي',
        jobTitle: 'Senior Consultant',
        department: 'Consultation',
        joiningDate: new Date().toISOString().split('T')[0],
        contractType: ContractTypeKuwait.UNLIMITED,
        status: 'Active',
        basicSalary: 1200,
        gender: 'Male',
        email: '',
        phone: '',
        civilIdExpiry: '',
        passportNumber: '',
        passportExpiry: '',
        residencyExpiry: '',
        bankName: '',
        bankIban: '',
        bankAccount: '',
        socialSecurityNumber: '',
        healthInsuranceNumber: '',
        bloodType: 'A+',
        managerName: '',
        socialStatus: 'Single',
        jobGrade: 'B1',
        branch: 'Main',
        contractStartDate: '',
        contractEndDate: '',
        workHoursPerDay: 8,
        workSystem: 'دوام كامل',
        restDays: ['الجمعة', 'السبت'],
        address: ''
    });

    // Helper functions for alerts and notifications
    const globalAlerts = useMemo(() => {
        const alerts: Array<{ id: string; empId: string; empName: string; title: string; date: string; type: 'critical' | 'warning' | 'info'; text: string }> = [];
        employees.forEach(emp => {
            const now = new Date();
            const getExpiryDiffDays = (dateStr?: string) => {
                if (!dateStr) return null;
                const expiry = new Date(dateStr);
                return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            };

            const civilIdDiff = getExpiryDiffDays(emp.civilIdExpiry);
            if (civilIdDiff !== null && civilIdDiff <= 60) {
                alerts.push({
                    id: `id-${emp.id}`,
                    empId: emp.id,
                    empName: emp.fullNameAr,
                    title: 'قرب انتهاء صلاحية البطاقة المدنية',
                    date: emp.civilIdExpiry || '',
                    type: civilIdDiff <= 15 ? 'critical' : 'warning',
                    text: `البطاقة المدنية تنتهي خلال ${civilIdDiff} يوماً (${emp.civilIdExpiry}).`
                });
            }

            const residencyDiff = getExpiryDiffDays(emp.residencyExpiry);
            if (residencyDiff !== null && residencyDiff <= 45) {
                alerts.push({
                    id: `res-${emp.id}`,
                    empId: emp.id,
                    empName: emp.fullNameAr,
                    title: 'موعد تجديد الإقامة والترخيص',
                    date: emp.residencyExpiry || '',
                    type: residencyDiff <= 10 ? 'critical' : 'warning',
                    text: `ترخيص العمل والإقامة ينتهي خلال ${residencyDiff} يوماً.`
                });
            }

            const passportDiff = getExpiryDiffDays(emp.passportExpiry);
            if (passportDiff !== null && passportDiff <= 90) {
                alerts.push({
                    id: `pass-${emp.id}`,
                    empId: emp.id,
                    empName: emp.fullNameAr,
                    title: 'صلاحية جواز السفر المعتمد',
                    date: emp.passportExpiry || '',
                    type: passportDiff <= 30 ? 'warning' : 'info',
                    text: `ينتهي جواز السفر في تاريخ ${emp.passportExpiry}.`
                });
            }

            // Loan Overdue Sim
            if (emp.loans && emp.loans.length > 0) {
                emp.loans.forEach(ln => {
                    if (ln.status === 'Active' && ln.balanceAmount > 1000) {
                        alerts.push({
                            id: `loan-${ln.id}`,
                            empId: emp.id,
                            empName: emp.fullNameAr,
                            title: 'تنبيه سلفة مالية نشطة',
                            date: ln.maturityDate,
                            type: 'info',
                            text: `الموظف لديه سلفة نشطة برصيد متبقٍ قدره ${ln.balanceAmount} د.ك.`
                        });
                    }
                });
            }
        });
        return alerts;
    }, [employees]);

    // Filtering logic
    const filteredEmployees = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        return employees.filter(e => {
            const matchesSearch = e.fullNameAr.toLowerCase().includes(term) ||
                (e.fullNameEn && e.fullNameEn.toLowerCase().includes(term)) ||
                e.employeeId.toLowerCase().includes(term) ||
                e.civilId.includes(term) ||
                e.jobTitle.toLowerCase().includes(term);
            const matchesDept = selectedDept === 'All' || e.department === selectedDept;
            const matchesStatus = selectedStatus === 'All' || e.status === selectedStatus;
            return matchesSearch && matchesDept && matchesStatus;
        });
    }, [employees, searchTerm, selectedDept, selectedStatus]);

    // Actions
    const handleOpenForm = (emp?: ExtendedEmployee) => {
        if (emp) {
            setEditingEmployee(emp);
            setFormData({ ...emp });
        } else {
            setEditingEmployee(null);
            setFormData({
                id: `emp-${Math.floor(Math.random() * 1000 + 100)}`,
                employeeId: `EMP-${Math.floor(Math.random() * 8999 + 1000)}`,
                fullNameAr: '',
                fullNameEn: '',
                civilId: '',
                nationality: 'كويتي',
                jobTitle: 'Senior Consultant',
                department: 'Consultation',
                joiningDate: new Date().toISOString().split('T')[0],
                contractType: ContractTypeKuwait.UNLIMITED,
                status: 'Active',
                basicSalary: 1200,
                gender: 'Male',
                email: '',
                phone: '',
                civilIdExpiry: '2028-12-30',
                passportNumber: '',
                passportExpiry: '2029-01-01',
                residencyExpiry: '2028-12-30',
                bankName: 'بنك الكويت الوطني (NBK)',
                bankIban: '',
                bankAccount: '',
                socialSecurityNumber: '',
                healthInsuranceNumber: '',
                bloodType: 'A+',
                managerId: '',
                managerName: 'أحمد محمود العبدالله',
                socialStatus: 'Single',
                jobGrade: 'B2',
                branch: 'Main',
                contractStartDate: new Date().toISOString().split('T')[0],
                contractEndDate: '',
                workHoursPerDay: 8,
                workSystem: 'دوام كامل',
                restDays: ['الجمعة', 'السبت'],
                address: '',
                allowances: [],
                attendanceLogs: [
                  { date: new Date().toISOString().split('T')[0], checkIn: '08:00', checkOut: '16:00', status: 'Present', delayMinutes: 0 }
                ],
                leaveRequests: [],
                disciplinaryActions: [],
                investigations: [],
                loans: [],
                evaluations: [],
                administrativeRequests: [],
                historyTimeline: [
                  {
                    id: `tl-${Math.random()}`,
                    date: new Date().toISOString().split('T')[0],
                    category: 'Hiring',
                    titleAr: 'التعيين بالمنشأة',
                    titleEn: 'Hired at Company',
                    descriptionAr: 'الانضمام إلى المكتب وبدء استحقاق المزايا',
                    descriptionEn: 'Joined company and initialized benefits parameters',
                    performedBy: 'نظام الموارد البشرية'
                  }
                ],
                legalNotes: []
            });
        }
        setIsFormOpen(true);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation check for duplicates
        const duplicateCheck = employees.some(emp => 
            emp.civilId === formData.civilId && emp.id !== formData.id
        );
        
        if (duplicateCheck) {
            addToast({
                type: 'error',
                title: 'تنبيه مطابقة بيانات',
                message: 'عذراً، يوجد موظف مسبق مسجل بنفس الرقم المدني الحالي.'
            });
            return;
        }

        if (editingEmployee) {
            setEmployees(prev => prev.map(emp => emp.id === editingEmployee.id ? { ...emp, ...formData } as ExtendedEmployee : emp));
            addToast({
                type: 'success',
                title: 'حفظ وتحديث',
                message: `تم تحديث ملف الموظف ${formData.fullNameAr} بنجاح ومزامنته.`
            });
            if (selectedEmployee?.id === editingEmployee.id) {
                setSelectedEmployee({ ...selectedEmployee, ...formData } as ExtendedEmployee);
            }
        } else {
            const newEmp = { ...formData, id: `emp-${Math.random().toString(36).substr(2, 9)}` } as ExtendedEmployee;
            setEmployees(prev => [newEmp, ...prev]);
            addToast({
                type: 'success',
                title: 'تسجيل ناجح',
                message: `تم تسجيل الموظف ${formData.fullNameAr} بقاطعة العمل الموحدة.`
            });
        }
        setIsFormOpen(false);
    };

    const handleDelete = (id: string, name: string) => {
        if (window.confirm(`هل أنت متأكد من رغبتك في حذف ملف الموظف (${name}) نهائياً؟ هذا الإجراء سيقوم بإزالة كامل سجلات الحضور، الرواتب والتحقيقات المرتبطة به.`)) {
            setEmployees(prev => prev.filter(emp => emp.id !== id));
            if (selectedEmployee?.id === id) {
                setSelectedEmployee(null);
            }
            addToast({
                type: 'warning',
                title: 'حذف السجلات',
                message: `تمت إزالة السجل الكامل للموظف ${name} من الخادم المحلي.`
            });
        }
    };

    const handleDuplicate = (emp: ExtendedEmployee) => {
        const dup = {
            ...emp,
            id: `emp-${Math.floor(Math.random() * 900 + 100)}`,
            employeeId: `EMP-${Math.floor(Math.random() * 8999 + 1000)}`,
            fullNameAr: `${emp.fullNameAr} (مكرر)`,
            fullNameEn: emp.fullNameEn ? `${emp.fullNameEn} (Copy)` : '',
            civilId: `99${emp.civilId.substr(2)}` // Slightly alter civil ID
        };
        setEmployees(prev => [dup, ...prev]);
        addToast({
            type: 'success',
            title: 'نسخ وتكرار ملف',
            message: `تم نسخ ملف الموظف ${emp.fullNameAr} لإجراء التعديلات السرية.`
        });
    };

    // Printing Setup
    const handleOpenPrintDoc = (type: 'contract' | 'payslip' | 'warning' | 'id', emp: ExtendedEmployee) => {
        setPrintDocType(type);
        const refNo = `REF-${new Date().getFullYear()}-${Math.floor(Math.random() * 8999 + 1000)}`;
        let content: any = {
            refNo,
            empName: emp.fullNameAr,
            empCivilId: emp.civilId,
            empJob: emp.jobTitle,
            empDept: emp.department,
            joiningDate: emp.joiningDate,
            basicSalary: emp.basicSalary,
            empId: emp.employeeId,
            date: new Date().toISOString().split('T')[0]
        };

        if (type === 'payslip') {
            const allowancesVal = emp.allowances?.reduce((sum, a) => sum + a.value, 0) || 0;
            const gross = emp.basicSalary + allowancesVal;
            const insDeduction = Math.round(emp.basicSalary * 0.08); // KWD 8% Social insurance contribution
            const net = gross - insDeduction;
            content = { ...content, allowancesVal, gross, insDeduction, net };
        } else if (type === 'warning') {
            content = {
                ...content,
                lawClause: 'المادة 41 من القانون رقم 6 لعام 2010 بشأن العمل في القطاع الأهلي بدولة الكويت',
                reason: emp.disciplinaryActions?.[0]?.violationDetails || 'التغيب المتكرر أو عدم الامتثال للتوجيهات الصادرة عن مستشاري ورؤساء الأقسام بالمكتب القانوني.',
                penalty: emp.disciplinaryActions?.[0]?.penalty || 'إنذار كتابي أول مع تسجيل القرار بملف الخدمة.'
            };
        }
        
        setPreviewDocContent(content);
        setIsPrintModalOpen(true);
    };

    const triggerSystemPrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        const html = document.getElementById('printableArea')?.innerHTML || '';
        printWindow.document.write(`
            <html>
                <head>
                    <title>طباعة وثيقة رسمية - مكتب الوقيان والمنصور</title>
                    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
                    <style>
                        body { direction: rtl; font-family: 'Inter', sans-serif; padding: 20px;}
                        @media print {
                            .no-print { display: none; }
                            body { padding: 0; }
                        }
                    </style>
                </head>
                <body onload="window.print(); window.close();">
                    <div class="max-w-4xl mx-auto p-8 border border-slate-200">
                        ${html}
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    // Interactive Document Archiver View
    const handlePreviewDocument = (filename: string, docAr: string) => {
        let contentText = "";
        let docType = "text";
        if (filename.includes("البطاقة")) {
            docType = "civil_id";
        } else if (filename.includes("جواز")) {
            docType = "passport";
        } else if (filename.includes("الشهادة")) {
            docType = "degree";
        } else {
            contentText = `مستند أصلي رسمي صادر بموجب لوائح وقوانين ديوان الخدمة المدنية ووزارة القوى العاملة الكويتية لعام 2026.\n\nالمستند المذكور: ${docAr}\nرقم المرجع: CID-${Math.floor(Math.random() * 89999 + 10000)}\nتاريخ الاعتماد: 2026-01-10`;
        }

        setPreviewFileMeta({
            title: docAr,
            type: docType,
            content: contentText
        });
        setIsPreviewDocOpen(true);
    };

    // Sub-record Mutators inside Profile Tab
    const handleAddNote = (empId: string, author: string, noteText: string) => {
        if (!noteText.trim()) return;
        setEmployees(prev => prev.map(emp => {
            if (emp.id === empId) {
                const updatedNotes = [
                    ...(emp.legalNotes || []),
                    {
                        id: `note-${Date.now()}`,
                        date: new Date().toISOString().split('T')[0],
                        author,
                        noteText
                    }
                ];
                return { ...emp, legalNotes: updatedNotes };
            }
            return emp;
        }));
        addToast({
            type: 'success',
            title: 'إضافة مرئية',
            message: 'تم إضافة الملاحظة وعرضها بملف المراجعة.'
        });
    };

    const handleCreateLoan = (empId: string, amount: number, installment: number) => {
        if (amount <= 0 || installment <= 0) return;
        setEmployees(prev => prev.map(emp => {
            if (emp.id === empId) {
                const updatedLoans = [
                    ...(emp.loans || []),
                    {
                        id: `ln-${Date.now()}`,
                        principalAmount: amount,
                        monthlyInstallment: installment,
                        balanceAmount: amount,
                        issueDate: new Date().toISOString().split('T')[0],
                        maturityDate: new Date(new Date().setMonth(new Date().getMonth() + Math.ceil(amount / installment))).toISOString().split('T')[0],
                        status: 'Active' as const,
                        payments: []
                    }
                ];
                // Push to timeline too
                const updatedTL = [
                    {
                        id: `tl-${Date.now()}`,
                        date: new Date().toISOString().split('T')[0],
                        category: 'Loan' as const,
                        titleAr: 'صرف سلفة مالية عاجلة',
                        titleEn: 'Approved Emergency Loan',
                        descriptionAr: `تقديم طلب سلفة برأس مال ${amount} د.ك بقسط يعادل ${installment} شهرياَ.`,
                        descriptionEn: `Approved loan advance of ${amount} KWD`,
                        performedBy: 'الإدارة المالية'
                    },
                    ...(emp.historyTimeline || [])
                ];
                return { ...emp, loans: updatedLoans, historyTimeline: updatedTL };
            }
            return emp;
        }));
        addToast({
            type: 'success',
            title: 'محرك القروض المباشر',
            message: `تم اعتماد سلفة جديدة بقيمة ${amount} د.ك وخصم الاستقطاعات.`
        });
    };

    const handleUpdateLeaveStatus = (empId: string, requestId: string, newStatus: 'Approved' | 'Rejected') => {
        setEmployees(prev => prev.map(emp => {
            if (emp.id === empId) {
                const updatedRequests = emp.leaveRequests?.map(req => {
                    if (req.id === requestId) {
                        return { 
                            ...req, 
                            status: newStatus,
                            approvals: newStatus === 'Approved' ? [{ role: 'إدارة HR', name: 'سارة خالد العتيبي', date: new Date().toISOString().split('T')[0] }] : []
                        };
                    }
                    return req;
                }) || [];

                // Timeline logger
                const targetedRequest = emp.leaveRequests?.find(r => r.id === requestId);
                const updatedTL = [
                    {
                        id: `tl-${Date.now()}`,
                        date: new Date().toISOString().split('T')[0],
                        category: 'Leave' as const,
                        titleAr: `تحديث طلب الإجازة (${newStatus === 'Approved' ? 'اعتماد' : 'رفض'})`,
                        titleEn: `Leave Request: ${newStatus}`,
                        descriptionAr: `تم تحديث حالة طلب الإجازة المقدمة بمدى ${targetedRequest?.days} يوم للقرار الإداري.`,
                        descriptionEn: `Leave request status updated by HR specialist.`,
                        performedBy: 'سارة خالد (HR)'
                    },
                    ...(emp.historyTimeline || [])
                ];

                return { ...emp, leaveRequests: updatedRequests, historyTimeline: updatedTL };
            }
            return emp;
        }));
        
        addToast({
            type: newStatus === 'Approved' ? 'success' : 'warning',
            title: 'إدارة الإجازات',
            message: `تم تعديل حالة الإجازة إلى: ${newStatus === 'Approved' ? 'معتمد ومصدق بوزارة العمل' : 'مرفوض إدارياً'}.`
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            {/* Main Flex Panel */}
            <div className="flex flex-col lg:flex-row min-h-screen">
                
                {/* Modules Sidebar Wrapper */}
                <aside className="w-full lg:w-76 bg-white dark:bg-slate-900 border-b lg:border-b-0 lg:border-l border-slate-100 dark:border-slate-800 p-6 shrink-0 z-10 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="bg-indigo-600 dark:bg-indigo-500 p-2.5 rounded-2xl shadow-lg shadow-indigo-600/15">
                                <UsersIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-md font-black text-slate-800 dark:text-white leading-tight">شؤون الموظفين</h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">سجلات الموظفين الموحدة</p>
                            </div>
                        </div>

                        <nav className="space-y-1">
                            <button onClick={() => { setSelectedEmployee(null); setViewMode('dashboard'); }} className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${viewMode === 'dashboard' && !selectedEmployee ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-black' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold'}`}>
                                <div className="flex items-center gap-3">
                                    <ChartBarIcon className="w-5 h-5 opacity-70" />
                                    <span className="text-xs">لوحة العمل والامتثال</span>
                                </div>
                            </button>
                            <button onClick={() => { setSelectedEmployee(null); setViewMode('grid'); }} className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${(viewMode === 'grid' || viewMode === 'table') && !selectedEmployee ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-black' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold'}`}>
                                <div className="flex items-center gap-3">
                                    <UsersIcon className="w-5 h-5 opacity-70" />
                                    <span className="text-xs">دليل ملفات الموظفين</span>
                                </div>
                                <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-black font-mono">{employees.length}</span>
                            </button>
                        </nav>

                        {/* Smart Alerts Section Inside Sidebar */}
                        <div className="mt-8">
                            <div className="flex items-center justify-between px-3 mb-3">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                                    تنبيهات استباقية مهمة
                                </span>
                                <span className="text-[9px] font-black font-mono text-rose-500">{globalAlerts.length}</span>
                            </div>
                            
                            <div className="space-y-2 max-h-56 overflow-y-auto scrollbar-none">
                                {globalAlerts.length === 0 ? (
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-center text-[10px] font-medium text-slate-400">
                                        جميع أذونات الإقامة والبطاقات المدنية سارية المفعول
                                    </div>
                                ) : (
                                    globalAlerts.map(al => (
                                        <div key={al.id} className={`p-3 rounded-2xl border transition-all text-xs text-right cursor-pointer ${al.type === 'critical' ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/35 text-rose-700 dark:text-rose-400' : al.type === 'warning' ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/35 text-amber-700 dark:text-amber-400' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
                                             onClick={() => {
                                                 const found = employees.find(e => e.id === al.empId);
                                                 if (found) {
                                                     setSelectedEmployee(found);
                                                     setActiveDetailTab('alerts');
                                                 }
                                             }}
                                        >
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <ExclamationTriangleIcon className="w-3.5 h-3.5 inline text-current shrink-0" />
                                                <span className="font-black text-[10px] truncate">{al.empName}</span>
                                            </div>
                                            <p className="text-[10px] leading-relaxed scale-95 origin-right opacity-90">{al.text}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 pt-6 mt-6">
                        <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-3xl text-right">
                            <span className="text-[9px] font-black text-indigo-500 block mb-1">منظومة القلعة المتكاملة</span>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">قوانين العمل مستوفاة بالكامل وفق المادة 41 / 44 من قانون العمل الكويتي.</p>
                        </div>
                    </div>
                </aside>

                {/* Vertical Workspace Portal */}
                <main className="flex-1 min-w-0 flex flex-col pt-0">
                    
                    {/* Header Controls */}
                    <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-20 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5">
                                <Link to="/employee-affairs" className="hover:text-indigo-600 transition-colors">شؤون الموظفين</Link>
                                <span>/</span>
                                <span className="text-slate-600 dark:text-slate-300 font-bold">ملفات السجل الرسمي</span>
                            </div>
                            <h1 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                                {selectedEmployee ? `الملف المهني: ${selectedEmployee.fullNameAr}` : 'إدارة الكوادر والموظفين'}
                                {selectedEmployee && (
                                    <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-2 py-0.5 rounded-full dark:bg-indigo-950 dark:text-indigo-300">
                                        {selectedEmployee.employeeId}
                                    </span>
                                )}
                            </h1>
                        </div>

                        {/* Top Action Layout */}
                        <div className="flex items-center gap-2 self-start md:self-auto">
                            {selectedEmployee ? (
                                <Button variant="outline" className="rounded-2xl border-slate-200 text-xs font-black dark:border-slate-700" leftIcon={<ArrowRightIcon className="w-4 h-4" />} onClick={() => setSelectedEmployee(null)}>
                                    العودة لملفات الدليل
                                </Button>
                            ) : (
                                <>
                                    <Button variant="outline" className="rounded-2xl border-slate-200 text-xs font-black dark:border-slate-700" leftIcon={<CloudArrowUpIcon className="w-4 h-4" />} onClick={() => handleOpenForm()}>
                                        تسجيل موظف جديد
                                    </Button>
                                    <Button className="rounded-2xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-indigo-600 dark:hover:bg-indigo-500 text-xs font-black" leftIcon={<PlusCircleIcon className="w-4.5 h-4.5" />} onClick={() => {
                                        setEmployees(prev => [...prev, ...initialExtendedEmployees.map(e => ({
                                            ...e,
                                            id: `emp-new-${Math.random()}`,
                                            employeeId: `EMP-${Math.floor(Math.random() * 8999 + 1000)}`,
                                            fullNameAr: `${e.fullNameAr} (مستورد من السيرفر)`,
                                            civilId: `28${Math.floor(Math.random() * 10000000000)}`
                                        }))]);
                                        addToast({
                                            type: 'success',
                                            title: 'استيراد السجلات',
                                            message: 'تم استيراد قائمة السيرفر التوضيحية.'
                                        });
                                    }}>
                                        استيراد عينة البيانات
                                    </Button>
                                </>
                            )}
                        </div>
                    </header>

                    {/* Central Workspace Panel */}
                    <div className="p-6 md:p-8 flex-1">
                        {selectedEmployee ? (
                            
                            // ==========================================
                            // PREMIUM FULL PROFILE INTEGRATIVE HUB
                            // ==========================================
                            <div className="space-y-6">
                                
                                {/* Hero Widget Card */}
                                <div className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 text-white rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.15),transparent_60%)]"></div>
                                    
                                    <div className="relative flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
                                        <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-right">
                                            <div className="relative group">
                                                <img 
                                                    src={selectedEmployee.photoUrl || `https://ui-avatars.com/api/?name=${selectedEmployee.fullNameAr}&background=random`} 
                                                    className="w-32 h-32 rounded-[2rem] object-cover border-4 border-white/20 shadow-2xl group-hover:scale-105 transition-transform"
                                                    alt={selectedEmployee.fullNameAr}
                                                />
                                                <div className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full border-4 border-indigo-950 bg-emerald-500"></div>
                                            </div>
                                            <div>
                                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                                                    <h3 className="text-2xl font-black">{selectedEmployee.fullNameAr}</h3>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase ${selectedEmployee.status === 'Active' ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30' : 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30'}`}>
                                                        {selectedEmployee.status === 'Active' ? 'مباشر العمل' : 'إجازة / تجربة'}
                                                    </span>
                                                </div>
                                                <p className="text-indigo-200 text-sm font-bold mb-4">{selectedEmployee.jobTitle} • {selectedEmployee.department}</p>
                                                
                                                <div className="flex flex-wrap justify-center md:justify-start gap-2.5 text-xs">
                                                    <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/5 flex items-center gap-1.5">
                                                        <IdentificationIcon className="w-4 h-4 text-indigo-300" />
                                                        <span>مدني: {selectedEmployee.civilId}</span>
                                                    </div>
                                                    <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/5 flex items-center gap-1.5">
                                                        <CalendarDaysIcon className="w-4 h-4 text-indigo-300" />
                                                        <span>التوظيف: {selectedEmployee.joiningDate}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 shrink-0 md:self-center">
                                            <Button variant="outline" className="h-10 text-xs border-white/20 text-white hover:bg-white/10 rounded-xl" leftIcon={<PrinterIcon className="w-4.5" />} onClick={() => handleOpenPrintDoc('id', selectedEmployee)}>
                                                بطاقة إرشادية
                                            </Button>
                                            <Button variant="secondary" className="h-10 text-xs bg-white text-indigo-950 hover:bg-slate-100 rounded-xl font-bold" leftIcon={<PencilIcon className="w-4.5" />} onClick={() => handleOpenForm(selectedEmployee)}>
                                                تعديل السيرة
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Custom Responsive Tabs Panels */}
                                <div className="flex gap-1.5 overflow-x-auto py-2.5 px-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl scrollbar-none shadow-sm">
                                    {[
                                        { id: 'overview', icon: <UserCircleIcon />, title: 'نظرة عامة' },
                                        { id: 'employment', icon: <BriefcaseIcon />, title: 'قيد التوظيف العمالي' },
                                        { id: 'payroll', icon: <BanknotesIcon />, title: 'بوابة الرواتب' },
                                        { id: 'attendance', icon: <CalendarDaysIcon />, title: 'الحضور والإجازات' },
                                        { id: 'disciplinary', icon: <ShieldExclamationIcon />, title: 'التحقيقات الإدارية' },
                                        { id: 'loans', icon: <CreditCardIcon />, title: 'السلف والقروض' },
                                        { id: 'docs', icon: <FolderIcon />, title: 'أرشيف الوثائق' },
                                        { id: 'evaluations', icon: <AcademicCapIcon />, title: 'التقييمات ربع السنوية' }
                                    ].map(tab => (
                                        <button 
                                            key={tab.id}
                                            onClick={() => setActiveDetailTab(tab.id)}
                                            className={`px-4 py-2.5 rounded-xl text-xs font-black shrink-0 transition-all flex items-center gap-2 ${activeDetailTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                        >
                                            <span className={activeDetailTab === tab.id ? 'text-white' : 'text-slate-400'}>{tab.icon}</span>
                                            {tab.title}
                                        </button>
                                    ))}
                                </div>

                                {/* Render Selected Tab Modules */}
                                <div className="mt-4 transition-all animate-in fade-in duration-300">
                                    
                                    {/* 1. Overview Tab */}
                                    {activeDetailTab === 'overview' && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            
                                            {/* Left Card Area */}
                                            <Card className="md:col-span-2 shadow-sm border-slate-100 bg-white">
                                                <div className="flex items-center gap-2 mb-6 border-b pb-4">
                                                    <InformationCircleIcon className="w-5 h-5 text-indigo-600" />
                                                    <h4 className="text-sm font-black text-slate-800 dark:text-white">ملخص المسار والمؤهلات</h4>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-right">
                                                    <div>
                                                        <span className="text-[10px] text-slate-400 font-extrabold uppercase">الحالة الاجتماعية</span>
                                                        <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">{selectedEmployee.socialStatus === 'Married' ? 'متزوج' : 'أعزب'}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] text-slate-400 font-extrabold">المسؤول الإداري</span>
                                                        <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">{selectedEmployee.managerName || 'أحمد محمود العبدالله'}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] text-slate-400 font-extrabold">الدرجة الوظيفية</span>
                                                        <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 font-mono">{selectedEmployee.jobGrade || 'A'}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] text-slate-400 font-extrabold">رقم جواز السفر</span>
                                                        <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 font-mono">{selectedEmployee.passportNumber || 'N/A'}</p>
                                                    </div>
                                                    <div className="sm:col-span-2 border-t pt-4">
                                                        <span className="text-[10px] text-slate-400 font-extrabold">العنوان التفصيلي (المدينة / السكن)</span>
                                                        <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 mt-1">{selectedEmployee.address || 'الكويت، مبارك الكبير، قطعة 2'}</p>
                                                    </div>
                                                </div>
                                            </Card>

                                            {/* Right Timeline Logs Grid */}
                                            <Card className="shadow-sm border-slate-100 bg-white flex flex-col justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-4 border-b pb-3">
                                                        <HistoryIcon className="w-5 h-5 text-indigo-600" />
                                                        <h4 className="text-slate-800 dark:text-white text-xs font-extrabold">النشاط والتسلسل الزمني</h4>
                                                    </div>
                                                    <div className="relative border-r pr-4 space-y-4">
                                                        {(selectedEmployee.historyTimeline || []).slice(0, 3).map(tl => (
                                                            <div key={tl.id} className="relative text-xs">
                                                                <div className="absolute -right-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-600 border border-white"></div>
                                                                <p className="text-[9px] text-slate-400 font-mono">{tl.date}</p>
                                                                <p className="font-extrabold text-slate-800 dark:text-slate-200">{tl.titleAr}</p>
                                                                <p className="text-[10px] text-slate-500 scale-95 origin-right">{tl.descriptionAr}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                
                                                <div className="mt-4 pt-3 border-t">
                                                    <h5 className="text-[10px] font-black text-indigo-500 mb-2">إضافة تعليق سري وملحوظة</h5>
                                                    <div className="flex gap-2">
                                                        <input 
                                                            id="overviewNoteInputField"
                                                            type="text" 
                                                            placeholder="اكتب تعليقاً..."
                                                            className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs px-3 h-10"
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    const val = (e.target as HTMLInputElement).value;
                                                                    handleAddNote(selectedEmployee.id, 'مشرف الموارد البشرية', val);
                                                                    (e.target as HTMLInputElement).value = '';
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </Card>
                                        </div>
                                    )}

                                    {/* 2. Employment Tab */}
                                    {activeDetailTab === 'employment' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
                                            <Card className="shadow-sm border-slate-100 p-6 bg-white space-y-4">
                                                <h5 className="text-sm font-black text-slate-800 dark:text-white flex items-center justify-between">
                                                    <span>وزارة الشؤون الاجتماعية وصلاحية التسجيلات</span>
                                                    <BriefcaseIcon className="w-4 h-4 text-indigo-500" />
                                                </h5>
                                                
                                                <div className="space-y-3.5 divide-y divide-slate-50 dark:divide-slate-800">
                                                    <div className="flex justify-between items-center py-2.5">
                                                        <span className="text-xs text-slate-500">بداية العقد المصدق</span>
                                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{selectedEmployee.contractStartDate || selectedEmployee.joiningDate}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center py-2.5">
                                                        <span className="text-xs text-slate-500">نهاية العقد المصدق</span>
                                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{selectedEmployee.contractEndDate || 'عقد غير محدد المدة'}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center py-2.5">
                                                        <span className="text-xs text-slate-500">رقم رخصة العمل بالقطاع الأهلي</span>
                                                        <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">KWT-88009922</span>
                                                    </div>
                                                    <div className="flex justify-between items-center py-2.5">
                                                        <span className="text-xs text-slate-500">رقم التأمينات الاجتماعية</span>
                                                        <span className="text-xs font-bold font-mono text-slate-850 dark:text-slate-250">{selectedEmployee.socialSecurityNumber || 'غير مسجل'}</span>
                                                    </div>
                                                </div>

                                                <button onClick={() => handleOpenPrintDoc('contract', selectedEmployee)} className="w-full h-11 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl text-xs font-black transition-all">
                                                    صياغة كشف نموذج عقد عمل رسمي معتمد
                                                </button>
                                            </Card>

                                            <Card className="shadow-sm border-slate-100 p-6 bg-white space-y-4">
                                                <h5 className="text-sm font-black text-slate-800 dark:text-white flex items-center justify-between">
                                                    <span>مواصفات الدوام وساعات الدوام</span>
                                                    <ClockIcon className="w-4.5 h-4.5 text-indigo-500" />
                                                </h5>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl">
                                                        <span className="text-[10px] text-slate-400 block mb-1">نظام الدوام الفعلي</span>
                                                        <p className="text-xs font-black text-slate-800 dark:text-white">{selectedEmployee.workSystem || 'دوام كامل مرن الكتروني'}</p>
                                                    </div>
                                                    <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl">
                                                        <span className="text-[10px] text-slate-400 block mb-1">ساعات العمل القياسية</span>
                                                        <p className="text-xs font-black text-slate-800 dark:text-white">{selectedEmployee.workHoursPerDay || 8} ساعات يومياً</p>
                                                    </div>
                                                    <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl col-span-2">
                                                        <span className="text-[10px] text-slate-400 block mb-1">أيام الراحة الأسبوعية المعتمدة</span>
                                                        <p className="text-xs font-black text-slate-800 dark:text-white">{(selectedEmployee.restDays || ['الجمعة', 'السبت']).join(' - ')}</p>
                                                    </div>
                                                </div>
                                            </Card>
                                        </div>
                                    )}

                                    {/* 3. Payroll Tab */}
                                    {activeDetailTab === 'payroll' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
                                            <Card className="shadow-sm border-slate-100 p-6 bg-white">
                                                <div className="flex items-center justify-between border-b pb-4 mb-4">
                                                    <h5 className="text-sm font-black text-slate-800 dark:text-white">تفاصيل الراتب والبدلات المتراكمة</h5>
                                                    <BanknotesIcon className="w-5 h-5 text-indigo-500" />
                                                </div>

                                                <div className="space-y-3 mb-6">
                                                    <div className="flex justify-between items-center p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                                                        <span className="text-xs text-slate-500">الراتب الأساسي</span>
                                                        <span className="text-sm font-black text-slate-850 dark:text-slate-200">{selectedEmployee.basicSalary.toLocaleString()} د.ك</span>
                                                    </div>
                                                    {selectedEmployee.allowances?.map((allow, index) => (
                                                        <div key={index} className="flex justify-between items-center px-4 py-2 border-b border-dashed">
                                                            <span className="text-xs text-slate-500">{allow.name}</span>
                                                            <span className="text-xs font-extrabold text-emerald-600">+{allow.value} د.ك</span>
                                                        </div>
                                                    ))}
                                                    <div className="flex justify-between items-center py-2.5 px-4 font-black text-sm text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/45 rounded-xl">
                                                        <span>إجمالي المستحقات (Gross Breakdown)</span>
                                                        <span>{(selectedEmployee.basicSalary + (selectedEmployee.allowances?.reduce((s, a) => s + a.value, 0) || 0)).toLocaleString()} د.ك</span>
                                                    </div>
                                                </div>

                                                <button onClick={() => handleOpenPrintDoc('payslip', selectedEmployee)} className="w-full h-11 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-lg shadow-slate-900/10">
                                                    بناء وطباعة قسيمة راتب مصدقة
                                                </button>
                                            </Card>

                                            <Card className="shadow-sm border-slate-100 p-6 bg-white space-y-4">
                                                <h5 className="text-sm font-black text-slate-800 dark:text-white">الربط المصرفي واستحقاق الهيئة</h5>
                                                <div className="space-y-3.5">
                                                    <div className="p-3 bg-slate-50 dark:bg-slate-850/50 rounded-xl">
                                                        <span className="text-[10px] text-slate-400 block mb-1">اسم البنك المعتمد</span>
                                                        <p className="text-xs font-black text-slate-800 dark:text-white">{selectedEmployee.bankName || 'بنك الكويت الوطني (NBK)'}</p>
                                                    </div>
                                                    <div className="p-3 bg-slate-50 dark:bg-slate-850/50 rounded-xl">
                                                        <span className="text-[10px] text-slate-400 block mb-1">حساب ورقم الآيبان (IBAN)</span>
                                                        <p className="text-xs font-bold font-mono text-slate-800 dark:text-white">{selectedEmployee.bankIban || 'KW65NBOK'}</p>
                                                    </div>
                                                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 rounded-xl text-xs flex items-center gap-2">
                                                        <CheckCircleIcon className="w-4.5 h-4.5 shrink-0" />
                                                        <p className="font-extrabold">الموظف يتم تحويل مستحقاته الكترونياً وفق متطلبات نظام الهيئة العامة للقوى العاملة.</p>
                                                    </div>
                                                </div>
                                            </Card>
                                        </div>
                                    )}

                                    {/* 4. Attendance & Leaves Tab */}
                                    {activeDetailTab === 'attendance' && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-right">
                                            
                                            <Card className="shadow-sm border-slate-100 bg-white p-5 text-center flex flex-col justify-between">
                                                <div>
                                                    <h5 className="text-xs font-black text-slate-400 uppercase mb-3">رصيد الإجازات السنوية المتبقي</h5>
                                                    <p className="text-4xl font-black text-indigo-600 dark:text-indigo-400">22</p>
                                                    <p className="text-xs font-extrabold text-slate-500 dark:text-slate-400 mt-2">يوم متاح للاستعمال العادي</p>
                                                </div>
                                                <div className="mt-4 pt-3 border-t grid grid-cols-2 gap-2 text-right text-xs">
                                                    <div>
                                                        <span className="text-[9px] text-slate-400">الإجازة المستنفذة</span>
                                                        <p className="font-extrabold text-slate-800 dark:text-white">8 أيام</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[9px] text-slate-400">الإجازة المعلقة</span>
                                                        <p className="font-extrabold text-slate-850 dark:text-white">1 يوم</p>
                                                    </div>
                                                </div>
                                            </Card>

                                            <Card className="md:col-span-2 shadow-sm border-slate-100 bg-white p-5 space-y-4">
                                                <h5 className="text-sm font-black text-slate-800 dark:text-white">طلبات الإجازات النشطة والمعلقة بالملف</h5>
                                                
                                                <div className="space-y-3">
                                                    {selectedEmployee.leaveRequests?.length === 0 ? (
                                                        <p className="text-xs font-extrabold text-slate-400 py-6 text-center">لا يوجد طلبات إجازة نشطة حالياً.</p>
                                                    ) : (
                                                        selectedEmployee.leaveRequests?.map(req => (
                                                            <div key={req.id} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                                                <div>
                                                                    <p className="text-xs font-black text-slate-800 dark:text-white">{req.type} ({req.days} يوم)</p>
                                                                    <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{req.startDate} حتى {req.endDate}</p>
                                                                    <p className="text-[10px] text-slate-500 mt-1 italic">السبب: {req.reason}</p>
                                                                </div>
                                                                <div className="flex items-center gap-2 self-end sm:self-auto">
                                                                    {req.status === 'Pending' ? (
                                                                        <>
                                                                            <button onClick={() => handleUpdateLeaveStatus(selectedEmployee.id, req.id, 'Approved')} className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl px-3 py-1.5 text-xs font-black transition-all">
                                                                                اعتماد الطلب
                                                                            </button>
                                                                            <button onClick={() => handleUpdateLeaveStatus(selectedEmployee.id, req.id, 'Rejected')} className="bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl px-3 py-1.5 text-xs font-black transition-all">
                                                                                رفض
                                                                            </button>
                                                                        </>
                                                                    ) : (
                                                                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black ${req.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                                            {req.status === 'Approved' ? 'معتمد ومثبت' : 'مرفوض'}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </Card>

                                        </div>
                                    )}

                                    {/* 5. Invesigations Tab */}
                                    {activeDetailTab === 'disciplinary' && (
                                        <div className="space-y-6 text-right">
                                            <Card className="shadow-sm border-slate-100 bg-white p-5 space-y-4">
                                                <div className="flex items-center justify-between border-b pb-4">
                                                    <h5 className="text-sm font-black text-slate-800 dark:text-white">جدول التحقيقات والقرارات الإدارية</h5>
                                                    <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
                                                </div>

                                                <div className="space-y-3.5">
                                                    {(!selectedEmployee.investigations || selectedEmployee.investigations.length === 0) ? (
                                                        <p className="text-xs text-slate-400 text-center py-8">السجل القانوني والتحقيق الإداري للموظف خال من المخالفات النشطة.</p>
                                                    ) : (
                                                        selectedEmployee.investigations.map(inv => (
                                                            <div key={inv.id} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border-r-4 border-r-indigo-600 space-y-2">
                                                                <div className="flex items-center justify-between">
                                                                    <p className="text-xs font-black text-slate-800 dark:text-white">رقم ملف التحقيق: {inv.caseNumber}</p>
                                                                    <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg font-mono font-bold">{inv.date}</span>
                                                                </div>
                                                                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">موضوع الاتهام: {inv.subject}</p>
                                                                <p className="text-[11px] text-slate-500 leading-relaxed">النتائج الفنية: {inv.results}</p>
                                                                <div className="flex justify-between items-center pt-2 border-t text-[10px] font-bold">
                                                                    <span className="text-indigo-600">المحقق: {inv.investigator}</span>
                                                                    <span className="text-slate-500">العقوبة المقترحة: {inv.penaltyProposed}</span>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </Card>

                                            <Card className="shadow-sm border-slate-100 bg-white p-5 space-y-4">
                                                <h5 className="text-sm font-black text-slate-800 dark:text-white">إنذارات كتابية ملحقة مباشرة</h5>
                                                {(!selectedEmployee.disciplinaryActions || selectedEmployee.disciplinaryActions.length === 0) ? (
                                                    <p className="text-xs text-slate-400 text-center py-6">لم يتم توجيه إنذارات رسمية.</p>
                                                ) : (
                                                    selectedEmployee.disciplinaryActions.map(disc => (
                                                        <div key={disc.id} className="p-4 bg-amber-50/40 dark:bg-amber-950/15 border border-amber-100 dark:border-amber-900/35 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                                            <div>
                                                                <p className="text-xs font-black text-amber-900 dark:text-amber-400">{disc.violationType}</p>
                                                                <p className="text-[10px] text-slate-500 mt-0.5">{disc.violationDetails}</p>
                                                                <p className="text-xs text-rose-600 dark:text-rose-450 font-black mt-2">الجزاء: {disc.penalty}</p>
                                                            </div>
                                                            <button onClick={() => handleOpenPrintDoc('warning', selectedEmployee)} className="h-10 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black px-4 whitespace-nowrap self-end sm:self-auto transition-all shadow-md shadow-amber-600/10">
                                                                توليد إنذار كتابي رسمي
                                                            </button>
                                                        </div>
                                                    ))
                                                )}
                                            </Card>
                                        </div>
                                    )}

                                    {/* 6. Loans Tab */}
                                    {activeDetailTab === 'loans' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
                                            
                                            <Card className="shadow-sm border-slate-100 bg-white p-6 space-y-4">
                                                <h5 className="text-sm font-black text-slate-800 dark:text-white">تقديم سلفة مالية إدارية عاجلة</h5>
                                                
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="text-[10px] font-black text-slate-400 block mb-1">قيمة السلفة التقديرية (دينار كويتي)</label>
                                                        <input 
                                                            id="loanAmtInputField"
                                                            type="number" 
                                                            placeholder="مثال: 1500" 
                                                            className="w-full bg-slate-50 border-none rounded-xl text-xs h-11 px-4 text-right font-black"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-black text-slate-400 block mb-1">قيمة القسط الشهري الثابت</label>
                                                        <input 
                                                            id="loanInstInputField"
                                                            type="number" 
                                                            placeholder="مثال: 150" 
                                                            className="w-full bg-slate-50 border-none rounded-xl text-xs h-11 px-4 text-right font-black"
                                                        />
                                                    </div>
                                                    
                                                    <button 
                                                        onClick={() => {
                                                            const amt = parseFloat((document.getElementById('loanAmtInputField') as HTMLInputElement).value || '0');
                                                            const inst = parseFloat((document.getElementById('loanInstInputField') as HTMLInputElement).value || '0');
                                                            handleCreateLoan(selectedEmployee.id, amt, inst);
                                                            (document.getElementById('loanAmtInputField') as HTMLInputElement).value = '';
                                                            (document.getElementById('loanInstInputField') as HTMLInputElement).value = '';
                                                        }}
                                                        className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-600/15 transition-all"
                                                    >
                                                        بناء وإصدار الاستقطاع المالي
                                                    </button>
                                                </div>
                                            </Card>

                                            <Card className="shadow-sm border-slate-100 bg-white p-6 space-y-4">
                                                <h5 className="text-sm font-black text-slate-800 dark:text-white">سجل السلف النشطة بالملف المالي</h5>
                                                
                                                <div className="space-y-3.5">
                                                    {(!selectedEmployee.loans || selectedEmployee.loans.length === 0) ? (
                                                        <p className="text-xs text-slate-400 text-center py-10">لا توجد سلف أو استقطاعات مالية سارية.</p>
                                                    ) : (
                                                        selectedEmployee.loans.map(ln => (
                                                            <div key={ln.id} className="p-4 bg-indigo-50/40 dark:bg-indigo-950/15 border border-indigo-100 rounded-2xl relative">
                                                                <div className="flex items-center justify-between">
                                                                    <p className="text-xs font-black text-slate-800 dark:text-white">السلفة المتبقية: {ln.balanceAmount} د.ك</p>
                                                                    <span className="text-[9px] bg-indigo-600 text-white px-2 py-0.5 rounded-lg">{ln.status === 'Active' ? 'نشط' : 'مسجل'}</span>
                                                                </div>
                                                                <p className="text-[10px] text-slate-500 mt-1 font-mono">القسط الشهري: {ln.monthlyInstallment} د.ك • الاستحقاق: {ln.maturityDate}</p>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </Card>

                                        </div>
                                    )}

                                    {/* 7. Documents Archive Tab */}
                                    {activeDetailTab === 'docs' && (
                                        <div className="space-y-6 text-right animate-in fade-in duration-300">
                                            <Card className="shadow-sm border-slate-100 bg-white p-6 space-y-4">
                                                <div className="flex items-center justify-between border-b pb-4">
                                                    <div>
                                                        <h5 className="text-sm font-black text-slate-800 dark:text-white">ملفات الأرشيف الرقمي المصدقة</h5>
                                                        <p className="text-[10px] text-slate-400">تحقق ومعاينة المستندات المطلوبة من وزارة العمل</p>
                                                    </div>
                                                    <Button variant="outline" size="sm" className="rounded-xl border-slate-200" leftIcon={<CloudArrowUpIcon className="w-4 h-4" />}>
                                                        رفع وثيقة جديدة
                                                    </Button>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {[
                                                        { filename: 'civil_id.png', label: 'صورة البطاقة المدنية الملونة', size: '2.4 MB', type: 'البطاقة المدنية' },
                                                        { filename: 'passport.jpg', label: 'صفحة جواز السفر الرئيسية', size: '3.1 MB', type: 'جواز السفر' },
                                                        { filename: 'degree.pdf', label: 'الشهادة الجامعية المصدقة', size: '4.7 MB', type: 'معادلة شهادة' },
                                                        { filename: 'salary_details.pdf', label: 'تفاصيل عقد العمل المصدق', size: '1.2 MB', type: 'عقد العمل' }
                                                    ].map((doc, i) => (
                                                        <div key={i} className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-start justify-between">
                                                            <div>
                                                                <p className="text-xs font-black text-slate-800 dark:text-white truncate max-w-40">{doc.label}</p>
                                                                <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{doc.filename} • {doc.size}</span>
                                                            </div>
                                                            <div className="flex gap-1 shrink-0">
                                                                <button onClick={() => handlePreviewDocument(doc.filename, doc.type)} className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center">
                                                                    <EyeIcon className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </Card>
                                        </div>
                                    )}

                                    {/* 8. Evaluations Tab */}
                                    {activeDetailTab === 'evaluations' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right animate-in fade-in duration-300">
                                            
                                            <Card className="shadow-sm border-slate-100 bg-white p-6 space-y-4">
                                                <h5 className="text-sm font-black text-slate-800 dark:text-white">سجل التقييمات والأداء السنوي</h5>
                                                
                                                <div className="space-y-4">
                                                    {(!selectedEmployee.evaluations || selectedEmployee.evaluations.length === 0) ? (
                                                        <p className="text-xs text-slate-400 text-center py-10">لا يوجد تقييمات مسجلة.</p>
                                                    ) : (
                                                        selectedEmployee.evaluations.map(ev => (
                                                            <div key={ev.id} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-100 dark:border-slate-805 space-y-2">
                                                                <div className="flex items-center justify-between">
                                                                    <p className="text-xs font-black text-indigo-600 dark:text-indigo-400">{ev.period}</p>
                                                                    <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2.5 py-0.5 rounded-full font-black font-mono">{ev.overallScore}%</span>
                                                                </div>
                                                                <p className="text-xs text-slate-705 dark:text-slate-300 font-bold leading-relaxed">"{ev.qualitativeFeedback}"</p>
                                                                <p className="text-[10px] text-slate-400 mt-2">المقيم المعتمد: {ev.evaluatorName}</p>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </Card>

                                            <Card className="shadow-sm border-slate-100 bg-white p-6 space-y-4">
                                                <h4 className="text-xs font-black text-indigo-500 uppercase tracking-widest">معايير أداء التقييم المفصلة</h4>
                                                
                                                <div className="space-y-4 pt-2">
                                                    {[
                                                        { label: 'الالتزام التشريعي والعملي', score: selectedEmployee.evaluations?.[0]?.criteriaScores.adherenceToLaw || 4.5 },
                                                        { label: 'جودة صياغة الاستشارات والمذكرات', score: selectedEmployee.evaluations?.[0]?.criteriaScores.qualityOfWork || 4.3 },
                                                        { label: 'العمل الجماعي ودبلوماسية الفريق', score: selectedEmployee.evaluations?.[0]?.criteriaScores.teamwork || 4.1 },
                                                        { label: 'السرعة والاستجابة للمهام العاجلة', score: selectedEmployee.evaluations?.[0]?.criteriaScores.speed || 3.9 }
                                                    ].map((item, index) => (
                                                        <div key={index} className="space-y-1">
                                                            <div className="flex justify-between items-center text-xs">
                                                                <span className="font-extrabold text-slate-700 dark:text-slate-300">{item.label}</span>
                                                                <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">{item.score}/5</span>
                                                            </div>
                                                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                                                <div className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full" style={{ width: `${(item.score / 5) * 100}%` }}></div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </Card>

                                        </div>
                                    )}

                                </div>

                            </div>
                        ) : (
                            
                            // ==========================================
                            // FILES DIRECTORY STATE LIST / DASHBOARD
                            // ==========================================
                            <div className="space-y-6">
                                
                                {/* 1. Analytical HR Dashboard Layout */}
                                {viewMode === 'dashboard' && (
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                        
                                        <Card className="bg-indigo-600 dark:bg-indigo-500 text-white rounded-[2rem] p-6 shadow-xl flex flex-col justify-between">
                                            <div>
                                                <span className="bg-white/10 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">احصاء عام</span>
                                                <h3 className="text-4xl font-black mt-4 font-mono">{employees.length}</h3>
                                                <p className="text-indigo-100 text-xs mt-1">إجمالي الكوادر المسجلين بالملفات</p>
                                            </div>
                                            <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center text-[10px]">
                                                <span>الذكور: {employees.filter(e => e.gender === 'Male').length}</span>
                                                <span>الإناث: {employees.filter(e => e.gender === 'Female').length}</span>
                                            </div>
                                        </Card>

                                        <Card className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                                            <div>
                                                <span className="bg-slate-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 text-[10px] font-black px-2 py-0.5 rounded-full">الرواتب القياسية</span>
                                                <h3 className="text-3xl font-black mt-4 font-mono">{(employees.reduce((sum, e) => sum + e.basicSalary, 0) / employees.length).toFixed(0)} د.ك</h3>
                                                <p className="text-slate-400 text-xs mt-1">متوسط الرواتب الفردية الأساسية الكلية</p>
                                            </div>
                                            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-500">
                                                <span>مجموع ميزانية الرواتب</span>
                                                <span className="font-bold opacity-85">{(employees.reduce((sum, e) => sum + e.basicSalary, 0)).toLocaleString()} د.ك</span>
                                            </div>
                                        </Card>

                                        <Card className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                                            <div>
                                                <span className="bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-full">إجازات مستمرة</span>
                                                <h3 className="text-3xl font-black mt-4 font-mono">{employees.filter(e => e.status === 'OnLeave').length}</h3>
                                                <p className="text-slate-400 text-xs mt-1">الكوادر في إجازات رسمية حالياً</p>
                                            </div>
                                            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
                                                <span>على رأس العمل لليوم</span>
                                                <span className="font-bold text-emerald-600">{employees.filter(e => e.status === 'Active').length} موظف</span>
                                            </div>
                                        </Card>

                                        <Card className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                                            <div>
                                                <span className="bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 text-[10px] font-black px-2 py-0.5 rounded-full">الملفات التأديبية</span>
                                                <h3 className="text-3xl font-black mt-4 font-mono">{employees.reduce((sum, e) => sum + (e.disciplinaryActions?.length || 0), 0)}</h3>
                                                <p className="text-slate-400 text-xs mt-1">إنذارات وقرارات خصم الأداء الكلية</p>
                                            </div>
                                            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
                                                <span>مخالفات قيد التحقيق</span>
                                                <span className="font-bold text-rose-500">1 ملف</span>
                                            </div>
                                        </Card>

                                    </div>
                                )}

                                {/* Advanced Filters & Search Controllers */}
                                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-5 shadow-sm flex flex-col md:flex-row items-center gap-4 text-right">
                                    <div className="relative flex-1 w-full">
                                        <MagnifyingGlassIcon className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400`} />
                                        <input 
                                            type="text" 
                                            placeholder="ابحث تفصيلياً (الاسم، المسمى، الرقم المدني، رقم الهوية)..." 
                                            className={`w-full h-12 ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} rounded-2xl bg-slate-50 dark:bg-slate-850 border-none text-xs font-black text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20`}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex flex-wrap gap-2 w-full md:w-auto shrink-0 justify-end">
                                        <select 
                                            className="h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border-none text-xs font-black text-slate-700 dark:text-slate-300 pointer-events-auto"
                                            value={selectedDept}
                                            onChange={(e) => setSelectedDept(e.target.value)}
                                        >
                                            <option value="All">كافة الأقسام الرسمية</option>
                                            {DEPARTMENTS_LIST.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                                        </select>
                                        <select 
                                            className="h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border-none text-xs font-black text-slate-700 dark:text-slate-300 pointer-events-auto"
                                            value={selectedStatus}
                                            onChange={(e) => setSelectedStatus(e.target.value)}
                                        >
                                            <option value="All">جميع حالات الدوام</option>
                                            <option value="Active">على رأس العمل</option>
                                            <option value="OnLeave">في إجازة</option>
                                            <option value="Probation">تحت التجربة</option>
                                        </select>

                                        <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl">
                                            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-450 hover:text-indigo-500'}`}>
                                                <ViewColumnsIcon className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => setViewMode('table')} className={`p-2 rounded-xl transition-all ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-450 hover:text-indigo-500'}`}>
                                                <ListBulletIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Directory Elements */}
                                {viewMode === 'table' ? (
                                    
                                    // Table Display mode
                                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm overflow-hidden">
                                        <table className="w-full text-right divide-y divide-slate-100">
                                            <thead>
                                                <tr className="bg-slate-50/50 dark:bg-slate-850/50 text-[10px] font-black text-slate-450 uppercase tracking-widest border-b border-slate-100">
                                                    <th className="px-6 py-5">المستند التعريفي</th>
                                                    <th className="px-6 py-5">المنصب والدائرة</th>
                                                    <th className="px-6 py-5">الهوية والبيانات</th>
                                                    <th className="px-6 py-5">الرواتب المتراكمة</th>
                                                    <th className="px-6 py-5 text-center">العمليات</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {filteredEmployees.map(emp => (
                                                    <tr key={emp.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-850/20 cursor-pointer transition-colors" onClick={() => { setSelectedEmployee(emp); setActiveDetailTab('overview'); }}>
                                                        <td className="px-6 py-4.5">
                                                            <div className="flex items-center gap-4">
                                                                <img src={emp.photoUrl || `https://ui-avatars.com/api/?name=${emp.fullNameAr}&background=random`} className="w-11 h-11 rounded-2xl object-cover border border-slate-100" />
                                                                <div>
                                                                    <p className="font-extrabold text-slate-800 dark:text-white text-xs">{emp.fullNameAr}</p>
                                                                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{emp.employeeId}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4.5 text-xs text-slate-700 dark:text-slate-300">
                                                            <p className="font-extrabold">{emp.jobTitle}</p>
                                                            <p className="text-[10px] text-slate-400 font-black">{DEPARTMENTS_LIST.find(d => d.value === emp.department)?.label || emp.department}</p>
                                                        </td>
                                                        <td className="px-6 py-4.5 text-xs text-slate-600 dark:text-slate-450 font-mono">
                                                            <p className="font-extrabold">الرقم المدني: {emp.civilId}</p>
                                                            <p className="text-[10px] text-slate-400">تاريخ التعيين: {emp.joiningDate}</p>
                                                        </td>
                                                        <td className="px-6 py-4.5 font-mono text-xs font-black text-indigo-650">
                                                            {emp.basicSalary.toLocaleString()} د.ك
                                                        </td>
                                                        <td className="px-6 py-4.5" onClick={(e) => e.stopPropagation()}>
                                                            <div className="flex justify-center items-center gap-1.5">
                                                                <button onClick={() => { setSelectedEmployee(emp); setActiveDetailTab('overview'); }} className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center">
                                                                    <EyeIcon className="w-4.5 h-4.5" />
                                                                </button>
                                                                <button onClick={() => handleOpenForm(emp)} className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all flex items-center justify-center">
                                                                    <PencilIcon className="w-4.5 h-4.5" />
                                                                </button>
                                                                <button onClick={() => handleDuplicate(emp)} className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-all flex items-center justify-center">
                                                                    <DocumentDuplicateIcon className="w-4.5 h-4.5" />
                                                                </button>
                                                                <button onClick={() => handleDelete(emp.id, emp.fullNameAr)} className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all flex items-center justify-center">
                                                                    <TrashIcon className="w-4.5 h-4.5" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                ) : (
                                    
                                    // Interactive Grid View
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {filteredEmployees.map(emp => (
                                            <div 
                                                key={emp.id} 
                                                onClick={() => { setSelectedEmployee(emp); setActiveDetailTab('overview'); }}
                                                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group text-right flex flex-col justify-between h-80"
                                            >
                                                <div>
                                                    <div className="flex items-start justify-between mb-4">
                                                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${emp.status === 'Active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-amber-50 text-amber-600'}`}>
                                                            {emp.status === 'Active' ? 'نشط' : 'إجازة / تجربة'}
                                                        </span>
                                                        <img 
                                                            src={emp.photoUrl || `https://ui-avatars.com/api/?name=${emp.fullNameAr}&background=random`} 
                                                            className="w-16 h-16 rounded-[1.5rem] object-cover border-2 border-slate-100 group-hover:scale-105 transition-transform" 
                                                            alt={emp.fullNameAr}
                                                        />
                                                    </div>
                                                    
                                                    <h4 className="font-extrabold text-slate-850 dark:text-white text-md tracking-tight group-hover:text-indigo-600 transition-colors line-clamp-1">{emp.fullNameAr}</h4>
                                                    <p className="text-[10px] text-indigo-500 font-extrabold mt-0.5 uppercase tracking-wide truncate">{emp.jobTitle}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold mt-1">{DEPARTMENTS_LIST.find(d => d.value === emp.department)?.label || emp.department}</p>
                                                    
                                                    <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] bg-slate-50 dark:bg-slate-850 p-2.5 rounded-2xl">
                                                        <div>
                                                            <span className="text-slate-400 block pb-0.5">البطاقة المدنية</span>
                                                            <span className="font-bold text-slate-700 dark:text-slate-350">{emp.civilId}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-400 block pb-0.5">الراتب الأساسي</span>
                                                            <span className="font-bold text-indigo-650 dark:text-indigo-400 font-mono">{emp.basicSalary} د.ك</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 mt-4" onClick={e => e.stopPropagation()}>
                                                    <span className="text-[10.5px] text-slate-400 font-medium">الرمز: {emp.employeeId}</span>
                                                    <div className="flex gap-1">
                                                        <button onClick={() => { setSelectedEmployee(emp); setActiveDetailTab('overview'); }} className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 flex items-center justify-center transition-all">
                                                            <EyeIcon className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleOpenForm(emp)} className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-amber-600 flex items-center justify-center transition-all">
                                                            <PencilIcon className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleDelete(emp.id, emp.fullNameAr)} className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-all">
                                                            <TrashIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {filteredEmployees.length === 0 && (
                                    <div className="py-24 text-center">
                                        <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                                            <IdentificationIcon className="w-10 h-10 text-slate-350" />
                                        </div>
                                        <h4 className="text-md font-black text-slate-700 dark:text-slate-300">لم يتم العثور على ملف للموظفين</h4>
                                        <p className="text-xs text-slate-400 mt-1 pb-4">يرجى التأكد من الكلمات أو الفلاتر المدخلة والتحري</p>
                                    </div>
                                )}

                            </div>
                        )}
                    </div>

                </main>
            </div>

            {/* Modal: Comprehensive Registration Form */}
            <Modal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingEmployee ? `تعديل السيرة العمالية: ${formData.fullNameAr}` : 'إنشاء وتسجيل ملف موظف جديد'}
                size="lg"
            >
                <form onSubmit={handleFormSubmit} className="space-y-6 pt-1 text-right">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <Input label="الاسم الكامل الثنائي أو الثلاثي (بالعربي)" value={formData.fullNameAr} onChange={e => setFormData({ ...formData, fullNameAr: e.target.value })} required />
                        <Input label="الاسم الكامل الموحد (English)" value={formData.fullNameEn} onChange={e => setFormData({ ...formData, fullNameEn: e.target.value })} />
                        <Input label="الرقم المدني الكويتي (12 خانة رقمية)" value={formData.civilId} onChange={e => setFormData({ ...formData, civilId: e.target.value })} maxLength={12} required />
                        <Input label="البريد الإلكتروني المخصص" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        <Input label="رقم السكن أو الهاتف الشخصي" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
                        <Input label="الجنسية المعتمدة" value={formData.nationality} onChange={e => setFormData({ ...formData, nationality: e.target.value })} required />

                        <Select 
                            label="القسم الإداري"
                            options={DEPARTMENTS_LIST}
                            value={formData.department}
                            onChange={e => setFormData({ ...formData, department: e.target.value })}
                        />
                        <Select 
                            label="المسمى الحرفي والمهني"
                            options={JOB_TITLES_LIST}
                            value={formData.jobTitle}
                            onChange={e => setFormData({ ...formData, jobTitle: e.target.value })}
                        />

                        <Input label="تاريخ الانضمام والتعيين" type="date" value={formData.joiningDate} onChange={e => setFormData({ ...formData, joiningDate: e.target.value })} required />
                        <Input label="الراتب الأساسي الشهري (د.ك)" type="number" value={formData.basicSalary} onChange={e => setFormData({ ...formData, basicSalary: parseFloat(e.target.value) || 0 })} required />
                        <Input label="تاريخ انتهاء البطاقة المدنية" type="date" value={formData.civilIdExpiry} onChange={e => setFormData({ ...formData, civilIdExpiry: e.target.value })} />
                        <Input label="تاريخ انتهاء جواز السفر" type="date" value={formData.passportExpiry} onChange={e => setFormData({ ...formData, passportExpiry: e.target.value })} />
                        <Input label="تاريخ انتهاء الإقامة السكنية" type="date" value={formData.residencyExpiry} onChange={e => setFormData({ ...formData, residencyExpiry: e.target.value })} />
                        
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-black text-slate-400 uppercase">الجنس الفعلي</label>
                            <div className="flex bg-slate-50 p-1 rounded-xl">
                                <button type="button" onClick={() => setFormData({ ...formData, gender: 'Male' })} className={`flex-grow py-2.5 text-xs font-extrabold rounded-lg transition-all ${formData.gender === 'Male' ? 'bg-white shadow text-indigo-600' : 'text-slate-450'}`}>ذكر</button>
                                <button type="button" onClick={() => setFormData({ ...formData, gender: 'Female' })} className={`flex-grow py-2.5 text-xs font-extrabold rounded-lg transition-all ${formData.gender === 'Female' ? 'bg-white shadow text-indigo-600' : 'text-slate-450'}`}>أنثى</button>
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-5 flex justify-end gap-2.5">
                        <Button variant="secondary" className="rounded-xl px-6 h-11" onClick={() => setIsFormOpen(false)}>إلغاء التغيير</Button>
                        <Button type="submit" className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black px-10 h-11 shadow-lg shadow-indigo-650/15">
                            {editingEmployee ? 'تحديث وحفظ التغييرات' : 'إتمام التثبيت العمالي'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal: Professional Kuwaiti Law Compliant Print & Preview Generator */}
            <Modal
                isOpen={isPrintModalOpen}
                onClose={() => setIsPrintModalOpen(false)}
                title="معاينة نموذج الوثيقة قبل الطباعة الرسمية"
                size="lg"
            >
                {previewDocContent && (
                    <div className="space-y-6 pt-1 text-right">
                        
                        {/* Interactive Edit before print */}
                        <Card className="p-4 bg-slate-50 border-none space-y-4">
                            <h5 className="text-xs font-black text-indigo-600">تعديل فوري تفصيلي على بيان الطباعة</h5>
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="تاريخ البيان" type="date" value={previewDocContent.date} onChange={e => setPreviewDocContent({ ...previewDocContent, date: e.target.value })} />
                                <Input label="رقم المرجع التسلسلي" value={previewDocContent.refNo} onChange={e => setPreviewDocContent({ ...previewDocContent, refNo: e.target.value })} />
                                {printDocType === 'warning' && (
                                    <div className="col-span-2">
                                        <TextArea label="سبب الإنذار المباشر" value={previewDocContent.reason} onChange={e => setPreviewDocContent({ ...previewDocContent, reason: e.target.value })} />
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Visual Simulator of Letterhead */}
                        <div id="printableArea" className="bg-white p-8 rounded-3xl border border-slate-200/50 shadow-inner text-slate-900 overflow-y-auto max-h-[50vh] scrollbar-none text-right">
                            
                            {/* Company Corporate Header */}
                            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5 mb-6 text-xs text-slate-700 leading-relaxed">
                                <div className="text-left font-sans">
                                    <p className="font-extrabold uppercase">AlWagayan, AlMansour Partners</p>
                                    <p>Attorneys & Legal Consultants</p>
                                    <p>State of Kuwait - Kuwait City</p>
                                    <p>Ref: <span className="font-mono">{previewDocContent.refNo}</span></p>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center font-black mx-auto mb-1 text-md">الوقيان</div>
                                    <p className="font-black text-slate-900">مكتب الوقيان والمنصور والزملاء</p>
                                    <p className="font-extrabold text-[10px]">للمحاماة والاستشارات القانونية والشركات</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">تاريخ البيان: {previewDocContent.date}</p>
                                    <p>محكمة التمييز والدستورية</p>
                                    <p>دولة الكويت، مدينة الكويت</p>
                                </div>
                            </div>

                            {/* Main Document Content Area */}
                            {printDocType === 'contract' && (
                                <div className="space-y-4 text-xs">
                                    <h4 className="text-center text-sm font-black underline">عقد عمل في القطاع الأهلي - موحد بموافقة الهيئة العامة</h4>
                                    <p className="leading-relaxed font-extrabold">بموجب أحكام القانون رقم 6 لعام 2010 بشأن العمل في القطاع الأهلي بدولة الكويت، تم الاتفاق والارتباط الإرادي بين:</p>
                                    
                                    <div className="bg-slate-50 p-3.5 rounded-xl space-y-1 my-3 text-[11px] leading-relaxed">
                                        <p><strong>الطرف الأول:</strong> مكتب الوقيان والمنصور والزملاء للمحاماة، ويمثله الشريك المدير أحمد محمود العبدالله.</p>
                                        <p><strong>الطرف الثاني:</strong> السيّد/السيّدة: {previewDocContent.empName}، الرقم المدني: {previewDocContent.empCivilId}، بوظيفة: {previewDocContent.empJob} في قسم: {previewDocContent.empDept}.</p>
                                    </div>
                                    
                                    <p className="leading-relaxed"><strong>البند الأول:</strong> يُعيّن الطرف الثاني لدى الطرف الأول بمسمى {previewDocContent.empJob} اعتباراً من تاريخ التثبيت {previewDocContent.joiningDate}.</p>
                                    <p className="leading-relaxed"><strong>البند الثاني:</strong> يتقاضى الطرف الثاني بموجب هذا السند راتباً أساسياً يعادل {previewDocContent.basicSalary} ديناراً كويتياً، يتم تحويله الكترونياً للبنك المصدق بالصرف.</p>
                                </div>
                            )}

                            {printDocType === 'payslip' && (
                                <div className="space-y-4 text-xs font-mono">
                                    <h4 className="text-center text-sm font-black font-sans underline">شهادة تفصيل الراتب والمستحقات والبدلات المعتمدة</h4>
                                    <div className="grid grid-cols-2 gap-y-3.5 border-b pb-4 my-2 text-[11px]">
                                        <p className="font-sans"><strong>اسم الموظف:</strong> {previewDocContent.empName}</p>
                                        <p className="font-sans"><strong>رقم الملف:</strong> {previewDocContent.empId}</p>
                                        <p className="font-sans"><strong>الرقم المدني:</strong> {previewDocContent.empCivilId}</p>
                                        <p className="font-sans"><strong>المسمى الوظيفي:</strong> {previewDocContent.empJob}</p>
                                    </div>

                                    <div className="space-y-2 text-[11px] border-b pb-4 text-right">
                                        <div className="flex justify-between">
                                            <span>الراتب الأساسي المعتمد:</span>
                                            <span>{previewDocContent.basicSalary} د.ك</span>
                                        </div>
                                        <div className="flex justify-between text-emerald-600 font-extrabold">
                                            <span>إجمالي البدلات والمزايا المضافة:</span>
                                            <span>+{previewDocContent.allowancesVal} د.ك</span>
                                        </div>
                                        <div className="flex justify-between text-rose-600 font-extrabold">
                                            <span>استقطاع التأمينات والضمان (PIFSS):</span>
                                            <span>-{previewDocContent.insDeduction} د.ك</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between font-black font-sans text-xs bg-slate-50 p-3 rounded-lg">
                                        <span>الراتب الصافي الفعلي (Net Cash Pay)</span>
                                        <span>{previewDocContent.net} دينار كويتي</span>
                                    </div>
                                </div>
                            )}

                            {printDocType === 'warning' && (
                                <div className="space-y-4 text-xs leading-relaxed">
                                    <h4 className="text-center text-sm font-black underline text-rose-900 font-sans">إنذار كتابي نهائي رسمي - مخالفة اللوائح</h4>
                                    <p><strong>تنبيه وإرشاد صادر من الموارد البشرية والشؤون القانونية للموظف:</strong></p>
                                    <p className="bg-rose-50 p-2 text-rose-900 font-extrabold rounded-lg">السيّد/السيّدة: {previewDocContent.empName}، الرقم الوظيفي الموحد: {previewDocContent.empId}</p>
                                    <p><strong>أسباب المخالفة والدواعي:</strong> {previewDocContent.reason}</p>
                                    <p>بموجب أحكام <strong>{previewDocContent.lawClause}</strong>، نود إعلامكم بضرورة التقيد ببروتوكول المكتب وصياغة مهام دفاع المحكمة بالانضباط التام.</p>
                                    <p className="font-extrabold text-rose-700 text-[11px]">الجزاء الإداري المتفق: {previewDocContent.penalty}</p>
                                </div>
                            )}

                            {printDocType === 'id' && (
                                <div className="border-2 border-slate-900 p-4 rounded-xl flex items-center justify-between text-xs max-w-md mx-auto">
                                    <div>
                                        <h5 className="font-black">مكتب الوقيان والمنصور للمحاماة</h5>
                                        <p className="text-[10px] text-slate-500 font-sans uppercase">Attorneys & Legal Consultants</p>
                                        <div className="space-y-1 mt-3">
                                            <p><strong>الاسم:</strong> {previewDocContent.empName}</p>
                                            <p><strong>الوظيفة:</strong> {previewDocContent.empJob}</p>
                                            <p><strong>الرقم:</strong> {previewDocContent.empId}</p>
                                        </div>
                                    </div>
                                    <div className="text-center shrink-0">
                                        <div className="w-16 h-16 bg-slate-100 border rounded-xl flex items-center justify-center font-bold text-slate-400">صورة</div>
                                        <span className="text-[8px] uppercase font-mono block mt-2">KWT AUTH REGISTERED</span>
                                    </div>
                                </div>
                            )}

                            {/* Signatures & Official Stamp Grid */}
                            <div className="grid grid-cols-2 text-center mt-10 pt-5 border-t border-dashed text-[10px] font-extrabold leading-loose text-slate-700">
                                <div>
                                    <p>صاحب العمل / الطرف الأول</p>
                                    <p className="mt-4 text-indigo-700 italic">أحمد محمود العبدالله</p>
                                    <p className="text-[8px] text-slate-400">التوقيع والاعتماد الرقمي</p>
                                </div>
                                <div className="border-r">
                                    <p>توقيع الموظف / الطرف الثاني</p>
                                    <p className="mt-8 text-slate-350">.........................................................</p>
                                    <p className="text-[8px] text-slate-400">الإقرار بالاستلام ومضمون السند</p>
                                </div>
                            </div>

                            {/* Official Stamps / QR footer */}
                            <div className="flex items-center justify-between pt-5 mt-5 border-t text-[8px] text-slate-400">
                                <span>المنظومة القانونية الموحدة v3 — عدالة</span>
                                <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                                    <span className="text-[8px] font-bold text-emerald-600 font-mono">STAMP VALID STATE OF KUWAIT</span>
                                </div>
                                <span>رمز الاستجابة السريعة: QR-A7B8C9</span>
                            </div>

                        </div>

                        <div className="flex justify-end gap-2 text-xs font-black">
                            <Button variant="secondary" className="rounded-xl px-4 h-11" onClick={() => setIsPrintModalOpen(false)}>إغلاق</Button>
                            <Button onClick={triggerSystemPrint} className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-8 h-11 shadow-lg shadow-indigo-650/15">
                                بدء الطباعة الفورية
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal: Interactive Document Previewer Mockup */}
            <Modal
                isOpen={isPreviewDocOpen}
                onClose={() => setIsPreviewDocOpen(false)}
                title={previewFileMeta ? `معاينة وثيقة: ${previewFileMeta.title}` : ''}
                size="md"
            >
                {previewFileMeta && (
                    <div className="space-y-4 pt-1 text-right">
                        
                        {previewFileMeta.type === 'civil_id' && (
                            <div className="bg-gradient-to-br from-indigo-100 via-white to-sky-100 p-5 rounded-3xl border border-indigo-200 text-indigo-950 font-bold relative mx-auto max-w-sm shadow-xl font-sans">
                                <div className="flex justify-between items-start border-b pb-2 mb-3">
                                    <div className="text-[8px] text-indigo-800">
                                        <p>الهيئة العامة للمعلومات المدنية</p>
                                        <p className="uppercase">Public Authority for Civil Information</p>
                                    </div>
                                    <div className="w-6 h-6 bg-indigo-800 rounded-full text-white font-black text-center leading-6 text-xs shrink-0 flex items-center justify-center">ك</div>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <div className="space-y-2 text-[10px]">
                                        <p><strong>اسم حامل البطاقة / Name:</strong></p>
                                        <p className="font-sans text-xs font-black text-indigo-900 bg-white/60 p-1 rounded-md">{selectedEmployee?.fullNameAr}</p>
                                        <p><strong>رقم الهوية المدنية / CIVIL ID:</strong></p>
                                        <p className="font-mono text-xs font-black tracking-widest text-indigo-900 bg-white/60 p-1 rounded-md">{selectedEmployee?.civilId}</p>
                                        <p><strong>تاريخ انتهاء البطاقة / Expiry:</strong> {selectedEmployee?.civilIdExpiry || '2028-12-30'}</p>
                                    </div>
                                    <div className="w-20 h-24 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-center text-[10px] text-indigo-400 font-extrabold shrink-0">
                                        صورة شخصية الكترونية
                                    </div>
                                </div>
                                <div className="text-center border-t pt-2 mt-4 text-[7px] text-indigo-500 font-mono tracking-tighter">
                                    STATE OF KUWAIT CIVIL ID - APPROVED REGISTERED DOC
                                </div>
                            </div>
                        )}

                        {previewFileMeta.type === 'passport' && (
                            <div className="bg-slate-900 p-5 rounded-3xl text-amber-100 relative mx-auto max-w-sm shadow-2xl font-sans text-left">
                                <div className="border-b border-amber-500/30 pb-3 mb-4 text-xs">
                                    <div className="flex justify-between">
                                        <span>دولة الكويت</span>
                                        <span className="uppercase font-mono">State of Kuwait</span>
                                    </div>
                                    <div className="flex justify-between text-[9px] mt-1 text-amber-500">
                                        <span>جواز سفر</span>
                                        <span className="uppercase font-mono">PASSPORT</span>
                                    </div>
                                </div>

                                <div className="space-y-3 text-[10px] font-mono leading-relaxed">
                                    <p><strong>اسم صاحب الجواز / Holder:</strong></p>
                                    <p className="text-white font-sans text-xs font-black tracking-wide">{selectedEmployee?.fullNameEn || selectedEmployee?.fullNameAr}</p>
                                    
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        <div>
                                            <span className="text-amber-500/70 block">رقم الجواز / Passport No.</span>
                                            <span className="text-white font-black">N-0098711A</span>
                                        </div>
                                        <div>
                                            <span className="text-amber-500/70 block">تاريخ الصلاحية / Expiration</span>
                                            <span className="text-white font-black">{selectedEmployee?.passportExpiry || '2029-01-01'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {previewFileMeta.type === 'degree' && (
                            <div className="bg-yellow-50/50 p-6 rounded-3xl border-4 border-double border-yellow-600/50 text-slate-800 text-center relative max-w-md mx-auto shadow-lg leading-relaxed font-sans">
                                <span className="font-bold underline uppercase block mb-2 text-amber-800 text-xs">وزارة التعليم العالي بدولة الكويت</span>
                                <h4 className="text-sm font-black underline mb-4">شهادة تخرج جامعية ومعادلة مصدقة</h4>
                                <p className="text-xs">نشهد نحن لجنة تقييم الشهادات والمعادلات بأن السيّد/السيّدة:</p>
                                <p className="font-black text-slate-900 border-b-2 inline-block px-4 py-1 my-2 text-sm">{selectedEmployee?.fullNameAr}</p>
                                <p className="text-xs">قد أكمل متطلبات نيل درجة الليسانس في الحقوق والشريعة القانونية بتقدير ممتاز من جامعة الكويت معترف بها رسمياً ومزكاة إدارياً.</p>
                            </div>
                        )}

                        {previewFileMeta.type === 'text' && (
                            <pre className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl text-xs font-mono whitespace-pre-wrap text-slate-700 leading-6 text-right font-sans">
                                {previewFileMeta.content}
                            </pre>
                        )}

                        <div className="flex justify-end gap-2">
                            <Button className="rounded-xl px-6 h-11 bg-slate-900 hover:bg-slate-800 text-white" onClick={() => setIsPreviewDocOpen(false)}>تمت المراجعة</Button>
                        </div>
                    </div>
                )}
            </Modal>

        </div>
    );
};

export default EmployeeProfilePage;
