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
    CurrencyDollarIcon, LinkIcon, PlusCircleIcon, PencilIcon, TrashIcon, 
    EyeIcon, PrinterIcon, ArrowDownTrayIcon, MagnifyingGlassIcon,
    UsersIcon, BanknotesIcon, ArrowPathIcon, CheckCircleIcon, ChartBarIcon
} from '../constants';

// --- Interfaces ---
interface PayrollItem {
    id: string;
    employeeName: string;
    civilId: string;
    nationality: 'Kuwaiti' | 'Expats';
    pifssRegistered: boolean;
    baseSalary: number;
    allowanceHousing: number;
    allowanceTransport: number;
    allowanceSpecial: number; // e.g. advocate rating, mobile
    bonusMonthly: number;
    deductionGeneral: number;
    deductionLoanRepayment: number; // Outstanding loan installment
    notes: string;
}

const initialPayroll: PayrollItem[] = [
    {
        id: 'pay-1',
        employeeName: 'أديب فواز عبدالجليل',
        civilId: '292051201994',
        nationality: 'Kuwaiti',
        pifssRegistered: true,
        baseSalary: 1400,
        allowanceHousing: 200,
        allowanceTransport: 100,
        allowanceSpecial: 150,
        bonusMonthly: 120,
        deductionGeneral: 0,
        deductionLoanRepayment: 100, // Loan
        notes: 'علاوة تخصص + مكافأة قضية كبرى منجزة'
    },
    {
        id: 'pay-2',
        employeeName: 'سحر بدر العجمي',
        civilId: '295110800344',
        nationality: 'Kuwaiti',
        pifssRegistered: true,
        baseSalary: 1850,
        allowanceHousing: 250,
        allowanceTransport: 150,
        allowanceSpecial: 200,
        bonusMonthly: 0,
        deductionGeneral: 35,
        deductionLoanRepayment: 0,
        notes: 'خصم غياب يوم مكرر معتمد قانوناً'
    },
    {
        id: 'pay-3',
        employeeName: 'موهيت كابور',
        civilId: '298111204859',
        nationality: 'Expats',
        pifssRegistered: false,
        baseSalary: 750,
        allowanceHousing: 150,
        allowanceTransport: 75,
        allowanceSpecial: 50,
        bonusMonthly: 40,
        deductionGeneral: 0,
        deductionLoanRepayment: 50,
        notes: 'بدل هاتف نقال + قسط السلفة الأول'
    },
    {
        id: 'pay-4',
        employeeName: 'أشرف محمود رضوان',
        civilId: '289121509412',
        nationality: 'Expats',
        pifssRegistered: false,
        baseSalary: 1200,
        allowanceHousing: 200,
        allowanceTransport: 100,
        allowanceSpecial: 100,
        bonusMonthly: 150,
        deductionGeneral: 0,
        deductionLoanRepayment: 0,
        notes: 'مكافأة الاستقطابات السنوية'
    }
];

const PayrollManagementPage: React.FC = () => {
    const [language, setLanguage] = useState<'ar' | 'en'>('ar');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'statement' | 'wps'>('statement');
    
    // --- State Management ---
    const [payroll, setPayroll] = useState<PayrollItem[]>(() => {
        const stored = localStorage.getItem('alwagayan_employee_payroll');
        return stored ? JSON.parse(stored) : initialPayroll;
    });

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingPayroll, setEditingPayroll] = useState<Partial<PayrollItem> | null>(null);
    const [selectedPayrollItem, setSelectedPayrollItem] = useState<PayrollItem | null>(null);
    const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);

    // Save state
    useEffect(() => {
        localStorage.setItem('alwagayan_employee_payroll', JSON.stringify(payroll));
    }, [payroll]);

    // Calculate wages
    const calculateGross = (item: PayrollItem) => {
        return item.baseSalary + item.allowanceHousing + item.allowanceTransport + item.allowanceSpecial + item.bonusMonthly;
    };

    const calculatePifssDeduction = (item: PayrollItem) => {
        if (item.nationality === 'Kuwaiti' && item.pifssRegistered) {
            // Under Kuwait law: Employee share is approx 10.5% - 11.5% of salary capped at 3000 KWD
            const capSalary = Math.min(item.baseSalary, 3000);
            return Math.round(capSalary * 0.11); // Standardized 11% employee contribution
        }
        return 0;
    };

    const calculatePifssEmployerShare = (item: PayrollItem) => {
        if (item.nationality === 'Kuwaiti' && item.pifssRegistered) {
            // Employer share is approx 12.5% of capped salary
            const capSalary = Math.min(item.baseSalary, 3000);
            return Math.round(capSalary * 0.125); 
        }
        return 0;
    };

    const calculateNet = (item: PayrollItem) => {
        const gross = calculateGross(item);
        const pifss = calculatePifssDeduction(item);
        return gross - pifss - item.deductionGeneral - item.deductionLoanRepayment;
    };

    // Filters
    const filteredPayroll = useMemo(() => {
        return payroll.filter(p => {
            const term = searchTerm.toLowerCase();
            return (
                p.employeeName.toLowerCase().includes(term) ||
                p.civilId.includes(term) ||
                p.notes.toLowerCase().includes(term)
            );
        });
    }, [payroll, searchTerm]);

    const stats = useMemo(() => {
        let totalBaseSum = 0;
        let totalGrossSum = 0;
        let totalPifssSum = 0;
        let totalNetSum = 0;
        let totalDeductions = 0;

        payroll.forEach(item => {
            totalBaseSum += item.baseSalary;
            totalGrossSum += calculateGross(item);
            totalPifssSum += calculatePifssDeduction(item);
            totalNetSum += calculateNet(item);
            totalDeductions += item.deductionGeneral + item.deductionLoanRepayment;
        });

        return {
            base: totalBaseSum,
            gross: totalGrossSum,
            pifss: totalPifssSum,
            pifssEmployer: payroll.reduce((acc, current) => acc + calculatePifssEmployerShare(current), 0),
            net: totalNetSum,
            deductions: totalDeductions
        };
    }, [payroll]);

    const translate = (ar: string, en: string) => {
        return language === 'ar' ? ar : en;
    };

    const handleSavePayroll = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPayroll) return;

        if (editingPayroll.id) {
            setPayroll(prev => prev.map(p => p.id === editingPayroll.id ? (editingPayroll as PayrollItem) : p));
        } else {
            const newItem: PayrollItem = {
                ...(editingPayroll as PayrollItem),
                id: 'pay-' + Date.now(),
                deductionGeneral: editingPayroll.deductionGeneral || 0,
                deductionLoanRepayment: editingPayroll.deductionLoanRepayment || 0,
                bonusMonthly: editingPayroll.bonusMonthly || 0
            };
            setPayroll(prev => [newItem, ...prev]);
        }
        setIsFormModalOpen(false);
        setEditingPayroll(null);
    };

    const handleDeletePayroll = (id: string) => {
        if (confirm(language === 'ar' ? 'هل أنت متأكد من حذف تفاصيل الراتب هذه لجميع الشهور القادمة؟' : 'Are you sure you want to delete this payroll slot?')) {
            setPayroll(prev => prev.filter(p => p.id !== id));
        }
    };

    const handleSyncDeductions = () => {
        let loanCount = 0;
        let discCount = 0;

        // Fetch loans
        const storedLoans = localStorage.getItem('alwagayan_loans');
        const loansList = storedLoans ? JSON.parse(storedLoans) : [];

        // Fetch disciplinary logs
        const storedDisc = localStorage.getItem('alwagayan_disciplinary');
        const discList = storedDisc ? JSON.parse(storedDisc) : [];

        const updatedPayroll = payroll.map(p => {
            let loanDeduction = p.deductionLoanRepayment;
            let generalDeduction = p.deductionGeneral;

            // Find active loans matching employee
            const empLoans = loansList.filter((l: any) => 
                (l.employeeName && l.employeeName.trim() === p.employeeName.trim()) && 
                (l.status === 'Active' || l.status === 'معتمد')
            );

            if (empLoans.length > 0) {
                const totalInstallment = empLoans.reduce((sum: number, l: any) => sum + (Number(l.installment || l.monthlyInstallment) || 0), 0);
                if (totalInstallment > 0) {
                    loanDeduction = totalInstallment;
                    loanCount++;
                }
            }

            // Find disciplinary deduction
            const empDiscs = discList.filter((d: any) => 
                (d.employeeName && d.employeeName.trim() === p.employeeName.trim()) &&
                (d.status === 'Approved' || d.status === 'معتمد وساري الصرف والخصم')
            );

            if (empDiscs.length > 0) {
                // calculate daily rate = baseSalary / 26
                const dailyRate = p.baseSalary / 26;
                const totalDiscDays = empDiscs.reduce((sum: number, d: any) => sum + (Number(d.deductionDays) || 1), 0);
                generalDeduction = Math.round(dailyRate * Math.min(totalDiscDays, 5)); // max 5 days according to Article 60
                discCount++;
            }

            return {
                ...p,
                deductionLoanRepayment: loanDeduction,
                deductionGeneral: generalDeduction
            };
        });

        setPayroll(updatedPayroll);
        alert(`تمت المزامنة بنجاح!\n- تم تحديث اقتطاعات القروض لعدد (${loanCount}) موظف.\n- تم ربط الجزاءات والخصم التأديبي لعدد (${discCount}) موظف بموجب المادة 60 من قانون العمل.`);
    };

    const handleExportCSV = () => {
        const headers = ['اسم الموظف', 'الرقم المدني', 'الجنسية', 'التأمينات الاجتماعية', 'الراتب الأساسي', 'بدل السكن', 'بدل المواصلات', 'بدلات أخرى', 'مكافآت', 'خصم التأمينات', 'خصم القروض', 'خصومات أخرى', 'الصافي'];
        const rows = payroll.map(item => [
            item.employeeName,
            item.civilId,
            item.nationality === 'Kuwaiti' ? 'كويتي' : 'وافد',
            item.pifssRegistered ? 'مسجل' : 'غير مسجل',
            item.baseSalary,
            item.allowanceHousing,
            item.allowanceTransport,
            item.allowanceSpecial,
            item.bonusMonthly,
            calculatePifssDeduction(item),
            item.deductionLoanRepayment,
            item.deductionGeneral,
            calculateNet(item)
        ]);

        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `payroll_export_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrintPayslip = (item: PayrollItem) => {
        setSelectedPayrollItem(item);
        setIsPayslipModalOpen(true);
    };

    return (
        <div className="space-y-8 pb-20 font-sans" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            
            {/* 1. Payslip PRINT LAYOUT ONLY */}
            {selectedPayrollItem && isPayslipModalOpen && (
                <div className="hidden print-only-container print:block bg-white p-10 text-black text-[9.5px] leading-relaxed" style={{ direction: 'rtl' }}>
                    <div className="border-b-4 border-slate-900 pb-4 mb-6 flex justify-between items-start text-right">
                        <div>
                            <h1 className="text-xs font-black">مكتب الوجيان والروضان للمحاماة والاستشارات القانونية</h1>
                            <p className="text-[9px] text-slate-505 font-bold">بوابة حماية الأجور والمسيرات المالية - دولة الكويت</p>
                        </div>
                        <div className="text-left font-mono text-[9px]">
                            <p>مسند الراتب: شهري / الرواتب العامة</p>
                            <p>كشف لشهر: {new Date().toLocaleString('ar-KW', { month: 'long', year: 'numeric' })}</p>
                        </div>
                    </div>

                    <div className="text-center my-6">
                        <h2 className="text-sm font-black border-y border-slate-800 py-1.5 inline-block px-10">كشف مفردات راتب معتمد (Payslip Statement)</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6 text-xs bg-slate-50 p-4 rounded-xl border">
                        <p><strong>اسم الموظف:</strong> {selectedPayrollItem.employeeName}</p>
                        <p><strong>البطاقة المدنية:</strong> {selectedPayrollItem.civilId}</p>
                        <p><strong>الجنسية:</strong> {selectedPayrollItem.nationality === 'Kuwaiti' ? 'كويتي' : 'وافد / إقامة مادة 18'}</p>
                        <p><strong>المؤسسة العامة للتأمينات (PIFSS):</strong> {selectedPayrollItem.nationality === 'Kuwaiti' && selectedPayrollItem.pifssRegistered ? 'مسجل ومشترك نشط' : 'غير كويتي (معفى)'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mt-6">
                        {/* Additions */}
                        <div className="space-y-3">
                            <h3 className="text-[10px] font-black border-b pb-1 text-slate-800">مستحقات وعلاوات الطرف الثاني</h3>
                            <div className="space-y-1.5 font-semibold text-slate-700">
                                <div className="flex justify-between">
                                    <span>الراتب الأساسي التعاقدي:</span>
                                    <span className="font-mono">{selectedPayrollItem.baseSalary} د.ك</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>بدل السكن المعتمد:</span>
                                    <span className="font-mono">+{selectedPayrollItem.allowanceHousing} د.ك</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>بدل الانتقال المعتمد:</span>
                                    <span className="font-mono">+{selectedPayrollItem.allowanceTransport} د.ك</span>
                                </div>
                                <div className="flex justify-between text-indigo-700">
                                    <span>بدل طبيعة تخصص أو علاوة إضافية:</span>
                                    <span className="font-mono">+{selectedPayrollItem.allowanceSpecial} د.ك</span>
                                </div>
                                <div className="flex justify-between text-emerald-700">
                                    <span>حوافز ومكافآت شهرية إضافية:</span>
                                    <span className="font-mono">+{selectedPayrollItem.bonusMonthly} د.ك</span>
                                </div>
                                <div className="border-t pt-1.5 flex justify-between font-black text-slate-900">
                                    <span>إجمالي مستحقات الدورة (Gross):</span>
                                    <span className="font-mono">{calculateGross(selectedPayrollItem)} د.ك</span>
                                </div>
                            </div>
                        </div>

                        {/* Deductions */}
                        <div className="space-y-3">
                            <h3 className="text-[10px] font-black border-b pb-1 text-slate-800">خصومات واقتطاعات الدورة المالية</h3>
                            <div className="space-y-1.5 font-semibold text-slate-700">
                                <div className="flex justify-between text-rose-700">
                                    <span>اقتطاع التأمينات (Employee PIFSS Share):</span>
                                    <span className="font-mono">-{calculatePifssDeduction(selectedPayrollItem)} د.ك</span>
                                </div>
                                <div className="flex justify-between text-rose-700">
                                    <span>تسديد الأقساط وسلفة الموظف:</span>
                                    <span className="font-mono">-{selectedPayrollItem.deductionLoanRepayment} د.ك</span>
                                </div>
                                <div className="flex justify-between text-rose-700">
                                    <span>خصم غيابات أو جزاءات إدارية:</span>
                                    <span className="font-mono">-{selectedPayrollItem.deductionGeneral} د.ك</span>
                                </div>
                                <div className="border-t pt-1.5 flex justify-between font-black text-slate-900">
                                    <span>إجمالي المقتطعات الإدارية:</span>
                                    <span className="font-mono">{calculatePifssDeduction(selectedPayrollItem) + selectedPayrollItem.deductionLoanRepayment + selectedPayrollItem.deductionGeneral} د.ك</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 bg-slate-900 text-white p-4 rounded-xl flex justify-between items-center text-xs font-black">
                        <span>صافي الراتب المستحق للتحويل (NET PAYOUT):</span>
                        <span className="font-mono text-sm">{calculateNet(selectedPayrollItem)} د.ك (فقط لا غير)</span>
                    </div>

                    {selectedPayrollItem.notes && (
                        <div className="mt-4 text-[9px] text-slate-500 font-bold border-t pt-2">
                            * ملاحظات الصرف: {selectedPayrollItem.notes}
                        </div>
                    )}

                    {/* Sign panels */}
                    <div className="mt-14 grid grid-cols-2 gap-8 text-center text-[9px] pt-4 border-t">
                        <div>
                            <p className="font-bold text-slate-500">توقيع الموظف المستلم بالقبول</p>
                            <div className="h-10"></div>
                            <p className="font-black text-slate-800">{selectedPayrollItem.employeeName}</p>
                        </div>
                        <div className="relative">
                            <p className="font-bold text-slate-500">الstamp الرسمي ومصادقة الموارد المالية</p>
                            <div className="h-10 flex items-center justify-center relative">
                                <div className="absolute border-2 border-red-500/20 rounded-full w-20 h-20 flex items-center justify-center rotate-12 -top-5 mx-auto left-0 right-0">
                                    <span className="text-[7px] text-red-500/50 leading-tight">الوجيان والروضان<br/>محامون ومستشارون<br/>الكويت</span>
                                </div>
                            </div>
                            <p className="font-black text-slate-800">صبري شطا - مدير الحسابات والكوادر</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Payslip Interactive Dialog */}
            {selectedPayrollItem && isPayslipModalOpen && (
                <Modal isOpen={isPayslipModalOpen} onClose={() => setIsPayslipModalOpen(false)} title={translate('شهادة راتب وقسيمة الصرف المعتمدة للموظف', 'Payslip Certificate & Payout Statement')} size="xl">
                    <div className="p-4 space-y-6 text-start no-print font-sans">
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-150 font-mono text-xs text-slate-700 leading-relaxed max-h-[380px] overflow-y-auto">
                            <h4 className="font-black border-b pb-3 mb-3 text-slate-800">بيانات كشف المستحقات الشهري | الموظف: {selectedPayrollItem.employeeName}</h4>
                            <p className="mb-1.5"><strong>إجمالي الراتب والبدلات (Gross):</strong> {calculateGross(selectedPayrollItem)} KWD</p>
                            <p className="mb-1.5"><strong>اقتطاع التأمينات (Employee PIFSS Deduction):</strong> -{calculatePifssDeduction(selectedPayrollItem)} KWD</p>
                            <p className="mb-1.5"><strong>خصم أقساط وسلف (Advances Deduction):</strong> -{selectedPayrollItem.deductionLoanRepayment} KWD</p>
                            <p className="mb-1.5"><strong>خصومات عامة:</strong> -{selectedPayrollItem.deductionGeneral} KWD</p>
                            <p className="mb-1.5 text-indigo-700 font-bold"><strong>الصافي الفعلي المحال للبنك (Net):</strong> {calculateNet(selectedPayrollItem)} KWD</p>
                            <div className="bg-indigo-50 text-indigo-800 p-3 rounded-xl border border-indigo-200 mt-4 text-[11px] font-black">
                                {language === 'ar' ? 'كشف الراتب يوضح اقتطاع التأمينات الاجتماعية بالكامل للمواطن الكويتي مع احتساب السلف والخصومات بدقة.' : 'The payslip details exact deductions, including national PIFSS allocations if active.'}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button size="sm" onClick={() => window.print()} leftIcon={<PrinterIcon className="w-4 h-4" />}>
                                {translate('اطبع كشف الرواتب المعتمد', 'Print Official Payslip')}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setIsPayslipModalOpen(false)}>
                                {translate('إلغاء المعاينة', 'Cancel')}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* MAIN HEADER PANEL */}
            <PrintHeader title="مسير الرواتب المعتمد وبوابة حماية الأجور بمكتب المحاماة" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 no-print">
                
                {/* Visual Top Panel */}
                <div className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-xl shadow-primary/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1.5 print:hidden">
                                <Link to="/employee-affairs" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold flex items-center gap-1">
                                    <span>شؤون الموظفين</span>
                                </Link>
                                <span className="text-xs text-slate-300">/</span>
                                <span className="text-xs text-slate-400 font-bold">بوابة الرواتب والأجور</span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 bg-indigo-600 rounded-xl text-white">
                                    <BanknotesIcon className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-black uppercase text-indigo-700 tracking-wider">Wage Protection & Payroll Hub</span>
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 mb-1">
                                رواتب الموظفين <span className="text-indigo-650">والأجور والبدلات</span>
                            </h1>
                            <p className="text-xs text-slate-500 font-bold">
                                بوابتك لإدارة مسير الرواتب الشهري الموحد (Payroll Statement)، واقتطاع التأمينات الاجتماعية (PIFSS) للمواطنين الكويتيين، وتنزيل ملفات حماية الأجور (WPS-Bank transfer file).
                            </p>
                        </div>

                        <div className="flex bg-slate-100 p-1 rounded-xl shrink-0 w-full md:w-auto justify-between">
                            <button 
                                onClick={() => setActiveTab('statement')}
                                className={`flex-1 md:flex-none py-2 px-5 rounded-lg text-xs font-black transition-all ${activeTab === 'statement' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-850'}`}
                            >
                                {translate('مسير وملخص الرواتب', 'Payroll Register')}
                            </button>
                            <button 
                                onClick={() => setActiveTab('wps')}
                                className={`flex-1 md:flex-none py-2 px-5 rounded-lg text-xs font-black transition-all ${activeTab === 'wps' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-850'}`}
                            >
                                {translate('ملف حماية الأجور WPS', 'WPS Export')}
                            </button>
                            <button 
                                onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                                className="p-2 bg-white text-indigo-650 rounded-lg font-bold text-[10px] hover:bg-slate-50 transition-colors shrink-0 ml-1"
                            >
                                {language === 'ar' ? 'EN' : 'AR'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- Bento Grid Stat Widgets --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                            <UsersIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-slate-400 text-[10px] font-black block">{translate('إجمالي المستفيدين', 'Total Payout staff')}</span>
                            <span className="text-xl font-black text-slate-900 font-sans tracking-tight">{payroll.length} {translate('موظف', 'Staff')}</span>
                        </div>
                    </Card>
                    <Card className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                            <CurrencyDollarIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-slate-400 text-[10px] font-black block">{translate('صافي الرواتب الإجمالي', 'Total Net Payout')}</span>
                            <span className="text-xl font-black text-slate-900 font-sans tracking-tight">{stats.net.toLocaleString()} د.ك</span>
                        </div>
                    </Card>
                    <Card className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-650">
                            <LinkIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-slate-400 text-[10px] font-black block">{translate('إجمالي حصة التأمينات الـ PIFSS', 'PIFSS Contributions')}</span>
                            <span className="text-xl font-black text-indigo-650 font-sans tracking-tight">{(stats.pifss + stats.pifssEmployer).toLocaleString()} د.ك</span>
                            <span className="text-[9px] text-slate-400 block font-semibold">{translate(`حصة الموظف: ${stats.pifss} د.ك`, `Employee share: ${stats.pifss} KWD`)}</span>
                        </div>
                    </Card>
                    <Card className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-rose-50 rounded-2xl text-rose-600">
                            <TrashIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-slate-400 text-[10px] font-black block">{translate('إجمالي خصومات الدورة', 'Total Deductions')}</span>
                            <span className="text-xl font-black text-rose-600 font-sans tracking-tight">{stats.deductions} د.ك</span>
                        </div>
                    </Card>
                </div>

                {/* Statement table tab */}
                <AnimatePresence mode="wait">
                    {activeTab === 'statement' ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            key="statement-tab"
                            className="space-y-6"
                        >
                            {/* Controller bar */}
                            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                                <div className="relative w-full md:max-w-xs">
                                    <Input
                                        placeholder={translate('ابحث عن اسم الموظف أو المدنية لقيد الراتب...', 'Search payroll items...')}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="bg-slate-50 border-slate-150 pl-10 pr-4 rounded-xl text-xs"
                                    />
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                        <MagnifyingGlassIcon className="w-4 h-4" />
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        leftIcon={<ArrowPathIcon className="w-4 h-4 text-amber-600" />}
                                        onClick={handleSyncDeductions}
                                        className="border-amber-200 bg-amber-50/50 hover:bg-amber-100 text-amber-900 font-bold"
                                    >
                                        {translate('مزامنة القروض والجزاءات', 'Sync Loans & Penalties')}
                                    </Button>

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        leftIcon={<ArrowDownTrayIcon className="w-4 h-4 text-emerald-600" />}
                                        onClick={handleExportCSV}
                                        className="border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100 text-emerald-900 font-bold"
                                    >
                                        {translate('تصدير Excel', 'Export Excel')}
                                    </Button>

                                    <Button 
                                        size="sm" 
                                        leftIcon={<PlusCircleIcon className="w-4 h-4" />}
                                        onClick={() => {
                                            setEditingPayroll({
                                                id: '',
                                                employeeName: '',
                                                civilId: '',
                                                nationality: 'Kuwaiti',
                                                pifssRegistered: true,
                                                baseSalary: 1000,
                                                allowanceHousing: 150,
                                                allowanceTransport: 50,
                                                allowanceSpecial: 0,
                                                bonusMonthly: 0,
                                                deductionGeneral: 0,
                                                deductionLoanRepayment: 0,
                                                notes: ''
                                            });
                                            setIsFormModalOpen(true);
                                        }}
                                    >
                                        {translate('إضافة بند راتب لموظف', 'Add Employee Payroll Item')}
                                    </Button>
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-3xl border border-slate-150 bg-white">
                                <table className="w-full text-right">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-150 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <th className="p-4">{translate('اسم الموظف والبطاقة', 'Employee Detail')}</th>
                                            <th className="p-4">{translate('الراتب الأساسي', 'Basic')}</th>
                                            <th className="p-4">{translate('البدلات (+)', 'Allowances')}</th>
                                            <th className="p-4">{translate('خصم التأمينات (PIFSS)', 'Employee PIFSS')}</th>
                                            <th className="p-4">{translate('الخصومات والسلف (-)', 'Deductions & Loan')}</th>
                                            <th className="p-4">{translate('الصافي المحال (Net)', 'Net Salary')}</th>
                                            <th className="p-4 text-center">{translate('خيارات المعاملة', 'Actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-150 text-xs text-slate-700">
                                        {filteredPayroll.map(item => (
                                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors font-semibold">
                                                <td className="p-4">
                                                    <div>
                                                        <h4 className="font-black text-slate-900 leading-tight">{item.employeeName}</h4>
                                                        <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5 font-sans">
                                                            <span>{item.civilId}</span>
                                                            <span>•</span>
                                                            <span className="text-indigo-650 font-bold">{item.nationality === 'Kuwaiti' ? 'كويتي' : 'وافد'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 font-mono font-bold">{item.baseSalary} د.ك</td>
                                                <td className="p-4 font-mono text-emerald-650 font-bold">
                                                    +{item.allowanceHousing + item.allowanceTransport + item.allowanceSpecial + item.bonusMonthly} د.ك
                                                </td>
                                                <td className="p-4 font-mono text-rose-550 font-bold">
                                                    {item.nationality === 'Kuwaiti' ? `-${calculatePifssDeduction(item)} د.ك` : '0 د.ك'}
                                                </td>
                                                <td className="p-4 font-mono text-rose-550 font-bold">
                                                    -{item.deductionGeneral + item.deductionLoanRepayment} د.ك
                                                </td>
                                                <td className="p-4 font-mono text-slate-900 font-extrabold text-sm">
                                                    {calculateNet(item)} د.ك
                                                </td>
                                                <td className="p-4 flex justify-center gap-1.5">
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline"
                                                        onClick={() => handlePrintPayslip(item)}
                                                        leftIcon={<PrinterIcon className="w-3.5 h-3.5" />}
                                                        className="text-indigo-650 border-indigo-150"
                                                    >
                                                        {translate('كشف الراتب', 'Payslip')}
                                                    </Button>
                                                    
                                                    <button 
                                                        onClick={() => {
                                                            setEditingPayroll(item);
                                                            setIsFormModalOpen(true);
                                                        }}
                                                        className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors"
                                                    >
                                                        <PencilIcon className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeletePayroll(item.id)}
                                                        className="p-1.5 text-slate-400 hover:text-rose-650 rounded-lg transition-colors"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            key="wps-tab"
                            className="space-y-6"
                        >
                            <Card className="p-6 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm space-y-5">
                                <div className="border-b pb-4">
                                    <h3 className="text-lg font-black text-slate-905">{translate('بوابة حماية الأجور والربط البنكي (WPS Integration-Kuwait)', 'Kuwait Wage Protection system (WPS)')}</h3>
                                    <p className="text-xs text-slate-400 font-bold">{translate('تنزيل ملف الصرف البنكي المتكامل المتوافق مع شروط الهيئة العامة للقوى العاملة وتوجيهات بنك الكويت المركزي.', 'Download compliant batch transfer sheet.')}</p>
                                </div>

                                <div className="space-y-2 text-xs text-slate-650 leading-relaxed font-semibold">
                                    <p>وفقاً للنظم الوزارية المعمول بها بدولة الكويت (حماية الأجور)، يلتزم أصحاب العمل بتحويل رواتب كافة الموظفين التابعين لهم إلكترونياً للبنوك المحلية الكتلية بصيغة ملفات محددة وصارمة ومطابقة لقوائم الموظفين.</p>
                                    <p className="text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
                                        * هذا الفايل يضم الرموز والمدنيات الحقيقية للموظفين لربطه بنظام حماية الأجور (الهيئة العامة للقوى العاملة) وتسييل الأجور.
                                    </p>
                                </div>

                                <div className="bg-slate-50 p-5 rounded-2xl border font-mono text-[10px] text-slate-600 space-y-2">
                                    <p className="font-bold border-b pb-2 mb-2 text-slate-800">معاينة بنية ملف التحويل WPS-Batch-File.csv :</p>
                                    <p>Employee_Civil_ID,Employee_Bank_IBAN,Basic_Salary,Allowances_Sum,Deductions_Sum,Net_Salary,Currency</p>
                                    {payroll.map(p => (
                                        <p key={p.id}>
                                            {p.civilId},KW7495817294812495810, {p.baseSalary},{p.allowanceHousing + p.allowanceTransport + p.allowanceSpecial}, {p.deductionGeneral + p.deductionLoanRepayment + calculatePifssDeduction(p)},{calculateNet(p)},KWD
                                        </p>
                                    ))}
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <button 
                                        onClick={() => alert(translate('تم إنشاء وتصدير ملف WPS بنجاح للبنك المركزي!', 'WPS file compiled & downloaded successfully!'))}
                                        className="h-10 px-5 bg-indigo-650 text-white rounded-xl hover:bg-indigo-700 font-black text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/10"
                                    >
                                        <ArrowDownTrayIcon className="w-4 h-4" />
                                        <span>{translate('تصدير وتحميل ملف WPS المالي', 'Download Bank WPS File')}</span>
                                    </button>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* --- Creator/Editor Modal --- */}
            {isFormModalOpen && editingPayroll && (
                <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={translate('ضبط وتنسيق بنود الراتب والبدلات للموظف', 'Adjust Employee Salary allocations')} size="lg">
                    <form onSubmit={handleSavePayroll} className="p-4 space-y-4 text-start no-print font-sans">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input 
                                label={translate('اسم الموظف رسمياً بالعربية:', 'Employee Name (AR):')}
                                value={editingPayroll.employeeName || ''}
                                onChange={(e) => setEditingPayroll({ ...editingPayroll, employeeName: e.target.value })}
                                required
                            />
                            <Input 
                                label={translate('الرقم المدني الكويتي المكون من 12 خانة:', 'Civil ID Number (12-digits):')}
                                value={editingPayroll.civilId || ''}
                                maxLength={12}
                                onChange={(e) => setEditingPayroll({ ...editingPayroll, civilId: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t pt-3">
                            <Select 
                                label={translate('تصنيف العمالة والجنسية:', 'Nationality Category:')}
                                value={editingPayroll.nationality || 'Kuwaiti'}
                                onChange={(e) => setEditingPayroll({ ...editingPayroll, nationality: e.target.value as any })}
                                options={[
                                    { value: 'Kuwaiti', label: 'عمالة وطنية (كويتي)' },
                                    { value: 'Expats', label: 'عمالة وافدة (Expats)' }
                                ]}
                            />
                            <Select 
                                label={translate('التسجيل بالتأمينات الاجتماعية PIFSS:', 'Registered with PIFSS:')}
                                value={editingPayroll.pifssRegistered ? 'yes' : 'no'}
                                onChange={(e) => setEditingPayroll({ ...editingPayroll, pifssRegistered: e.target.value === 'yes' })}
                                options={[
                                    { value: 'yes', label: 'مسجل (التأمينات نشط)' },
                                    { value: 'no', label: 'غير مسجل (أو معفى)' }
                                ]}
                            />
                            <Input 
                                label={translate('الراتب الأساسي التعاقدي (د.ك):', 'Base Salary (KWD):')}
                                type="number"
                                value={editingPayroll.baseSalary || 1000}
                                onChange={(e) => setEditingPayroll({ ...editingPayroll, baseSalary: parseInt(e.target.value) })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t pt-3">
                            <Input 
                                label={translate('علاوة سكن المقررة (د.ك):', 'Housing Allowance:')}
                                type="number"
                                value={editingPayroll.allowanceHousing || 150}
                                onChange={(e) => setEditingPayroll({ ...editingPayroll, allowanceHousing: parseInt(e.target.value) })}
                                required
                            />
                            <Input 
                                label={translate('علاوة الانتقال والسير (د.ك):', 'Travel Allowance:')}
                                type="number"
                                value={editingPayroll.allowanceTransport || 50}
                                onChange={(e) => setEditingPayroll({ ...editingPayroll, allowanceTransport: parseInt(e.target.value) })}
                                required
                            />
                            <Input 
                                label={translate('بدلات مهنية وخاصة إضافية (د.ك):', 'Special Allowance:')}
                                type="number"
                                value={editingPayroll.allowanceSpecial || 0}
                                onChange={(e) => setEditingPayroll({ ...editingPayroll, allowanceSpecial: parseInt(e.target.value) })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t pt-3">
                            <Input 
                                label={translate('حوافز ومكافأة الدورة المالية (د.ك):', 'Monthly Bonus (KWD):')}
                                type="number"
                                value={editingPayroll.bonusMonthly || 0}
                                onChange={(e) => setEditingPayroll({ ...editingPayroll, bonusMonthly: parseInt(e.target.value) })}
                            />
                            <Input 
                                label={translate('تسديد أقساط سلف القسط القائم (د.ك):', 'Loan repayment deduction:')}
                                type="number"
                                value={editingPayroll.deductionLoanRepayment || 0}
                                onChange={(e) => setEditingPayroll({ ...editingPayroll, deductionLoanRepayment: parseInt(e.target.value) })}
                            />
                            <Input 
                                label={translate('خصومات وجزاءات عامة (غثيان/غياب) (د.ك):', 'Disciplinary fine/absence deduction:')}
                                type="number"
                                value={editingPayroll.deductionGeneral || 0}
                                onChange={(e) => setEditingPayroll({ ...editingPayroll, deductionGeneral: parseInt(e.target.value) })}
                            />
                        </div>

                        <TextArea 
                            label={translate('ملاحظات وسجل الصرف والتوضيحات:', 'Specific Notes:')}
                            value={editingPayroll.notes || ''}
                            rows={2}
                            onChange={(e) => setEditingPayroll({ ...editingPayroll, notes: e.target.value })}
                        />

                        <div className="flex justify-end gap-2 pt-2 border-t">
                            <Button type="button" variant="outline" size="sm" onClick={() => setIsFormModalOpen(false)}>
                                {translate('إلغاء لجميع التعديلات', 'Cancel')}
                            </Button>
                            <Button type="submit" size="sm">
                                {translate('حفظ ومصادقة إلكترونية', 'Confirm Payroll Item')}
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}

        </div>
    );
};

export default PayrollManagementPage;
