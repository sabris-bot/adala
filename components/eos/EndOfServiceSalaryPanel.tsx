import React from 'react';
import { DollarSign, Landmark, HelpCircle } from 'lucide-react';

interface SalaryPanelProps {
    basicSalary: number;
    housingAllowance: number;
    transportAllowance: number;
    phoneAllowance: number;
    positionAllowance: number;
    otherAllowances: number;
    onChange: (fields: Partial<{
        basicSalary: number;
        housingAllowance: number;
        transportAllowance: number;
        phoneAllowance: number;
        positionAllowance: number;
        otherAllowances: number;
    }>) => void;
    lang: 'ar' | 'en';
}

export const EndOfServiceSalaryPanel: React.FC<SalaryPanelProps> = ({
    basicSalary,
    housingAllowance,
    transportAllowance,
    phoneAllowance,
    positionAllowance,
    otherAllowances,
    onChange,
    lang
}) => {
    const isAr = lang === 'ar';
    const grossSalary = basicSalary + housingAllowance + transportAllowance + phoneAllowance + positionAllowance + otherAllowances;
    const dailyWage = grossSalary / 26;

    return (
        <div className="space-y-6 text-right font-sans" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-xs">
                <h4 className="text-xs font-black text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-1.5 select-none text-start">
                    <Landmark className="w-4 h-4 text-[#00796B]" />
                    <span>{isAr ? 'هوية ومفردات الراتب والمستحقات المستمرة' : 'Salary Breakdown Structure & Periodic Allowances'}</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Basic Salary */}
                    <div className="space-y-1 text-start">
                        <label className="text-[10px] font-extrabold text-slate-400 block">{isAr ? 'الراتب الأساسي (M-Salary):' : 'Basic Monthly Salary:'}</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={basicSalary || ''}
                                onChange={(e) => onChange({ basicSalary: Math.max(0, Number(e.target.value)) })}
                                className="w-full h-10 px-3 pl-12 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 text-left"
                            />
                            <span className="absolute left-3 top-3 font-mono text-[9px] font-black text-slate-400">KWD</span>
                        </div>
                    </div>

                    {/* Housing Allowance */}
                    <div className="space-y-1 text-start">
                        <label className="text-[10px] font-extrabold text-slate-400 block">{isAr ? 'بدل سكن (Housing):' : 'Housing Allowance:'}</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={housingAllowance || ''}
                                onChange={(e) => onChange({ housingAllowance: Math.max(0, Number(e.target.value)) })}
                                className="w-full h-10 px-3 pl-12 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 text-left"
                            />
                            <span className="absolute left-3 top-3 font-mono text-[9px] font-black text-slate-400">KWD</span>
                        </div>
                    </div>

                    {/* Transport Allowance */}
                    <div className="space-y-1 text-start">
                        <label className="text-[10px] font-extrabold text-slate-400 block">{isAr ? 'بدل انتقال (Transport):' : 'Transportation Allowance:'}</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={transportAllowance || ''}
                                onChange={(e) => onChange({ transportAllowance: Math.max(0, Number(e.target.value)) })}
                                className="w-full h-10 px-3 pl-12 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 text-left"
                            />
                            <span className="absolute left-3 top-3 font-mono text-[9px] font-black text-slate-400">KWD</span>
                        </div>
                    </div>

                    {/* Phone Allowance */}
                    <div className="space-y-1 text-start">
                        <label className="text-[10px] font-extrabold text-slate-400 block">{isAr ? 'بدل اتصال وموبايل (Phone):' : 'Communication Allowance:'}</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={phoneAllowance || ''}
                                onChange={(e) => onChange({ phoneAllowance: Math.max(0, Number(e.target.value)) })}
                                className="w-full h-10 px-3 pl-12 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 text-left"
                            />
                            <span className="absolute left-3 top-3 font-mono text-[9px] font-black text-slate-400">KWD</span>
                        </div>
                    </div>

                    {/* Position Allowance */}
                    <div className="space-y-1 text-start">
                        <label className="text-[10px] font-extrabold text-[#00796B] block">{isAr ? 'بدل منصب / تمثيل وظيفي:' : 'Position / Representation Allowance:'}</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={positionAllowance || ''}
                                onChange={(e) => onChange({ positionAllowance: Math.max(0, Number(e.target.value)) })}
                                className="w-full h-10 px-3 pl-12 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 text-left"
                            />
                            <span className="absolute left-3 top-3 font-mono text-[9px] font-black text-[#00796B]">KWD</span>
                        </div>
                    </div>

                    {/* Other Allowances */}
                    <div className="space-y-1 text-start">
                        <label className="text-[10px] font-extrabold text-slate-400 block">{isAr ? 'بدلات أخرى مستمرة (عينية):' : 'Other Periodic Allowances (Gross):'}</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={otherAllowances || ''}
                                onChange={(e) => onChange({ otherAllowances: Math.max(0, Number(e.target.value)) })}
                                className="w-full h-10 px-3 pl-12 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 text-left"
                            />
                            <span className="absolute left-3 top-3 font-mono text-[9px] font-black text-slate-400">KWD</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* LIVE COMPUTATION ACCRUALS LEDGER CARD */}
            <div className="bg-gradient-to-br from-slate-900 to-[#0e423b] text-white p-5 rounded-2xl border border-slate-950 shadow-md">
                <span className="text-[8.5px] uppercase font-black bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded tracking-wider block w-max mb-3 select-none">
                    {isAr ? 'وعاء الاحتساب التلقائي' : 'Statutory Computation Basis'}
                </span>
                <div className="grid grid-cols-2 gap-4 text-start">
                    <div>
                        <span className="block text-[9.5px] text-slate-400 font-bold">{isAr ? 'الراتب الإجمالي الكلي (Gross):' : 'Accumulated Gross Salary:'}</span>
                        <span className="text-xl font-bold font-mono text-emerald-300">
                            {grossSalary.toLocaleString(undefined, { minimumFractionDigits: 3 })} <small className="text-xs font-sans text-white/70">د.ك</small>
                        </span>
                    </div>
                    <div>
                        <span className="block text-[9.5px] text-slate-400 font-bold">{isAr ? 'الأجر اليومي المعتمد (القسمة على 26):' : 'Derived Daily wage (Gross / 26):'}</span>
                        <span className="text-xl font-bold font-mono text-emerald-100">
                            {dailyWage.toLocaleString(undefined, { minimumFractionDigits: 3 })} <small className="text-xs font-sans text-white/70">د.ك</small>
                        </span>
                    </div>
                </div>
                <div className="border-t border-white/10 mt-3 pt-3 flex gap-2 items-start text-[9.5px] text-slate-300 leading-normal">
                    <HelpCircle className="w-3.5 h-3.5 text-emerald-300 shrink-0 mt-0.5" />
                    <span>
                        {isAr
                            ? 'معادلة الدقة الحسابية: وفقاً للعرف العمالي الكويتي، يُقسم راتب الموظف الشهري على (٢٦) للحصول على معدل الأجر اليومي لعملية الاحتساب القانوني في نهاية الخدمة.'
                            : 'Standard Calculation rule: Under Kuwait legal practices, the gross salary is divided by 26 to derive the daily rate for indemnity and leave liquidations.'}
                    </span>
                </div>
            </div>
        </div>
    );
};
