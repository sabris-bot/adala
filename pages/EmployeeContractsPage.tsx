import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import PrintHeader from '../components/ui/PrintHeader';
import { Badge } from '../components/ui/Badge';
import { 
    DocumentTextIcon, PlusCircleIcon, PencilIcon, TrashIcon, 
    EyeIcon, PrinterIcon, ArrowDownTrayIcon, MagnifyingGlassIcon,
    UsersIcon, ShieldCheckIcon, CalendarDaysIcon, CurrencyDollarIcon, CheckCircleIcon
} from '../constants';

// --- Interfaces ---
interface EmployeeContract {
    id: string;
    contractNo: string;
    employeeNameAr: string;
    employeeNameEn: string;
    passportOrCivilId: string;
    contractType: 'Limited' | 'Unlimited';
    startDate: string;
    endDate?: string; // empty if Unlimited
    probationDays: number; // max 100 days
    monthlySalary: number;
    allowanceHousing: number;
    allowanceTransport: number;
    noticePeriodMonths: number; // usually 3 months for monthly payroll
    status: 'Active' | 'Probation' | 'Expired' | 'Terminated' | 'Draft';
    jobTitleAr: string;
    jobTitleEn: string;
    pifssNumber?: string; // For Kuwaitis
}

const initialContracts: EmployeeContract[] = [
    {
        id: 'ctr-1',
        contractNo: 'CTR-KW-2024-089',
        employeeNameAr: 'أديب فواز عبدالجليل',
        employeeNameEn: 'Adeeb Fawaz Abduljaleel',
        passportOrCivilId: '292051201994',
        contractType: 'Limited',
        startDate: '2024-06-01',
        endDate: '2026-05-31',
        probationDays: 100,
        monthlySalary: 1400,
        allowanceHousing: 200,
        allowanceTransport: 100,
        noticePeriodMonths: 3,
        status: 'Active',
        jobTitleAr: 'باحث قانوني أول',
        jobTitleEn: 'Senior Legal Researcher',
        pifssNumber: '98754124'
    },
    {
        id: 'ctr-2',
        contractNo: 'CTR-KW-2025-102',
        employeeNameAr: 'سحر بدر العجمي',
        employeeNameEn: 'Sahar Badr Al-Ajmi',
        passportOrCivilId: '295110800344',
        contractType: 'Unlimited',
        startDate: '2025-01-15',
        probationDays: 100,
        monthlySalary: 1850,
        allowanceHousing: 250,
        allowanceTransport: 150,
        noticePeriodMonths: 3,
        status: 'Active',
        jobTitleAr: 'محامية قطاع الأهلي والتنفيذي',
        jobTitleEn: 'Employment and Litigation Advocate',
        pifssNumber: '88344512'
    },
    {
        id: 'ctr-3',
        contractNo: 'CTR-KW-2026-003',
        employeeNameAr: 'موهيت كابور',
        employeeNameEn: 'Mohit Kapoor',
        passportOrCivilId: 'H94851241',
        contractType: 'Limited',
        startDate: '2026-03-10',
        endDate: '2028-03-09',
        probationDays: 100,
        monthlySalary: 750,
        allowanceHousing: 150,
        allowanceTransport: 75,
        noticePeriodMonths: 3,
        status: 'Probation',
        jobTitleAr: 'مساعد إداري ومترجم',
        jobTitleEn: 'Admin Assistant & Translator'
    }
];

const EmployeeContractsPage: React.FC = () => {
    const [language, setLanguage] = useState<'ar' | 'en'>('ar');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedContract, setSelectedContract] = useState<EmployeeContract | null>(null);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

    // --- State Management ---
    const [contracts, setContracts] = useState<EmployeeContract[]>(() => {
        const stored = localStorage.getItem('alwagayan_employee_contracts');
        return stored ? JSON.parse(stored) : initialContracts;
    });

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingContract, setEditingContract] = useState<Partial<EmployeeContract> | null>(null);

    // Save contracts to localStorage
    useEffect(() => {
        localStorage.setItem('alwagayan_employee_contracts', JSON.stringify(contracts));
    }, [contracts]);

    // Filtering
    const filteredContracts = useMemo(() => {
        return contracts.filter(c => {
            const term = searchTerm.toLowerCase();
            return (
                c.employeeNameAr.toLowerCase().includes(term) ||
                c.employeeNameEn.toLowerCase().includes(term) ||
                c.contractNo.toLowerCase().includes(term) ||
                c.jobTitleAr.toLowerCase().includes(term) ||
                c.passportOrCivilId.includes(term)
            );
        });
    }, [contracts, searchTerm]);

    const handleSaveContract = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingContract) return;

        if (editingContract.id) {
            // Edit
            setContracts(prev => prev.map(c => c.id === editingContract.id ? (editingContract as EmployeeContract) : c));
        } else {
            // New
            const newCtr: EmployeeContract = {
                ...(editingContract as EmployeeContract),
                id: 'ctr-' + Date.now(),
                contractNo: 'CTR-KW-2026-' + Math.floor(100 + Math.random() * 900),
                status: 'Active'
            };
            setContracts(prev => [newCtr, ...prev]);
        }
        setIsFormModalOpen(false);
        setEditingContract(null);
    };

    const handleDeleteContract = (id: string) => {
        if (confirm(language === 'ar' ? 'هل أنت متأكد من إلغاء أو حذف هذا العقد رسمياً من منظومة شؤون الموظفين؟' : 'Are you sure you want to permanently delete this contract?')) {
            setContracts(prev => prev.filter(c => c.id !== id));
        }
    };

    const translate = (ar: string, en: string) => {
        return language === 'ar' ? ar : en;
    };

    const handlePrintContract = (ctr: EmployeeContract) => {
        setSelectedContract(ctr);
        setIsPrintModalOpen(true);
    };

    return (
        <div className="space-y-8 pb-20 font-sans" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            
            {/* 1. Official Billing / Legal Contract Print view */}
            {selectedContract && isPrintModalOpen && (
                <div className="hidden print-only-container print:block bg-white p-8 text-black text-[9px] leading-relaxed" style={{ direction: 'rtl' }}>
                    <div className="border-b-4 border-slate-900 pb-4 mb-4 flex justify-between items-center text-right">
                        <div>
                            <h1 className="text-xs font-black">مكتب الوجيان والروضان للمحاماة والاستشارات القانونية</h1>
                            <p className="text-[9px] text-slate-500 font-bold">بوابة العقود الوطنية الموحدة - قانون العمل الأهلي رقم 6 لسنة 2010</p>
                        </div>
                        <div className="text-left font-mono">
                            <p className="font-bold">رقم العقد: {selectedContract.contractNo}</p>
                            <p className="font-bold">تاريخ البدء: {selectedContract.startDate}</p>
                        </div>
                    </div>

                    <div className="text-center my-6">
                        <h2 className="text-md font-black border-y border-black py-2">عقد عمل في القطاع الأهلي (عقد موحد خاضع لوزارة الشؤون والقوى العاملة)</h2>
                    </div>

                    {/* Bilingual Parallel Columns for Dual Ministry Validation */}
                    <div className="grid grid-cols-2 gap-6 text-justify">
                        {/* Right column: Arabic text */}
                        <div className="space-y-4 border-l border-slate-200 pl-4">
                            <h3 className="font-black text-[10px] text-slate-900">الطرف الأول: صاحب العمل</h3>
                            <p>مكتب الوجيان والروضان للمحاماة الكائن بالكويت، ويمثله بالتوقيع مدير الموارد البشرية المستشار الإداري صبري شطا.</p>

                            <h3 className="font-black text-[10px] text-slate-900">الطرف الثاني: الموظف</h3>
                            <p>الأخصائي/ة: <strong>{selectedContract.employeeNameAr}</strong>، الجنسية: المقيد بالبطاقة/الجواز رقم: {selectedContract.passportOrCivilId}.</p>

                            <h3 className="font-black text-[10px] text-slate-900">البند الأول: طبيعة العمل والدوام</h3>
                            <p>يعين الطرف الثاني لدى الطرف الأول بوظيفة <strong>{selectedContract.jobTitleAr}</strong>، ويلتزم بأداء المهام المنوطة به في حدود ساعات العمل القانونية المعمول بها بدولة الكويت (8 ساعات يومياً) وتحت المتابعة المباشرة لإدارة المكتب.</p>

                            <h3 className="font-black text-[10px] text-slate-900">البند الثاني: نوع العقد والمدة</h3>
                            <p>هذا العقد <strong>{selectedContract.contractType === 'Limited' ? `محدد المدة، يبدأ من تاريخ التعيين في ${selectedContract.startDate} وينتهي رسمياً في ${selectedContract.endDate || '-'}` : 'غير محدد المدة، يبدأ من تاريخ المباشرة الفعلي'}</strong>.</p>

                            <h3 className="font-black text-[10px] text-slate-900">البند الثالث: فترة التجربة (مادة 17)</h3>
                            <p>يخضع الطرف الثاني لفترة تجربة مدتها {selectedContract.probationDays} يوم عمل، يجوز خلالها لأي من الطرفين إنهاء العقد دون سابق إنذار أو مكافأة.</p>

                            <h3 className="font-black text-[10px] text-slate-900">البند الرابع: الراتب والبدلات المالية</h3>
                            <p>يستحق الطرف الثاني لقاء عمله راتباً أساسياً شهرياً وقدره {selectedContract.monthlySalary} د.ك، مضافاً إليه بدل سكن قدره {selectedContract.allowanceHousing} د.ك وبدل انتقال قدره {selectedContract.allowanceTransport} د.ك بمجموع إجمالي قدره {selectedContract.monthlySalary + selectedContract.allowanceHousing + selectedContract.allowanceTransport} د.ك (فقط لا غير شهرياً)، يحول للحساب البنكي رسمياً قبل تاريخ 5 من كل شهر ميلادي.</p>
                        </div>

                        {/* Left column: English translation aligned exactly */}
                        <div className="space-y-4 text-left" style={{ direction: 'ltr' }}>
                            <h3 className="font-black text-[10px] text-slate-900">First Party: The Employer</h3>
                            <p>Al-Wagayan & Al-Rodhan Advocates & Legal Advisors, represented by HR Director Counselor Sabry Shatta.</p>

                            <h3 className="font-black text-[10px] text-slate-900">Second Party: The Employee</h3>
                            <p>Mr./Ms: <strong>{selectedContract.employeeNameEn}</strong>, passport/civil ID number: {selectedContract.passportOrCivilId}.</p>

                            <h3 className="font-black text-[10px] text-slate-900">Clause 1: Scope of Employment</h3>
                            <p>The Second Party is hired for the position of <strong>{selectedContract.jobTitleEn}</strong>. Scope of work is 8 hours daily in accordance with the Laws of Kuwait.</p>

                            <h3 className="font-black text-[10px] text-slate-900">Clause 2: Contract Type & Term</h3>
                            <p>This contract is <strong>{selectedContract.contractType === 'Limited' ? `Limited, commencing on ${selectedContract.startDate} and terminating on ${selectedContract.endDate || '-'}` : 'Unlimited, commencing on early start date' }</strong>.</p>

                            <h3 className="font-black text-[10px] text-slate-900">Clause 3: Probation Period (Article 17)</h3>
                            <p>The Second Party serves a probation period of {selectedContract.probationDays} working days. The contract may be terminated inside probation by either party without notice.</p>

                            <h3 className="font-black text-[10px] text-slate-900">Clause 4: Salary & Benefits</h3>
                            <p>The Second Party is paid a basic salary of {selectedContract.monthlySalary} KWD + Housing allowance of {selectedContract.allowanceHousing} KWD + Travel allowance of {selectedContract.allowanceTransport} KWD, making a monthly Net of {selectedContract.monthlySalary + selectedContract.allowanceHousing + selectedContract.allowanceTransport} KWD transferred before the 5th of each month.</p>
                        </div>
                    </div>

                    {/* PIFSS Specific Registration block */}
                    {selectedContract.pifssNumber && (
                        <div className="mt-6 border border-slate-300 p-3 text-right rounded-lg bg-slate-50">
                            <p className="font-black text-[9px] text-slate-800">بيانات الهيئة العامة للتأمينات الاجتماعية (PIFSS-Citizen-Registration):</p>
                            <p>الموظف كويتي الجنسية، مسجل رسمياً في نظام المؤسسة العامة للتأمينات الاجتماعية تحت الرقم التأميني الموحد: <strong>{selectedContract.pifssNumber}</strong> مع اقتطاع الحصص القانونية دورياً.</p>
                        </div>
                    )}

                    {/* Signs block */}
                    <div className="mt-12 grid grid-cols-2 gap-8 text-center text-[9px] pt-4 border-t border-slate-300">
                        <div>
                            <p className="font-bold text-slate-500">توقيع وإقرار الموظف (الطرف الثاني)</p>
                            <div className="h-10"></div>
                            <p className="font-bold text-slate-800">{selectedContract.employeeNameAr}</p>
                        </div>
                        <div className="relative">
                            <p className="font-bold text-slate-500">ممثلاً عن مكتب المحاماة (الطرف الأول)</p>
                            <div className="h-10 flex items-center justify-center relative">
                                <div className="absolute border-2 border-red-500/20 rounded-full w-20 h-20 flex items-center justify-center rotate-12 -top-5 mx-auto left-0 right-0">
                                    <span className="text-[7px] text-red-500/50 leading-tight">الوجيان والروضان<br/>محامون ومستشارون<br/>الكويت</span>
                                </div>
                            </div>
                            <p className="font-bold text-slate-800">الأستاذ المستشار صبري شطا</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Print Modal for Preview and Triggering default browser print UI */}
            {selectedContract && isPrintModalOpen && (
                <Modal isOpen={isPrintModalOpen} onClose={() => setIsPrintModalOpen(false)} title={translate('معاينة العقد الأهلي بوزارة الشؤون والقوى العاملة', 'Ministry of labor unified contract view')} size="xl">
                    <div className="p-4 space-y-6 text-start no-print">
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-150 font-mono text-xs text-slate-700 leading-relaxed max-h-[380px] overflow-y-auto">
                            <h4 className="font-black border-b pb-3 mb-3 text-slate-800">علاقة العمل التعاقدية القانونية | العقد رقم: {selectedContract.contractNo}</h4>
                            <p className="mb-2"><strong>الموظف المتعاقد معه:</strong> {selectedContract.employeeNameAr} ({selectedContract.employeeNameEn})</p>
                            <p className="mb-2"><strong>المسمى الوظيفي:</strong> {selectedContract.jobTitleAr}</p>
                            <p className="mb-2"><strong>الراتب الأساسي المرصود:</strong> {selectedContract.monthlySalary} د.ك شهرياً</p>
                            <p className="mb-2"><strong>البدلات:</strong> سكن {selectedContract.allowanceHousing} د.ك | انتقال {selectedContract.allowanceTransport} د.ك</p>
                            {selectedContract.pifssNumber && <p className="mb-2"><strong>التأمينات الاجتماعية الـ PIFSS:</strong> مسجل برقم ({selectedContract.pifssNumber})</p>}
                            <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-200 mt-4 text-[11px] font-black">
                                {language === 'ar' ? 'تصميم بأسلوب "مطبوعة رسمية مزدوجة العمود" حسب المتطلبات الوزارية الكويتية.' : 'Parallel dual column structure according to Kuwait legislative requirements.'}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button size="sm" onClick={() => window.print()} leftIcon={<PrinterIcon className="w-4 h-4" />}>
                                {translate('اطبع العقد الرسمي ذو العمودين', 'Print Bilingual Contract')}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setIsPrintModalOpen(false)}>
                                {translate('إلغاء المعاينة', 'Cancel')}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* MAIN CONTAINER */}
            <PrintHeader title="سجلات وعقود الكوادر الإدارية والمهنية بالمكتب" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 no-print">
                
                {/* Banner Header */}
                <div className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-xl shadow-primary/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1.5 print:hidden">
                                <Link to="/employee-affairs" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold flex items-center gap-1">
                                    <span>شؤون الموظفين</span>
                                </Link>
                                <span className="text-xs text-slate-300">/</span>
                                <span className="text-xs text-slate-400 font-bold">إدارة عقود العمل</span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 bg-indigo-600 rounded-xl text-white">
                                    <DocumentTextIcon className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-black uppercase text-indigo-700 tracking-wider">Employment Contracts Administration</span>
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 mb-1">
                                إدارة <span className="text-indigo-650">عقود العمل القانونية</span>
                            </h1>
                            <p className="text-xs text-slate-500 font-bold">
                                توثيق وصياغة عقود العمل (المحددة وغير المحددة المدة)، ومتابعة فترات الاختبار (PROBATION)، ومستحقات مكافأة نهاية الخدمة، ومقتضيات التأمين والتأمينات الوطنية (PIFSS).
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Button 
                                size="sm" 
                                leftIcon={<PlusCircleIcon className="w-4 h-4" />}
                                onClick={() => {
                                    setEditingContract({
                                        id: '',
                                        contractNo: '',
                                        employeeNameAr: '',
                                        employeeNameEn: '',
                                        passportOrCivilId: '',
                                        contractType: 'Limited',
                                        startDate: new Date().toISOString().split('T')[0],
                                        endDate: '',
                                        probationDays: 100,
                                        monthlySalary: 1000,
                                        allowanceHousing: 150,
                                        allowanceTransport: 50,
                                        noticePeriodMonths: 3,
                                        jobTitleAr: '',
                                        jobTitleEn: '',
                                        pifssNumber: ''
                                    });
                                    setIsFormModalOpen(true);
                                }}
                            >
                                {translate('إبرام وصياغة عقد جديد', 'Draft Contract')}
                            </Button>
                            
                            <button 
                                onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                                className="h-10 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shrink-0 font-black text-xs flex items-center justify-center bg-white"
                            >
                                {language === 'ar' ? 'English EN' : 'العربية AR'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Search Bar Panel */}
                <div className="flex bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="relative w-full max-w-md">
                        <Input
                            placeholder={translate('ابحث عن الموظف، المسمى الفني، الرقم المرجعي أو البطاقة المدنية...', 'Search contracts by name, job, ID or ref...')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-slate-50 border-slate-150 pl-10 pr-4 rounded-xl text-xs"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            <MagnifyingGlassIcon className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                {/* Contracts List Rendering Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredContracts.map(ctr => (
                        <Card key={ctr.id} className="p-6 rounded-[2rem] bg-white border border-slate-100 hover:border-slate-250 transition-all flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="space-y-0.5">
                                        <span className="font-mono text-[9px] font-black text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full select-all">{ctr.contractNo}</span>
                                        <h3 className="font-black text-slate-900 text-sm mt-1">{translate(ctr.employeeNameAr, ctr.employeeNameEn)}</h3>
                                        <p className="text-[10px] text-slate-400 font-semibold">{translate('المسمى والوظيفة:', 'Job Class:')} <strong className="text-slate-700">{translate(ctr.jobTitleAr, ctr.jobTitleEn)}</strong></p>
                                    </div>
                                    <Badge text={ctr.status} variant={ctr.status === 'Active' ? 'success' : ctr.status === 'Probation' ? 'warning' : 'secondary'} />
                                </div>

                                <div className="border-t border-slate-50 py-3 grid grid-cols-2 gap-3 text-xs font-semibold text-slate-600">
                                    <div>
                                        <p className="text-slate-400 text-[10px]">{translate('نوع وبند العقد', 'Contract Type')}</p>
                                        <p className="text-slate-800 font-bold">{ctr.contractType === 'Limited' ? translate('محدد المدة (كويتي/وافد)', 'Limited period') : translate('غير محدد المدة وقابل للتجديد', 'Unlimited period')}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-[10px]">{translate('الراتب الشهري الأساسي', 'Basic Monthly Compensation')}</p>
                                        <p className="text-slate-800 font-black font-mono">{ctr.monthlySalary} KWD</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-[10px]">{translate('البدلات المالية المؤقتة والدورية', 'Monthly Allowances')}</p>
                                        <p className="text-slate-800 font-bold font-mono">+{ctr.allowanceHousing + ctr.allowanceTransport} KWD</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-[10px]">{translate('تاريخ البدء والمطابقة', 'Commenced date')}</p>
                                        <p className="text-slate-850 font-bold font-mono">{ctr.startDate}</p>
                                    </div>
                                </div>

                                {ctr.pifssNumber && (
                                    <div className="mt-2 bg-indigo-50/50 p-2 rounded-xl border border-indigo-100 flex items-center gap-1.5 text-[10px] font-black text-indigo-800">
                                        <ShieldCheckIcon className="w-4 h-4 text-indigo-650" />
                                        <span>{translate('مسجل بالكامل في التأمينات الاجتماعية (PIFSS)', 'Fully registered inside Kuwaiti Social Security Authority (PIFSS)')}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-1.5 border-t border-slate-50 pt-3 mt-4">
                                <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handlePrintContract(ctr)}
                                    leftIcon={<PrinterIcon className="w-4.5 h-4.5" />}
                                    className="text-indigo-650 border-indigo-100 hover:bg-indigo-50"
                                >
                                    {translate('عرض العقد والطباعة', 'Print Contract')}
                                </Button>
                                
                                <button 
                                    onClick={() => {
                                        setEditingContract(ctr);
                                        setIsFormModalOpen(true);
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-indigo-650 hover:bg-slate-50 rounded-lg transition-colors"
                                >
                                    <PencilIcon className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => handleDeleteContract(ctr.id)}
                                    className="p-1.5 text-slate-400 hover:text-rose-650 hover:bg-rose-50 rounded-lg transition-colors"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </Card>
                    ))}
                    {filteredContracts.length === 0 && (
                        <div className="col-span-full py-20 text-center text-slate-400 text-xs font-bold bg-white rounded-3xl border">
                            {translate('لم يتم العثور على عقود موظفين مطابقة للمواصفات.', 'No contracts matched your search criteria.')}
                        </div>
                    )}
                </div>
            </div>

            {/* --- Creator/Editor Modal --- */}
            {isFormModalOpen && editingContract && (
                <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={translate('صياغة وتحرير بنود عقد العمل الأهلي الموحد (الكويت)', 'Draft Unified Kuwaiti Labor Contract')} size="lg">
                    <form onSubmit={handleSaveContract} className="p-4 space-y-4 text-start no-print">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input 
                                label={translate('اسم الموظف رسمياً بالعربية:', 'FullName (AR):')}
                                value={editingContract.employeeNameAr || ''}
                                onChange={(e) => setEditingContract({ ...editingContract, employeeNameAr: e.target.value })}
                                required
                            />
                            <Input 
                                label={translate('اسم الموظف بالإنجليزية (مطابق للجواز):', 'FullName (EN):')}
                                value={editingContract.employeeNameEn || ''}
                                onChange={(e) => setEditingContract({ ...editingContract, employeeNameEn: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input 
                                label={translate('المسمى الوظيفي بالعربية:', 'Job Title (AR):')}
                                value={editingContract.jobTitleAr || ''}
                                onChange={(e) => setEditingContract({ ...editingContract, jobTitleAr: e.target.value })}
                                required
                            />
                            <Input 
                                label={translate('المسمى الوظيفي بالإنجليزية:', 'Job Title (EN):')}
                                value={editingContract.jobTitleEn || ''}
                                onChange={(e) => setEditingContract({ ...editingContract, jobTitleEn: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input 
                                label={translate('رقم البطاقة المدنية أو جواز السفر:', 'Civil ID / Passport Number:')}
                                value={editingContract.passportOrCivilId || ''}
                                onChange={(e) => setEditingContract({ ...editingContract, passportOrCivilId: e.target.value })}
                                required
                            />
                            <Select 
                                label={translate('نوع وصياغة العقد:', 'Select Contract Class:')}
                                value={editingContract.contractType || 'Limited'}
                                onChange={(e) => setEditingContract({ ...editingContract, contractType: e.target.value as any })}
                                options={[
                                    { value: 'Limited', label: 'محدد المدة (تنتهي بمدة معينة - Limited)' },
                                    { value: 'Unlimited', label: 'غير محدد المدة (قابل للتجديد - Unlimited)' }
                                ]}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input 
                                label={translate('تاريخ البدء والمباشرة بالعمل:', 'StartDate:')}
                                type="date"
                                value={editingContract.startDate || ''}
                                onChange={(e) => setEditingContract({ ...editingContract, startDate: e.target.value })}
                                required
                            />
                            {editingContract.contractType === 'Limited' && (
                                <Input 
                                    label={translate('تاريخ انتهاء بنود التعاقد:', 'EndDate:')}
                                    type="date"
                                    value={editingContract.endDate || ''}
                                    onChange={(e) => setEditingContract({ ...editingContract, endDate: e.target.value })}
                                    required
                                />
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t pt-3">
                            <Input 
                                label={translate('الراتب الأساسي (د.ك):', 'Base Salary (KWD):')}
                                type="number"
                                value={editingContract.monthlySalary || 1000}
                                onChange={(e) => setEditingContract({ ...editingContract, monthlySalary: parseInt(e.target.value) })}
                                required
                            />
                            <Input 
                                label={translate('بديل السكن الشهري (د.ك):', 'Housing Allowance:')}
                                type="number"
                                value={editingContract.allowanceHousing || 150}
                                onChange={(e) => setEditingContract({ ...editingContract, allowanceHousing: parseInt(e.target.value) })}
                                required
                            />
                            <Input 
                                label={translate('بديل الانتقال والمواصلات (د.ك):', 'Travel Allowance:')}
                                type="number"
                                value={editingContract.allowanceTransport || 50}
                                onChange={(e) => setEditingContract({ ...editingContract, allowanceTransport: parseInt(e.target.value) })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input 
                                label={translate('فترة الاختبار والتدقيق (أيام):', 'Probation Days (Max 100):')}
                                type="number"
                                max={100}
                                value={editingContract.probationDays || 100}
                                onChange={(e) => setEditingContract({ ...editingContract, probationDays: parseInt(e.target.value) })}
                                required
                            />
                            <Input 
                                label={translate('الرقم التأميني بالتأمينات الوطنية (اختياري للكويتيين):', 'PIFSS Membership Code (Optional):')}
                                value={editingContract.pifssNumber || ''}
                                placeholder="مثال: 948124XX"
                                onChange={(e) => setEditingContract({ ...editingContract, pifssNumber: e.target.value })}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t font-sans">
                            <Button type="button" variant="outline" size="sm" onClick={() => setIsFormModalOpen(false)}>
                                {translate('إلغاء الصياغة', 'Cancel')}
                            </Button>
                            <Button type="submit" size="sm">
                                {translate('تصدير وحفظ العقد', 'Conclude and Save Contract')}
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}

        </div>
    );
};

export default EmployeeContractsPage;
