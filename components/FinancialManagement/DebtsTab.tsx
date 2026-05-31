import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    CreditCardIcon, 
    CalendarIcon, 
    PlusCircleIcon, 
    CheckIcon, 
    XMarkIcon, 
    ClockIcon, 
    ExclamationTriangleIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { Badge } from '../ui/Badge';
import { useToast } from '../ui/Toast';

interface Installment {
    number: number;
    amount: number;
    dueDate: string;
    status: 'paid' | 'pending' | 'overdue';
    paidDate?: string;
}

interface DebtTracker {
    id: string;
    partyNameAr: string;
    partyNameEn: string;
    role: 'client' | 'supplier' | 'broker';
    totalAmount: number;
    remainingAmount: number;
    descriptionAr: string;
    descriptionEn: string;
    installments: Installment[];
    lastPaidDate?: string;
    status: 'active' | 'completed' | 'overdue';
}

interface DebtsTabProps {
    formatCurrency: (amount: number, currency?: string) => string;
    isAr?: boolean;
}

export const DebtsTab: React.FC<DebtsTabProps> = ({ formatCurrency, isAr = true }) => {
    const { addToast } = useToast();

    // 1. Initial Debts & Installment Schedules
    const [debts, setDebts] = useState<DebtTracker[]>([
        {
            id: 'DEB-2024-001',
            partyNameAr: 'شركة المرزوق للتطوير العقاري',
            partyNameEn: 'Al-Marzouq Real Estate Group',
            role: 'client',
            totalAmount: 15000,
            remainingAmount: 5000,
            descriptionAr: 'مستحقات عقد صياغة عقود تأسيس وتحكيم قضائي',
            descriptionEn: 'Arising of consulting and arbitration services',
            status: 'active',
            installments: [
                { number: 1, amount: 5000, dueDate: '2024-03-15', status: 'paid', paidDate: '2024-03-14' },
                { number: 2, amount: 5000, dueDate: '2024-04-15', status: 'paid', paidDate: '2024-04-16' },
                { number: 3, amount: 5000, dueDate: '2024-06-15', status: 'pending' },
            ]
        },
        {
            id: 'DEB-2024-002',
            partyNameAr: 'السيد أحمد محمود العبدالله',
            partyNameEn: 'Mr. Ahmed Mahmoud Al-Abdullah',
            role: 'client',
            totalAmount: 8000,
            remainingAmount: 4000,
            descriptionAr: 'أقساط دعوى إخلاء العقار التجاري بالسالمية وغرامات التأخير',
            descriptionEn: 'Installment of legal evictions of commercial units',
            status: 'overdue',
            installments: [
                { number: 1, amount: 4000, dueDate: '2024-05-10', status: 'overdue' },
                { number: 2, amount: 4000, dueDate: '2024-07-10', status: 'pending' },
            ]
        },
        {
            id: 'DEB-2024-003',
            partyNameAr: 'شطا للأنظمة والشبكات البرمجية',
            partyNameEn: 'Shata Software Networks Co.',
            role: 'supplier',
            totalAmount: 3200,
            remainingAmount: 1600,
            descriptionAr: 'فاتورة ترخيص السحابة القانونية المشفرة وتجديد خوادم الحوسبة',
            descriptionEn: 'SaaS legal cloud server and server hosting fees',
            status: 'active',
            installments: [
                { number: 1, amount: 1600, dueDate: '2524-05-01', status: 'paid', paidDate: '2024-05-01' },
                { number: 2, amount: 1600, dueDate: '2024-06-01', status: 'pending' },
            ]
        }
    ]);

    // UI form state
    const [isNewDebtModalOpen, setIsNewDebtModalOpen] = useState(false);
    const [selectedDebtForInstallments, setSelectedDebtForInstallments] = useState<DebtTracker | null>(null);

    const [partyNameAr, setPartyNameAr] = useState('');
    const [partyNameEn, setPartyNameEn] = useState('');
    const [role, setRole] = useState<'client' | 'supplier' | 'broker'>('client');
    const [descriptionAr, setDescriptionAr] = useState('');
    const [descriptionEn, setDescriptionEn] = useState('');
    const [totalAmount, setTotalAmount] = useState(0);
    const [installmentCount, setInstallmentCount] = useState(3);

    // Duplicate tracker log to avoid repetitive submit clicks
    const [recentSubmits, setRecentSubmits] = useState<{ amount: number; party: string; timestamp: number }[]>([]);

    // 2. Prevent duplicate entries using short time-buffer algorithms to protect accounting books
    const detectDuplicateSubmission = (amount: number, partyName: string): boolean => {
        const now = Date.now();
        const duplicate = recentSubmits.find(submit => 
            submit.amount === amount && 
            submit.party === partyName && 
            (now - submit.timestamp) < 15000 // 15-second duplicate window
        );

        if (duplicate) {
            addToast({
                type: 'error',
                title: isAr ? 'تحذير تكرار الصرف والمدفوعات' : 'Duplicate Lockout',
                message: isAr ? 'كشف النظام محاولة تسجيل قسط أو مستحَق مكرر في نفس الدقيقة. تم تفعيل الحظر احترازياً.' : 'Preventative duplicate trigger. Identical submit detected within short window.'
            });
            return true;
        }

        // Add to log
        setRecentSubmits(prev => [...prev, { amount, party: partyName, timestamp: now }]);
        return false;
    };

    const handleCreateDebt = () => {
        if (!partyNameAr || !partyNameEn || totalAmount <= 0 || installmentCount <= 0) {
            addToast({
                type: 'error',
                title: isAr ? 'خطأ في التثبيت' : 'Validation Error',
                message: isAr ? 'الرجاء ملء اسم الطرف الآخر باللغتين والمبلغ الإجمالي وعدد الأقساط بشكل كامل.' : 'All fields must be correctly structured.'
            });
            return;
        }

        // Run security checks
        if (detectDuplicateSubmission(totalAmount, partyNameAr)) {
            return;
        }

        const installmentAmount = Math.max(0, parseFloat((totalAmount / installmentCount).toFixed(3)));
        const generatedInstallments: Installment[] = [];
        const today = new Date();

        for (let i = 1; i <= installmentCount; i++) {
            const dueDate = new Date(today.getFullYear(), today.getMonth() + i, 15).toISOString().split('T')[0];
            generatedInstallments.push({
                number: i,
                amount: installmentAmount,
                dueDate: dueDate,
                status: 'pending'
            });
        }

        const newDebt: DebtTracker = {
            id: `DEB-${Date.now().toString().slice(-6)}`,
            partyNameAr,
            partyNameEn,
            role,
            totalAmount,
            remainingAmount: totalAmount,
            descriptionAr,
            descriptionEn,
            installments: generatedInstallments,
            status: 'active'
        };

        setDebts([newDebt, ...debts]);
        setIsNewDebtModalOpen(false);
        resetForm();

        addToast({
            type: 'success',
            title: isAr ? 'تم جدولة المديونية' : 'Debt Registered',
            message: isAr ? 'تم إدراج الحركة وتوليد الأرصدة المستحقة للأقساط بمسافات زمنية متساوية.' : 'Generated installments stream and secured book references.'
        });
    };

    const resetForm = () => {
        setPartyNameAr('');
        setPartyNameEn('');
        setRole('client');
        setDescriptionAr('');
        setDescriptionEn('');
        setTotalAmount(0);
        setInstallmentCount(3);
    };

    const collectInstallment = (debtId: string, installmentIndex: number) => {
        setDebts(prev => prev.map(d => {
            if (d.id !== debtId) return d;
            
            const updated = [...d.installments];
            const originalInst = updated[installmentIndex];
            
            if (originalInst.status === 'paid') return d;

            updated[installmentIndex] = {
                ...originalInst,
                status: 'paid',
                paidDate: new Date().toISOString().split('T')[0]
            };

            const paidSum = updated.filter(inst => inst.status === 'paid').reduce((acc, inst) => acc + inst.amount, 0);
            const remaining = Math.max(0, d.totalAmount - paidSum);

            return {
                ...d,
                installments: updated,
                remainingAmount: remaining,
                status: remaining === 0 ? 'completed' as const : d.status
            };
        }));

        // Trigger dynamic modal updates to prevent visual latency
        if (selectedDebtForInstallments && selectedDebtForInstallments.id === debtId) {
            const currentObj = debts.find(d => d.id === debtId);
            if (currentObj) {
                // Update selected scope
                const updated = [...currentObj.installments];
                updated[installmentIndex] = {
                    ...updated[installmentIndex],
                    status: 'paid',
                    paidDate: new Date().toISOString().split('T')[0]
                };
                const paidSum = updated.filter(inst => inst.status === 'paid').reduce((acc, inst) => acc + inst.amount, 0);
                const remaining = Math.max(0, currentObj.totalAmount - paidSum);
                setSelectedDebtForInstallments({
                    ...currentObj,
                    installments: updated,
                    remainingAmount: remaining,
                    status: remaining === 0 ? 'completed' : currentObj.status
                });
            }
        }

        addToast({
            type: 'success',
            title: isAr ? 'تم سحب الدفعة والأقساط' : 'Installment Collected',
            message: isAr ? 'تم تغيير الحالة في جدول الميزانية وتحويل المبالغ لخزينة البنك بنجاح.' : 'Logged payment index and restructured receivable sheets.'
        });
    };

    return (
        <div className="space-y-8 text-right" dir={isAr ? 'rtl' : 'ltr'}>
            
            {/* Split panel: Left tracker list, right detail views */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* List of outstanding debts */}
                <Card className="p-6 md:p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h4 className="text-md font-bold text-slate-850 dark:text-white flex items-center gap-2">
                                <CreditCardIcon className="w-5 h-5 text-indigo-600" />
                                {isAr ? 'منظومة جدولة وتحصيل الديون والأقساط المتتالية' : 'Debts & Systematic Receivables'}
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-1">
                                {isAr ? 'تتبع الذمم الدائنة والمدينة من وإلى الموكلين والمقاولون والشركاء مع التحديث الذاتي للأقساط.' : 'Real-time billing cycles matched to installment streams, client receipts and vendor disbursements.'}
                            </p>
                        </div>
                        <Button 
                            variant="primary" 
                            size="sm" 
                            className="rounded-xl px-4 py-2 text-xs font-bold font-sans"
                            leftIcon={<PlusCircleIcon className="w-4 h-4" />}
                            onClick={() => setIsNewDebtModalOpen(true)}
                        >
                            {isAr ? 'جدولة مستحق جديد' : 'New Schedule'}
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {debts.map(d => (
                            <div key={d.id} className="p-5 bg-slate-50 dark:bg-dm-background rounded-[2rem] border border-slate-100 dark:border-slate-850 hover:bg-slate-100/50 transition-all flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden group">
                                <div className={`absolute top-0 right-0 w-2 h-full rounded-r-none ${
                                    d.status === 'overdue' ? 'bg-rose-500' : d.status === 'completed' ? 'bg-emerald-500' : 'bg-primary'
                                }`} />
                                
                                <div className="space-y-1.5 flex-1 pr-3">
                                    <div className="flex items-center gap-2">
                                        <h5 className="font-bold text-slate-800 dark:text-white text-sm">
                                            {isAr ? d.partyNameAr : d.partyNameEn}
                                        </h5>
                                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                                            d.role === 'client' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-500'
                                        }`}>
                                            {d.role === 'client' ? (isAr ? 'موكل (مدين)' : 'Client') : (isAr ? 'مورد (دائن)' : 'Supplier')}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                                        {isAr ? d.descriptionAr : d.descriptionEn}
                                    </p>
                                    <p className="text-[9px] text-slate-400 font-bold font-mono">ID: {d.id}</p>
                                </div>

                                <div className="text-left md:border-r border-slate-100 dark:border-gray-800 md:pr-6 md:pl-2 flex flex-col justify-center items-end min-w-[160px]">
                                    <p className="text-[10px] text-slate-400 font-bold">{isAr ? 'المتبقي من الدين:' : 'Receivable Balance:'}</p>
                                    <h4 className="text-xl font-black text-indigo-600 dark:text-primary-light font-mono tracking-tighter mt-0.5">
                                        {formatCurrency(d.remainingAmount)} <span className="text-[10px] font-normal text-slate-400 font-sans">/ {formatCurrency(d.totalAmount)}</span>
                                    </h4>
                                    
                                    <button 
                                        className="text-[10px] font-black text-indigo-600 hover:underline mt-2.5 flex items-center gap-1.5 bg-indigo-50/50 hover:bg-indigo-100/50 px-2.5 py-1 rounded-lg transition-colors"
                                        onClick={() => setSelectedDebtForInstallments(d)}
                                    >
                                        <CalendarIcon className="w-3.5 h-3.5" />
                                        {isAr ? 'صحيفة الأقساط التفصيلية' : 'View Installments'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Installment stream detail and logger panel */}
                <div className="space-y-6">
                    <Card className="p-6 md:p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl space-y-5">
                        <div className="flex items-center gap-2 text-slate-800 dark:text-white">
                            <ClockIcon className="w-5 h-5 text-indigo-600" />
                            <h4 className="font-bold text-sm">{isAr ? 'كشف تحصيلات الدفع المتتالية' : 'Receivables Stream Timeline'}</h4>
                        </div>

                        {selectedDebtForInstallments ? (
                            <div className="space-y-5 animate-in fade-in">
                                <div className="bg-slate-50 dark:bg-dm-background p-4 rounded-[1.5rem] space-y-1.5">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">{selectedDebtForInstallments.id}</p>
                                    <h5 className="font-bold text-slate-850 dark:text-white text-xs">
                                        {isAr ? selectedDebtForInstallments.partyNameAr : selectedDebtForInstallments.partyNameEn}
                                    </h5>
                                    <div className="flex justify-between items-center text-xs text-slate-500 border-t border-slate-100 dark:border-gray-800 pt-2 font-semibold">
                                        <span>{isAr ? 'المستوى المتبقي:' : 'Balance Outstanding:'}</span>
                                        <span className="font-mono font-black text-indigo-600 dark:text-emerald-400">{formatCurrency(selectedDebtForInstallments.remainingAmount)}</span>
                                    </div>
                                </div>

                                <div className="space-y-3.5 relative border-r-2 border-slate-100 dark:border-slate-800 pr-4 mr-2">
                                    {selectedDebtForInstallments.installments.map((inst, index) => (
                                        <div key={index} className="relative flex justify-between items-center text-xs">
                                            {/* Bullet icon */}
                                            <div className={`absolute top-1/2 right-[-21px] -translate-y-1/2 w-2 h-2 rounded-full ${
                                                inst.status === 'paid' ? 'bg-emerald-500' : inst.status === 'overdue' ? 'bg-rose-500 animate-ping' : 'bg-slate-300'
                                            }`} />
                                            
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-dm-text">
                                                    {isAr ? `القسط رقم #${inst.number}` : `Installment #${inst.number}`}
                                                </p>
                                                <p className="text-[9px] text-slate-400 font-mono italic">
                                                    {isAr ? `تاريخ الاستحقاق: ${inst.dueDate}` : `Due by: ${inst.dueDate}`}
                                                </p>
                                            </div>

                                            <div className="text-left">
                                                <p className="font-mono font-bold text-slate-800 dark:text-white">{formatCurrency(inst.amount)}</p>
                                                {inst.status === 'paid' ? (
                                                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-0.5">
                                                        <CheckIcon className="w-3 h-3" />
                                                        {isAr ? 'تم استلامه' : 'Paid'}
                                                    </span>
                                                ) : inst.status === 'overdue' ? (
                                                    <div className="flex flex-col items-end gap-1">
                                                        <span className="text-[9px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded flex items-center gap-0.5">
                                                            <ExclamationTriangleIcon className="w-3 h-3" />
                                                            {isAr ? 'متأخر استحقاقه' : 'Overdue'}
                                                        </span>
                                                        <button 
                                                            className="text-[9px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-2 py-1 rounded"
                                                            onClick={() => collectInstallment(selectedDebtForInstallments.id, index)}
                                                        >
                                                            {isAr ? 'تحصيل يدوي' : 'Collect cash'}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button 
                                                        className="text-[9px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded mt-1.5"
                                                        onClick={() => collectInstallment(selectedDebtForInstallments.id, index)}
                                                    >
                                                        {isAr ? 'تثبيت وتحصيل الدفعة' : 'Record Pay'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem]">
                                <ExclamationTriangleIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                <p className="text-[11px] text-slate-400">{isAr ? 'اضغط على استعراض صحيفة الأقساط لمتابعة تيار التدفق والتحصيل.' : 'Choose installment schedules from the left list to audit payment milestones.'}</p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            {/* Modal for Creating New Debt */}
            <AnimatePresence>
                {isNewDebtModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/65 flex items-center justify-center p-4 z-50 animate-in fade-in">
                        <motion.div 
                            initial={{ scale: 0.97, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.97, opacity: 0 }}
                            className="bg-white dark:bg-dm-card rounded-[32px] max-w-md w-full p-8 border border-slate-100 dark:border-slate-800 shadow-2xl space-y-6"
                        >
                            <div className="border-b border-slate-100 dark:border-gray-800 pb-3">
                                <h3 className="text-lg font-black text-slate-850 dark:text-white">
                                    {isAr ? 'تأسيس وجدولة خطة دفع مستحقة' : 'Setup Receivable Schedule Plan'}
                                </h3>
                                <p className="text-xs text-slate-400">{isAr ? 'تجزئة عقود الأتعاب أو مدفوعات الموردين لأقساط متكررة متباعدة تلقائياً.' : 'Plan sequential recurring invoices linked to contract files.'}</p>
                            </div>

                            <div className="space-y-4 text-xs font-bold text-slate-600 dark:text-slate-350">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block mb-1.5">{isAr ? 'اسم الطرف الآخر (عربي):' : 'Second Party (AR):'}</label>
                                        <Input 
                                            value={partyNameAr}
                                            onChange={(e) => setPartyNameAr(e.target.value)}
                                            placeholder="شركة البترول الوطنية"
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1.5">{isAr ? 'اسم الطرف الآخر (إنجليزي):' : 'Second Party (EN):'}</label>
                                        <Input 
                                            value={partyNameEn}
                                            onChange={(e) => setPartyNameEn(e.target.value)}
                                            placeholder="KNPC Kuwait"
                                            className="rounded-xl"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block mb-1.5">{isAr ? 'العلاقة التشغيلية دفترياً:' : 'Receivable Typology:'}</label>
                                        <Select 
                                            value={role}
                                            onChange={(e) => setRole(e.target.value as any)}
                                            options={[
                                                { label: isAr ? 'موكل مدين (أتعاب وقضايا)' : 'Client Debtor (Fees)', value: 'client' },
                                                { label: isAr ? 'مورد دائن (أجهزة وشاشات)' : 'Vendor Creditor (SaaS)', value: 'supplier' }
                                            ]}
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1.5">{isAr ? 'القيمة الإجمالية للمديونية:' : 'Total Amount KWD:'}</label>
                                        <Input 
                                            type="number"
                                            value={totalAmount?.toString()}
                                            onChange={(e) => setTotalAmount(parseFloat(e.target.value) || 0)}
                                            placeholder="0.000"
                                            className="rounded-xl font-mono text-lg font-bold"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block mb-1.5">{isAr ? 'عدد أقساط التحصيل الإجمالية:' : 'Instalments count (monthly spacing):'}</label>
                                    <Input 
                                        type="number"
                                        value={installmentCount?.toString()}
                                        onChange={(e) => setInstallmentCount(parseInt(e.target.value) || 3)}
                                        placeholder="3"
                                        className="rounded-xl font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1.5">{isAr ? 'البيان التفصيلي للعلاقة المالية (عربي):' : 'Financial Statement Description (AR):'}</label>
                                    <Input 
                                        value={descriptionAr}
                                        onChange={(e) => setDescriptionAr(e.target.value)}
                                        placeholder="توزيع مستحقات تحكيم طعن بالتمييز الكلي"
                                        className="rounded-xl"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1.5">{isAr ? 'البيان التفصيلي للعلاقة المكملة (إنجليزي):' : 'Financial Statement Description (EN):'}</label>
                                    <Input 
                                        value={descriptionEn}
                                        onChange={(e) => setDescriptionEn(e.target.value)}
                                        placeholder="Receivables timeline of cassation consultation arbitration"
                                        className="rounded-xl"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-50 dark:border-gray-800">
                                <Button 
                                    variant="outline" 
                                    className="rounded-xl px-5 text-xs font-bold"
                                    onClick={() => {
                                        setIsNewDebtModalOpen(false);
                                        resetForm();
                                    }}
                                >
                                    {isAr ? 'إلغاء' : 'Cancel'}
                                </Button>
                                <Button 
                                    variant="primary" 
                                    className="rounded-xl px-6 text-xs font-black shadow-lg shadow-indigo-600/15"
                                    onClick={handleCreateDebt}
                                >
                                    {isAr ? 'تأكيد وإدراج خطة الدفع' : 'Secure Receivables Plan'}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};
