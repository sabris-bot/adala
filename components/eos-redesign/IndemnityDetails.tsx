import React, { useState } from 'react';
import { Landmark, ArrowLeftRight, HelpCircle, ChevronDown, ChevronUp, Scale, AlertTriangle, Calculator } from 'lucide-react';

interface IndemnityDetailsProps {
  yearsOfService: number;
  grossSalary: number;
  basicSalary: number;
  allowableAllowance: number;
  paymentFrequency: 'monthly' | 'daily';
  indemnityDivisor: 26 | 30;
  conversionScale: number;
  isCapped: boolean;
  ceilingMax: number;
  rawIndemnity: number;
  finalIndemnityBeforeOffset: number;
  finalIndemnity: number;
  pifssOffsetApplied: number;
  isKuwaiti: boolean;
  terminationReason: string;
}

export const IndemnityDetails: React.FC<IndemnityDetailsProps> = ({
  yearsOfService,
  grossSalary,
  basicSalary,
  allowableAllowance,
  paymentFrequency,
  indemnityDivisor,
  conversionScale,
  isCapped,
  ceilingMax,
  rawIndemnity,
  finalIndemnityBeforeOffset,
  finalIndemnity,
  pifssOffsetApplied,
  isKuwaiti,
  terminationReason
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const dailyRate = grossSalary / indemnityDivisor;
  const isMonthly = paymentFrequency === 'monthly';

  // We want to generate a list of yearly steps to show the detailed math
  const steps: { yearNum: number; daysAccrued: number; formula: string; amount: number }[] = [];
  let remainingYears = yearsOfService;

  for (let i = 1; i <= Math.ceil(yearsOfService); i++) {
    const fraction = remainingYears >= 1 ? 1 : remainingYears;
    if (fraction <= 0) break;

    const ratePerYear = i <= 5 ? (isMonthly ? 15 : 10) : (isMonthly ? 30 : 15);
    const daysEarned = fraction * ratePerYear;
    const yearAmount = daysEarned * dailyRate;

    const formula = i <= 5
      ? `${fraction.toFixed(4)} سنة × ${isMonthly ? '15 يوم' : '10 أيام'} = ${daysEarned.toFixed(2)} يوم استحقاق × أجر يومي (${dailyRate.toFixed(3)} د.ك)`
      : `${fraction.toFixed(4)} سنة × ${isMonthly ? '30 يوم' : '15 يوم'} = ${daysEarned.toFixed(2)} يوم استحقاق × أجر يومي (${dailyRate.toFixed(3)} د.ك)`;

    steps.push({
      yearNum: i,
      daysAccrued: daysEarned,
      formula,
      amount: yearAmount
    });

    remainingYears -= 1;
  }

  return (
    <div className="bg-white dark:bg-[#1a202c] rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 sm:p-6 shadow-xs space-y-4">
      
      {/* Interactive Title / Header */}
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          <span className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 rounded-xl">
            <Landmark className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">تفصيل مكافأة نهاية الخدمة (مادة 51)</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">توزيع الحساب السنوي التفصيلي وصيغ المعادلات بالتتابع الزمني.</p>
          </div>
        </div>

        <button type="button" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-4">
          
          {/* Top Metadata overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/40 dark:border-slate-700/40 text-xs">
            <div>
              <span className="text-slate-400 dark:text-slate-500 block">سنوات الخدمة الإجمالية</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono">{yearsOfService.toFixed(4)} سنة</span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 block">فئة الأجر المعتمد</span>
              <span className="font-bold text-slate-900 dark:text-white">{isMonthly ? 'أجر شهري' : 'أجر يومي/أسبوعي'}</span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 block">الأجر اليومي للمكافأة</span>
              <span className="font-bold text-[#134D41] dark:text-emerald-400 font-mono">{dailyRate.toFixed(3)} د.ك</span>
              <span className="text-[9px] text-slate-400 block font-normal">({grossSalary.toFixed(3)} ÷ {indemnityDivisor})</span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 block">عامل نسبة التصفية</span>
              <span className="font-bold text-indigo-700 dark:text-indigo-400 font-mono">{(conversionScale * 100).toFixed(0)}%</span>
              <span className="text-[9px] text-slate-400 block font-normal">حسب سبب المغادرة</span>
            </div>
          </div>

          {/* Steps Timeline Grid */}
          <div className="space-y-2.5 relative border-r-2 border-slate-100 dark:border-slate-800 pr-4">
            {steps.map((step, idx) => {
              const isFirstFive = step.yearNum <= 5;
              return (
                <div key={idx} className="relative space-y-1">
                  
                  {/* Timeline bullet */}
                  <div className={`absolute -right-[23px] top-1.5 w-2 h-2 rounded-full border-2 ${isFirstFive ? 'bg-amber-500 border-white dark:border-[#1a202c]' : 'bg-emerald-500 border-white dark:border-[#1a202c]'}`} />
                  
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-extrabold text-slate-800 dark:text-slate-200">
                      السنة ({step.yearNum}) - {isFirstFive ? 'المرحلة الأولى (أول 5 سنوات)' : 'المرحلة الثانية (ما بعد 5 سنوات)'}
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{step.amount.toFixed(3)} د.ك</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono bg-slate-50/50 dark:bg-slate-850 p-1.5 rounded border border-slate-200/20 dark:border-slate-700/20">
                    {step.formula} = <strong className="text-slate-800 dark:text-slate-200">{step.amount.toFixed(3)} د.ك</strong>
                  </p>
                </div>
              );
            })}
          </div>

          {/* Formulas and Cap Details summary */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 dark:text-slate-400">إجمالي مكافأة الخدمة المتراكمة (الخام):</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{rawIndemnity.toFixed(3)} د.ك</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 dark:text-slate-400">عامل تسوية الاستقالة والتأديب (مادة 53/41):</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">× {conversionScale.toFixed(2)} ({(conversionScale * 100).toFixed(0)}%)</span>
            </div>

            {isCapped && (
              <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-400 p-3 rounded-xl text-[11px] border border-rose-100 dark:border-rose-900/30 flex items-start gap-2 leading-relaxed">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                <div>
                  <strong>تم تطبيق سقف الحد الأقصى للمكافأة (المادة 51):</strong>
                  <span> بموجب المادة 51، لا يجوز أن تتجاوز مكافأة نهاية الخدمة الإجمالية أجر <strong>18 شهراً</strong> للرواتب الشهرية (الحد الأقصى الحالي: {ceilingMax.toFixed(3)} د.ك). لقد تجاوز حساب الموظف الفعلي السقف المسموح به ولذلك تم كبحه تلقائياً.</span>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center text-xs pt-1 border-t border-dashed border-slate-200 dark:border-slate-700">
              <span className="text-slate-800 dark:text-slate-300 font-bold">المكافأة المعدلة قبل خصومات التأمينات:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{finalIndemnityBeforeOffset.toFixed(3)} د.ك</span>
            </div>

            {isKuwaiti && (
              <div className="flex justify-between items-center text-xs text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/15 p-2 rounded-lg">
                <span>خصم اشتراك التأمينات الاجتماعية (PIFSS رب العمل):</span>
                <span className="font-mono font-bold">-{pifssOffsetApplied.toFixed(3)} د.ك</span>
              </div>
            )}

            <div className="flex justify-between items-center text-sm font-black text-emerald-900 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/35 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
              <span>صافي مكافأة نهاية الخدمة الصافية النهائية:</span>
              <span className="font-mono text-base">{finalIndemnity.toFixed(3)} د.ك</span>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
