import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    HomeIcon, 
    WrenchIcon, 
    CurrencyDollarIcon, 
    ClockIcon, 
    PlusCircleIcon, 
    CheckCircleIcon, 
    ExclamationTriangleIcon,
    TrashIcon,
    UserCircleIcon,
} from '@heroicons/react/24/outline';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { Badge } from '../ui/Badge';
import { useToast } from '../ui/Toast';

interface RentalContract {
    id: string;
    unitNumber: string;
    propertyAddressAr: string;
    propertyAddressEn: string;
    tenantNameAr: string;
    tenantNameEn: string;
    monthlyRent: number;
    startDate: string;
    endDate: string;
    collectionStatus: 'paid' | 'overdue' | 'pending';
    outstandingBalance: number;
    utilityFees: number;
    maintenanceHistory: { date: string; cost: number; issue: string }[];
}

interface PropertiesTabProps {
    formatCurrency: (amount: number, currency?: string) => string;
    isAr?: boolean;
}

export const PropertiesTab: React.FC<PropertiesTabProps> = ({ formatCurrency, isAr = true }) => {
    const { addToast } = useToast();

    // 1. Core Property and Rentals State
    const [contracts, setContracts] = useState<RentalContract[]>([
        {
            id: 'PROP-01',
            unitNumber: 'المكتب 302 - الدور الثالث',
            propertyAddressAr: 'برج الصفاة التجاري، شارع فهد السالم، مدينة الكويت',
            propertyAddressEn: 'Al-Safat Tower, Fahad Al-Salem St, Kuwait City',
            tenantNameAr: 'شطا العالمية للبرمجيات والذكاء المالي',
            tenantNameEn: 'Shata Global Software & Financial Intelligence',
            monthlyRent: 850,
            startDate: '2023-01-01',
            endDate: '2025-12-31',
            collectionStatus: 'paid',
            outstandingBalance: 0,
            utilityFees: 30,
            maintenanceHistory: [
                { date: '2023-06-15', cost: 120, issue: 'إصلاح وصيانة التكييف المركزي والمراوح الخارجية' },
                { date: '2024-02-10', cost: 45, issue: 'تبديل الكشافات والإضاءة الداخلية لغرف المرافعة' }
            ]
        },
        {
            id: 'PROP-02',
            unitNumber: 'الدور 12 - الطابق بالكامل',
            propertyAddressAr: 'أبراج أوتاد الاستثمارية، شارع أحمد الجابر، الشرق',
            propertyAddressEn: 'Awtad Commercial Towers, Ahmed Al-Jaber St, Sharq',
            tenantNameAr: 'شركة المقاولات الإنشائية الكبرى',
            tenantNameEn: 'The Civil Engineering Group Ltd.',
            monthlyRent: 2400,
            startDate: '2022-05-15',
            endDate: '2024-05-14',
            collectionStatus: 'overdue',
            outstandingBalance: 4800, // 2 Months unpaid
            utilityFees: 120,
            maintenanceHistory: [
                { date: '2023-11-01', cost: 350, issue: 'تصليح هبوط مواسير مياه الملحق وشبكة الإطفاء' }
            ]
        },
        {
            id: 'PROP-03',
            unitNumber: 'شقة 104 - الطابق الأول',
            propertyAddressAr: 'مجمع الياسمين السكني، شارع عمان، السالمية',
            propertyAddressEn: 'Al-Yasmeen Residential, Amman St, Salmiya',
            tenantNameAr: 'السيد صفي الدين الشواف (المستشار القانوني)',
            tenantNameEn: 'Mr. Safi Eddine Shawaf (Legal Consultant)',
            monthlyRent: 450,
            startDate: '2023-10-01',
            endDate: '2024-09-30',
            collectionStatus: 'pending',
            outstandingBalance: 450, // current month pending
            utilityFees: 15,
            maintenanceHistory: []
        }
    ]);

    // Form modal state
    const [isAddContractOpen, setIsAddContractOpen] = useState(false);
    const [selectedContractForDetails, setSelectedContractForDetails] = useState<RentalContract | null>(null);

    // Form inputs state
    const [unitNumber, setUnitNumber] = useState('');
    const [propertyAddressAr, setPropertyAddressAr] = useState('');
    const [propertyAddressEn, setPropertyAddressEn] = useState('');
    const [tenantNameAr, setTenantNameAr] = useState('');
    const [tenantNameEn, setTenantNameEn] = useState('');
    const [monthlyRent, setMonthlyRent] = useState(500);
    const [utilityFees, setUtilityFees] = useState(20);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Maintenance registration values
    const [maintenanceCost, setMaintenanceCost] = useState(50);
    const [maintenanceIssue, setMaintenanceIssue] = useState('');

    // Totals calculations
    const stats = useMemo(() => {
        const totalRentAssets = contracts.reduce((acc, c) => acc + c.monthlyRent, 0);
        const outstandingRent = contracts.reduce((acc, c) => acc + c.outstandingBalance, 0);
        const collectedRentThisMonth = contracts
            .filter(c => c.collectionStatus === 'paid')
            .reduce((acc, c) => acc + c.monthlyRent, 0);

        return {
            totalRentAssets,
            outstandingRent,
            collectedRentThisMonth
        };
    }, [contracts]);

    const handleCreateContract = () => {
        if (!unitNumber || !tenantNameAr || !tenantNameEn || !propertyAddressAr || !propertyAddressEn) {
            addToast({
                type: 'error',
                title: isAr ? 'بيانات ناقصة' : 'Details Missing',
                message: isAr ? 'الرجاء إدخال تفاصيل العقار والمدينة واسم المستأجر باللغتين.' : 'All field references are required.'
            });
            return;
        }

        const newContract: RentalContract = {
            id: `PROP-${contracts.length + 10}`,
            unitNumber,
            propertyAddressAr,
            propertyAddressEn,
            tenantNameAr,
            tenantNameEn,
            monthlyRent: Number(monthlyRent),
            startDate: startDate || new Date().toISOString().split('T')[0],
            endDate: endDate || new Date(new Date().getFullYear() + 1, 11, 31).toISOString().split('T')[0],
            collectionStatus: 'pending',
            outstandingBalance: 0,
            utilityFees: Number(utilityFees),
            maintenanceHistory: []
        };

        setContracts([...contracts, newContract]);
        setIsAddContractOpen(false);
        resetForm();

        addToast({
            type: 'success',
            title: isAr ? 'تم تقييد خطة الإيجار' : 'Asset Contract Registered',
            message: isAr ? 'تم تسجيل الوحدة وتفعيل مسار إيرادات العقارات ذمماً.' : 'Registered location values and saved metadata.'
        });
    };

    const resetForm = () => {
        setUnitNumber('');
        setPropertyAddressAr('');
        setPropertyAddressEn('');
        setTenantNameAr('');
        setTenantNameEn('');
        setMonthlyRent(500);
        setUtilityFees(20);
        setStartDate('');
        setEndDate('');
    };

    const registerMaintenance = (contractId: string) => {
        if (!maintenanceIssue) return;

        setContracts(prev => prev.map(c => {
            if (c.id !== contractId) return c;
            
            const list = [...c.maintenanceHistory, {
                date: new Date().toISOString().split('T')[0],
                cost: Number(maintenanceCost),
                issue: maintenanceIssue
            }];

            return {
                ...c,
                maintenanceHistory: list
            };
        }));

        // Dynamic visual update
        if (selectedContractForDetails && selectedContractForDetails.id === contractId) {
            setSelectedContractForDetails(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    maintenanceHistory: [
                        ...prev.maintenanceHistory,
                        {
                            date: new Date().toISOString().split('T')[0],
                            cost: Number(maintenanceCost),
                            issue: maintenanceIssue
                        }
                    ]
                };
            });
        }

        setMaintenanceIssue('');
        addToast({
            type: 'success',
            title: isAr ? 'تم قيد تكلفة الصيانة' : 'Maintenance Cost Accounted',
            message: isAr ? 'تم إدراج نفقة الصيانة وخصمها دفترياً من ريع الوحدة.' : 'Recorded estate repair and cleared expense balance.'
        });
    };

    const collectRentInvoice = (contractId: string) => {
        setContracts(prev => prev.map(c => {
            if (c.id !== contractId) return c;
            
            return {
                ...c,
                collectionStatus: 'paid',
                outstandingBalance: 0
            };
        }));

        if (selectedContractForDetails && selectedContractForDetails.id === contractId) {
            setSelectedContractForDetails(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    collectionStatus: 'paid',
                    outstandingBalance: 0
                };
            });
        }

        addToast({
            type: 'success',
            title: isAr ? 'تم تحصيل ريع الإيجار' : 'Rent Collected',
            message: isAr ? 'تم إيداع مبلغ الإيجار والبدلات في خزينة الميزانية وتصفية الرصيد.' : 'Unpaid balances cleared and moved to ledger.'
        });
    };

    return (
        <div className="space-y-8 text-right" dir={isAr ? 'rtl' : 'ltr'}>
            
            {/* Action and metrics overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. Monthly Expected revenues */}
                <Card className="p-6 rounded-[2rem] border-none shadow-xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full blur-2xl translate-x-1/3 -translate-y-1/3" />
                    <p className="text-[10px] font-black uppercase tracking-wider text-white/60 mb-1">{isAr ? 'ريع الأصول والعقارات شهرياً' : 'Total Monthly Rent Yield'}</p>
                    <h3 className="text-2xl font-black font-mono tracking-tight">
                        {formatCurrency(stats.totalRentAssets)}
                    </h3>
                </Card>

                {/* 2. Outstanding unpaid lease */}
                <Card className="p-6 rounded-[2rem] border-none shadow-xl bg-gradient-to-br from-rose-900 to-rose-950 text-white relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full blur-2xl translate-x-1/3 -translate-y-1/3" />
                    <p className="text-[10px] font-black uppercase tracking-wider text-rose-100/70 mb-1">{isAr ? 'أرصدة إيجارية متأخرة الدفع' : 'Arrears Outstanding'}</p>
                    <h3 className="text-2xl font-black font-mono tracking-tight text-rose-300">
                        {formatCurrency(stats.outstandingRent)}
                    </h3>
                </Card>

                {/* 3. Realized rent collected this month */}
                <Card className="p-6 rounded-[2rem] border-none shadow-xl bg-gradient-to-br from-[#004D40] to-emerald-800 text-white relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full blur-2xl translate-x-1/3 -translate-y-1/3" />
                    <p className="text-[10px] font-black uppercase tracking-wider text-emerald-100/70 mb-1">{isAr ? 'المحصل الفعلي هذا الشهر' : 'Rent Received (Month)'}</p>
                    <h3 className="text-2xl font-black font-mono tracking-tight">
                        {formatCurrency(stats.collectedRentThisMonth)}
                    </h3>
                </Card>
            </div>

            {/* Split page layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Rental Properties List */}
                <Card className="p-6 md:p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h4 className="text-md font-bold text-slate-850 dark:text-white flex items-center gap-2">
                                <HomeIcon className="w-5 h-5 text-indigo-600" />
                                {isAr ? 'كشف الأصول العقارية والمحيط الإيجاري للمكتب' : 'Sub-assets Real-estate Properties'}
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-1">
                                {isAr ? 'إدارة العقارات والوحدات المأجورة إدارياً أو سكنياً وتتبع سداد الإيجارات بدقة.' : 'Oversee owned locations, rents collection loops, maintenance costs and utilities invoices.'}
                            </p>
                        </div>
                        <Button 
                            variant="primary" 
                            size="sm" 
                            className="rounded-xl px-4 py-2 text-xs font-bold font-sans"
                            leftIcon={<PlusCircleIcon className="w-4 h-4" />}
                            onClick={() => setIsAddContractOpen(true)}
                        >
                            {isAr ? 'تسجيل عقد جديد' : 'New Contract'}
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {contracts.map(c => (
                            <div key={c.id} className="p-5 bg-slate-50 dark:bg-dm-background rounded-[2rem] border border-slate-100 dark:border-slate-850 hover:bg-slate-100/50 transition-all flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden group">
                                <div className={`absolute top-0 right-0 w-2 h-full rounded-r-none ${
                                    c.collectionStatus === 'overdue' ? 'bg-rose-500' : c.collectionStatus === 'pending' ? 'bg-amber-400' : 'bg-emerald-500'
                                }`} />

                                <div className="space-y-1 flex-1 pr-3">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h5 className="font-bold text-slate-800 dark:text-white text-sm">
                                            {c.unitNumber}
                                        </h5>
                                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                                            c.collectionStatus === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                        }`}>
                                            {c.collectionStatus === 'paid' ? (isAr ? 'مستوفى سداده' : 'Fully Paid') : (isAr ? 'مستحَق ومطلوب' : 'Dues outstanding')}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                                        {isAr ? c.propertyAddressAr : c.propertyAddressEn}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-bold whitespace-nowrap overflow-hidden text-ellipsis flex items-center gap-1.5 mt-1">
                                        <UserCircleIcon className="w-4 h-4" />
                                        {isAr ? `المستأجر: ${c.tenantNameAr}` : `Tenant: ${c.tenantNameEn}`}
                                    </p>
                                </div>

                                <div className="text-left md:border-r border-slate-100 dark:border-gray-800 md:pr-6 md:pl-2 flex flex-col justify-center items-end min-w-[150px]">
                                    <p className="text-[10px] text-slate-400 font-bold">{isAr ? 'الإيجار الشهري الكلي:' : 'Lease Rate Monthly:'}</p>
                                    <h4 className="text-xl font-black text-indigo-600 dark:text-primary-light font-mono tracking-tighter mt-0.5">
                                        {formatCurrency(c.monthlyRent)}
                                    </h4>
                                    
                                    <button 
                                        className="text-[10px] font-black text-indigo-600 hover:underline mt-2 flex items-center gap-1.5 bg-indigo-50/50 hover:bg-indigo-100/50 px-2.5 py-1 rounded-lg transition-colors"
                                        onClick={() => setSelectedContractForDetails(c)}
                                    >
                                        {isAr ? 'تفاصيل السجل والصيانة' : 'View Repairs Sheet'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Sub-asset Repair list and balance clearing */}
                <div className="space-y-6">
                    <Card className="p-6 md:p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl space-y-5">
                        <div className="flex items-center gap-2 text-slate-800 dark:text-white">
                            <WrenchIcon className="w-5 h-5 text-indigo-600" />
                            <h4 className="font-bold text-sm">{isAr ? 'سجل تتبع الصيانة والتشغيل' : 'Maintenance Audit Logs'}</h4>
                        </div>

                        {selectedContractForDetails ? (
                            <div className="space-y-5 animate-in fade-in">
                                <div className="bg-slate-50 dark:bg-dm-background p-4 rounded-[1.5rem] space-y-1.5 text-xs">
                                    <p className="text-[10px] text-indigo-600 font-bold uppercase">{selectedContractForDetails.id}</p>
                                    <h5 className="font-bold text-slate-850 dark:text-white text-xs">{selectedContractForDetails.unitNumber}</h5>
                                    
                                    {selectedContractForDetails.collectionStatus !== 'paid' && (
                                        <div className="flex justify-between items-center border-t border-slate-100 dark:border-gray-800 pt-2.5 mt-2">
                                            <span className="text-rose-500 font-bold">{isAr ? 'متأخر الإيجار الكلي:' : 'Rent overdue:'}</span>
                                            <span className="font-mono font-black text-rose-500 text-sm">{formatCurrency(selectedContractForDetails.outstandingBalance || selectedContractForDetails.monthlyRent)}</span>
                                        </div>
                                    )}

                                    {selectedContractForDetails.collectionStatus !== 'paid' && (
                                        <Button 
                                            size="sm" 
                                            fullWidth 
                                            className="mt-3 text-[10px] font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                                            onClick={() => collectRentInvoice(selectedContractForDetails.id)}
                                        >
                                            {isAr ? 'تسوية ودفع الدفعة الحالية' : 'Mark as Lease Paid'}
                                        </Button>
                                    )}
                                </div>

                                <div className="space-y-3 pt-3">
                                    <h6 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{isAr ? 'تاريخ صيانة الوحدة:' : 'Repairs log list:'}</h6>
                                    {selectedContractForDetails.maintenanceHistory.length > 0 ? (
                                        <div className="divide-y divide-slate-100 dark:divide-slate-850">
                                            {selectedContractForDetails.maintenanceHistory.map((m, i) => (
                                                <div key={i} className="py-2.5 text-xs text-slate-600 space-y-1">
                                                    <div className="flex justify-between font-bold text-[10px]">
                                                        <span className="text-slate-400 font-mono">{m.date}</span>
                                                        <span className="text-rose-500 font-mono">-{formatCurrency(m.cost)}</span>
                                                    </div>
                                                    <p className="leading-relaxed font-semibold text-slate-700 dark:text-slate-350">{m.issue}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-[10px] text-slate-400 italic py-2">{isAr ? 'لا توجد طلبات صيانة مسجلة حتى الآن.' : 'Zero repairs logged within this loop.'}</p>
                                    )}
                                </div>

                                {/* Register new maintenance entry */}
                                <div className="border-t border-slate-100 dark:border-gray-800 pt-4 space-y-3 text-xs font-bold text-slate-600 dark:text-slate-350">
                                    <h6 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest">{isAr ? 'إدراج معاملة صيانة وإصلاح:' : 'Record Estate Modification:'}</h6>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block mb-1">{isAr ? 'تكلفة الصيانة:' : 'Cost KWD:'}</label>
                                            <Input 
                                                type="number"
                                                value={maintenanceCost?.toString()}
                                                onChange={(e) => setMaintenanceCost(parseFloat(e.target.value) || 0)}
                                                className="rounded-xl font-mono text-xs"
                                            />
                                        </div>
                                        <div>
                                            <label className="block mb-1">{isAr ? 'تفاصيل العطل والشرح:' : 'Description:'}</label>
                                            <Input 
                                                value={maintenanceIssue}
                                                onChange={(e) => setMaintenanceIssue(e.target.value)}
                                                placeholder="..."
                                                className="rounded-xl text-xs"
                                            />
                                        </div>
                                    </div>
                                    <Button 
                                        size="sm" 
                                        fullWidth 
                                        variant="outline" 
                                        className="text-[10px]"
                                        onClick={() => registerMaintenance(selectedContractForDetails.id)}
                                    >
                                        {isAr ? 'قيد نفقة الصيانة' : 'Post Maintenance expense'}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem]">
                                <ExclamationTriangleIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                <p className="text-[11px] text-slate-400">{isAr ? 'اضغط على تفاصيل السجل لأي وحدة لمتابعة وتسجيل تكاليف الصيانة.' : 'Check location outlines to trigger custom maintenance ledgers.'}</p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            {/* Modal for Creating New Lease Contract */}
            <AnimatePresence>
                {isAddContractOpen && (
                    <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/65 flex items-center justify-center p-4 z-50 animate-in fade-in">
                        <motion.div 
                            initial={{ scale: 0.97, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.97, opacity: 0 }}
                            className="bg-white dark:bg-dm-card rounded-[32px] max-w-md w-full p-8 border border-slate-100 dark:border-slate-800 shadow-2xl space-y-6"
                        >
                            <div className="border-b border-slate-100 dark:border-gray-800 pb-3">
                                <h3 className="text-lg font-black text-slate-850 dark:text-white">
                                    {isAr ? 'قيد وحدة وتأسيس عهدة إيجارية' : 'Establish Real-estate Unit Contract'}
                                </h3>
                                <p className="text-xs text-slate-400">{isAr ? 'ربط أصول المكاتب الاستثمارية بسير المحاصيل الإيجارية والبدلات.' : 'Register rental contracts tied to financial book assets.'}</p>
                            </div>

                            <div className="space-y-4 text-xs font-bold text-slate-600 dark:text-slate-350">
                                <div>
                                    <label className="block mb-1.5">{isAr ? 'رقم وتوصيف مكتب/شقة بالدور:' : 'Unit number / Description:'}</label>
                                    <Input 
                                        value={unitNumber}
                                        onChange={(e) => setUnitNumber(e.target.value)}
                                        placeholder="شقة 403، الدور الرابع"
                                        className="rounded-xl"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block mb-1.5">{isAr ? 'العنوان بالكامل (عربي):' : 'Property Address (AR):'}</label>
                                        <Input 
                                            value={propertyAddressAr}
                                            onChange={(e) => setPropertyAddressAr(e.target.value)}
                                            placeholder="برج المدينة، الشرق"
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1.5">{isAr ? 'العنوان بالكامل (إنجليزي):' : 'Property Address (EN):'}</label>
                                        <Input 
                                            value={propertyAddressEn}
                                            onChange={(e) => setPropertyAddressEn(e.target.value)}
                                            placeholder="City Complex, Sharq, KWT"
                                            className="rounded-xl"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block mb-1.5">{isAr ? 'المستأجر بالكامل (عربي):' : 'Tenant Name (AR):'}</label>
                                        <Input 
                                            value={tenantNameAr}
                                            onChange={(e) => setTenantNameAr(e.target.value)}
                                            placeholder="شركة البترول المحلية"
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1.5">{isAr ? 'المستأجر بالكامل (إنجليزي):' : 'Tenant Name (EN):'}</label>
                                        <Input 
                                            value={tenantNameEn}
                                            onChange={(e) => setTenantNameEn(e.target.value)}
                                            placeholder="Kuwait Petroleum Co."
                                            className="rounded-xl"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 border-t border-slate-55 dark:border-gray-500 pt-4">
                                    <div>
                                        <label className="block mb-1.5">{isAr ? 'الإيجار الشهري KWD:' : 'Rent amount KWD:'}</label>
                                        <Input 
                                            type="number"
                                            value={monthlyRent?.toString()}
                                            onChange={(e) => setMonthlyRent(parseFloat(e.target.value) || 0)}
                                            className="rounded-xl font-mono text-sm font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1.5">{isAr ? 'بديل الخدمات والكهرباء شهرياً:' : 'Utilities KWD:'}</label>
                                        <Input 
                                            type="number"
                                            value={utilityFees?.toString()}
                                            onChange={(e) => setUtilityFees(parseFloat(e.target.value) || 0)}
                                            className="rounded-xl font-mono text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-50 dark:border-gray-800">
                                <Button 
                                    variant="outline" 
                                    className="rounded-xl px-5 text-xs font-bold"
                                    onClick={() => {
                                        setIsAddContractOpen(false);
                                        resetForm();
                                    }}
                                >
                                    {isAr ? 'إلغاء' : 'Cancel'}
                                </Button>
                                <Button 
                                    variant="primary" 
                                    className="rounded-xl px-6 text-xs font-black shadow-lg shadow-indigo-600/15"
                                    onClick={handleCreateContract}
                                >
                                    {isAr ? 'تمرير وقيد العقد' : 'Secure contract'}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
