import React, { useState } from 'react';
import { Calculator, ChevronDown, ChevronUp, Check, AlertCircle, Info, InfoIcon, AlertTriangle } from 'lucide-react';
import { RedesignedTakenLeave } from './types';

interface CalculationDetailsProps {
  joiningDate: string;
  exitDate: string;
  activeCalendarDays: number;
  unpaidAbsenceDays: number;
  basicSalary: number;
  allowableAllowance: number;
  grossSalary: number;
  takenLeaves: RedesignedTakenLeave[];
  deductFridaysFromLeaves: boolean;
  leaveAccrualBasis: 'law30' | 'fullMonth'; // Method 1 vs Method 2
  onChangeLeaveAccrualBasis: (val: 'law30' | 'fullMonth') => void;
  enforceLeaveCap: boolean;
  leaveCapDays?: number;
  onAddAuditLog: (action: string, details: string) => void;
}

export const CalculationDetails: React.FC<CalculationDetailsProps> = ({
  joiningDate,
  exitDate,
  activeCalendarDays,
  unpaidAbsenceDays,
  basicSalary,
  allowableAllowance,
  grossSalary,
  takenLeaves,
  deductFridaysFromLeaves,
  leaveAccrualBasis,
  onChangeLeaveAccrualBasis,
  enforceLeaveCap,
  leaveCapDays = 60,
  onAddAuditLog,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  // Math equations calculation:
  // 1. Service duration in days
  const totalDays = activeCalendarDays;

  // 2. Leave accrual
  // Method 1: Law 30 days
  const lawAccruedDays = (totalDays / 365) * 30;
  // Method 2: Company Policy (e.g. 1 month salary per year which equals 30 days per year but maybe with full months calculation)
  const companyAccruedDays = (totalDays / 365.25) * 30; // 365.25 for company policy leap year ratio

  const selectedAccruedDays = leaveAccrualBasis === 'law30' ? lawAccruedDays : companyAccruedDays;

  // 3. Taken leaves
  const leavesList = takenLeaves.map((l) => {
    const daysUsed = deductFridaysFromLeaves ? l.netDays : l.days;
    return {
      desc: `${l.leaveType} (${l.fromDate} إلى ${l.toDate})`,
      originalDays: l.days,
      fridays: l.fridaysCount,
      used: daysUsed,
    };
  });

  const totalTaken = leavesList.reduce((sum, l) => sum + l.used, 0);

  // 4. Remaining balance
  const rawBalance = selectedAccruedDays - totalTaken;
  const netBalance = Math.max(0, rawBalance);

  // Cap limit
  const isCapped = enforceLeaveCap && netBalance > leaveCapDays;
  const finalCappedBalance = isCapped ? leaveCapDays : netBalance;

  // 5. Daily rate leave (gross / 26 for law, gross / 30 for company policy month salary)
  const leaveDailyRate = leaveAccrualBasis === 'law30' ? grossSalary / 26 : grossSalary / 30;
  const financialValue = finalCappedBalance * leaveDailyRate;

  return (
    <div className="bg-white dark:bg-[#1a202c] rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 sm:p-6 shadow-xs space-y-4">
      
      {/* Title block */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          <span className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 rounded-xl">
            <Calculator className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">تفاصيل العمليات الحسابية والمعادلات الرياضية</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">تتبع مفصل خطوة بخطوة للعمليات الحسابية المعتمدة لضمان الدقة العالية.</p>
          </div>
        </div>

        <button type="button" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-6 text-xs text-slate-800 dark:text-slate-200">
          
          {/* COMPARISON TABLE: Method 1 vs Method 2 */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-900 dark:text-white block border-r-2 border-indigo-500 pr-2">أولاً: مقارنة خيارات احتساب الإجازة السنوية وتصفية الرصيد</span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              يتيح لك النظام مقارنة الطريقتين واختيار إحداهما لتطبيقها في التصفية النهائية للموظف. انقر على أي من الطريقتين لاعتمادها فوراً في الحسبة:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Method 1: Law */}
              <div 
                onClick={() => {
                  onChangeLeaveAccrualBasis('law30');
                  onAddAuditLog('تغيير طريقة حساب الإجازات', 'تم اختيار طريقة قانون العمل الكويتي (30 يوم لكل سنة خدمة)');
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                  leaveAccrualBasis === 'law30'
                    ? 'border-emerald-500 bg-emerald-500/5 text-emerald-950 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                }`}
              >
                {leaveAccrualBasis === 'law30' && (
                  <span className="absolute left-3 top-3 p-1 bg-emerald-500 text-white rounded-full">
                    <Check className="w-3 h-3" />
                  </span>
                )}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="font-bold text-xs">الخيار (أ): قانون العمل الكويتي (المادة 70/72)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed pr-4">
                    30 يوماً ميلادياً عن كل سنة خدمة. يتم احتساب اليومية بقسمة الراتب الشامل على **26 يوماً** (المستقر قضائياً).
                  </p>
                  
                  {/* Detailed Math */}
                  <div className="bg-white dark:bg-slate-850 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 font-mono text-[10px] space-y-1.5">
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold block">🧮 معادلة قانون العمل:</span>
                    <div className="flex justify-between">
                      <span>الرصيد التراكمي:</span>
                      <span>({totalDays} يوم ÷ 365) × 30 = {lawAccruedDays.toFixed(4)} يوم</span>
                    </div>
                    <div className="flex justify-between">
                      <span>الرصيد الصافي (بعد خصم {totalTaken} يوم):</span>
                      <span>{Math.max(0, lawAccruedDays - totalTaken).toFixed(4)} يوم</span>
                    </div>
                    <div className="flex justify-between">
                      <span>قيمة اليومية (الأجر ÷ 26):</span>
                      <span>{grossSalary.toFixed(3)} ÷ 26 = {(grossSalary / 26).toFixed(3)} د.ك</span>
                    </div>
                    <div className="flex justify-between font-bold border-t border-slate-100 dark:border-slate-800 pt-1 text-slate-900 dark:text-white">
                      <span>إجمالي المستحق المالي:</span>
                      <span>
                        {(Math.min(enforceLeaveCap ? leaveCapDays : Infinity, Math.max(0, lawAccruedDays - totalTaken)) * (grossSalary / 26)).toFixed(3)} د.ك
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Method 2: Company policy */}
              <div 
                onClick={() => {
                  onChangeLeaveAccrualBasis('fullMonth');
                  onAddAuditLog('تغيير طريقة حساب الإجازات', 'تم اختيار طريقة سياسة الشركة (راتب شهر عن كل سنة)');
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                  leaveAccrualBasis === 'fullMonth'
                    ? 'border-emerald-500 bg-emerald-500/5 text-emerald-950 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                }`}
              >
                {leaveAccrualBasis === 'fullMonth' && (
                  <span className="absolute left-3 top-3 p-1 bg-emerald-500 text-white rounded-full">
                    <Check className="w-3 h-3" />
                  </span>
                )}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    <span className="font-bold text-xs">الخيار (ب): سياسة الشركة (راتب شهر كامل / 30 يوم)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed pr-4">
                    مستحق يعادل راتب شهر كامل عن كل سنة خدمة. ويتم احتساب اليومية بقسمة الراتب الشامل على **30 يوماً** (أساس الشهر الكامل).
                  </p>
                  
                  {/* Detailed Math */}
                  <div className="bg-white dark:bg-slate-850 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 font-mono text-[10px] space-y-1.5">
                    <span className="text-blue-700 dark:text-blue-400 font-bold block">🧮 معادلة سياسة الشركة:</span>
                    <div className="flex justify-between">
                      <span>الرصيد التراكمي:</span>
                      <span>({totalDays} يوم ÷ 365.25) × 30 = {companyAccruedDays.toFixed(4)} يوم</span>
                    </div>
                    <div className="flex justify-between">
                      <span>الرصيد الصافي (بعد خصم {totalTaken} يوم):</span>
                      <span>{Math.max(0, companyAccruedDays - totalTaken).toFixed(4)} يوم</span>
                    </div>
                    <div className="flex justify-between">
                      <span>قيمة اليومية (الأجر ÷ 30):</span>
                      <span>{grossSalary.toFixed(3)} ÷ 30 = {(grossSalary / 30).toFixed(3)} د.ك</span>
                    </div>
                    <div className="flex justify-between font-bold border-t border-slate-100 dark:border-slate-800 pt-1 text-slate-900 dark:text-white">
                      <span>إجمالي المستحق المالي:</span>
                      <span>
                        {(Math.min(enforceLeaveCap ? leaveCapDays : Infinity, Math.max(0, companyAccruedDays - totalTaken)) * (grossSalary / 30)).toFixed(3)} د.ك
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* DETAILED COMPUTATIONS CARD */}
          <div className="bg-slate-50 dark:bg-slate-800/30 p-4 sm:p-5 rounded-xl border border-slate-200/50 dark:border-slate-700/50 space-y-4">
            
            {/* Step 1: Duration */}
            <div className="space-y-1 pb-3 border-b border-slate-200/40 dark:border-slate-700/40">
              <span className="font-bold text-slate-900 dark:text-white block">1. مدة الخدمة الفعلية المحسوبة بالتفصيل</span>
              <p className="text-[11px] text-slate-500 font-mono">
                الفترة من تاريخ المباشرة {joiningDate} إلى تاريخ الانقطاع {exitDate} = {totalDays + unpaidAbsenceDays} يوماً ميلادياً.
                {unpaidAbsenceDays > 0 && ` مخصوماً منها غياب غير مدفوع الأجر ${unpaidAbsenceDays} يوم.`}
              </p>
              <div className="font-mono text-[11px] bg-white dark:bg-slate-850 p-2 rounded border border-slate-100 dark:border-slate-800">
                <span>إجمالي أيام الخدمة الفعلية النشطة (الصافية) = <strong>{totalDays} يوماً</strong></span>
              </div>
            </div>

            {/* Step 2: Shared Taken Leaves */}
            <div className="space-y-1 pb-3 border-b border-slate-200/40 dark:border-slate-700/40">
              <span className="font-bold text-slate-900 dark:text-white block">2. جدول استهلاك الإجازات المستخدمة فعلياً (تاريخياً)</span>
              <div className="space-y-1.5 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                {leavesList.length === 0 ? (
                  <p className="italic text-slate-400">لا يوجد أي إجازات مسجلة مستهلكة في السجلات.</p>
                ) : (
                  leavesList.map((l, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white dark:bg-slate-850 p-1.5 rounded border border-slate-100 dark:border-slate-800">
                      <span>{idx + 1}- {l.desc}</span>
                      <span>
                        {l.used} يوماً 
                        {deductFridaysFromLeaves && ` (الأصل: ${l.originalDays} يوماً مخصوماً منها ${l.fridays} أيام جمعة)`}
                      </span>
                    </div>
                  ))
                )}
                <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded font-black text-slate-800 dark:text-slate-200 flex justify-between">
                  <span>إجمالي الإجازات المستخدمة والمستهلكة المخصومة:</span>
                  <span>{totalTaken} يوماً</span>
                </div>
              </div>
            </div>

            {/* Side-by-Side Math Comparison and Steps */}
            <div className="space-y-2">
              <span className="font-bold text-slate-900 dark:text-white block">3. تفصيل العملية الحسابية لكلا القسمين والمقارنة المباشرة:</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Law Math Breakdown */}
                <div className="bg-white dark:bg-[#1a202c] p-3 rounded-lg border border-emerald-500/25 space-y-2">
                  <span className="font-bold text-emerald-800 dark:text-emerald-400 block pb-1 border-b border-slate-100 dark:border-slate-800">القسم الأول: حساب قانون العمل الكويتي (30 يوم / 26)</span>
                  <div className="font-mono text-[10px] space-y-1.5 text-slate-600 dark:text-slate-300">
                    <div>
                      <span>أ. الرصيد التراكمي المستحق:</span>
                      <p className="text-slate-900 dark:text-white font-bold">({totalDays} يوم ÷ 365) × 30 = {lawAccruedDays.toFixed(4)} يوم</p>
                    </div>
                    <div>
                      <span>ب. الرصيد المتبقي الصافي:</span>
                      <p className="text-slate-900 dark:text-white font-bold">{lawAccruedDays.toFixed(4)} - {totalTaken} = {Math.max(0, lawAccruedDays - totalTaken).toFixed(4)} يوم</p>
                    </div>
                    <div>
                      <span>ج. تطبيق الكبح (الحد الأقصى):</span>
                      <p className="text-slate-900 dark:text-white font-bold">
                        {enforceLeaveCap ? `مكبوح بحد ${leaveCapDays} يوماً ⬅️ ` : 'لا يوجد حد كبح ⬅️ '}
                        <strong className="text-emerald-700 dark:text-emerald-400">
                          {Math.min(enforceLeaveCap ? leaveCapDays : Infinity, Math.max(0, lawAccruedDays - totalTaken)).toFixed(4)} يوم
                        </strong>
                      </p>
                    </div>
                    <div>
                      <span>د. قيمة اليومية القانونية (الأجر الشامل ÷ 26):</span>
                      <p className="text-slate-900 dark:text-white font-bold">{grossSalary.toFixed(3)} ÷ 26 = {(grossSalary / 26).toFixed(3)} د.ك</p>
                    </div>
                    <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 text-xs text-emerald-800 dark:text-emerald-400 font-extrabold flex justify-between">
                      <span>البدل النقدي المستحق للقسم الأول:</span>
                      <span>{(Math.min(enforceLeaveCap ? leaveCapDays : Infinity, Math.max(0, lawAccruedDays - totalTaken)) * (grossSalary / 26)).toFixed(3)} د.ك</span>
                    </div>
                  </div>
                </div>

                {/* Company Policy Math Breakdown */}
                <div className="bg-white dark:bg-[#1a202c] p-3 rounded-lg border border-blue-500/25 space-y-2">
                  <span className="font-bold text-blue-800 dark:text-blue-400 block pb-1 border-b border-slate-100 dark:border-slate-800">القسم الثاني: حساب سياسة الشركة (شهر كامل / 30)</span>
                  <div className="font-mono text-[10px] space-y-1.5 text-slate-600 dark:text-slate-300">
                    <div>
                      <span>أ. الرصيد التراكمي المستحق:</span>
                      <p className="text-slate-900 dark:text-white font-bold">({totalDays} يوم ÷ 365.25) × 30 = {companyAccruedDays.toFixed(4)} يوم</p>
                    </div>
                    <div>
                      <span>ب. الرصيد المتبقي الصافي:</span>
                      <p className="text-slate-900 dark:text-white font-bold">{companyAccruedDays.toFixed(4)} - {totalTaken} = {Math.max(0, companyAccruedDays - totalTaken).toFixed(4)} يوم</p>
                    </div>
                    <div>
                      <span>ج. تطبيق الكبح (الحد الأقصى):</span>
                      <p className="text-slate-900 dark:text-white font-bold">
                        {enforceLeaveCap ? `مكبوح بحد ${leaveCapDays} يوماً ⬅️ ` : 'لا يوجد حد كبح ⬅️ '}
                        <strong className="text-blue-700 dark:text-blue-400">
                          {Math.min(enforceLeaveCap ? leaveCapDays : Infinity, Math.max(0, companyAccruedDays - totalTaken)).toFixed(4)} يوم
                        </strong>
                      </p>
                    </div>
                    <div>
                      <span>د. قيمة اليومية القانونية (الأجر الشامل ÷ 30):</span>
                      <p className="text-slate-900 dark:text-white font-bold">{grossSalary.toFixed(3)} ÷ 30 = {(grossSalary / 30).toFixed(3)} د.ك</p>
                    </div>
                    <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 text-xs text-blue-800 dark:text-blue-400 font-extrabold flex justify-between">
                      <span>البدل النقدي المستحق للقسم الثاني:</span>
                      <span>{(Math.min(enforceLeaveCap ? leaveCapDays : Infinity, Math.max(0, companyAccruedDays - totalTaken)) * (grossSalary / 30)).toFixed(3)} د.ك</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Selection Banner */}
            <div className="bg-indigo-50 dark:bg-indigo-950/20 text-indigo-950 dark:text-indigo-300 rounded-xl p-3.5 border border-indigo-150 dark:border-indigo-900/50 space-y-1">
              <span className="font-extrabold block text-xs">📢 الحالة المختارة النشطة والمعتمدة حالياً بالتصفية:</span>
              <p className="text-[11px] leading-relaxed">
                تُطبق حالياً **{leaveAccrualBasis === 'law30' ? 'طريقة قانون العمل الكويتي (القسم الأول)' : 'طريقة سياسة الشركة الداخلية (القسم الثاني)'}** بقيمة تعويض نقدي إجمالية قدرها: 
                <strong className="text-emerald-700 dark:text-emerald-400 text-sm font-black mx-1">
                  {financialValue.toFixed(3)} د.ك
                </strong>
                عن رصيد معتمد قدره <strong className="font-mono text-xs">{finalCappedBalance.toFixed(4)} يوماً</strong>.
              </p>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
