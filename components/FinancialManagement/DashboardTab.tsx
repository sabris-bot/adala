import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
    TrendingUp, 
    TrendingDown, 
    DollarSign, 
    ArrowUpRight, 
    ArrowDownRight, 
    Activity, 
    Award, 
    Calendar,
    Briefcase,
    Users
} from 'lucide-react';
import { FinancialTransaction } from '../../types';

interface DashboardTabProps {
    transactions: FinancialTransaction[];
    formatCurrency: (amount: number, currency?: string) => string;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({ transactions, formatCurrency }) => {
    const [timeframe, setTimeframe] = useState<'daily' | 'monthly' | 'yearly'>('monthly');

    // Stats calculations
    const totalRevenue = transactions
        .filter(t => t.amount > 0 && t.category !== 'TRUST_ACCOUNT')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const netProfit = totalRevenue - totalExpenses;

    const trustBalance = 182450.000; // Mock trust balance as defined in main page

    // High performance case performers
    const casePerformers = [
        { title: 'قضية بنك بوبيان ضد شركة المقاولات', amount: 12500, lawyer: 'فهد الرشيدي', status: 'مربحة جداً' },
        { title: 'نزاع شراكة مجموعة المرزوق التجارية', amount: 8400, lawyer: 'صبري شطا', status: 'مكتملة' },
        { title: 'تحصيل تعويضات شركة الخليج للتأمين', amount: 15000, lawyer: 'أحمد العبدالله', status: 'قيد المتابعة' },
        { title: 'صياغة عقود استحواذ مجموعة الصناعات', amount: 3200, lawyer: 'فاطمة علي', status: 'مكتملة' }
    ];

    // Lawyer performance metrics
    const lawyerPerformers = [
        { name: 'المستشار صبري شطا', revenue: 24500, share: '35%', count: 12 },
        { name: 'المحامي فهد الرشيدي', revenue: 18200, share: '50%', count: 18 },
        { name: 'المحامية فاطمة علي', revenue: 9800, share: '40%', count: 8 },
        { name: 'المحامي أحمد الصالح', revenue: 6500, share: '50%', count: 5 }
    ];

    // Dynamic metrics based on timeframe
    const getTimeframeMultiplier = () => {
        if (timeframe === 'daily') return 0.033;
        if (timeframe === 'yearly') return 12;
        return 1;
    };

    const multiplier = getTimeframeMultiplier();

    return (
        <div className="space-y-6 text-right" dir="rtl">
            
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* 1. Revenue Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-6 bg-white dark:bg-dm-card rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-md relative overflow-hidden group"
                >
                    <div className="absolute top-0 left-0 w-2 h-full bg-emerald-505 bg-emerald-500 rounded-r-none" />
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-lg flex items-center gap-0.5">
                            <ArrowUpRight className="w-3 h-3" /> +14.2%
                        </span>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                        الإيرادات ({timeframe === 'daily' ? 'اليومية المتوقعة' : timeframe === 'yearly' ? 'السنوية المتراكمة' : 'الشهر الجاري'})
                    </span>
                    <h3 className="text-2xl font-black font-mono mt-1 text-slate-850 dark:text-white">
                        {formatCurrency(totalRevenue * multiplier)}
                    </h3>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-2 font-bold">
                        تتضمن أتعاب الترافع المباشر والرسوم الاستشارية المعتمدة.
                    </p>
                </motion.div>

                {/* 2. Expenses Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                    className="p-6 bg-white dark:bg-dm-card rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-md relative overflow-hidden group"
                >
                    <div className="absolute top-0 left-0 w-2 h-full bg-rose-505 bg-rose-500 rounded-r-none" />
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-xl">
                            <TrendingDown className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black text-rose-600 bg-rose-50 dark:bg-rose-950/30 px-2 py-0.5 rounded-lg flex items-center gap-0.5">
                            <ArrowDownRight className="w-3 h-3" /> -3.1%
                        </span>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                        المصروفات العامة والتشغيلية
                    </span>
                    <h3 className="text-2xl font-black font-mono mt-1 text-rose-650 dark:text-rose-455 text-rose-600">
                        {formatCurrency(totalExpenses * multiplier)}
                    </h3>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-2 font-bold">
                        الأجور البرمجية مضافاً إليها إيجار المركز الرئيسي والبث القضائي.
                    </p>
                </motion.div>

                {/* 3. Pure Profits Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="p-6 bg-white dark:bg-dm-card rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-md relative overflow-hidden group"
                >
                    <div className="absolute top-0 left-0 w-2 h-full bg-primary rounded-r-none" />
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-primary/5 dark:bg-primary-dark/20 text-primary dark:text-primary-light rounded-xl">
                            <Activity className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black text-primary bg-primary/5 dark:bg-primary-dark/30 px-2 py-0.5 rounded-lg flex items-center gap-0.5">
                            <ArrowUpRight className="w-3 h-3" /> +18.5%
                        </span>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                        صافي عوائد التشغيل (المحقق)
                    </span>
                    <h3 className="text-2xl font-black font-mono mt-1 text-primary dark:text-primary-light">
                        {formatCurrency(netProfit * multiplier)}
                    </h3>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-2 font-bold">
                        العائد الحقيقي المتاح للتوزيع والأرباح المدورة في ميزانية الشركاء.
                    </p>
                </motion.div>

                {/* 4. Escrow & Trust Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.15 }}
                    className="p-6 bg-white dark:bg-dm-card rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-md relative overflow-hidden group"
                >
                    <div className="absolute top-0 left-0 w-2 h-full bg-amber-505 bg-amber-500 rounded-r-none" />
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-xl">
                            <Users className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg">
                            آمن ومراقب 🛡️
                        </span>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                        حساب أمـانـات الموكلين المعزول
                    </span>
                    <h3 className="text-2xl font-black font-mono mt-1 text-amber-650 dark:text-amber-455 text-amber-600">
                        {formatCurrency(trustBalance)}
                    </h3>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-2 font-bold">
                        أموال محجوزة قضائياً لصالح قضايا معلقة قيد التصفية.
                    </p>
                </motion.div>

            </div>

            {/* Timeframe selector & Visual Analytics Wave Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Simulated SVG Wave Chart Panel */}
                <div className="lg:col-span-8 bg-white dark:bg-dm-card p-6 rounded-[2.5rem] border border-slate-150 dark:border-slate-800 shadow-md">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div>
                            <h3 className="text-base font-black text-slate-850 dark:text-white">المنحنى التراكمي للتدفقات السنوية ومؤشرات النمو KWD</h3>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-bold">مقارنة فنية حية للإيرادات والمصروفات المحاسبية الفعلية</p>
                        </div>

                        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 p-1 rounded-2xl border border-slate-100 dark:border-slate-850">
                            {(['daily', 'monthly', 'yearly'] as const).map(t => (
                                <button
                                    key={t}
                                    onClick={() => setTimeframe(t)}
                                    className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all ${timeframe === t ? 'bg-primary text-white shadow-md shadow-primary/10' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                                >
                                    {t === 'daily' ? 'يومي' : t === 'monthly' ? 'شهري' : 'سنوي'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Chart Container */}
                    <div className="relative h-64 w-full bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl border border-slate-100/50 dark:border-slate-850/50 p-4">
                        <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                            {/* Definition of gradients */}
                            <defs>
                                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#00796B" stopOpacity="0.25"/>
                                    <stop offset="100%" stopColor="#00796B" stopOpacity="0"/>
                                </linearGradient>
                                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#ea580c" stopOpacity="0.25"/>
                                    <stop offset="100%" stopColor="#ea580c" stopOpacity="0"/>
                                </linearGradient>
                            </defs>

                            {/* Guideline Grid */}
                            <line x1="0" y1="10" x2="100" y2="10" stroke="#94a3b8" strokeOpacity="0.2" strokeWidth="0.1" strokeDasharray="1,1" />
                            <line x1="0" y1="20" x2="100" y2="20" stroke="#94a3b8" strokeOpacity="0.2" strokeWidth="0.1" strokeDasharray="1,1" />
                            <line x1="0" y1="30" x2="100" y2="30" stroke="#94a3b8" strokeOpacity="0.2" strokeWidth="0.1" strokeDasharray="1,1" />

                            {/* Revenue Path Area */}
                            <path 
                                d="M 0 35 Q 20 20 40 15 T 80 5 T 100 8 L 100 40 L 0 40 Z" 
                                fill="url(#revenueGrad)" 
                            />
                            {/* Revenue Path Line */}
                            <path 
                                d="M 0 35 Q 20 20 40 15 T 80 5 T 100 8" 
                                fill="none" 
                                stroke="#00796B" 
                                strokeWidth="0.6" 
                                strokeLinecap="round"
                            />

                            {/* Expense Path Area */}
                            <path 
                                d="M 0 38 Q 20 32 40 33 T 80 25 T 100 22 L 100 40 L 0 40 Z" 
                                fill="url(#expenseGrad)" 
                            />
                            {/* Expense Path Line */}
                            <path 
                                d="M 0 38 Q 20 32 40 33 T 80 25 T 100 22" 
                                fill="none" 
                                stroke="#ea580c" 
                                strokeWidth="0.4" 
                                strokeLinecap="round"
                                strokeDasharray="1, 0.5"
                            />
                        </svg>

                        {/* Chart Legend Overlay */}
                        <div className="absolute bottom-3 right-4 flex items-center gap-4 text-[9px] font-bold text-slate-500">
                            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block"></span> الإيرادات الكلية</span>
                            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 block border border-dashed"></span> المصروفات التشغيلية والرواوى</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-5 gap-1 text-[9px] text-slate-400 font-mono text-center mt-2">
                        <span>الربع الأول</span>
                        <span>الربع الثاني</span>
                        <span>الربع الثالث</span>
                        <span>الربع الرابع</span>
                        <span>السنة القادمة (توقع)</span>
                    </div>
                </div>

                {/* Case-based performance indicators */}
                <div className="lg:col-span-4 bg-white dark:bg-dm-card p-6 rounded-[2.5rem] border border-slate-150 dark:border-slate-800 shadow-md flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-black text-slate-850 dark:text-white">أبرز القضايا تحقيقاً للإيرادات</h3>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-bold">توزيع أتعاب ومصاريف السلك القضائي المباشرة</p>
                    </div>

                    <div className="space-y-4 my-6">
                        {casePerformers.map((casePerf, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-850">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 block truncate max-w-[180px]">{casePerf.title}</span>
                                    <span className="text-[9px] text-slate-400 block font-normal">المكلف: {casePerf.lawyer}</span>
                                </div>
                                <div className="text-left">
                                    <span className="text-xs font-black text-emerald-600 block">{formatCurrency(casePerf.amount)}</span>
                                    <span className="text-[8px] font-black text-primary bg-primary/5 dark:bg-primary-dark/20 px-1 py-0.5 rounded-md">{casePerf.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                        <p className="text-[9px] font-medium text-primary dark:text-primary-light leading-relaxed">
                            💡 زيادة بنسبة 18% في أرباح القضايا العمالية بعد تطبيق نظام التدقيق والامتثال مع قانون كود 6/2010.
                        </p>
                    </div>
                </div>

            </div>

            {/* Lawyer and Consultants Performance Statistics */}
            <div className="bg-white dark:bg-dm-card p-6 rounded-[2.5rem] border border-slate-150 dark:border-slate-800 shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-sm font-black text-slate-850 dark:text-white">جدول توزيع الأرباح وأتعاب المستشارين والشركاء</h3>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-bold">متابعة دقيقة لحصص المحامين والشركاء مع احتساب عمولة المنظومة</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {lawyerPerformers.map((law, idx) => (
                        <div key={idx} className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-3xl border border-slate-100 dark:border-slate-850 space-y-3 relative group hover:border-primary/30 transition-all">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-black text-slate-800 dark:text-white block">{law.name}</span>
                                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-lg">{law.share} حصة</span>
                            </div>
                            
                            <div className="flex justify-between text-[10px] items-end">
                                <span className="text-slate-400 font-bold">إجمالي الأتعاب المقبوضة:</span>
                                <span className="font-mono text-sm font-black text-primary dark:text-primary-light">{formatCurrency(law.revenue)}</span>
                            </div>

                            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: `${(law.revenue / 25000) * 100}%` }} />
                            </div>

                            <p className="text-[8px] text-slate-400 font-bold">
                                قام بالترافع وإنجاز {law.count} قضية بنجاح وتوثيق مالي.
                            </p>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};
