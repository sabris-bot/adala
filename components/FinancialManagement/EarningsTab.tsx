import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
    Coins, 
    Percent, 
    TrendingUp, 
    ShieldAlert, 
    Briefcase, 
    User,
    CheckCircle,
    ArrowUpRight,
    Settings,
    FileSpreadsheet
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useToast } from '../ui/Toast';

interface EarningsLedgerRecord {
    id: string;
    targetUser: string;
    role: 'lawyer' | 'consultant';
    underlyingCase: string;
    transactionAmount: number;
    platformShare: number;
    userPayout: number;
    status: 'transferred' | 'pending';
    payoutDate: string;
}

interface EarningsTabProps {
    formatCurrency: (amount: number, currency?: string) => string;
}

export const EarningsTab: React.FC<EarningsTabProps> = ({ formatCurrency }) => {
    const { addToast } = useToast();
    
    // Default config values for splits % (Must total 100%)
    const [platformPct, setPlatformPct] = useState(25);
    const [lawyerPct, setLawyerPct] = useState(45);
    const [consultantPct, setConsultantPct] = useState(30);

    // Filter type
    const [filterRole, setFilterRole] = useState<'all' | 'lawyer' | 'consultant'>('all');

    // User ledger dataset for profits
    const [ledger, setLedger] = useState<EarningsLedgerRecord[]>([
        {
            id: 'TXN-EARN-001',
            targetUser: 'المستشار صبري شطا',
            role: 'consultant',
            underlyingCase: 'قضية بنك بوبيان ضد شركة المقاولات',
            transactionAmount: 15000,
            platformShare: 3750, // 25% of 15,000
            userPayout: 4500, // 30% of 15,000 (Consultant share under custom 45-30 ratio)
            status: 'transferred',
            payoutDate: '2024-05-18'
        },
        {
            id: 'TXN-EARN-002',
            targetUser: 'المحامي فهد الرشيدي',
            role: 'lawyer',
            underlyingCase: 'قضية بنك بوبيان ضد شركة المقاولات',
            transactionAmount: 15000,
            platformShare: 3750,
            userPayout: 6750, // 45% of 15,000
            status: 'transferred',
            payoutDate: '2024-05-18'
        },
        {
            id: 'TXN-EARN-003',
            targetUser: 'المحامية فاطمة علي',
            role: 'lawyer',
            underlyingCase: 'تدقيق وصياغة لوائح شركة الغانم',
            transactionAmount: 5700,
            platformShare: 1425,
            userPayout: 2565,
            status: 'transferred',
            payoutDate: '2024-05-12'
        },
        {
            id: 'TXN-EARN-004',
            targetUser: 'المستشار صبري شطا',
            role: 'consultant',
            underlyingCase: 'تصفية تركة ورثة العبدالله التجارية',
            transactionAmount: 8500,
            platformShare: 2125,
            userPayout: 2550,
            status: 'pending',
            payoutDate: '2024-05-30'
        },
        {
            id: 'TXN-EARN-005',
            targetUser: 'المحامي أحمد الصالح',
            role: 'lawyer',
            underlyingCase: 'نزاع شراكة مجموعة المرزوق التجارية',
            transactionAmount: 25000,
            platformShare: 6250,
            userPayout: 11250,
            status: 'pending',
            payoutDate: '2024-06-05'
        }
    ]);

    const handleUpdatePercentages = (type: 'platform' | 'lawyer' | 'consultant', val: number) => {
        const num = Math.min(100, Math.max(0, val));
        
        if (type === 'platform') {
            setPlatformPct(num);
            // Rebalance remaining 100% between other 2 proportionally
            const remaining = 100 - num;
            setLawyerPct(Math.round(remaining * 0.6));
            setConsultantPct(remaining - Math.round(remaining * 0.6));
        } else if (type === 'lawyer') {
            setLawyerPct(num);
            const remaining = 100 - num;
            setPlatformPct(Math.round(remaining * 0.4));
            setConsultantPct(remaining - Math.round(remaining * 0.4));
        } else {
            setConsultantPct(num);
            const remaining = 100 - num;
            setPlatformPct(Math.round(remaining * 0.45));
            setLawyerPct(remaining - Math.round(remaining * 0.45));
        }
    };

    const handleConfirmPayout = (id: string) => {
        setLedger(prev => prev.map(item => {
            if (item.id === id) {
                return { ...item, status: 'transferred' };
            }
            return item;
        }));
        addToast({
            type: 'success',
            title: 'تم صرف المستحقات الماليّة ✅',
            message: 'تمت المقاصّة الرقمية وصرف العمولات المستقطعة لحساب المستشار بنجاح.'
        });
    };

    const handleExportLedger = () => {
        let text = "ID,Beneficiary,Role,Underlying Case,Gross Amount,Platform Keep,Partner Net Payout,Status,Payment Date\n";
        ledger.forEach(it => {
            text += `${it.id},${it.targetUser},${it.role},"${it.underlyingCase}",${it.transactionAmount},${it.platformShare},${it.userPayout},${it.status},${it.payoutDate}\n`;
        });
        
        const uri = "data:text/csv;charset=utf-8," + encodeURIComponent(text);
        const link = document.createElement("a");
        link.setAttribute("href", uri);
        link.setAttribute("download", `earnings-report-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        addToast({
            type: 'success',
            title: 'توليد التقرير المالي 📥',
            message: 'تم تصدير مستند تفصيل عوائد الشركاء والملخص الضريبي للعام الحالي بنجاح.'
        });
    };

    const filteredLedger = ledger.filter(item => {
        if (filterRole === 'all') return true;
        return item.role === filterRole;
    });

    return (
        <div className="space-y-6 text-right" dir="rtl">
            
            {/* Split Commission Config Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* 1. sliders of configuration */}
                <div className="lg:col-span-4 bg-white dark:bg-dm-card p-6 rounded-[2.5rem] border border-slate-150 dark:border-slate-800 shadow-sm space-y-6">
                    <div>
                        <h3 className="text-sm font-black text-slate-850 dark:text-white flex items-center gap-1.5">
                            <Settings className="w-5 h-5 text-primary" /> إعداد وتوزيع نسب العمولات الذاتية %
                        </h3>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-bold">بوابة حوكمة وتقسيم الإيرادات تلقائياً وفق العقود المبرمة</p>
                    </div>

                    <div className="space-y-4">
                        
                        {/* Slide 1: Platform */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold text-slate-650 dark:text-slate-350">
                                <span>عمولة إدارة المنصة (Platform Fee):</span>
                                <span className="font-mono text-primary">{platformPct}%</span>
                            </div>
                            <input 
                                type="range" 
                                min={0} 
                                max={100}
                                value={platformPct}
                                onChange={(e) => handleUpdatePercentages('platform', parseInt(e.target.value))}
                                className="w-full h-1.5 bg-slate-100 dark:bg-slate-850 rounded-lg cursor-pointer accent-primary"
                            />
                        </div>

                        {/* Slide 2: Lawyer */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold text-slate-650 dark:text-slate-350">
                                <span>حصة المحامي الترافعي الشريك:</span>
                                <span className="font-mono text-primary">{lawyerPct}%</span>
                            </div>
                            <input 
                                type="range" 
                                min={0} 
                                max={100}
                                value={lawyerPct}
                                onChange={(e) => handleUpdatePercentages('lawyer', parseInt(e.target.value))}
                                className="w-full h-1.5 bg-slate-100 dark:bg-slate-850 rounded-lg cursor-pointer accent-primary"
                            />
                        </div>

                        {/* Slide 3: Consultant */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold text-slate-650 dark:text-slate-350">
                                <span>أتعاب المستشار القانوني الفاحص:</span>
                                <span className="font-mono text-primary">{consultantPct}%</span>
                            </div>
                            <input 
                                type="range" 
                                min={0} 
                                max={100}
                                value={consultantPct}
                                onChange={(e) => handleUpdatePercentages('consultant', parseInt(e.target.value))}
                                className="w-full h-1.5 bg-slate-100 dark:bg-slate-850 rounded-lg cursor-pointer accent-primary"
                            />
                        </div>

                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-850 text-center text-[10px] font-bold text-slate-450 dark:text-slate-400">
                        مجموع نسب الاقتسام: <span className="text-emerald-600 font-mono font-black">{platformPct + lawyerPct + consultantPct}%</span>
                        {platformPct + lawyerPct + consultantPct === 100 ? (
                            <span className="text-[9px] text-emerald-500 block mt-1 font-black">✓ التوازن المحاسبي مستمر وفعال</span>
                        ) : (
                            <span className="text-[9px] text-rose-500 block mt-1 font-black">⚠️ تنبيه: يرجى الحفاظ على المجموع 100% لمنع حدوث فروقات مالية</span>
                        )}
                    </div>
                </div>

                {/* 2. List of Profits Ledgers */}
                <div className="lg:col-span-8 bg-white dark:bg-dm-card p-6 rounded-[2.5rem] border border-slate-150 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h3 className="text-sm font-black text-slate-850 dark:text-white flex items-center gap-1.5">
                                <Coins className="w-5 h-5 text-primary" /> سجل صرف العمولات للشركاء والمحامين المقيدين
                            </h3>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-bold">مراجعة كشف المستحقات المفرزة وتحديث قيود تحويل البنك لبيت التمويل الكويتي</p>
                        </div>

                        <div className="flex gap-1.5">
                            <Button 
                                onClick={handleExportLedger}
                                className="h-9 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 dark:border-slate-850 text-slate-600 dark:text-slate-350 text-[10px] font-black flex items-center gap-1"
                            >
                                <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> تصدير الكشف excel
                            </Button>
                        </div>
                    </div>

                    <div className="flex justify-start gap-1.5 pt-2">
                        {(['all', 'lawyer', 'consultant'] as const).map(role => (
                            <button
                                key={role}
                                onClick={() => setFilterRole(role)}
                                className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all ${filterRole === role ? 'bg-primary text-white shadow-md' : 'bg-slate-50 dark:bg-slate-900 text-slate-400'}`}
                            >
                                {role === 'all' ? 'جميع الشركاء' : role === 'lawyer' ? 'المحامين الشركاء' : 'المستشارين القانونيين'}
                            </button>
                        ))}
                    </div>

                    {/* Table grid portion */}
                    <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-850">
                        <table className="w-full text-right text-xs" dir="rtl">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-850 text-slate-450 dark:text-slate-500 font-bold">
                                    <th className="px-5 py-3">المستفيد</th>
                                    <th className="px-5 py-3 font-mono text-center">الصفة</th>
                                    <th className="px-5 py-3 text-left">مجموع القضية (Gross)</th>
                                    <th className="px-5 py-3 text-left">عمولة المنصة</th>
                                    <th className="px-5 py-3 text-left">صافي المستحق (Net)</th>
                                    <th className="px-5 py-3 text-center">الوضعيّة</th>
                                    <th className="px-5 py-3 text-center">الإجراء</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                                {filteredLedger.map((it) => (
                                    <tr key={it.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/10">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-primary/5 dark:bg-primary-dark/20 text-primary dark:text-primary-light rounded-lg">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-800 dark:text-slate-200 block">{it.targetUser}</span>
                                                    <span className="text-[9px] text-slate-400 block truncate max-w-[180px]">{it.underlyingCase}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded ${it.role === 'lawyer' ? 'bg-primary/10 dark:bg-primary-dark/30 text-primary' : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600'}`}>
                                                {it.role === 'lawyer' ? 'محامٍ شريك' : 'مستشار'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-left font-mono font-bold text-slate-400">
                                            {formatCurrency(it.transactionAmount)}
                                        </td>
                                        <td className="px-5 py-4 text-left font-mono font-semibold text-rose-500">
                                            -{formatCurrency(it.platformShare)}
                                        </td>
                                        <td className="px-5 py-4 text-left font-mono font-black text-emerald-600">
                                            {formatCurrency(it.userPayout)}
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            {it.status === 'transferred' ? (
                                                <span className="text-[9px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/25 px-2 py-0.5 rounded-md font-bold">تم التحويل بنجاح</span>
                                            ) : (
                                                <span className="text-[9px] text-amber-600 bg-amber-50 dark:bg-amber-950/25 px-2 py-0.5 rounded-md font-bold">بانتظار الصرف</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            {it.status === 'pending' ? (
                                                <button
                                                    onClick={() => handleConfirmPayout(it.id)}
                                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[9px] font-black align-middle"
                                                >
                                                    تأكيد الدفع
                                                </button>
                                            ) : (
                                                <span className="text-slate-350 text-[10px] font-bold">سند مبرم</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

        </div>
    );
};
