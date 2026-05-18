
import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import PrintHeader from '../components/ui/PrintHeader';
import { 
    PlusCircleIcon, PrinterIcon, ArrowPathIcon, InformationCircleIcon, 
    ShieldCheckIcon, ScaleIcon, BanknotesIcon, CalendarDaysIcon, 
    MagnifyingGlassIcon, CheckCircleIcon, XCircleIcon, 
    GlobeAltIcon, ArrowLeftIcon, UserGroupIcon, BuildingLibraryIcon, ArchiveBoxIcon,
    ClipboardDocumentCheckIcon, CalculatorIcon, DocumentTextIcon, UserCircleIcon,
    BuildingOffice2Icon, ExclamationTriangleIcon, TrashIcon, EyeIcon, 
    ChevronDownIcon, UserPlusIcon, HistoryIcon, ClockIcon
} from '../constants';
import { 
    TerminationReasonKuwait, EOS_Settlement, 
    EOS_SettlementStatus, ContractTypeKuwait
} from '../types';
import { 
    terminationReasonKuwaitOptions, OFFICE_NAME 
} from '../constants';
import { initialEmployees } from './EmployeeProfilePage';
import { format } from 'date-fns';
import { calculateKuwaitEOS } from '../services/eosService';

// --- Local Styles & Constants ---
const PRINT_STYLES = `
@media print {
  body { background: white !important; font-size: 10pt; color: #1e293b !important; }
  .no-print { display: none !important; }
  .print-only { display: block !important; }
  .page-break { page-break-before: always; }
  .print-container { padding: 0 !important; margin: 0 !important; width: 100% !important; max-width: 100% !important; border: none !important; box-shadow: none !important; }
  .print-card { border: 1px solid #e2e8f0 !important; margin-bottom: 20px !important; break-inside: avoid; }
  .doc-modern-table { width: 100% !important; border-collapse: collapse !important; margin: 15px 0 !important; }
  .doc-modern-table th, .doc-modern-table td { border: 1px solid #cbd5e1 !important; padding: 12px 8px !important; font-size: 9pt !important; }
  .doc-modern-table th { background-color: #f8fafc !important; color: #334155 !important; font-weight: bold; }
  .print-signature-box { border: 1.5px solid #334155 !important; padding: 15px !important; min-height: 100px !important; border-radius: 8px !important; }
  @page { margin: 1.5cm; size: A4; }
}
`;

const STEP_TABS = [
    { id: 'employee', label: 'بيانات الموظف', icon: <UserCircleIcon className="w-5 h-5"/> },
    { id: 'contract', label: 'العقد والخدمة', icon: <ScaleIcon className="w-5 h-5"/> },
    { id: 'financial', label: 'المالية والإجازات', icon: <BanknotesIcon className="w-5 h-5"/> },
    { id: 'result', label: 'النتيجة والمستندات', icon: <ClipboardDocumentCheckIcon className="w-5 h-5"/> },
];

const EndOfServicePage: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
    
    const [formData, setFormData] = useState({
        employeeId: '',
        employeeName: '',
        employeeCivilId: '',
        jobTitle: '',
        nationality: 'وافد / أجنبي',
        joiningDate: format(new Date(), 'yyyy-MM-dd'),
        lastWorkingDay: format(new Date(), 'yyyy-MM-dd'),
        terminationReason: TerminationReasonKuwait.RESIGNATION,
        paySystem: 'شهري' as 'شهري' | 'غير شهري',
        basicSalary: 0,
        allowances: 0,
        leaveEntitlement: 30,
        leaveTaken: 0,
        leaveAdjustment: 0,
        noticeAction: 'WorkDuringNotice' as 'WorkDuringNotice' | 'PayNoticePay' | 'Waived',
        otherAdditions: 0,
        deductions: 0,
        absenceDays: 0,
        socialInsuranceDeduction: 0,
        contractType: ContractTypeKuwait.UNLIMITED,
        notes: ''
    });

    const [savedSettlements, setSavedSettlements] = useState<EOS_Settlement[]>([]);
    const [showSavedList, setShowSavedList] = useState(false);

    // --- Calculation Hook ---
    const calc = useMemo(() => {
        return calculateKuwaitEOS({
            ...formData,
            terminationReason: formData.terminationReason as TerminationReasonKuwait,
        });
    }, [formData]);

    // --- Actions ---
    const handleEmployeeSelect = (emp: any) => {
        setFormData({
            ...formData,
            employeeName: emp.fullNameAr,
            employeeCivilId: emp.civilId,
            jobTitle: emp.jobTitle,
            joiningDate: emp.joiningDate,
            basicSalary: emp.basicSalary,
            allowances: (emp.allowances || []).reduce((acc: number, cur: any) => acc + cur.value, 0),
            contractType: emp.contractType,
            nationality: emp.nationality?.includes('كويت') ? 'مواطن (الكويت)' : 'وافد / أجنبي',
            paySystem: 'شهري'
        });
        setIsSelectionModalOpen(false);
    };

    const handleSave = () => {
        const newRecord: EOS_Settlement = {
            id: `EOS-${Date.now()}`,
            employeeId: formData.employeeCivilId,
            employeeName: formData.employeeName,
            settlementDate: format(new Date(), 'yyyy-MM-dd'),
            lastWorkingDay: formData.lastWorkingDay,
            terminationReason: formData.terminationReason,
            status: 'UnderReview',
            basicSalary: formData.basicSalary,
            allowances: formData.allowances,
            grossSalary: formData.basicSalary + formData.allowances,
            serviceYears: calc.serviceYears,
            serviceMonths: calc.serviceMonths,
            serviceDays: calc.serviceDays,
            indemnityAmount: calc.indemnityAmount,
            leaveBalanceAmount: calc.leavePayAmount,
            accruedSalaryAmount: 0, 
            noticePeriodAmount: calc.noticePeriodPay,
            otherBonuses: formData.otherAdditions,
            loansDeduction: formData.deductions,
            absenceDeduction: calc.deductionsTotal - formData.deductions - formData.socialInsuranceDeduction,
            otherDeductions: 0,
            netPayable: calc.netAmount,
            legalArticles: calc.legalArticles.map(a => a.article),
            preparedBy: "النظام الذكي",
            notes: formData.notes
        };
        setSavedSettlements(prev => [newRecord, ...prev]);
        setShowSavedList(true);
    };

    const handlePrint = () => {
        window.print();
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEP_TABS.length - 1));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

    // --- Formal Document Template (Print Only) ---
    const FormalDocument = () => (
        <div className="print-only hidden p-10 bg-white text-slate-900 font-sans" dir="rtl" style={{ minHeight: '29.7cm' }}>
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
                <div className="text-right">
                    <h2 className="text-2xl font-black">{OFFICE_NAME}</h2>
                    <p className="text-sm font-bold">للمحاماة والاستشارات القانونية</p>
                    <p className="text-xs">دولة الكويت - مجمع الوزارات</p>
                </div>
                <div className="text-center">
                    <div className="w-16 h-16 bg-slate-900 rounded-xl mb-2 mx-auto flex items-center justify-center">
                        <ScaleIcon className="text-white w-10 h-10" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest">Official Document</p>
                </div>
                <div className="text-left text-xs space-y-1">
                    <p>المرجع: <span className="font-bold">EOS/{new Date().getFullYear()}/{Math.floor(Math.random()*9000)+1000}</span></p>
                    <p>التاريخ: <span className="font-bold">{format(new Date(), 'yyyy/MM/dd')}</span></p>
                    <p>الصفحة: 1 من 1</p>
                </div>
            </div>

            <div className="text-center mb-10">
                <h1 className="text-2xl font-black underline underline-offset-8">كشف تسوية مستحقات نهاية الخدمة والوفاء النهائي</h1>
            </div>

            {/* Employee Data Table */}
            <div className="mb-8">
                <h3 className="bg-slate-100 p-2 font-black text-sm mb-4 border-r-4 border-slate-900">أولاً: البيانات الوظيفية</h3>
                <table className="doc-modern-table w-full">
                    <tbody>
                        <tr>
                            <td className="bg-slate-50 font-bold w-1/4">اسم الموظف:</td>
                            <td className="w-1/4">{formData.employeeName}</td>
                            <td className="bg-slate-50 font-bold w-1/4">الرقم المدني:</td>
                            <td className="w-1/4 font-mono">{formData.employeeCivilId}</td>
                        </tr>
                        <tr>
                            <td className="bg-slate-50 font-bold">المسمى الوظيفي:</td>
                            <td>{formData.jobTitle}</td>
                            <td className="bg-slate-50 font-bold">الجنسية:</td>
                            <td>{formData.nationality}</td>
                        </tr>
                        <tr>
                            <td className="bg-slate-50 font-bold">تاريخ التعيين:</td>
                            <td>{format(new Date(formData.joiningDate), 'yyyy/MM/dd')}</td>
                            <td className="bg-slate-50 font-bold">تاريخ انتهاء الخدمة:</td>
                            <td>{format(new Date(formData.lastWorkingDay), 'yyyy/MM/dd')}</td>
                        </tr>
                        <tr>
                            <td className="bg-slate-50 font-bold">مدة الخدمة:</td>
                            <td colSpan={3} className="font-bold">{calc.serviceYears} سنة، {calc.serviceMonths} شهر، {calc.serviceDays} يوم</td>
                        </tr>
                        <tr>
                            <td className="bg-slate-50 font-bold">سبب انتهاء الخدمة:</td>
                            <td colSpan={3}>{terminationReasonKuwaitOptions.find(o => o.value === formData.terminationReason)?.label}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Financial Details */}
            <div className="mb-8">
                <h3 className="bg-slate-100 p-2 font-black text-sm mb-4 border-r-4 border-slate-900">ثانياً: المستحقات والخصومات المخصومة</h3>
                <table className="doc-modern-table w-full">
                    <thead>
                        <tr className="bg-slate-100">
                            <th>البند</th>
                            <th>التفاصيل القانونية</th>
                            <th>المبلغ (د.ك)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="font-bold">مكافأة نهاية الخدمة</td>
                            <td className="text-xs">المادة 51 - بواقع {(calc.indemnityBreakdown.adjustmentFactor * 100).toFixed(0)}% من المستحق</td>
                            <td className="text-center font-bold">{calc.indemnityAmount.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td className="font-bold">بدل الإجازات المستحقة</td>
                            <td className="text-xs">رصيد {calc.leaveBalanceDays} يوم (الراتب الشامل: {formData.basicSalary + formData.allowances})</td>
                            <td className="text-center font-bold">{calc.leavePayAmount.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td className="font-bold">بدل مهلة الإخطار</td>
                            <td className="text-xs">{formData.noticeAction === 'PayNoticePay' ? 'صرف نقدي' : 'تم العمل/التنازل'}</td>
                            <td className="text-center font-bold">{calc.noticePeriodPay.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td className="font-bold">إضافات أخرى</td>
                            <td className="text-xs">عمولات ومستحقات متفرقة</td>
                            <td className="text-center font-bold">{formData.otherAdditions.toLocaleString()}</td>
                        </tr>
                        <tr className="bg-slate-50">
                            <td colSpan={2} className="text-left font-black">إجمالي المستحقات:</td>
                            <td className="text-center font-black">{calc.additionsTotal.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td className="font-bold text-rose-700">الخصومات والسلف</td>
                            <td className="text-xs">سلف موظفين، ديون، أو غرامات</td>
                            <td className="text-center font-bold text-rose-700">({formData.deductions.toLocaleString()})</td>
                        </tr>
                        <tr>
                            <td className="font-bold text-rose-700">غياب / تأمينات</td>
                            <td className="text-xs">أيام غياب فعلية وحصة العامل في التأمينات</td>
                            <td className="text-center font-bold text-rose-700">({(calc.deductionsTotal - formData.deductions).toLocaleString()})</td>
                        </tr>
                        <tr className="bg-slate-900 text-white font-black">
                            <td colSpan={2} className="text-left py-4 px-4 text-lg">صافي المبلغ المسلم (فقط لا غير):</td>
                            <td className="text-center text-lg">{calc.netAmount.toLocaleString()} د.ك</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Discharge Section */}
            <div className="mb-12 p-6 border-2 border-slate-200 rounded-2xl bg-slate-50 italic">
                <h4 className="font-black text-center mb-4 not-italic underline">إقرار استلام وبراءة ذمة نهائية</h4>
                <p className="text-xs leading-relaxed text-justify">
                    أنا الموقع أدناه {formData.employeeName}، أقر وأعترف بأنني قد استلمت كافة مستحقاتي المالية الموضحة أعلاه والناشئة عن علاقة عملي بالشركة، كما أقر باستلامي لكافة الوثائق والأوراق والعهد الخاصة بي، وأنه بموجب هذا التوقيع أبرئ ذمة الشركة إبراءً عاماً شاملاً ومانعاً من أي مطالبات حالية أو مستقبلية تتعلق بفترة عملي أو انتهائها، وذلك وفقاً لقانون العمل في القطاع الأهلي بدولة الكويت.
                </p>
                <div className="mt-8 flex justify-between px-10 items-center">
                    <div className="text-center space-y-4">
                        <p className="font-bold text-xs">توقيع الموظف</p>
                        <div className="w-40 h-10 border-b border-slate-400"></div>
                        <p className="text-[10px]">تاريخ التوقيع: ___/___/20__</p>
                    </div>
                    <div className="text-center space-y-4">
                        <p className="font-bold text-xs">بصمة الإبهام (إن وجد)</p>
                        <div className="w-20 h-20 border-2 border-slate-300 rounded-md"></div>
                    </div>
                </div>
            </div>

            {/* Approvals Grid */}
            <div className="grid grid-cols-2 gap-4 mt-10">
                <div className="print-signature-box flex flex-col justify-between">
                    <p className="text-[10px] font-black text-slate-400 mb-2">اعتماد الإدارة القانونية</p>
                    <div className="flex-1 border-b border-slate-200 border-dashed mb-2"></div>
                    <p className="text-[10px] text-right font-bold">الاسم: ............................</p>
                </div>
                <div className="print-signature-box flex flex-col justify-between">
                    <p className="text-[10px] font-black text-slate-400 mb-2">اعتماد الإدارة المالية</p>
                    <div className="flex-1 border-b border-slate-200 border-dashed mb-2"></div>
                    <p className="text-[10px] text-right font-bold">الاسم: ............................</p>
                </div>
                <div className="print-signature-box flex flex-col justify-between">
                    <p className="text-[10px] font-black text-slate-400 mb-2">المدير العام / المفوض بالتوقيع</p>
                    <div className="flex-1 border-b border-slate-200 border-dashed mb-2"></div>
                    <p className="text-[10px] text-right font-bold">الختم:</p>
                </div>
                <div className="flex items-center justify-center p-4 border-2 border-double border-slate-200 rounded-2xl relative opacity-20">
                     <div className="w-32 h-32 rounded-full border-4 border-slate-400 flex items-center justify-center">
                        <span className="text-[8px] font-black uppercase tracking-tighter">COMPANY STAMP AREA</span>
                     </div>
                     <p className="absolute text-[8px] bottom-2">موضع ختم الشركة الرسمي</p>
                </div>
            </div>
            
            <footer className="mt-20 pt-4 border-t border-slate-100 text-[8px] text-slate-400 flex justify-between">
                <p>صدر هذا المستند من منظومة "عدالة" الذكية - جميع الحقوق محفوظة لشركة الوجيان للاستشارات</p>
                <p>رقم التحقق الإلكتروني: {Math.random().toString(36).substring(7).toUpperCase()}</p>
            </footer>
        </div>
    );

    // --- Sections ---
    const renderStepContent = () => {
        switch (STEP_TABS[currentStep].id) {
            case 'employee':
                return (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                    >
                        <div className="space-y-6 bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <UserCircleIcon className="w-6 h-6 text-indigo-500" />
                                    الهوية الوظيفية
                                </h4>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="rounded-xl font-bold"
                                    onClick={() => setIsSelectionModalOpen(true)}
                                    leftIcon={<UserGroupIcon className="w-4 h-4"/>}
                                >
                                    اختيار من السجل
                                </Button>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400 block pr-1">الاسم الكامل (حسب البطاقة المدنية)</label>
                                    <input 
                                        type="text" 
                                        className="w-full h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all text-right text-lg font-bold"
                                        placeholder="أدخل اسم الموظف الرباعي..."
                                        value={formData.employeeName}
                                        onChange={e => setFormData({...formData, employeeName: e.target.value})}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-600 dark:text-slate-400 block pr-1">الرقم المدني</label>
                                        <input 
                                            type="text" 
                                            className="w-full h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all text-right font-mono tracking-wider"
                                            value={formData.employeeCivilId}
                                            onChange={e => setFormData({...formData, employeeCivilId: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-600 dark:text-slate-400 block pr-1">المسمى الوظيفي</label>
                                        <input 
                                            type="text" 
                                            className="w-full h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all text-right"
                                            value={formData.jobTitle}
                                            onChange={e => setFormData({...formData, jobTitle: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400 block pr-1">الفئة / الجنسية</label>
                                    <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl">
                                        <button 
                                            onClick={() => setFormData({...formData, nationality: 'وافد / أجنبي'})}
                                            className={`py-3 rounded-lg text-sm font-black transition-all ${formData.nationality === 'وافد / أجنبي' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-400'}`}
                                        >
                                            وافد / أجنبي
                                        </button>
                                        <button 
                                            onClick={() => setFormData({...formData, nationality: 'مواطن (الكويت)'})}
                                            className={`py-3 rounded-lg text-sm font-black transition-all ${formData.nationality !== 'وافد / أجنبي' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-400'}`}
                                        >
                                            مواطن كويتي
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 p-10 rounded-2xl shadow-xl text-white relative overflow-hidden flex flex-col justify-center">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full -ml-24 -mb-24 blur-2xl"></div>
                            <div className="relative z-10 space-y-6">
                                <div className="bg-indigo-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-2">
                                    <ShieldCheckIcon className="w-10 h-10 text-indigo-200" />
                                </div>
                                <h3 className="text-3xl font-black leading-tight">محرك الاحتساب القانوني الذكي (نهاية الخدمة)</h3>
                                <p className="text-indigo-100/90 leading-relaxed font-medium text-lg">
                                    يتم احتساب المستحقات وفقاً لأحكام قانون العمل الكويتي رقم 6 لسنة 2010 في القطاع الأهلي، مع دمج كافة التعديلات القانونية المتعلقة بحساب الأجر الشامل والمواد 51، 53، 70 و79.
                                </p>
                                <div className="flex gap-4 pt-4">
                                    <div className="bg-white/10 px-5 py-4 rounded-2xl backdrop-blur-md border border-white/5">
                                        <p className="text-[10px] uppercase font-black tracking-[0.2em] text-indigo-300 opacity-60 mb-1">Jurisdiction</p>
                                        <p className="font-bold flex items-center gap-2"><GlobeAltIcon className="w-4 h-4"/> دولة الكويت</p>
                                    </div>
                                    <div className="bg-white/10 px-5 py-4 rounded-2xl backdrop-blur-md border border-white/5">
                                        <p className="text-[10px] uppercase font-black tracking-[0.2em] text-indigo-300 opacity-60 mb-1">Authority</p>
                                        <p className="font-bold flex items-center gap-2"><BuildingLibraryIcon className="w-4 h-4 text-emerald-400"/> وزارة الشؤون</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            case 'contract':
                return (
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                    >
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-6 shadow-sm">
                            <h4 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                                    <CalendarDaysIcon className="w-6 h-6 text-indigo-600" />
                                </div>
                                فترة الخدمة الفعلية
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-600 block pr-1">تاريخ مباشرة العمل</label>
                                    <input type="date" value={formData.joiningDate} onChange={e => setFormData({...formData, joiningDate: e.target.value})} className="w-full h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 text-right font-bold"/>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-600 block pr-1">تاريخ ترك العمل</label>
                                    <input type="date" value={formData.lastWorkingDay} onChange={e => setFormData({...formData, lastWorkingDay: e.target.value})} className="w-full h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 text-right font-bold"/>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-6 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20 text-white group overflow-hidden relative">
                                <div className="relative z-10">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200 mb-1">إجمالي مدة الخدمة</p>
                                    <p className="text-3xl font-black tabular-nums">{calc.serviceYears} سنة ، {calc.serviceMonths} شهر</p>
                                    <p className="text-xs font-bold text-indigo-100 mt-1 opacity-80">{calc.serviceDays} يوم خدمة متبقية</p>
                                </div>
                                <ClockIcon className="w-16 h-16 text-white/10 absolute -right-2 transform -rotate-12 group-hover:scale-110 transition-transform" />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-6 shadow-sm">
                            <h4 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                                    <ScaleIcon className="w-6 h-6 text-amber-600" />
                                </div>
                                السند القانوني للإنهاء
                            </h4>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-600 block pr-1">نوع عقد العمل</label>
                                    <select value={formData.contractType} onChange={e => setFormData({...formData, contractType: e.target.value as any})} className="w-full h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 text-right font-bold text-sm">
                                        <option value={ContractTypeKuwait.UNLIMITED}>عقد غير محدد المدة (مستمر)</option>
                                        <option value={ContractTypeKuwait.LIMITED}>عقد محدد المدة (مؤقت)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-600 block pr-1">سبب انتهاء علاقة العمل</label>
                                    <select 
                                        className="w-full h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 text-right font-bold text-sm"
                                        value={formData.terminationReason}
                                        onChange={e => setFormData({...formData, terminationReason: e.target.value as any})}
                                    >
                                        {terminationReasonKuwaitOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                </div>
                                {formData.terminationReason.includes("المادة 41") && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                        className="p-5 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-2xl flex gap-4 text-rose-700 dark:text-rose-400"
                                    >
                                        <ExclamationTriangleIcon className="w-10 h-10 shrink-0" />
                                        <div className="space-y-1">
                                            <p className="font-black text-sm">فصل تأديبي (المادة 41)</p>
                                            <p className="text-xs font-medium leading-relaxed">تنبيه: الفصل الجسيم يحرم العامل من المكافأة والإنذار. تأكد من استيفاء إجراءات التحقيق الإداري والمواعيد القانونية (7 أيام من العلم).</p>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                );
            case 'financial':
                return (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                    >
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-sm">
                                <div className="space-y-6">
                                    <h4 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                                            <BanknotesIcon className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        عناصر الأجر الشامل
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase pr-1 block">الراتب الأساسي</label>
                                            <input type="number" value={formData.basicSalary} onChange={e => setFormData({...formData, basicSalary: Number(e.target.value)})} className="w-full h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 text-center font-black text-lg"/>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase pr-1 block">البدلات الخاضعة</label>
                                            <input type="number" value={formData.allowances} onChange={e => setFormData({...formData, allowances: Number(e.target.value)})} className="w-full h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 text-center font-black text-lg"/>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase pr-1 block">متوسط العمولات / المكافآت</label>
                                        <input type="number" value={formData.otherAdditions} onChange={e => setFormData({...formData, otherAdditions: Number(e.target.value)})} className="w-full h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 text-center font-bold"/>
                                    </div>
                                    <div className="p-5 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-center border border-emerald-100 dark:border-emerald-800">
                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">وعاء الاحتساب (الأجر الشامل)</p>
                                        <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{(formData.basicSalary + formData.allowances).toLocaleString()} د.ك / شهر</p>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <h4 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                                            <CalendarDaysIcon className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        تصفية الأرصدة
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase pr-1 block">الاستحقاق القانوني</label>
                                            <input type="number" value={formData.leaveEntitlement} onChange={e => setFormData({...formData, leaveEntitlement: Number(e.target.value)})} className="w-full h-10 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 text-center font-bold"/>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase pr-1 block">إجازات مستهلكة</label>
                                            <input type="number" value={formData.leaveTaken} onChange={e => setFormData({...formData, leaveTaken: Number(e.target.value)})} className="w-full h-10 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 text-center font-bold"/>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase pr-1 block">وضعية مهلة الإخطار (3 أشهر)</label>
                                        <select value={formData.noticeAction} onChange={e => setFormData({...formData, noticeAction: e.target.value as any})} className="w-full h-10 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 text-right text-sm font-bold">
                                            <option value="WorkDuringNotice">عمل خلال المهلة (لا بدل)</option>
                                            <option value="PayNoticePay">صرف بدل نقدي كامل</option>
                                            <option value="Waived">تنازل طرفين</option>
                                        </select>
                                    </div>
                                    <div className="p-5 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-center border border-indigo-100 dark:border-indigo-800">
                                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">صافي الرصيد المستحق</p>
                                        <p className="text-2xl font-black text-indigo-700 dark:text-indigo-300">{calc.leaveBalanceDays} يوم إجازة</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                <h4 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2 mb-6 text-rose-600">
                                    <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center">
                                        <XCircleIcon className="w-5 h-5 text-rose-600" />
                                    </div>
                                    جدول الاستقطاعات والديون
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase pr-1 block">سلف عمالية</label>
                                        <input type="number" value={formData.deductions} onChange={e => setFormData({...formData, deductions: Number(e.target.value)})} className="w-full h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 text-center font-black text-rose-600 text-lg"/>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase pr-1 block">أيام غياب تخصم</label>
                                        <input type="number" value={formData.absenceDays} onChange={e => setFormData({...formData, absenceDays: Number(e.target.value)})} className="w-full h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 text-center font-black text-rose-600 text-lg"/>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase pr-1 block">تأمينات اجتماعية</label>
                                        <input type="number" value={formData.socialInsuranceDeduction} onChange={e => setFormData({...formData, socialInsuranceDeduction: Number(e.target.value)})} className="w-full h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 text-center font-black text-rose-600 text-lg"/>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 sticky top-24">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 text-center">أمر صرف المستحقات المبدئي</h4>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center text-sm font-bold">
                                        <span className="text-slate-500">مكافأة الخدمة</span>
                                        <span className="text-slate-800 dark:text-white tabular-nums font-black">{calc.indemnityAmount.toLocaleString()} د.ك</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-bold">
                                        <span className="text-slate-500">بدل الإجازات</span>
                                        <span className="text-slate-800 dark:text-white tabular-nums font-black">{calc.leavePayAmount.toLocaleString()} د.ك</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-bold">
                                        <span className="text-slate-500">بدل الإنذار</span>
                                        <span className="text-slate-800 dark:text-white tabular-nums font-black">{calc.noticePeriodPay.toLocaleString()} د.ك</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-black border-t dark:border-slate-800 pt-6">
                                        <span className="text-rose-500">إجمالي الخصم</span>
                                        <span className="text-rose-600 tabular-nums">({calc.deductionsTotal.toLocaleString()}) د.ك</span>
                                    </div>
                                    <div className="p-8 bg-slate-900 rounded-[2.5rem] text-center mt-8 group relative overflow-hidden shadow-2xl">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
                                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2 relative z-10">الصافي المسلم للعامل</p>
                                        <p className="text-4xl font-black text-amber-400 tabular-nums relative z-10">{calc.netAmount.toLocaleString()} <span className="text-sm font-bold">د.ك</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            case 'result':
                return (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-10"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <SummaryCard icon={<CalculatorIcon/>} label="المكافأة" value={calc.indemnityAmount} color="indigo" />
                            <SummaryCard icon={<CalendarDaysIcon/>} label="تصفية الإجازة" value={calc.leavePayAmount} color="emerald" />
                            <SummaryCard icon={<BanknotesIcon/>} label="بدل الإخطار" value={calc.noticePeriodPay} color="amber" />
                            <SummaryCard icon={<CheckCircleIcon/>} label="صافي المستحق" value={calc.netAmount} color="rose" isNet />
                        </div>

                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                            <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
                                <div>
                                    <h4 className="font-black text-xl text-slate-800 dark:text-white">تفسير الحسبة وسند المواد</h4>
                                    <p className="text-xs font-bold text-slate-400 mt-1">توضيح المعايير المعتمدة في الحساب النهائي</p>
                                </div>
                                <Badge text="نظام كويتي معتمد" className="bg-indigo-600 text-white font-black py-2 px-5 rounded-xl" />
                            </div>
                            <div className="p-10 space-y-12">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                    <div className="space-y-6">
                                        <h5 className="font-black text-lg text-slate-800 dark:text-white border-r-4 border-indigo-600 pr-4 flex items-center gap-2">
                                            <ScaleIcon className="w-5 h-5 text-indigo-600" />
                                            مكافأة المادة 51
                                        </h5>
                                        <ul className="space-y-4">
                                            <CalculationStep label="أول 5 سنوات (15 يوم/سنة)" value={calc.indemnityBreakdown.firstFiveYearsAmount} />
                                            <CalculationStep label="ما زاد عن 5 سنوات (شهر/سنة)" value={calc.indemnityBreakdown.subsequentYearsAmount} />
                                            <CalculationStep label="سقف المادة (18 شهر)" value={calc.indemnityBreakdown.capAmount} secondary />
                                            <CalculationStep label="نسبة الاستحقاق حسب المادة 53" value={`${(calc.indemnityBreakdown.adjustmentFactor * 100).toFixed(0)}%`} isFactor />
                                        </ul>
                                    </div>
                                    <div className="space-y-6">
                                        <h5 className="font-black text-lg text-slate-800 dark:text-white border-r-4 border-emerald-600 pr-4 flex items-center gap-2">
                                            <BanknotesIcon className="w-5 h-5 text-emerald-600" />
                                            تصفية الإجازات والمستحقات
                                        </h5>
                                        <ul className="space-y-4">
                                            <CalculationStep label="أجر اليوم الواحد (أجر شامل / 26)" value={(formData.basicSalary + formData.allowances) / 26} isRate />
                                            <CalculationStep label="إجمالي الأيام المتبقية" value={calc.leaveBalanceDays} isDays />
                                            <CalculationStep label="التعويض النقدي المستحق" value={calc.leavePayAmount} />
                                            <CalculationStep label="إضافات / حوافز أخرى" value={formData.otherAdditions} />
                                        </ul>
                                    </div>
                                </div>
                                
                                <div className="pt-10 border-t dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {calc.legalArticles.map((art, idx) => (
                                        <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl space-y-3 border-r-4 border-indigo-500 shadow-sm hover:shadow-md transition-shadow">
                                            <span className="text-xs font-black bg-indigo-600 text-white px-3 py-1 rounded-full uppercase">مادة {art.article}</span>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-bold">{art.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-8 items-stretch pb-10">
                           <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                                <label className="text-sm font-black text-slate-400 uppercase tracking-widest block mb-4">مرئيات إضافية وبنود خاصة</label>
                                <textarea 
                                    className="w-full h-40 bg-slate-50 dark:bg-slate-800 border-none rounded-[2rem] p-6 text-sm text-right resize-none font-medium focus:ring-2 focus:ring-indigo-500"
                                    placeholder="أدخل أية ملاحظات قانونية، تفاصيل خصم جزائي، أو بنود اتفاق خاص لتضمينها في المستند الرسمي..."
                                    value={formData.notes}
                                    onChange={e => setFormData({...formData, notes: e.target.value})}
                                />
                           </div>
                           <div className="w-full lg:w-96 flex flex-col gap-4">
                                <Button 
                                    className="w-full h-20 rounded-[2rem] bg-[#487B75] hover:bg-[#3d6964] text-white font-black text-xl shadow-2xl shadow-[#487B75]/30 transform active:scale-95 transition-all"
                                    leftIcon={<PrinterIcon className="w-7 h-7"/>}
                                    onClick={handlePrint}
                                >
                                    إصدار وطباعة المستند
                                </Button>
                                <div className="grid grid-cols-1 gap-3">
                                    <Button 
                                        variant="outline"
                                        className="h-14 rounded-2xl border-indigo-200 text-indigo-700 font-black text-sm bg-white hover:bg-indigo-50"
                                        leftIcon={<ArrowPathIcon className="w-5 h-5"/>}
                                        onClick={handleSave}
                                    >
                                        حفظ في الأرشيف
                                    </Button>
                                    <Button 
                                        variant="ghost"
                                        className="h-14 rounded-2xl text-slate-400 hover:text-rose-600 font-bold text-sm"
                                        leftIcon={<TrashIcon className="w-5 h-5"/>}
                                        onClick={() => window.location.reload()}
                                    >
                                        إلغاء وتفريغ البيانات
                                    </Button>
                                </div>
                           </div>
                        </div>
                    </motion.div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-32 transition-colors duration-500" dir="rtl">
            <style>{PRINT_STYLES}</style>
            
            <FormalDocument />
           
            <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-8 py-6 sticky top-0 z-30 shadow-sm no-print">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/20 rotate-3">
                            <CalculatorIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">إدارة تسويات الخدمة</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge text="Kuwait Legal Engine v5.0" className="bg-slate-100 text-slate-500 text-[9px] font-black tracking-widest uppercase" />
                                <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                <span className="text-[10px] font-bold text-emerald-500">محدث وفقاً لقانون 2010</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button 
                            onClick={() => setShowSavedList(!showSavedList)}
                            className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-6 py-3 rounded-2xl text-sm font-black border border-indigo-100 dark:border-indigo-800 hover:shadow-lg transition-all flex items-center gap-3 group"
                        >
                            <HistoryIcon className="w-5 h-5 group-hover:rotate-[-45deg] transition-transform" /> 
                            السجل ({savedSettlements.length})
                        </button>
                        <button 
                            onClick={() => {
                                window.location.reload();
                            }}
                            className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-sm font-black shadow-xl shadow-slate-900/30 hover:bg-slate-800 transition-all flex items-center gap-3 active:scale-95"
                        >
                            <PlusCircleIcon className="w-5 h-5"/> تسوية جديدة
                        </button>
                    </div>
                </div>
            </header>

            <nav className="max-w-7xl mx-auto px-8 mt-12 no-print">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex justify-between items-center gap-4">
                    {STEP_TABS.map((step, idx) => (
                        <button 
                            key={step.id} 
                            disabled={idx > currentStep && !formData.employeeName}
                            onClick={() => idx <= currentStep && setCurrentStep(idx)}
                            className={`flex-1 group relative transition-all duration-500 ${idx <= currentStep ? 'opacity-100' : 'opacity-30 cursor-not-allowed'}`}
                        >
                            <div className="flex flex-col items-center gap-2 px-2 py-3 rounded-[1.5rem] transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-700 ${idx === currentStep ? 'bg-indigo-600 text-white scale-110 shadow-xl shadow-indigo-600/30' : idx < currentStep ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                    {idx < currentStep ? <CheckCircleIcon className="w-6 h-6"/> : step.icon}
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${idx === currentStep ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{step.label}</span>
                            </div>
                            {idx < STEP_TABS.length - 1 && (
                                <div className="absolute top-1/2 -left-1/2 w-full h-[1.5px] bg-slate-100 dark:bg-slate-800 -z-10 hidden lg:block">
                                    <div className={`h-full transition-all duration-1000 bg-emerald-500 ${idx < currentStep ? 'w-full' : 'w-0'}`} />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-8 mt-12 no-print">
                <AnimatePresence mode="wait">
                    <div key={currentStep}>
                        {renderStepContent()}
                    </div>
                </AnimatePresence>

                <div className="mt-16 flex justify-between items-center py-10 border-t dark:border-slate-900">
                    <Button 
                        variant="ghost" 
                        disabled={currentStep === 0} 
                        onClick={prevStep}
                        leftIcon={<ArrowLeftIcon className="w-5 h-5 rotate-180"/>}
                        className="rounded-[1.5rem] h-14 px-10 font-black text-slate-600 bg-slate-100 hover:bg-slate-200"
                    >
                        العودة للخلف
                    </Button>
                    <div className="hidden md:flex flex-col items-center">
                        <div className="flex gap-1.5 mb-2">
                            {STEP_TABS.map((_, i) => (
                                <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === currentStep ? 'w-8 bg-indigo-500' : 'w-1.5 bg-slate-200 dark:bg-slate-800'}`} />
                            ))}
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Phase {currentStep + 1} System Ready</span>
                    </div>
                    {currentStep < STEP_TABS.length - 1 ? (
                        <Button 
                            onClick={nextStep}
                            className="rounded-[1.5rem] h-14 px-12 font-black bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-2xl shadow-indigo-600/30 hover:scale-105 active:scale-95"
                            rightIcon={<ArrowLeftIcon className="w-5 h-5 transform rotate-180"/>}
                        >
                            استمرار للمرحلة التالية
                        </Button>
                    ) : (
                         <Button 
                            onClick={handlePrint}
                            className="rounded-[1.5rem] h-14 px-12 font-black bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-2xl shadow-emerald-600/30 hover:scale-105 active:scale-95"
                            leftIcon={<PrinterIcon className="w-5 h-5"/>}
                        >
                            أمر الطباعة النهائي
                        </Button>
                    )}
                </div>
            </main>

            <Modal
                isOpen={isSelectionModalOpen}
                onClose={() => setIsSelectionModalOpen(false)}
                title="اختيار موظف من السجل النشط"
                size="lg"
            >
                <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-3 custom-scrollbar">
                    {initialEmployees.map(emp => (
                        <div 
                            key={emp.id} 
                            onClick={() => handleEmployeeSelect(emp)}
                            className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] border-2 border-slate-50 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-xl cursor-pointer transition-all flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 relative shadow-inner">
                                    <img src={emp.photoUrl || `https://ui-avatars.com/api/?name=${emp.fullNameAr}&background=random`} alt={emp.fullNameAr} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-2xl"></div>
                                </div>
                                <div>
                                    <h5 className="font-black text-slate-800 dark:text-white text-lg tracking-tight group-hover:text-indigo-600 transition-colors">{emp.fullNameAr}</h5>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{emp.jobTitle}</p>
                                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                                        <p className="text-[10px] font-bold text-indigo-500">{emp.department}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-300 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-all transform group-hover:rotate-180">
                                <PlusCircleIcon className="w-5 h-5" />
                            </div>
                        </div>
                    ))}
                </div>
            </Modal>

            <Modal
                isOpen={showSavedList}
                onClose={() => setShowSavedList(false)}
                title="الأرشيف الأخير لتسويات الخدمة"
                size="xl"
            >
                <div className="p-2">
                    {savedSettlements.length === 0 ? (
                        <div className="py-24 text-center text-slate-400 space-y-6">
                             <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 mx-auto rounded-full flex items-center justify-center animate-pulse">
                                <ArchiveBoxIcon className="w-12 h-12 opacity-20" />
                             </div>
                             <div>
                                <p className="text-xs font-black uppercase tracking-[0.3em] opacity-40">Database Empty</p>
                                <p className="text-sm font-bold mt-2">لا توجد سجلات محفوظة مؤخراً في هذا النظام.</p>
                             </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                            {savedSettlements.map(s => (
                                <div key={s.id} className="bg-white dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-700 p-8 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all relative group overflow-hidden">
                                     <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform"></div>
                                     <div className="flex justify-between items-start mb-6">
                                         <div>
                                            <h6 className="font-black text-slate-800 dark:text-white text-xl tracking-tight">{s.employeeName}</h6>
                                            <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">{s.employeeId}</p>
                                         </div>
                                         <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
                                     </div>
                                     <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-6 pb-6 border-b border-dashed dark:border-slate-700">
                                         <div className="flex flex-col gap-1">
                                            <span className="text-slate-300">تاريخ الاعتماد</span>
                                            <span className="font-mono text-slate-800 dark:text-slate-300">{s.settlementDate}</span>
                                         </div>
                                         <div className="flex flex-col gap-1">
                                            <span className="text-slate-300">فترة الخدمة</span>
                                            <span className="font-black text-indigo-600">{s.serviceYears}Y {s.serviceMonths}M</span>
                                         </div>
                                     </div>
                                     <div className="flex justify-between items-center">
                                         <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">صافي الصرف</p>
                                            <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{s.netPayable.toLocaleString()} <span className="text-[10px]">د.ك</span></p>
                                         </div>
                                         <div className="flex gap-2">
                                             <button className="w-10 h-10 bg-slate-50 dark:bg-slate-700 rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center"><EyeIcon className="w-5 h-5" /></button>
                                             <button className="w-10 h-10 bg-slate-50 dark:bg-slate-700 rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center"><PrinterIcon className="w-5 h-5" /></button>
                                         </div>
                                     </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Modal>

            {/* --- ACTUAL PRINTABLE DOCUMENT --- */}
            <div id="printable-eos" className="print-only hidden p-10 bg-white min-h-screen text-slate-900 font-sans" dir="rtl">
                <PrintHeader 
                    title="كشف تسوية مستحقات نهاية الخدمة" 
                    subtitle="محرر وفقاً للقانون رقم 6 لسنة 2010 بشأن العمل بالقطاع الأهلي" 
                />
                
                <div className="grid grid-cols-2 gap-x-12 gap-y-6 mb-10 border-[1.5px] border-slate-400 p-8 rounded-2xl bg-slate-50/20">
                    <PrintInfo label="اسم الموظف" value={formData.employeeName} />
                    <PrintInfo label="الرقم المدني" value={formData.employeeCivilId} />
                    <PrintInfo label="المسمى الوظيفي" value={formData.jobTitle} />
                    <PrintInfo label="الجنسية" value={formData.nationality} />
                    <PrintInfo label="تاريخ التعيين" value={formData.joiningDate} />
                    <PrintInfo label="تاريخ ترك العمل" value={formData.lastWorkingDay} />
                    <PrintInfo label="إجمالي مدة الخدمة" value={`${calc.serviceYears} سنة ، ${calc.serviceMonths} شهر ، ${calc.serviceDays} يوم`} />
                    <PrintInfo label="سبب انتهاء الخدمة" value={terminationReasonKuwaitOptions.find(p => p.value === formData.terminationReason)?.label} />
                </div>

                <div className="space-y-8">
                    <div>
                        <h3 className="text-xl font-black border-r-8 border-slate-900 pr-4 mb-6">أولاً: بنود الاستحقاق المالي (Credits)</h3>
                        <table className="doc-modern-table shadow-sm">
                            <thead>
                                <tr>
                                    <th className="w-[30%]">بند الاستحقاق</th>
                                    <th>طريقة الاحتساب / السند القانوني</th>
                                    <th className="w-[20%]">المبلغ (د.ك)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="font-bold">مكافأة نهاية الخدمة المنصوص عليها</td>
                                    <td>احتساب المادة 51 (15 يوم/سنة لـ 5 سنوات ، شهر للمتبقي) بنسبة {Math.round(calc.indemnityBreakdown.adjustmentFactor * 100)}%</td>
                                    <td className="text-center font-black tracking-tight">{calc.indemnityAmount.toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td className="font-bold">تصفية رصيد الإجازات السنوية</td>
                                    <td>رصيد متراكم ({calc.leaveBalanceDays} يوم) - المواد 70 و79 من القانون</td>
                                    <td className="text-center font-black tracking-tight">{calc.leavePayAmount.toLocaleString()}</td>
                                </tr>
                                {calc.noticePeriodPay > 0 && (
                                    <tr>
                                        <td className="font-bold">بدل مهلة الإخطار (الإنذار)</td>
                                        <td>تعويض المادة 44 عن عدم منح مهلة الإخطار (3 أشهر)</td>
                                        <td className="text-center font-black tracking-tight">{calc.noticePeriodPay.toLocaleString()}</td>
                                    </tr>
                                )}
                                {formData.otherAdditions > 0 && (
                                    <tr>
                                        <td className="font-bold">إضافات أخرى / مكافآت معتمدة</td>
                                        <td>عمولات، حوافز، أو أجور متأخرة</td>
                                        <td className="text-center font-black tracking-tight">{formData.otherAdditions.toLocaleString()}</td>
                                    </tr>
                                )}
                                <tr className="bg-slate-100 font-black text-lg">
                                    <td colSpan={2} className="text-left font-black">إجمالي المستحقات (A)</td>
                                    <td className="text-center underline underline-offset-4 decoration-2">{calc.additionsTotal.toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div>
                        <h3 className="text-xl font-black border-r-8 border-slate-900 pr-4 mb-6">ثانياً: بنود الاستقطاع والمديونية (Debits)</h3>
                        <table className="doc-modern-table shadow-sm">
                            <thead>
                                <tr>
                                    <th className="w-[30%]">بند الاستقطاع</th>
                                    <th>سبب الخصم / السند</th>
                                    <th className="w-[20%]">المبلغ (د.ك)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="font-bold">سلف وقروض عمالية شخصية</td>
                                    <td>مبالغ تم استلامها مقدماً ولم تسدد</td>
                                    <td className="text-center font-bold">{formData.deductions.toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td className="font-bold">خصم أيام الغياب والجزاءات</td>
                                    <td>غياب بدون عذر ({formData.absenceDays} يوم) - المادة 35</td>
                                    <td className="text-center font-bold">{(calc.deductionsTotal - formData.deductions - formData.socialInsuranceDeduction).toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td className="font-bold">اشتراكات التأمينات الاجتماعية</td>
                                    <td>حصة المؤمن عليه المحصلة لصالح المؤسسة العامة للتأمينات</td>
                                    <td className="text-center font-bold">{formData.socialInsuranceDeduction.toLocaleString()}</td>
                                </tr>
                                <tr className="bg-slate-100 font-black text-lg">
                                    <td colSpan={2} className="text-left font-black">إجمالي المستقطعات (B)</td>
                                    <td className="text-center text-rose-800">({calc.deductionsTotal.toLocaleString()})</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="my-10 p-10 border-[6px] border-double border-slate-900 text-center bg-slate-50/30 rounded-3xl">
                        <p className="text-2xl font-black mb-4 tracking-tight">صافي المبلغ المستحق النهائي (A - B)</p>
                        <p className="text-6xl font-black text-slate-900 tracking-tighter">
                            {calc.netAmount.toLocaleString()} <span className="text-2xl">دينار كويتي فقط لا غير</span>
                        </p>
                        <p className="text-sm font-bold text-slate-500 mt-6 italic">هذا المبلغ يمثل كامل التصفية النهائية لعلاقة العمل حتى تاريخ ترك الموظف لعمله.</p>
                    </div>

                    <div className="page-break"></div>

                    <div className="mt-20 p-12 border-[1.5px] border-slate-400 rounded-3xl bg-white shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-full h-3 bg-slate-900"></div>
                        <h2 className="text-4xl font-black text-center mb-12 text-slate-900 tracking-tighter">إقرار استلام نهائي وبراءة ذمة شاملة</h2>
                        <div className="space-y-10">
                            <p className="text-xl leading-[2.4] font-bold text-slate-900 text-justify">
                                أقر أنا الموظف/ <strong>{formData.employeeName}</strong>، حامل البطاقة المدنية رقم: <strong>{formData.employeeCivilId}</strong>، وبكامل إرادتي ومسؤوليتي القانونية، بأنني قد تسلمت من <strong>{OFFICE_NAME}</strong> كافة مستحقاتي العمالية المتعلقة بفترة خدمتي الموضحة أعلاه، وذلك بالسداد (نقداً / شيك رقم: ........... / تحويل بنكي)، ويشمل ذلك مكافأة نهاية الخدمة، تصفية الإجازات، مهلة الإخطار، وكافة الأجور والبدلات.
                                <br/><br/>
                                وبناءً عليه وبموجب هذا الإقرار، أبرئ ذمة <strong>{OFFICE_NAME}</strong> وأصحابها براءة ذمة شاملة كاملة وعامة من أي حقوق أو مطالبات مالية أو عمالية من أي نوع كان، حالية أو مستقبيلة، ناتجة عن علاقة العمل والخدمة أو إنهائها، بما في ذلك أي تعويضات قانونية أو قضائية، مسقطاً لكافة أوجه الطعن والمطالبة أمام القضاء الكويتي بكافة درجاته.
                            </p>

                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 mt-16 no-print-grid">
                                <div className="space-y-4">
                                    <p className="font-black text-center text-[13px] bg-slate-900 text-white py-2 rounded-lg">توقيع الموظف (المقر بما فيه)</p>
                                    <div className="print-signature-box flex flex-col justify-between h-[120px] bg-white border-2 border-slate-900">
                                        <div className="flex justify-between items-start">
                                            <p className="text-[10px] text-slate-400 font-bold">التوقيع / البصمة:</p>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-black border-t pt-2">
                                            <span>الاسم: {formData.employeeName}</span>
                                            <span>التاريخ: {format(new Date(), 'yyyy/MM/dd')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="font-black text-center text-[13px] bg-slate-100 text-slate-900 py-2 rounded-lg border border-slate-900">اعتماد الإدارة المالية</p>
                                    <div className="print-signature-box flex flex-col justify-between h-[120px] bg-white border-2 border-slate-900">
                                        <div className="flex justify-between items-start">
                                            <p className="text-[10px] text-slate-400 font-bold">مراجعة الحسابات:</p>
                                        </div>
                                        <div className="h-px bg-slate-100 mt-auto w-full"></div>
                                        <div className="text-[10px] font-black text-center pb-2">سند صرف معتمد</div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="font-black text-center text-[13px] bg-slate-100 text-slate-900 py-2 rounded-lg border border-slate-900">اعتماد الشؤون القانونية</p>
                                    <div className="print-signature-box flex flex-col justify-between h-[120px] bg-white border-2 border-slate-900">
                                        <div className="flex justify-between items-start">
                                            <p className="text-[10px] text-slate-400 font-bold">المراجعة القانونية:</p>
                                        </div>
                                        <div className="h-px bg-slate-100 mt-auto w-full"></div>
                                        <div className="text-[10px] font-black text-center pb-2">مطابق لقانون العمل</div>
                                    </div>
                                </div>

                                <div className="space-y-4 lg:col-span-2">
                                    <p className="font-black text-center text-[13px] bg-slate-100 text-slate-900 py-2 rounded-lg border border-slate-900">المدير العام / المفوض بالتوقيع</p>
                                    <div className="print-signature-box flex flex-col justify-between h-[120px] bg-white border-2 border-slate-900">
                                        <div className="flex justify-between items-start">
                                            <p className="text-[10px] text-slate-400 font-bold">الاعتماد النهائي:</p>
                                        </div>
                                        <div className="h-px bg-slate-100 mt-auto w-full"></div>
                                        <div className="text-[10px] font-black text-center pb-2">يعتمد الصرف والمخالصة</div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="font-black text-center text-[13px] bg-slate-100 text-slate-900 py-2 rounded-lg border border-slate-900">الختم الرسمي</p>
                                    <div className="print-signature-box flex flex-col items-center justify-center border-dashed opacity-40 h-[120px]">
                                        <BuildingOffice2Icon className="w-12 h-12 text-slate-300" />
                                        <p className="text-[7px] font-black uppercase mt-2 tracking-[0.4em]">Official Company Seal</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-24 pt-10 border-t-2 border-slate-100 flex justify-between text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">
                            <span>System Auth: {calc.netAmount.toString(16).toUpperCase()}V9</span>
                            <span>ADALA ERP : END OF SERVICE MODULE V5.0</span>
                            <span>Doc Ref: {Math.random().toString(36).substring(7).toUpperCase()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Helper Components ---
const SummaryCard = ({ icon, label, value, color, isNet = false }: { icon: any, label: string, value: number, color: string, isNet?: boolean }) => {
    const colors: Record<string, string> = {
        indigo: 'bg-white text-slate-900 border-indigo-100 border-b-indigo-500',
        emerald: 'bg-white text-slate-900 border-emerald-100 border-b-emerald-500',
        amber: 'bg-white text-slate-900 border-amber-100 border-b-amber-500',
        rose: 'bg-slate-900 text-white dark:bg-slate-800'
    };

    return (
        <div className={`p-8 rounded-[2.5rem] border-2 ${colors[color]} shadow-md space-y-5 flex flex-col items-center justify-center text-center group transition-all hover:translate-y-[-8px] hover:shadow-2xl`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${isNet ? 'bg-white/10' : 'bg-slate-50 dark:bg-slate-900'}`}>
                {React.cloneElement(icon as React.ReactElement, { className: `w-7 h-7 ${isNet ? 'text-white' : ''}` } as any)}
            </div>
            <div>
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${isNet ? 'text-slate-400' : 'text-slate-400'}`}>{label}</p>
                <p className="text-2xl font-black tabular-nums tracking-tighter">{value.toLocaleString()} <span className="text-[10px] font-black opacity-40">د.ك</span></p>
            </div>
        </div>
    );
};

const CalculationStep = ({ label, value, secondary = false, isRate = false, isFactor = false, isDays = false }: { label: string, value: any, secondary?: boolean, isRate?: boolean, isFactor?: boolean, isDays?: boolean }) => (
    <li className="flex justify-between items-center text-sm border-b border-slate-50 dark:border-slate-800 pb-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 px-2 rounded-lg transition-colors">
        <span className={`${secondary ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'} font-bold`}>{label}</span>
        <span className={`font-black tabular-nums tracking-tight ${secondary ? 'text-slate-400 italic' : 'text-slate-900 dark:text-white'}`}>
            {isFactor ? value : isRate ? `${(value as number).toLocaleString()} د.ك` : isDays ? `${value} يوم` : `${(value as number).toLocaleString()} د.ك`}
        </span>
    </li>
);

const PrintInfo = ({ label, value }: { label: string, value: any }) => (
    <div className="flex flex-col gap-1 pr-4 border-r-2 border-slate-200">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</span>
        <span className="text-sm font-black text-slate-900 leading-tight">{value || '-'}</span>
    </div>
);

export default EndOfServicePage;
