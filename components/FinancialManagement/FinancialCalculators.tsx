import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Coins, 
    Calculator, 
    Calendar, 
    Percent, 
    Scale, 
    Briefcase,
    Receipt, 
    ArrowUpRight, 
    User,
    CheckCircle,
    Download
} from 'lucide-react';

interface FinancialCalculatorsProps {
    formatCurrency: (amount: number, currency?: string) => string;
}

export const FinancialCalculators: React.FC<FinancialCalculatorsProps> = ({ formatCurrency }) => {
    const [subTab, setSubTab] = useState<'payroll' | 'loans' | 'indemnity'>('payroll');

    // 1. Payroll Calculator State Variables
    const [basicSalary, setBasicSalary] = useState<number>(800);
    const [allowances, setAllowances] = useState<number>(200);
    const [overtimeHours, setOvertimeHours] = useState<number>(5);
    const [overtimeRate, setOvertimeRate] = useState<number>(4.5);
    const [gosiDeduction, setGosiDeduction] = useState<number>(6); // national pension deduction rate %
    const [absentDays, setAbsentDays] = useState<number>(0);

    // Compute Payroll
    const rawOvertimePay = overtimeHours * overtimeRate;
    const grossIncome = basicSalary + allowances + rawOvertimePay;
    const gosiAmount = (basicSalary + allowances) * (gosiDeduction / 100);
    const dayRate = basicSalary / 30; // standard Kuwait labor calculation 30 days divisor
    const absentAmount = absentDays * dayRate;
    const netSalaryPayable = Math.max(0, grossIncome - gosiAmount - absentAmount);

    // 2. Loans Calculator State Variables
    const [loanAmount, setLoanAmount] = useState<number>(5000);
    const [interestRate, setInterestRate] = useState<number>(4.5); // per year flat markup
    const [durationMonths, setDurationMonths] = useState<number>(12);

    // Compute Repayment schedule
    const computeRepayments = () => {
        const totalInterestRate = (interestRate / 100) * (durationMonths / 12);
        const totalInterestCost = loanAmount * totalInterestRate;
        const totalDebtAmount = loanAmount + totalInterestCost;
        const monthlyInstallment = totalDebtAmount / durationMonths;

        // Populate table lines
        const schedule = [];
        let runningBalance = totalDebtAmount;
        for (let i = 1; i <= durationMonths; i++) {
            const interestPortion = totalInterestCost / durationMonths;
            const principalPortion = loanAmount / durationMonths;
            runningBalance -= monthlyInstallment;
            schedule.push({
                month: i,
                installment: monthlyInstallment,
                principalPayment: principalPortion,
                interestPayment: interestPortion,
                remainingBalance: Math.max(0, runningBalance)
            });
        }
        return {
            totalInterestCost,
            totalDebtAmount,
            monthlyInstallment,
            schedule
        };
    };

    const loanRepay = computeRepayments();

    // 3. Indemnity End-of-Service State Variables
    const [finalSalary, setFinalSalary] = useState<number>(1200); // KWD
    const [yearsOfService, setYearsOfService] = useState<number>(4.5);
    const [separationReason, setSeparationReason] = useState<'termination' | 'resignation'>('termination');

    // Kuwait Civil Labor Law 6/2010 Rules:
    const calculateIndemnity = () => {
        const dailyRate = finalSalary / 26; // Kuwait Labor Court divisor
        let accumulatedDays = 0;

        if (yearsOfService <= 5) {
            accumulatedDays = yearsOfService * 15;
        } else {
            // First 5 years gets 15 days/year
            accumulatedDays = 5 * 15;
            // Subsequent years get 30 days/year
            accumulatedDays += (yearsOfService - 5) * 30;
        }

        let totalCalculatedIndemnity = accumulatedDays * dailyRate;

        // Resignation adjustment
        let adjustmentFactor = 1.0;
        if (separationReason === 'resignation') {
            if (yearsOfService < 3) {
                adjustmentFactor = 0.0; // Under 3 years: no indemnity
            } else if (yearsOfService >= 3 && yearsOfService < 5) {
                adjustmentFactor = 0.5; // Half indemnity
            } else if (yearsOfService >= 5 && yearsOfService < 10) {
                adjustmentFactor = 2 / 3; // 2/3rds indemnity
            } else {
                adjustmentFactor = 1.0; // Over 10 years: full payout
            }
        }

        const rawFinalPayout = totalCalculatedIndemnity * adjustmentFactor;
        const maxPayoutCap = finalSalary * 18; // 18 months salary maximum cap
        const finalIndemnityPayout = Math.min(rawFinalPayout, maxPayoutCap);

        return {
            dailyRate,
            accumulatedDays,
            unadjustedIndemnity: totalCalculatedIndemnity,
            adjustmentFactor,
            finalIndemnityPayout
        };
    };

    const legalIndemnity = calculateIndemnity();

    return (
        <div className="bg-[#0a1424] border-2 border-[#DFBA5A]/35 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-80 h-80 bg-[#DFBA5A]/5 rounded-full blur-3xl pointer-events-none" />
            
            {/* Header selection tab strip */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-white/5 pb-6 relative z-10">
                <div>
                    <h3 className="text-lg font-black text-[#DFBA5A]">محرك مالي وقانوني للاحتساب التلقائي</h3>
                    <p className="text-xs text-slate-300 font-medium">اكتشف حواسب الدقة الذكية لرواتب كادر الموظفين، أقساط القروض، أو مستحقات نهاية الخدمة</p>
                </div>
                <div className="flex gap-1.5 p-1 bg-[#101F37] border border-white/5 rounded-2xl w-full md:w-auto">
                    <button 
                        onClick={() => setSubTab('payroll')}
                        className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                            subTab === 'payroll' 
                            ? 'bg-gradient-to-l from-[#DFBA5A] to-[#B8922A] text-[#050b15] shadow-lg' 
                            : 'text-slate-350 hover:text-white'
                        }`}
                    >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>كشف الرواتب</span>
                    </button>
                    <button 
                        onClick={() => setSubTab('loans')}
                        className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                            subTab === 'loans' 
                            ? 'bg-gradient-to-l from-[#DFBA5A] to-[#B8922A] text-[#050b15] shadow-lg' 
                            : 'text-slate-355 text-slate-350 hover:text-white'
                        }`}
                    >
                        <Percent className="w-3.5 h-3.5" />
                        <span>السلف والتمويل وسدادها</span>
                    </button>
                    <button 
                        onClick={() => setSubTab('indemnity')}
                        className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                            subTab === 'indemnity' 
                            ? 'bg-gradient-to-l from-[#DFBA5A] to-[#B8922A] text-[#050b15] shadow-lg' 
                            : 'text-slate-350 hover:text-white'
                        }`}
                    >
                        <Scale className="w-3.5 h-3.5" />
                        <span>مستحقات نهاية الخدمة (الكويت)</span>
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {/* 1. PAYROLL CALCULATOR PANEL */}
                {subTab === 'payroll' && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-right relative z-10"
                        dir="rtl"
                    >
                        <div className="lg:col-span-5 space-y-4 bg-[#101F37] p-6 rounded-3xl border border-white/5">
                            <h4 className="text-xs font-black text-[#DFBA5A] uppercase tracking-widest pb-2 border-b border-white/5">مدخلات احتساب الراتب للموظف</h4>

                            <div>
                                <label className="text-xs font-bold text-slate-200 block mb-1">الراتب الأساسي (Basic Salary)</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        value={basicSalary}
                                        onChange={(e) => setBasicSalary(parseFloat(e.target.value) || 0)}
                                        className="w-full px-4 py-3 bg-[#13243F] border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#DFBA5A]/20 font-black text-white"
                                        placeholder="KWD 0.0"
                                    />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-[#DFBA5A] font-black">د.ك</span>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-200 block mb-1">البدلات الثابتة (سكن، ترفيه، وقود)</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        value={allowances}
                                        onChange={(e) => setAllowances(parseFloat(e.target.value) || 0)}
                                        className="w-full px-4 py-3 bg-[#13243F] border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#DFBA5A]/20 font-black text-white"
                                        placeholder="KWD 0.0"
                                    />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-[#DFBA5A] font-black">د.ك</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-200 block mb-1">الساعات الإضافية</label>
                                    <input 
                                        type="number" 
                                        value={overtimeHours}
                                        onChange={(e) => setOvertimeHours(parseFloat(e.target.value) || 0)}
                                        className="w-full px-4 py-3 bg-[#13243F] border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#DFBA5A]/20 font-black text-white"
                                        placeholder="ساعات"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-200 block mb-1">معدل الساعة د.ك</label>
                                    <input 
                                        type="number" 
                                        step="0.5"
                                        value={overtimeRate}
                                        onChange={(e) => setOvertimeRate(parseFloat(e.target.value) || 0)}
                                        className="w-full px-4 py-3 bg-[#13243F] border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#DFBA5A]/20 font-black text-white"
                                        placeholder="سعر الساعة"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-200 block mb-1">استحقاق التأمين (GOSI %)</label>
                                    <input 
                                        type="number" 
                                        value={gosiDeduction}
                                        onChange={(e) => setGosiDeduction(parseFloat(e.target.value) || 0)}
                                        className="w-full px-4 py-3 bg-[#13243F] border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#DFBA5A]/20 font-black text-white"
                                        placeholder="%"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-rose-400 block mb-1">أيام الغياب غير المصرح</label>
                                    <input 
                                        type="number" 
                                        value={absentDays}
                                        onChange={(e) => setAbsentDays(parseFloat(e.target.value) || 0)}
                                        className="w-full px-4 py-3 bg-[#13243F] border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#DFBA5A]/20 font-black text-white"
                                        placeholder="أيام"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-7 flex flex-col justify-between">
                            <div className="bg-[#101F37] p-6 rounded-3xl border border-white/5 text-right space-y-4">
                                <h4 className="text-xs font-black text-[#DFBA5A] uppercase tracking-widest pb-2 border-b border-white/5">الملخص المالي التفصيلي المجمع للراتب</h4>
                                
                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                                        <span className="text-slate-300">مجموع الراتب والبدلات المتراكمة</span>
                                        <span className="font-bold text-white">{formatCurrency(basicSalary + allowances)}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-white/5 text-emerald-400">
                                        <span>علاوات العمل والإنتاج الإضافي</span>
                                        <span className="font-bold">+{formatCurrency(rawOvertimePay)}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-white/5 text-rose-450 text-rose-400">
                                        <span>استقطاع اشتراكات التأمينات الاجتماعية (GOSI)</span>
                                        <span className="font-bold">-{formatCurrency(gosiAmount)}</span>
                                    </div>
                                    {absentAmount > 0 && (
                                        <div className="flex justify-between items-center py-2 border-b border-white/5 text-rose-400">
                                            <span>استقطاع الغياب والأيام غير المدفوعة ({absentDays} أيام)</span>
                                            <span className="font-bold">-{formatCurrency(absentAmount)}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 flex justify-between items-center border-t border-dashed border-white/10">
                                    <span className="text-sm font-black text-slate-205 text-slate-200">صافي المبلغ المستحق للصرف</span>
                                    <span className="text-3xl font-black font-mono text-[#DFBA5A]">
                                        {formatCurrency(netSalaryPayable)}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-col md:flex-row gap-4">
                                <div className="flex-1 p-4 bg-[#DFBA5A]/5 border border-[#DFBA5A]/15 rounded-2xl flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-[#DFBA5A] mt-0.5" />
                                    <div>
                                        <h5 className="text-xs font-black text-[#DFBA5A]">المطابقة القانونية والتشريعية</h5>
                                        <p className="text-[10px] text-slate-300 leading-relaxed max-w-sm mt-0.5">
                                            كشوف الأجور والرواتب ممتثلة للمادتين 55 و56 من قانون العمل الكويتي رقم 6 لسنة 2010 بشأن احتساب خصومات الأيام وقواعد الأجور الشهرية.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* 2. LOANS & REPAYMENTS PLANNER PANEL */}
                {subTab === 'loans' && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-right relative z-10"
                        dir="rtl"
                    >
                        <div className="lg:col-span-4 space-y-4 bg-[#101F37] p-6 rounded-3xl border border-white/5">
                            <h4 className="text-xs font-black text-[#DFBA5A] uppercase tracking-widest pb-2 border-b border-white/5">بيانات السلفة والتمويل للموظف</h4>

                            <div>
                                <label className="text-xs font-bold text-slate-200 block mb-1">قيمة القرض أو السلفة التراكمية</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        value={loanAmount}
                                        onChange={(e) => setLoanAmount(parseFloat(e.target.value) || 0)}
                                        className="w-full px-4 py-3 bg-[#13243F] border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#DFBA5A]/20 font-black text-white"
                                    />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-[#DFBA5A] font-black">د.ك</span>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-200 block mb-1">نسبة الفائدة أو العوائد الإدارية السنوية</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        step="0.1"
                                        value={interestRate}
                                        onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                                        className="w-full px-4 py-3 bg-[#13243F] border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#DFBA5A]/20 font-black text-white"
                                    />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-[#DFBA5A] font-black">%</span>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-200 block mb-1">فترة السداد بالأشهر (Duration)</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        value={durationMonths}
                                        onChange={(e) => setDurationMonths(parseInt(e.target.value) || 1)}
                                        className="w-full px-4 py-3 bg-[#13243F] border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#DFBA5A]/20 font-black text-white"
                                    />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-[#DFBA5A] font-black">شهر</span>
                                </div>
                            </div>

                            <div className="bg-[#DFBA5A]/5 border border-[#DFBA5A]/15 p-4 rounded-2xl">
                                <p className="text-[10px] text-slate-200 leading-relaxed font-bold">
                                    * تلتزم إدارة الموارد المالية باللوائح المصرفية الكويتية بحيث لا يتجاوز الخصم الشهري الإجمالي 40% من الراتب لحماية مستوى المعيشة للكوادر.
                                </p>
                            </div>
                        </div>

                        <div className="lg:col-span-8 flex flex-col justify-between">
                            <div>
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="bg-[#101F37] p-4 rounded-2xl border border-white/5 flex flex-col justify-center">
                                        <span className="text-[10px] text-slate-300 font-bold block mb-1 font-sans">القسط الشهري المقدر</span>
                                        <span className="text-base font-black font-mono text-[#DFBA5A]">{formatCurrency(loanRepay.monthlyInstallment)}</span>
                                    </div>
                                    <div className="bg-[#101F37] p-4 rounded-2xl border border-white/5 flex flex-col justify-center">
                                        <span className="text-[10px] text-slate-300 font-bold block mb-1 font-sans">العوائد والفوائد الإدارية</span>
                                        <span className="text-base font-black font-mono text-rose-400">+{formatCurrency(loanRepay.totalInterestCost)}</span>
                                    </div>
                                    <div className="bg-[#101F37] p-4 rounded-2xl border border-white/5 flex flex-col justify-center">
                                        <span className="text-[10px] text-slate-300 font-bold block mb-1 font-sans">إجمالي الدين المطلوب</span>
                                        <span className="text-base font-black font-mono text-emerald-400">{formatCurrency(loanRepay.totalDebtAmount)}</span>
                                    </div>
                                </div>

                                <div className="border border-white/5 rounded-3xl overflow-hidden shadow-xl max-h-[220px] overflow-y-auto no-scrollbar bg-[#101F37]">
                                    <table className="w-full text-xs text-right border-collapse">
                                        <thead>
                                            <tr className="bg-[#152744] border-b border-white/5 font-black text-[#DFBA5A]">
                                                <th className="p-3">دورة القسط</th>
                                                <th className="p-3">قيمة القسط الكاملة</th>
                                                <th className="p-3">سداد أصل المبلغ</th>
                                                <th className="p-3">العائد الإداري</th>
                                                <th className="p-3">الرصيد المتبقي</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loanRepay.schedule.map(sc => (
                                                <tr key={sc.month} className="border-b border-white/5 text-slate-300 font-mono hover:bg-[#152744]/20 transition-all">
                                                    <td className="p-3">الشهر {sc.month}</td>
                                                    <td className="p-3 font-bold text-[#DFBA5A]">{formatCurrency(sc.installment)}</td>
                                                    <td className="p-3">{formatCurrency(sc.principalPayment)}</td>
                                                    <td className="p-3 text-rose-400">+{formatCurrency(sc.interestPayment)}</td>
                                                    <td className="p-3">{formatCurrency(sc.remainingBalance)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* 3. KUWAITI LAWS END-OF-SERVICE (INDEMNITY) ACCELERATOR PANEL */}
                {subTab === 'indemnity' && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-right relative z-10"
                        dir="rtl"
                    >
                        <div className="lg:col-span-5 space-y-4 bg-[#101F37] p-6 rounded-3xl border border-white/5">
                            <h4 className="text-xs font-black text-[#DFBA5A] uppercase tracking-widest pb-2 border-b border-white/5">بيانات تنهية الخدمة وفترات العمل</h4>
                            
                            <div>
                                <label className="text-xs font-bold text-slate-200 block mb-1">آخر راتب إجمالي شامل للمستحقات (Salaries)</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        value={finalSalary}
                                        onChange={(e) => setFinalSalary(parseFloat(e.target.value) || 0)}
                                        className="w-full px-4 py-3 bg-[#13243F] border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#DFBA5A]/20 font-black text-white"
                                    />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-[#DFBA5A] font-black">د.ك</span>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-200 block mb-1">مدة الخدمة الإجمالية بالسنوات</label>
                                <input 
                                    type="number" 
                                    step="0.1"
                                    value={yearsOfService}
                                    onChange={(e) => setYearsOfService(parseFloat(e.target.value) || 0)}
                                    className="w-full px-4 py-3 bg-[#13243F] border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#DFBA5A]/20 font-black text-white"
                                    placeholder="مثلاً: 4.5"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-200 block">سبب انفصال العلاقة المهنية</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={() => setSeparationReason('termination')}
                                        className={`px-4 py-3 rounded-xl text-xs font-black border transition-all ${
                                            separationReason === 'termination' 
                                            ? 'bg-gradient-to-l from-[#DFBA5A] to-[#B8922A] text-[#050b15] border-transparent' 
                                            : 'border-white/10 hover:bg-white/5 text-white'
                                        }`}
                                    >
                                        فصل أو إنهاء خدمة
                                    </button>
                                    <button 
                                        onClick={() => setSeparationReason('resignation')}
                                        className={`px-4 py-3 rounded-xl text-xs font-black border transition-all ${
                                            separationReason === 'resignation' 
                                            ? 'bg-gradient-to-l from-[#DFBA5A] to-[#B8922A] text-[#050b15] border-transparent' 
                                            : 'border-white/10 hover:bg-white/5 text-white'
                                        }`}
                                    >
                                        استقالة طوعية
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-7 flex flex-col justify-between">
                            <div className="bg-[#101F37] p-6 rounded-3xl border border-white/5 text-xs text-right space-y-4">
                                <h4 className="text-xs font-black text-[#DFBA5A] uppercase tracking-widest pb-2 border-b border-white/5">مخالصة الحسابات وأتعاب مكافأة نهاية الخدمة</h4>
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                                        <span className="text-slate-300">معدل الأجر اليومي الحكمي (قسمة على 26 يوماً)</span>
                                        <span className="font-bold text-white">{formatCurrency(legalIndemnity.dailyRate)}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                                        <span className="text-slate-300">إجمالي الأيام المستحقة للتراكم</span>
                                        <span className="font-bold text-white">{legalIndemnity.accumulatedDays.toFixed(1)} يوماً</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                                        <span className="text-slate-300">المبلغ الإجمالي الخام للمستحقات</span>
                                        <span className="font-bold text-[#DFBA5A]">{formatCurrency(legalIndemnity.unadjustedIndemnity)}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                                        <span className="text-slate-300">معامل تعديل الاستقالة الطوعية</span>
                                        <span className="font-bold font-mono text-white">{(legalIndemnity.adjustmentFactor * 100).toFixed(0)}%</span>
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-between items-center border-t border-dashed border-white/10">
                                    <span className="text-sm font-black text-slate-200">صافي المستحق النهائي لنهاية الخدمة</span>
                                    <span className="text-3xl font-black font-mono text-[#DFBA5A]">
                                        {formatCurrency(legalIndemnity.finalIndemnityPayout)}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-[#DFBA5A]/5 border border-[#DFBA5A]/15 rounded-2xl flex items-start gap-3">
                                <Scale className="w-5 h-5 text-[#DFBA5A] mt-0.5" />
                                <div>
                                    <h5 className="text-xs font-black text-[#DFBA5A] flex items-center gap-1.5">
                                        <span>مدونة الامتثال: قانون العمل الكويتي رقم 6 لسنة 2010</span>
                                    </h5>
                                    <p className="text-[10px] text-slate-305 text-slate-300 leading-relaxed max-w-lg mt-0.5">
                                        تحسب مكافأة نهاية الخدمة بالكامل للموظف ذي الأجر الشهري استناداً للمادة 51 من القانون والتي تضمن احتساب نصف شهر لكل سنة من السنوات الخمس الأولى، وشهر كامل لكل سنة لاحقة، مع مراعاة تخفيضات الاستقالة بالمادة 53.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
