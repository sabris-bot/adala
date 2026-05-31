import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    BuildingLibraryIcon, 
    BanknotesIcon, 
    ArrowPathIcon, 
    PlusIcon, 
    TrashIcon, 
    CheckCircleIcon, 
    ExclamationTriangleIcon,
    ArrowDownTrayIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { Badge } from '../ui/Badge';
import { useToast } from '../ui/Toast';

interface BankAccount {
    id: string;
    name: string;
    nameEn: string;
    number: string;
    iban: string;
    balance: number;
    currency: string;
    type: 'current' | 'savings' | 'trust' | 'escrow';
}

interface PettyCashVoucher {
    id: string;
    date: string;
    issuedTo: string;
    description: string;
    category: 'hospitality' | 'stationery' | 'postage' | 'transport' | 'maintenance' | 'other';
    amount: number;
    approvedBy: string;
    status: 'draft' | 'approved' | 'rejected';
}

interface TreasuryTabProps {
    formatCurrency: (amount: number, currency?: string) => string;
    isAr?: boolean;
}

export const TreasuryTab: React.FC<TreasuryTabProps> = ({ formatCurrency, isAr = true }) => {
    const { addToast } = useToast();

    // 1. Bank Accounts state
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([
        {
            id: 'bank-01',
            name: 'بيت التمويل الكويتي (بيتك)',
            nameEn: 'Kuwait Finance House (KFH)',
            number: '011-02-123456-7',
            iban: 'KW53 KGLB 0000 0110 2123 4567',
            balance: 145950.000,
            currency: 'KWD',
            type: 'current'
        },
        {
            id: 'bank-02',
            name: 'بنك بوبيان - الحساب الرئيسي',
            nameEn: 'Boubyan Bank - Main A/C',
            number: '445-09-987654-2',
            iban: 'KW45 BOUB 0000 0445 0998 7654',
            balance: 82400.000,
            currency: 'KWD',
            type: 'current'
        },
        {
            id: 'bank-03',
            name: 'بنك الكويت الوطني (الوطني)',
            nameEn: 'National Bank of Kuwait (NBK)',
            number: '120-22-445566-1',
            iban: 'KW32 NBOK 0000 0120 2244 5566',
            balance: 182450.000,
            currency: 'KWD',
            type: 'trust'
        }
    ]);

    // 2. Petty cash book state
    const [pettyCash, setPettyCash] = useState<PettyCashVoucher[]>([
        {
            id: 'PCV-1002',
            date: '2024-05-24',
            issuedTo: 'صالح المندوب',
            description: 'طوابع بريدية ومصاريف إعلان مذكرات محكمة الرقعي',
            category: 'postage',
            amount: 45.000,
            approvedBy: 'مدير الحسابات',
            status: 'approved'
        },
        {
            id: 'PCV-1003',
            date: '2024-05-23',
            issuedTo: 'شركة بيكر الكبرى للضيافة',
            description: 'مستلزمات الضيافة والقهوة والشاي لمبنى مكاتب الشركاء',
            category: 'hospitality',
            amount: 110.500,
            approvedBy: 'أحمد المحاسب',
            status: 'approved'
        },
        {
            id: 'PCV-1004',
            date: '2024-05-21',
            issuedTo: 'مكتبة الفجر الحديثة',
            description: 'أوراق طباعة مستندات، أظرف توثيق ملفات ومستلزمات قرطاسية',
            category: 'stationery',
            amount: 64.000,
            approvedBy: 'أحمد المحاسب',
            status: 'approved'
        },
        {
            id: 'PCV-1005',
            date: '2024-05-20',
            issuedTo: 'فارس السائق',
            description: 'توصيل عاجل ملفات قضية محكمة الأحمدي والتزود بالوقود',
            category: 'transport',
            amount: 25.000,
            approvedBy: 'أحمد المحاسب',
            status: 'draft'
        }
    ]);

    const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
    const [isBankModalOpen, setIsBankModalOpen] = useState(false);
    
    // Reconciliation simulation state
    const [reconciliationFile, setReconciliationFile] = useState<string | null>(null);
    const [isReconciling, setIsReconciling] = useState(false);
    const [reconciliationStats, setReconciliationStats] = useState<{
        matched: number;
        unmatched: number;
        variance: number;
    } | null>(null);

    // Form inputs state
    const [voucherForm, setVoucherForm] = useState<Partial<PettyCashVoucher>>({
        issuedTo: '',
        description: '',
        category: 'other',
        amount: 0,
        approvedBy: 'أحمد المحاسب',
        status: 'draft'
    });

    const [bankForm, setBankForm] = useState<Partial<BankAccount>>({
        name: '',
        nameEn: '',
        number: '',
        iban: '',
        balance: 1000,
        currency: 'KWD',
        type: 'current'
    });

    // Total petty cash spent calculated of approved ones
    const totalPettyCashSpent = useMemo(() => {
        return pettyCash
            .filter(v => v.status === 'approved')
            .reduce((sum, v) => sum + v.amount, 0);
    }, [pettyCash]);

    // Petty Cash Total Fund
    const pettyCashFundSize = 1000; // standard constant petty cash float
    const remainingPettyCash = pettyCashFundSize - totalPettyCashSpent;

    const handleCreateVoucher = () => {
        if (!voucherForm.issuedTo || !voucherForm.description || !voucherForm.amount) {
            addToast({
                type: 'error',
                title: isAr ? 'بيانات ناقصة' : 'Validation Error',
                message: isAr ? 'يرجى إدخال اسم المستلم والبيان التفصيلي وقيمة السند.' : 'All voucher fields are required.'
            });
            return;
        }

        const newVoucher: PettyCashVoucher = {
            id: `PCV-${1000 + pettyCash.length + 2}`,
            date: new Date().toISOString().split('T')[0],
            issuedTo: voucherForm.issuedTo,
            description: voucherForm.description,
            category: voucherForm.category as any,
            amount: Number(voucherForm.amount),
            approvedBy: voucherForm.approvedBy || '',
            status: voucherForm.status as any
        };

        setPettyCash([newVoucher, ...pettyCash]);
        setIsVoucherModalOpen(false);
        setVoucherForm({
            issuedTo: '',
            description: '',
            category: 'other',
            amount: 0,
            approvedBy: 'أحمد المحاسب',
            status: 'draft'
        });

        addToast({
            type: 'success',
            title: isAr ? 'تم تقييد السند' : 'Petty Cash Voucher Created',
            message: isAr ? 'تم تسجيل وتمرير قيد النثرية النقدية.' : 'Petty cash expense saved.'
        });
    };

    const handleCreateBankAccount = () => {
        if (!bankForm.name || !bankForm.iban || !bankForm.number) {
            addToast({
                type: 'error',
                title: isAr ? 'بيانات غير كاملة' : 'Incomplete Fields',
                message: isAr ? 'الرجاء إدخال اسم البنك، رقم الحساب الدولي IBAN، والفرع.' : 'Please supply account descriptions, digits and valid IBAN.'
            });
            return;
        }

        const newAccount: BankAccount = {
            id: `bank-${Date.now()}`,
            name: bankForm.name,
            nameEn: bankForm.nameEn || bankForm.name,
            number: bankForm.number,
            iban: bankForm.iban,
            balance: Number(bankForm.balance) || 0,
            currency: bankForm.currency || 'KWD',
            type: bankForm.type as any
        };

        setBankAccounts([...bankAccounts, newAccount]);
        setIsBankModalOpen(false);
        setBankForm({
            name: '',
            nameEn: '',
            number: '',
            iban: '',
            balance: 0,
            currency: 'KWD',
            type: 'current'
        });

        addToast({
            type: 'success',
            title: isAr ? 'تم ربط الحساب' : 'Bank Account Linked',
            message: isAr ? 'تم تسجيل الحساب الجديد في الهيكل المالي.' : 'Linked new bank and routed transaction buffers.'
        });
    };

    const handleApproveVoucher = (id: string) => {
        setPettyCash(prev => prev.map(v => v.id === id ? { ...v, status: 'approved' } : v));
        addToast({
            type: 'success',
            title: isAr ? 'تم اعتماد الصرف' : 'Voucher Disbursed',
            message: isAr ? 'تم ترحيل السند واعتماد النثرية في كشف الحساب.' : 'Disbursed petty cash expense.'
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setReconciliationFile(e.target.files[0].name);
            setIsReconciling(true);
            
            // Simulating smart CSV parser and audit match
            setTimeout(() => {
                setIsReconciling(false);
                setReconciliationStats({
                    matched: 14,
                    unmatched: 2,
                    variance: 0.120 // 120 fils mismatch
                });
                addToast({
                    type: 'success',
                    title: isAr ? 'اكتملت المطابقة الذكية' : 'Match Complete',
                    message: isAr ? 'تمت مطابقة 14 معاملة بنجاح مع كشف حساب بوبيان.' : 'Reconciled 14 records with Boubyan Bank.'
                });
            }, 2500);
        }
    };

    return (
        <div className="space-y-8 text-right" dir={isAr ? 'rtl' : 'ltr'}>
            
            {/* Header section with KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* 1. Treasury liquid total */}
                <Card className="p-6 rounded-[2rem] border-none shadow-xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full blur-2xl translate-x-1/3 -translate-y-1/3" />
                    <p className="text-[10px] font-black uppercase tracking-wider text-white/60 mb-1">{isAr ? 'السيولة الإجمالية للبنوك' : 'Total Bank Liquidity'}</p>
                    <h3 className="text-2xl font-black font-mono tracking-tight">
                        {formatCurrency(bankAccounts.reduce((sum, b) => sum + b.balance, 0))}
                    </h3>
                </Card>

                {/* 2. Petty cash vault */}
                <Card className="p-6 rounded-[2rem] border-none shadow-xl bg-gradient-to-br from-[#004D40] to-emerald-800 text-white relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full blur-2xl translate-x-1/3 -translate-y-1/3" />
                    <p className="text-[10px] font-black uppercase tracking-wider text-white/60 mb-1">{isAr ? 'رصيد الخزينة الفرعية (النثريات)' : 'Petty Cash Fund Float'}</p>
                    <h3 className="text-2xl font-black font-mono tracking-tight">
                        {formatCurrency(remainingPettyCash)} <span className="text-xs font-normal"> / {formatCurrency(pettyCashFundSize)}</span>
                    </h3>
                </Card>

                {/* 3. Escrow holdings representation */}
                <Card className="p-6 rounded-[2rem] border-none shadow-xl bg-gradient-to-br from-amber-700 to-amber-900 text-white relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full blur-2xl translate-x-1/3 -translate-y-1/3" />
                    <p className="text-[10px] font-black uppercase tracking-wider text-amber-100/70 mb-1">{isAr ? 'الودائع وحسابات الضمان المفتوحة' : 'Escrow Deposited Assets'}</p>
                    <h3 className="text-2xl font-black font-mono tracking-tight">
                        {formatCurrency(182450.000)}
                    </h3>
                </Card>

                {/* 4. Sub-accounts match rate */}
                <Card className="p-6 rounded-[2rem] border-none shadow-xl bg-gradient-to-br from-teal-900 to-teal-700 text-white relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full blur-2xl translate-x-1/3 -translate-y-1/3" />
                    <p className="text-[10px] font-black uppercase tracking-wider text-teal-100/70 mb-1">{isAr ? 'دقة المطابقة البنكية التلقائية' : 'Reconciliation Accuracy'}</p>
                    <h3 className="text-2xl font-black font-mono tracking-tight">
                        98.7% <span className="text-xs font-bold text-emerald-400 bg-white/10 px-2 py-0.5 rounded-full">آمن</span>
                    </h3>
                </Card>
            </div>

            {/* Split page: Sub-accounts vs Petty Cash book */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Bank Accounts panel */}
                <Card className="p-6 md:p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl space-y-6">
                    <div className="flex justify-between items-center">
                        <h4 className="text-md font-bold text-slate-850 dark:text-white flex items-center gap-2">
                            <BuildingLibraryIcon className="w-5 h-5 text-indigo-600" />
                            {isAr ? 'البنوك والترميز الدولي IBAN' : 'IBAN Bank Anchors'}
                        </h4>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-xl px-3 py-1.5 text-[10px]"
                            leftIcon={<PlusIcon className="w-3.5 h-3.5" />}
                            onClick={() => setIsBankModalOpen(true)}
                        >
                            {isAr ? 'إلحاق بنك' : 'Link Bank'}
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {bankAccounts.map(b => (
                            <div key={b.id} className="p-4 bg-slate-50 dark:bg-dm-background rounded-2xl border border-slate-100 dark:border-slate-850 hover:bg-slate-100/50 transition-all flex flex-col gap-2 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-1.5 h-full bg-indigo-600 rounded-r-none" />
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-slate-800 dark:text-white">{isAr ? b.name : b.nameEn}</span>
                                    <span className="bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-bold text-[8px] px-2 py-0.5 rounded uppercase">{b.type}</span>
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono tracking-tight break-all">
                                    {isAr ? 'الآيبان:' : 'IBAN:'} {b.iban}
                                </div>
                                <div className="flex justify-between items-end border-t border-slate-100 dark:border-gray-800 pt-2 text-xs">
                                    <span className="text-slate-400">{isAr ? 'الرصيد الدفتري:' : 'Book balance:'}</span>
                                    <span className="font-black text-slate-850 dark:text-primary-light font-mono text-sm">{formatCurrency(b.balance)}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Reconciliation CSV Sandbox Upload */}
                    <div className="bg-slate-50 dark:bg-dm-background p-5 rounded-[2rem] border border-slate-100 dark:border-slate-850 space-y-4">
                        <div className="flex items-center gap-2">
                            <ArrowPathIcon className="w-5 h-5 text-indigo-600 animate-spin" />
                            <h5 className="font-bold text-xs">{isAr ? 'بوابة التسوية الذكية التلقائية' : 'Auto Bank Statement Reconciler'}</h5>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                            {isAr ? 'ارفع كشف الحساب البنكي بصيغة Excel/CSV لمطابقته الفورية مع القيود المحاسبية الدفترية واكتشاف التباينات المائة فلسية.' : 'Drag statement logs or select CSV documents to match ledger entries and clear variance pools.'}
                        </p>

                        <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center hover:bg-slate-100 dark:hover:bg-dm-card/30 transition-all cursor-pointer relative overflow-hidden">
                            <input 
                                type="file" 
                                accept=".csv,.xlsx,.xls" 
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={handleFileChange}
                                disabled={isReconciling}
                            />
                            {isReconciling ? (
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-indigo-600 animate-pulse">{isAr ? 'جاري الفحص والمطابقة والتسوية المائية...' : 'Reconciliation in progress...'}</p>
                                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-indigo-600 h-full animate-infinite-width" style={{ width: '60%' }} />
                                    </div>
                                </div>
                            ) : reconciliationFile ? (
                                <div className="text-xs">
                                    <p className="text-emerald-600 font-bold">{isAr ? 'تم تحميل الملف:' : 'Uploaded File:'}</p>
                                    <p className="text-[10px] text-slate-400 truncate">{reconciliationFile}</p>
                                </div>
                            ) : (
                                <div className="text-[11px] text-slate-400">
                                    <ArrowDownTrayIcon className="w-6 h-6 text-slate-350 mx-auto mb-2" />
                                    {isAr ? 'اسحب كشف الحساب هنا لمطابقته' : 'Drag or click to choose account files'}
                                </div>
                            )}
                        </div>

                        {reconciliationStats && (
                            <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-950 rounded-xl space-y-2 text-[10px] font-bold">
                                <div className="flex justify-between text-emerald-600">
                                    <span>{isAr ? 'القيود المتطابقة بنسبة 100%:' : 'Matched transactions:'}</span>
                                    <span>{reconciliationStats.matched}</span>
                                </div>
                                <div className="flex justify-between text-rose-500">
                                    <span>{isAr ? 'فروقات أو قيود معلقة:' : 'Unresolved entries:'}</span>
                                    <span>{reconciliationStats.unmatched}</span>
                                </div>
                                <div className="flex justify-between border-t border-slate-200 dark:border-gray-800 pt-1.5">
                                    <span>{isAr ? 'الانحراف المتراكم:' : 'Total variance:'}</span>
                                    <span className="font-mono text-rose-500">{formatCurrency(reconciliationStats.variance)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Petty Cash Sub-system */}
                <Card className="p-6 md:p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h4 className="text-md font-bold text-slate-850 dark:text-white flex items-center gap-2">
                            <BanknotesIcon className="w-5 h-5 text-indigo-600" />
                            {isAr ? 'سجل الصرف النقدي والخزينة الفرعية (النثريات)' : 'Subsidiary Ledger (Petty Cash)'}
                        </h4>
                        <Button 
                            variant="primary" 
                            size="sm" 
                            className="rounded-xl px-4 py-2 text-xs font-bold font-sans"
                            leftIcon={<PlusIcon className="w-4 h-4" />}
                            onClick={() => setIsVoucherModalOpen(true)}
                        >
                            {isAr ? 'قيد صادر نثري (سند)' : 'New Petty Cash Voucher'}
                        </Button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-right border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-black text-slate-400">
                                    <th className="py-2.5 px-1">{isAr ? 'رقم السند/التاريخ' : 'Ref / Date'}</th>
                                    <th className="py-2.5 px-1">{isAr ? 'البيان ومصرف النثرية' : 'Details / Vendor'}</th>
                                    <th className="py-2.5 px-1">{isAr ? 'تصنيف النثرية' : 'Category'}</th>
                                    <th className="py-2.5 px-1 text-left">{isAr ? 'المبلغ' : 'Amount'}</th>
                                    <th className="py-2.5 px-1 text-center">{isAr ? 'حالة الدقة والموافقة' : 'Verification Status'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs">
                                {pettyCash.map(v => (
                                    <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                                        <td className="py-3 px-1 text-right">
                                            <p className="font-bold text-slate-800 dark:text-white">{v.id}</p>
                                            <p className="text-[10px] text-slate-400 font-mono">{v.date}</p>
                                        </td>
                                        <td className="py-3 px-1">
                                            <p className="font-bold text-slate-800 dark:text-dm-text leading-tight">{v.description}</p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">{isAr ? `صُرف لـ: ${v.issuedTo}` : `Issued to: ${v.issuedTo}`}</p>
                                        </td>
                                        <td className="py-3 px-1">
                                            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-[10px] font-bold text-slate-500">
                                                {v.category}
                                            </span>
                                        </td>
                                        <td className="py-3 px-1 font-mono text-left font-bold text-rose-500">
                                            -{formatCurrency(v.amount)}
                                        </td>
                                        <td className="py-3 px-1 text-center">
                                            {v.status === 'approved' ? (
                                                <div className="flex items-center justify-center gap-1 text-emerald-500 text-[10px] font-black">
                                                    <CheckCircleIcon className="w-4 h-4" />
                                                    {isAr ? 'معتمد ومرحّل' : 'Authorized'}
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button 
                                                        className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-[9px] text-white rounded font-bold"
                                                        onClick={() => handleApproveVoucher(v.id)}
                                                    >
                                                        {isAr ? 'اعتماد الصرف' : 'Authorize Outflow'}
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Modal for Creating Petty Cash Voucher */}
            <AnimatePresence>
                {isVoucherModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/65 flex items-center justify-center p-4 z-50 animate-in fade-in">
                        <motion.div 
                            initial={{ scale: 0.97, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.97, opacity: 0 }}
                            className="bg-white dark:bg-dm-card rounded-[32px] max-w-md w-full p-8 border border-slate-100 dark:border-slate-800 shadow-2xl space-y-6"
                        >
                            <div className="border-b border-slate-100 dark:border-gray-800 pb-3">
                                <h3 className="text-lg font-black text-slate-850 dark:text-white">
                                    {isAr ? 'تقييد ومطالبة نفقات نثرية' : 'New Sub-ledger Petty Voucher'}
                                </h3>
                                <p className="text-xs text-slate-400">{isAr ? 'سند صرف فوري من خزينة المكتب لمعاملات الضيافة والبرقيات القضائية.' : 'Immediate direct expense claims.'}</p>
                            </div>

                            <div className="space-y-4 text-xs font-bold text-slate-600 dark:text-slate-350">
                                <div>
                                    <label className="block mb-1.5">{isAr ? 'المستفيد / المندوب المتسلم:' : 'Recipient Personnel:'}</label>
                                    <Input 
                                        value={voucherForm.issuedTo}
                                        onChange={(e) => setVoucherForm({...voucherForm, issuedTo: e.target.value})}
                                        placeholder="سعاد الصانع"
                                        className="rounded-xl"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1.5">{isAr ? 'البيان والشرح للتكلفة:' : 'Expenditure statement:'}</label>
                                    <Input 
                                        value={voucherForm.description}
                                        onChange={(e) => setVoucherForm({...voucherForm, description: e.target.value})}
                                        placeholder="ضيافة وفد الموكل بنك بوبيان"
                                        className="rounded-xl"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block mb-1.5">{isAr ? 'قيمة السند نقداً:' : 'Cash amount KWD:'}</label>
                                        <Input 
                                            type="number"
                                            value={voucherForm.amount?.toString()}
                                            onChange={(e) => setVoucherForm({...voucherForm, amount: parseFloat(e.target.value) || 0})}
                                            placeholder="0.000"
                                            className="rounded-xl font-mono text-lg font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1.5">{isAr ? 'مستند النثرية:' : 'Ref Classification:'}</label>
                                        <Select 
                                            value={voucherForm.category}
                                            onChange={(e) => setVoucherForm({...voucherForm, category: e.target.value as any})}
                                            options={[
                                                { label: isAr ? 'ضيافة وضيافة شركاء' : 'Hospitality & Host', value: 'hospitality' },
                                                { label: isAr ? 'أدوات مكتبية وصيانة' : 'Stationery & Papers', value: 'stationery' },
                                                { label: isAr ? 'رسوم بريد ومحكمة الرشوة' : 'Postage & Courts', value: 'postage' },
                                                { label: isAr ? 'وقود لسيارة الشركة' : 'Transport & Gas', value: 'transport' },
                                                { label: isAr ? 'مسابقات وتنقلات مختلفة' : 'Other expense pool', value: 'other' }
                                            ]}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-50 dark:border-gray-800">
                                <Button 
                                    variant="outline" 
                                    className="rounded-xl px-5 text-xs font-bold"
                                    onClick={() => setIsVoucherModalOpen(false)}
                                >
                                    {isAr ? 'إلغاء' : 'Cancel'}
                                </Button>
                                <Button 
                                    variant="primary" 
                                    className="rounded-xl px-6 text-xs font-black shadow-lg shadow-indigo-600/15"
                                    onClick={handleCreateVoucher}
                                >
                                    {isAr ? 'تثبيت وحقن السند' : 'Inject Voucher'}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal for Creating Bank Account */}
            <AnimatePresence>
                {isBankModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/65 flex items-center justify-center p-4 z-50 animate-in fade-in">
                        <motion.div 
                            initial={{ scale: 0.97, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.97, opacity: 0 }}
                            className="bg-white dark:bg-dm-card rounded-[32px] max-w-sm w-full p-8 border border-slate-100 dark:border-slate-800 shadow-2xl space-y-6"
                        >
                            <div className="border-b border-slate-100 dark:border-gray-800 pb-3">
                                <h3 className="text-lg font-black text-slate-850 dark:text-white">
                                    {isAr ? 'ربط وتكامل حساب بنكي جديد' : 'Establish New Bank Core Anchor'}
                                </h3>
                                <p className="text-xs text-slate-400">{isAr ? 'إدخال معلومات البنك والآيبان لإقرار السيولة تلقائياً.' : 'Connect bank interfaces using standard IBAN structure.'}</p>
                            </div>

                            <div className="space-y-4 text-xs font-bold text-slate-600 dark:text-slate-350">
                                <div>
                                    <label className="block mb-1.5">{isAr ? 'اسم البنك باللغة العربية:' : 'Bank Name (AR):'}</label>
                                    <Input 
                                        value={bankForm.name}
                                        onChange={(e) => setBankForm({...bankForm, name: e.target.value})}
                                        placeholder="بنك الخليج"
                                        className="rounded-xl"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1.5">{isAr ? 'اسم البنك بالبرمجة الإنجليزية:' : 'Bank Name (EN):'}</label>
                                    <Input 
                                        value={bankForm.nameEn}
                                        onChange={(e) => setBankForm({...bankForm, nameEn: e.target.value})}
                                        placeholder="Gulf Bank Kuwait"
                                        className="rounded-xl"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1.5">{isAr ? 'رقم الحساب الداخلي الكويتي:' : 'Account Number:'}</label>
                                    <Input 
                                        value={bankForm.number}
                                        onChange={(e) => setBankForm({...bankForm, number: e.target.value})}
                                        placeholder="002-39-445890-1"
                                        className="rounded-xl font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1.5">{isAr ? 'كود الآيبان الدولي المكتمل (IBAN):' : 'International IBAN:'}</label>
                                    <Input 
                                        value={bankForm.iban}
                                        onChange={(e) => setBankForm({...bankForm, iban: e.target.value})}
                                        placeholder="KW12 GULB 0000 0023 9445 8901"
                                        className="rounded-xl font-mono"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block mb-1.5">{isAr ? 'الرصيد الدفتري الافتتاحي:' : 'Starting book bal KWD:'}</label>
                                        <Input 
                                            type="number"
                                            value={bankForm.balance?.toString()}
                                            onChange={(e) => setBankForm({...bankForm, balance: parseFloat(e.target.value) || 0})}
                                            placeholder="5000"
                                            className="rounded-xl font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1.5">{isAr ? 'نوعية الحساب المفتوح:' : 'Account role:'}</label>
                                        <Select 
                                            value={bankForm.type}
                                            onChange={(e) => setBankForm({...bankForm, type: e.target.value as any})}
                                            options={[
                                                { label: isAr ? 'حساب جاري تشغيلي' : 'Current Operations', value: 'current' },
                                                { label: isAr ? 'حساب أمانات الموكلين' : 'Trust Client Deposits', value: 'trust' },
                                                { label: isAr ? 'حساب الضمان Escrow' : 'Escrow Secured Deposits', value: 'escrow' }
                                            ]}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-50 dark:border-gray-800">
                                <Button 
                                    variant="outline" 
                                    className="rounded-xl px-5 text-xs font-bold"
                                    onClick={() => setIsBankModalOpen(false)}
                                >
                                    {isAr ? 'إلغاء' : 'Cancel'}
                                </Button>
                                <Button 
                                    variant="primary" 
                                    className="rounded-xl px-6 text-xs font-black shadow-lg shadow-indigo-600/15"
                                    onClick={handleCreateBankAccount}
                                >
                                    {isAr ? 'ربط الحساب وتثبيته' : 'Establish Link'}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
