import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
    Calculator, 
    Sparkles, 
    TrendingUp, 
    TrendingDown, 
    Users, 
    Building2, 
    Coins, 
    ArrowRightLeft 
} from 'lucide-react';

interface DecisionSimulatorProps {
    currentMonthlyRevenue: number;
    currentMonthlyExpenses: number;
    formatCurrency: (amount: number, currency?: string) => string;
}

export const DecisionSimulator: React.FC<DecisionSimulatorProps> = ({
    currentMonthlyRevenue,
    currentMonthlyExpenses,
    formatCurrency
}) => {
    // Simulation parameters
    const [lawyerCount, setLawyerCount] = useState<number>(0); // change in lawyers
    const [rentNewBranch, setRentNewBranch] = useState<boolean>(false);
    const [consultationRateChange, setConsultationRateChange] = useState<number>(0); // percent change
    const [wonPremiumContract, setWonPremiumContract] = useState<boolean>(false);

    // Baseline stats
    const baselineRevenue = currentMonthlyRevenue;
    const baselineExpenses = currentMonthlyExpenses;
    const baselineProfit = baselineRevenue - baselineExpenses;

    // Simulation calculation
    const calculateSimulatedStats = () => {
        let simulatedRevenue = baselineRevenue;
        let simulatedExpenses = baselineExpenses;

        // 1. Lawyer headcount effect
        // Hitting cost: each lawyer costs ~KWD 1,200/month avg salary + software
        // Revenue capability: each lawyer adds KWD 2,800/month in billable hourly capacity
        simulatedExpenses += lawyerCount * 1200;
        simulatedRevenue += lawyerCount * 2800;

        // 2. Rent new branch
        // Rent costs KWD 1,500/month, auxiliary staffing costs KWD 800/month
        // Revenue boost is KWD 4,200/month
        if (rentNewBranch) {
            simulatedExpenses += 2300;
            simulatedRevenue += 4200;
        }

        // 3. Consultation rate change
        // Say 15% of current revenue is direct consultations (~ KWD 630 on average)
        // Adjust average consult revenue based on percent change
        const directConsultShare = baselineRevenue * 0.15;
        const consultAdjustment = directConsultShare * (consultationRateChange / 100);
        simulatedRevenue += consultAdjustment;

        // 4. Won premium contract
        // Adds flat KWD 5,000/month in premium retainers, costs KWD 1,000 in counsel
        if (wonPremiumContract) {
            simulatedRevenue += 5000;
            simulatedExpenses += 1000;
        }

        const simulatedProfit = simulatedRevenue - simulatedExpenses;
        const profitChange = simulatedProfit - baselineProfit;
        const profitChangePct = baselineProfit > 0 ? (profitChange / baselineProfit) * 100 : 0;

        return {
            simulatedRevenue,
            simulatedExpenses,
            simulatedProfit,
            profitChange,
            profitChangePct
        };
    };

    const sim = calculateSimulatedStats();

    return (
        <div className="bg-[#0a1424] border-2 border-[#DFBA5A]/35 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#DFBA5A]/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#DFBA5A]/15 border border-[#DFBA5A]/30 text-[#DFBA5A] rounded-2xl">
                        <Calculator className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-black text-[#DFBA5A] text-lg">أداة محاكاة القرارات والسيناريوهات المالية</h3>
                        <p className="text-xs text-slate-300 font-medium">أدخل تعديلات تشغيلية واعرف فوراً التأثير الإسقاطي على ربحية المكتب</p>
                    </div>
                </div>
                <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#DFBA5A] animate-pulse" />
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">محرك تنبؤ الموازنة الذكي نشط</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
                {/* Simulator Inputs Control Panel */}
                <div className="lg:col-span-5 space-y-6 bg-[#101F37] p-6 rounded-3xl border border-[#DFBA5A]/20">
                    <h4 className="text-sm font-black text-[#DFBA5A] pb-3 border-b border-white/5">تعديل المتغيرات التشغيلية</h4>

                    {/* Scenario 1: Lawyers Count change */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-200">تعديل كادر المحامين والمستشارين</span>
                          <span className={`font-mono font-black ${lawyerCount > 0 ? 'text-[#DFBA5A]' : lawyerCount < 0 ? 'text-rose-450 text-rose-400' : 'text-slate-400'}`}>
                              {lawyerCount > 0 ? `+${lawyerCount}` : lawyerCount} محامين
                          </span>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setLawyerCount(prev => Math.max(-10, prev - 1))}
                                className="px-3 py-1 bg-[#152744] border border-white/10 rounded-lg text-sm font-bold text-white hover:bg-[#DFBA5A]/10 transition-colors"
                            >
                                -
                            </button>
                            <input 
                                type="range" 
                                min="-10" 
                                max="20" 
                                value={lawyerCount} 
                                onChange={(e) => setLawyerCount(parseInt(e.target.value))}
                                className="flex-1 accent-[#DFBA5A]"
                            />
                            <button 
                                onClick={() => setLawyerCount(prev => Math.min(20, prev + 1))}
                                className="px-3 py-1 bg-[#152744] border border-white/10 rounded-lg text-sm font-bold text-white hover:bg-[#DFBA5A]/10 transition-colors"
                            >
                                +
                            </button>
                        </div>
                        <p className="text-[10px] text-slate-400">كل محامٍ يعادل تكلفة 1,200 د.ك شهرياً ويوسع سعة التحصيل بـ 2,800 د.ك.</p>
                    </div>

                    {/* Scenario 2: Rent New Branch */}
                    <div className="flex justify-between items-center p-3.5 bg-[#152744] rounded-2xl border border-white/5">
                        <div className="flex items-center gap-3">
                            <Building2 className="w-5 h-5 text-[#DFBA5A]" />
                            <div>
                                <span className="text-xs font-black text-slate-100 block">التوسع بفرع تجاري جديد</span>
                                <span className="text-[9px] text-[#DFBA5A]">إيجار ومصاريف إدارية: KWD 2,300</span>
                            </div>
                        </div>
                        <input 
                            type="checkbox" 
                            checked={rentNewBranch}
                            onChange={(e) => setRentNewBranch(e.target.checked)}
                            className="w-5 h-5 rounded border-white/10 accent-[#DFBA5A]"
                        />
                    </div>

                    {/* Scenario 3: Consultation Rate change */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-200">تعديل تسعيرة الاستشارات الفورية</span>
                          <span className={`font-mono font-black ${consultationRateChange > 0 ? 'text-[#DFBA5A]' : 'text-slate-400'}`}>
                              {consultationRateChange > 0 ? `+${consultationRateChange}%` : `${consultationRateChange}%`}
                          </span>
                        </div>
                        <input 
                            type="range" 
                            min="-30" 
                            max="100" 
                            step="5"
                            value={consultationRateChange} 
                            onChange={(e) => setConsultationRateChange(parseInt(e.target.value))}
                            className="w-full accent-[#DFBA5A]"
                        />
                        <p className="text-[10px] text-slate-400">التأثير الإيجابي أو السلبي المتوقع على حجم الإقبال وتراخيص العقود.</p>
                    </div>

                    {/* Scenario 4: Won Premium Corporate Retainer */}
                    <div className="flex justify-between items-center p-3.5 bg-[#152744] rounded-2xl border border-white/5">
                        <div className="flex items-center gap-3">
                            <Coins className="w-5 h-5 text-[#DFBA5A]" />
                            <div>
                                <span className="text-xs font-black text-slate-100 block">عقد استشاري سنوي مميز (VIP)</span>
                                <span className="text-[9px] text-[#DFBA5A]">عوائد شهرية مضمونة بقيمة: KWD 5,000</span>
                            </div>
                        </div>
                        <input 
                            type="checkbox" 
                            checked={wonPremiumContract}
                            onChange={(e) => setWonPremiumContract(e.target.checked)}
                            className="w-5 h-5 rounded border-white/10 accent-[#DFBA5A]"
                        />
                    </div>
                </div>

                {/* Simulator Projections Result Display */}
                <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                    <div>
                        <h4 className="text-xs font-black text-[#DFBA5A] uppercase tracking-widest mb-4 pb-1 border-b border-white/5">الوضع المحاكي الحالي والمقارنة المحاسبية</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Revenue projection */}
                            <div className="bg-[#101F37] p-4 rounded-2xl border border-[#DFBA5A]/15">
                                <span className="text-[10px] font-bold text-slate-300 block mb-1">الإيراد المحاكي</span>
                                <p className="text-lg font-black font-mono text-[#DFBA5A]">
                                    {formatCurrency(sim.simulatedRevenue)}
                                </p>
                                <div className="flex items-center gap-1 mt-2">
                                    {sim.simulatedRevenue >= baselineRevenue ? (
                                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                                    ) : (
                                        <TrendingDown className="w-3.5 h-3.5 text-rose-455 text-rose-400" />
                                    )}
                                    <span className={`text-[10px] font-black ${sim.simulatedRevenue >= baselineRevenue ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {formatCurrency(Math.abs(sim.simulatedRevenue - baselineRevenue))} ({sim.simulatedRevenue >= baselineRevenue ? 'زيادة' : 'انخفاض'})
                                    </span>
                                </div>
                            </div>

                            {/* Expenses projection */}
                            <div className="bg-[#101F37] p-4 rounded-2xl border border-[#DFBA5A]/15">
                                <span className="text-[10px] font-bold text-slate-300 block mb-1">المصروف المحاكي</span>
                                <p className="text-lg font-black font-mono text-slate-100">
                                    {formatCurrency(sim.simulatedExpenses)}
                                </p>
                                <div className="flex items-center gap-1 mt-2">
                                    {sim.simulatedExpenses <= baselineExpenses ? (
                                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                                    ) : (
                                        <TrendingDown className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                                    )}
                                    <span className={`text-[10px] font-black ${sim.simulatedExpenses <= baselineExpenses ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {formatCurrency(Math.abs(sim.simulatedExpenses - baselineExpenses))} ({sim.simulatedExpenses <= baselineExpenses ? 'توفير' : 'إضافة'})
                                    </span>
                                </div>
                            </div>

                            {/* Net Profits projection */}
                            <div className="bg-[#101F37] p-4 rounded-2xl border border-[#DFBA5A]/15">
                                <span className="text-[10px] font-bold text-slate-300 block mb-1">صافي الربح المحاكي</span>
                                <p className={`text-lg font-black font-mono ${sim.simulatedProfit >= 0 ? 'text-[#DFBA5A]' : 'text-rose-400'}`}>
                                    {formatCurrency(sim.simulatedProfit)}
                                </p>
                                <div className="flex items-center gap-1 mt-2">
                                    {sim.simulatedProfit >= baselineProfit ? (
                                        <TrendingUp className="w-3.5 h-3.5 text-emerald-450 text-emerald-400" />
                                    ) : (
                                        <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                                    )}
                                    <span className={`text-[10px] font-black ${sim.simulatedProfit >= baselineProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {formatCurrency(Math.abs(sim.simulatedProfit - baselineProfit))} ({sim.simulatedProfit >= baselineProfit ? 'أرباح إضافية' : 'تراجع عوائد'})
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Projections Insight Gauge Card */}
                    <div className="bg-gradient-to-l from-[#DFBA5A] via-[#C5A028] to-[#9E7A1C] text-[#07111e] rounded-3xl p-6 relative overflow-hidden shadow-xl border border-[#DFBA5A]/30">
                        <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/3 translate-x-1/3"></div>
                        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-4 text-right">
                            <div className="space-y-1.5">
                                <h5 className="text-[10px] font-black uppercase tracking-widest text-[#07111e]/70">المحاكي الاستراتيجي للأرباح الكلية</h5>
                                <h3 className="text-xl font-black">
                                    تغيير في صافي الدخل: <span className={sim.profitChange >= 0 ? 'text-[#07111e]' : 'text-rose-950 text-rose-900'}>
                                        {sim.profitChange >= 0 ? '+' : ''}{formatCurrency(sim.profitChange)}
                                    </span>
                                </h3>
                                <p className="text-xs text-[#07111e]/80 leading-relaxed font-bold max-w-md">
                                    بناءً على التغير المطبق، ستشهد أعمال المكتب {sim.profitChange >= 0 ? 'نمواً ماليّاً ملموساً' : 'تراجعاً'} في صافي الأرباح بمقدار <span className="text-[#07111e] font-black underline">{Math.abs(sim.profitChangePct).toFixed(1)}%</span> على أساس شهري استناداً للرصد الفعلي المودع.
                                </p>
                            </div>

                            <div className="flex flex-col items-center justify-center p-3 py-4 bg-[#07111e]/15 border border-[#07111e]/10 rounded-2xl min-w-[120px]">
                                <span className="text-[8px] font-black uppercase tracking-wider text-[#07111e]/70 mb-1">نسبة التغير</span>
                                <span className={`text-xl font-black ${sim.profitChange >= 0 ? 'text-[#07111e]' : 'text-rose-950 text-rose-900'}`}>
                                    {sim.profitChange >= 0 ? '+' : ''}{sim.profitChangePct.toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
