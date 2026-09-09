import React from 'react';
import { Scale, Printer, FileText, Landmark, ShieldCheck } from 'lucide-react';
import PrintHeader from '../ui/PrintHeader';
import { NumberToKuwaitiWords } from '../../utils/kuwaitEosUtils';
import { RedesignedTakenLeave, RedesignedFinancialItem, EOS_LEGAL_BASIS } from './types';

interface EosPrintLayoutProps {
  employeeName: string;
  civilId: string;
  id: string; // Job ID
  department: string;
  jobTitle: string;
  isKuwaiti: boolean;
  joiningDate: string;
  exitDate: string;
  terminationReason: string;
  contractType: string;
  basicSalary: number;
  allowableAllowance: number;
  grossSalary: number;
  unpaidAbsenceDays: number;
  enforceLeaveCap: boolean;
  leaveCapDays?: number;
  indemnityDivisor: number;
  duration: { years: number; months: number; days: number; totalCalendarDays: number; activeDays: number };
  computations: {
    rawIndemnity: number;
    conversionScale: number;
    finalIndemnityBeforeOffset: number;
    pifssOffsetApplied: number;
    finalIndemnity: number;
    leaveCompensation: number;
    leaveCompensationLaw: number;
    leaveCompensationCompany: number;
    leaveDaysLaw: number;
    leaveDaysCompany: number;
    leaveDailyRateLaw: number;
    leaveDailyRateCompany: number;
    accruedLeaveDays: number;
    totalTakenLeaveDays: number;
    remainingLeaveDays: number;
    finalCappedLeaveDays: number;
    totalAdditions: number;
    totalDeductions: number;
    netPayout: number;
    yearsOfService: number;
    firstPeriodDays: number;
    subsequentPeriodDays: number;
    isCapped: boolean;
    ceilingMax: number;
  };
  takenLeaves: RedesignedTakenLeave[];
  deductFridaysFromLeaves: boolean;
  leaveAccrualBasis: 'law30' | 'fullMonth';
  additions: RedesignedFinancialItem[];
  deductions: RedesignedFinancialItem[];
  nationality?: string;
  performanceNotes?: string;
  onClose: () => void;
}

export const EosPrintLayout: React.FC<EosPrintLayoutProps> = ({
  employeeName,
  civilId,
  id,
  department,
  jobTitle,
  isKuwaiti,
  joiningDate,
  exitDate,
  terminationReason,
  contractType,
  basicSalary,
  allowableAllowance,
  grossSalary,
  unpaidAbsenceDays,
  enforceLeaveCap,
  leaveCapDays = 60,
  indemnityDivisor,
  duration,
  computations,
  takenLeaves,
  deductFridaysFromLeaves,
  leaveAccrualBasis,
  additions,
  deductions,
  nationality,
  performanceNotes = "",
  onClose,
}) => {
  const [activePrintTab, setActivePrintTab] = React.useState<'eos_statement' | 'experience_certificate'>('eos_statement');
  const arabicWordsPayout = NumberToKuwaitiWords(computations.netPayout);
  const dailyRateWorkday = grossSalary / 26;
  const hourlyRateWorkday = dailyRateWorkday / 8;
  const dailyRateIndemnity = grossSalary / indemnityDivisor;

  const printDate = new Date().toLocaleDateString('ar-KW', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });

  return (
    <div id="official-print-modal" className="bg-white text-slate-950 p-6 sm:p-10 font-sans text-right max-w-4xl mx-auto border-[3px] border-[#134D41] rounded-2xl relative shadow-2xl print:border-none print:shadow-none print:p-0" dir="rtl">
      
      {/* Decorative background watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
        <Scale className="w-[350px] h-[350px] text-[#134D41]" />
      </div>

      {/* Tab selection bar (non-printable) */}
      <div className="flex border-b border-slate-200 mb-6 print:hidden gap-2">
        <button
          type="button"
          onClick={() => setActivePrintTab('eos_statement')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 bg-transparent ${activePrintTab === 'eos_statement' ? 'border-[#134D41] text-[#134D41] font-black' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <Scale className="w-4 h-4" />
          <span>كشف حساب تصفية المستحقات</span>
        </button>
        <button
          type="button"
          onClick={() => setActivePrintTab('experience_certificate')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 bg-transparent ${activePrintTab === 'experience_certificate' ? 'border-[#134D41] text-[#134D41] font-black' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <FileText className="w-4 h-4" />
          <span>شهادة خبرة رسمية جاهزة للطباعة</span>
        </button>
      </div>

      {/* Header */}
      <PrintHeader 
        title={activePrintTab === 'eos_statement' ? "كشف حساب تصفية المستحقات ومكافأة نهاية الخدمة" : "شهادة خبرة وسيرة وظيفية"} 
        subtitle={activePrintTab === 'eos_statement' ? "بموجب أحكام مواد قانون العمل الكويتي رقم (6) لسنة 2010 وتعديلاته بالقطاع الأهلي" : "صادرة بموجب أحكام المادة (54) من قانون العمل الكويتي رقم (6) لسنة 2010"} 
        hideOfficeBranding={true}
      />

      {/* Printing Metas */}
      {activePrintTab === 'eos_statement' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 border p-3.5 rounded-xl text-[10px] text-slate-800 mb-6">
          <div>
            <span className="text-slate-400 font-bold block">تاريخ إصدار تصفية الكشف:</span>
            <span className="font-extrabold text-slate-900">{printDate} م</span>
          </div>
          <div className="text-center">
            <span className="text-slate-400 font-bold block">تاريخ الانتهاء والإنهاء المعتمد:</span>
            <span className="font-bold text-[#134D41] bg-emerald-50 px-2.5 py-0.5 rounded inline-block border border-emerald-100">
              {exitDate ? new Date(exitDate).toLocaleDateString('ar-KW', { day: 'numeric', month: 'long', year: 'numeric' }) : '......................'} م
            </span>
          </div>
          <div className="text-left font-mono text-rose-700 font-bold" dir="ltr">
            <span>REF: ADALAH-EOS-LAW-6-2010</span>
          </div>
        </div>
      )}

      {activePrintTab === 'eos_statement' ? (
        <div className="space-y-6">
        
        {/* Section 1: Employee Data */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-100 px-4 py-2 font-black text-xs text-slate-800 border-b border-slate-200">
            ١. بيانات الملف التعاقدي للموظف المستفيد
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 text-[11px] leading-relaxed">
            <div>
              <span className="text-slate-400 block font-bold">الاسم الكامل:</span>
              <span className="font-extrabold text-slate-900">{employeeName || '...........................................'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-bold">الرقم المدني الكويتي:</span>
              <span className="font-mono font-bold text-slate-900">{civilId || '...........................................'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-bold">الرقم الوظيفي:</span>
              <span className="font-mono font-bold text-slate-900">{id || '...........................................'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-bold">القسم الإداري:</span>
              <span className="font-bold text-slate-900">{department || '...........................................'}</span>
            </div>
            
            <div className="pt-2">
              <span className="text-slate-400 block font-bold">المسمى الوظيفي:</span>
              <span className="font-bold text-slate-900">{jobTitle || '...........................................'}</span>
            </div>
            <div className="pt-2">
              <span className="text-slate-400 block font-bold">الجنسية:</span>
              <span className="font-bold text-slate-900">{isKuwaiti ? 'كويتي الجنسية 🇰🇼' : 'غير كويتي'}</span>
            </div>
            <div className="pt-2">
              <span className="text-slate-400 block font-bold">تاريخ التعيين:</span>
              <span className="font-mono font-bold text-slate-900">{joiningDate}</span>
            </div>
            <div className="pt-2">
              <span className="text-slate-400 block font-bold">تاريخ انتهاء الخدمة:</span>
              <span className="font-mono font-bold text-slate-900">{exitDate}</span>
            </div>

            <div className="pt-2">
              <span className="text-slate-400 block font-bold">سبب انتهاء الخدمة:</span>
              <span className="font-bold text-rose-800">{terminationReason}</span>
            </div>
            <div className="pt-2">
              <span className="text-slate-400 block font-bold">نوع العقد:</span>
              <span className="font-bold text-slate-900">{contractType}</span>
            </div>
            <div className="pt-2">
              <span className="text-slate-400 block font-bold">آخر راتب أساسي:</span>
              <span className="font-mono font-bold text-slate-900">{basicSalary.toFixed(3)} د.ك</span>
            </div>
            <div className="pt-2">
              <span className="text-slate-400 block font-bold">آخر راتب شامل:</span>
              <span className="font-mono font-bold text-[#134D41]">{grossSalary.toFixed(3)} د.ك</span>
            </div>
          </div>
        </div>

        {/* Section 2: Service Duration Details */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-100 px-4 py-2 font-black text-xs text-slate-800 border-b border-slate-200">
            ٢. بيان مدة الخدمة الفعلية وتفاصيلها الجريجورية
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 text-[11px] font-mono">
            <div>
              <span className="text-slate-400 font-sans block font-bold">من تاريخ التعيين:</span>
              <span className="font-bold">{joiningDate}</span>
            </div>
            <div>
              <span className="text-slate-400 font-sans block font-bold">إلى تاريخ الانتهاء:</span>
              <span className="font-bold">{exitDate}</span>
            </div>
            <div>
              <span className="text-slate-400 font-sans block font-bold">انقطاعات غير مدفوعة الأجر (-):</span>
              <span className="font-bold text-rose-600">{unpaidAbsenceDays} يوماً</span>
            </div>
            <div>
              <span className="text-slate-400 font-sans block font-bold">إجمالي الأيام الميلادية الفعلية الصافية:</span>
              <span className="font-black text-[#134D41]">{duration.activeDays} يوماً ({duration.years} سنة و {duration.months} شهر و {duration.days} يوم)</span>
            </div>
          </div>
        </div>

        {/* Section 3: Salary Details */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-100 px-4 py-2 font-black text-xs text-slate-800 border-b border-slate-200">
            ٣. الأجر التفصيلي ومعادلة حساب اليومية والساعة
          </div>
          <div className="p-4 text-[11px] space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <span className="text-slate-400 block font-bold">الراتب الأساسي:</span>
                <span className="font-mono font-bold text-slate-900">{basicSalary.toFixed(3)} د.ك</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold">البدلات الخاضعة:</span>
                <span className="font-mono font-bold text-slate-900">{allowableAllowance.toFixed(3)} د.ك</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold">الأجر الشامل:</span>
                <span className="font-mono font-black text-[#134D41]">{grossSalary.toFixed(3)} د.ك</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold">أجر اليومية (الراتب ÷ 26):</span>
                <span className="font-mono font-bold text-[#134D41]">{dailyRateWorkday.toFixed(3)} د.ك</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold">أجر الساعة (اليوم ÷ 8):</span>
                <span className="font-mono font-bold text-[#134D41]">{hourlyRateWorkday.toFixed(3)} د.ك</span>
              </div>
            </div>
            
            {/* Formulas explanations */}
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 font-mono text-[9.5px] text-slate-500 space-y-1">
              <div>• أجر اليومية القانونية (مبني على ٢٦ يوماً عمل): {dailyRateWorkday.toFixed(3)} د.ك | للمكافأة (مبني على {indemnityDivisor} يوماً): {dailyRateIndemnity.toFixed(3)} د.ك</div>
              <div>• أجر الساعة (مبني على ٨ ساعات عمل باليوم): {hourlyRateWorkday.toFixed(3)} د.ك</div>
            </div>

            {/* Indemnity Details */}
            <div className="space-y-1 pb-3 border-b border-dashed border-slate-200">
              <span className="font-bold text-slate-900 block">• تفاصيل مكافأة نهاية الخدمة التراكمية (المادة 51):</span>
              <p className="text-slate-600 leading-relaxed font-mono">
                أول ٥ سنوات (بمعدل {computations.yearsOfService <= 5 ? computations.yearsOfService.toFixed(4) : 5} سنوات × 15 يوم) = {computations.firstPeriodDays.toFixed(2)} يوماً عمالياً براتب شامل. <br />
                السنوات اللاحقة (بمعدل {Math.max(0, computations.yearsOfService - 5).toFixed(4)} سنوات × أجر شهر كامل يعادل {indemnityDivisor} يوماً عمالياً) = {computations.subsequentPeriodDays.toFixed(2)} يوماً عمالياً براتب شامل. <br />
                إجمالي المكافأة الخام = ({computations.firstPeriodDays.toFixed(2)} + {computations.subsequentPeriodDays.toFixed(2)}) يوم × (أجر اليومية للمكافأة {dailyRateIndemnity.toFixed(3)} د.ك) = {computations.rawIndemnity.toFixed(3)} د.ك. <br />
                عامل تسوية المغادرة (المادة 53): × {computations.conversionScale.toFixed(2)} = {computations.finalIndemnityBeforeOffset.toFixed(3)} د.ك. 
                {computations.isCapped && ` (مكبوح بحد السقف الأقصى للمادة 51: ${computations.ceilingMax.toFixed(3)} د.ك)`}
                {isKuwaiti && ` (خصم اشتراك التأمينات الاجتماعية PIFSS المقتطعة: -${computations.pifssOffsetApplied.toFixed(3)} د.ك)`}
              </p>
              <div className="font-mono font-bold text-[#134D41] text-right pt-1 text-xs">
                صافي مكافأة نهاية الخدمة الصافية المعتمدة = {computations.finalIndemnity.toFixed(3)} د.ك
              </div>
            </div>

            {/* Leaves Details */}
            <div className="space-y-1">
              <span className="font-bold text-slate-900 block">
                • تفاصيل تصفية رصيد الإجازات السنوية المتراكمة ({leaveAccrualBasis === 'law30' ? 'القسم الأول: قانون العمل الكويتي' : 'القسم الثاني: سياسة الشركة'}):
              </span>
              <p className="text-slate-600 leading-relaxed font-mono text-[11px]">
                الرصيد الكلي المتراكم المستحق = {computations.accruedLeaveDays.toFixed(4)} يوماً. <br />
                إجمالي الإجازات المستخدمة المسجلة المخصومة = {computations.totalTakenLeaveDays} يوماً. <br />
                الرصيد المتبقي الصافي = {computations.remainingLeaveDays.toFixed(4)} يوماً {enforceLeaveCap && ` (مكبوح بالحد الأقصى للتسوية بموجب سياسة المنشأة بمعدل ${leaveCapDays} يوماً)`}. <br />
                القيمة المالية للرصيد الصافي = الرصيد المعتمد ({computations.finalCappedLeaveDays.toFixed(4)} يوم) × (الراتب ÷ {leaveAccrualBasis === 'law30' ? '26' : '30'}) = {computations.leaveCompensation.toFixed(3)} د.ك.
              </p>
              
              {/* Taken Leaves Sub-list in Printout */}
              {takenLeaves && takenLeaves.length > 0 && (
                <div className="mt-2.5 mb-2.5 p-2 bg-slate-50 rounded-lg border border-slate-250">
                  <span className="text-[10px] font-black text-slate-700 block mb-1">تفصيل فترات الإجازات المستخدمة المخصومة:</span>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[9px] text-right border-collapse">
                      <thead>
                        <tr className="bg-slate-200/80 text-slate-700 border-b border-slate-300 font-bold">
                          <th className="p-1 border-r border-slate-300">الفترة الزمنية للإجازة</th>
                          <th className="p-1 text-center border-r border-slate-300">أيام التقويم</th>
                          <th className="p-1 text-center border-r border-slate-300">أيام الجمع (مستبعدة)</th>
                          <th className="p-1 text-center border-r border-slate-300 font-black">صافي الخصم</th>
                          <th className="p-1">البيان / ملاحظات الإجازة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {takenLeaves.map((leave) => (
                          <tr key={leave.id} className="text-slate-700">
                            <td className="p-1 border-r border-slate-200 font-mono">من {leave.fromDate} إلى {leave.toDate}</td>
                            <td className="p-1 text-center border-r border-slate-200 font-mono">{leave.days}</td>
                            <td className="p-1 text-center border-r border-slate-200 font-mono text-teal-700 font-bold">{leave.fridaysCount}</td>
                            <td className="p-1 text-center border-r border-slate-200 font-mono text-rose-700 font-black">{leave.netDays}</td>
                            <td className="p-1 font-sans">{leave.leaveType} {leave.note ? `(${leave.note})` : ''}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="font-mono font-bold text-[#134D41] text-right pt-1 text-xs">
                إجمالي البدل النقدي لتصفية الإجازة السنوية = {computations.leaveCompensation.toFixed(3)} د.ك
              </div>
            </div>

          </div>
        </div>

        {/* Section 5: Additions and Deductions summary */}
        {(additions.length > 0 || deductions.length > 0) && (
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-100 px-4 py-2 font-black text-xs text-slate-800 border-b border-slate-200">
              ٥. تفاصيل المبالغ والبنود الاستثنائية المضافة أو المخصومة
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px] leading-relaxed">
              
              {/* Additions */}
              <div className="space-y-2">
                <span className="font-bold text-emerald-800 block">• الإضافات والمكافآت والعمولات المستحقة (+):</span>
                {additions.length === 0 ? (
                  <span className="text-slate-400 font-bold block">لا يوجد</span>
                ) : (
                  <div className="space-y-1 font-mono">
                    {additions.map((item) => (
                      <div key={item.id} className="flex justify-between bg-slate-50 p-1.5 rounded border border-slate-100">
                        <span>{item.description}</span>
                        <span>+{item.amount.toFixed(3)} د.ك</span>
                      </div>
                    ))}
                    <div className="text-[#134D41] font-bold text-left font-sans text-[11px]">الإجمالي الإضافي: +{computations.totalAdditions.toFixed(3)} د.ك</div>
                  </div>
                )}
              </div>

              {/* Deductions */}
              <div className="space-y-2">
                <span className="font-bold text-rose-800 block">• الخصومات والسلف والتعويضات عن تلفيات (-):</span>
                {deductions.length === 0 ? (
                  <span className="text-slate-400 font-bold block">لا يوجد</span>
                ) : (
                  <div className="space-y-1 font-mono">
                    {deductions.map((item) => (
                      <div key={item.id} className="flex justify-between bg-slate-50 p-1.5 rounded border border-slate-100">
                        <span>{item.description}</span>
                        <span>-{item.amount.toFixed(3)} د.ك</span>
                      </div>
                    ))}
                    <div className="text-rose-700 font-bold text-left font-sans text-[11px]">الإجمالي المخصوم: -{computations.totalDeductions.toFixed(3)} د.ك</div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Section 6: Net Due & Words Payout Block */}
        <div className="bg-[#ECFDF5] border-2 border-emerald-500 rounded-xl p-5 text-center">
          <span className="text-[10px] font-black text-slate-800 block uppercase tracking-wider mb-1">صافي المبلغ الإجمالي المستحق للدفع والصرف النهائي للموظف المستفيد</span>
          <strong className="text-2xl font-black text-[#134D41] font-mono block">
            {computations.netPayout.toFixed(3)} د.ك
          </strong>
          <p className="text-xs font-black text-[#134D41] border-t border-emerald-200 mt-2.5 pt-2">
            فقط وقدره: {arabicWordsPayout} لا غير.
          </p>
        </div>

        {/* Section 7: Legal Basis Section (السند القانوني) */}
        <div className="border border-slate-200 rounded-xl overflow-hidden page-break-before">
          <div className="bg-slate-100 px-4 py-2 font-black text-xs text-slate-800 border-b border-slate-200 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>الأساس والسند القانوني المعتمد في عمليات التصفية والحساب</span>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-[9.5px] leading-relaxed text-slate-600 dark:text-slate-400 bg-slate-50/50">
            {EOS_LEGAL_BASIS.map((article) => (
              <div key={article.id} className="bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-2xs space-y-1">
                <span className="font-black text-slate-900 block">{article.articleNumber}</span>
                <span className="font-bold text-[#134D41] block">{article.title}</span>
                <p className="text-slate-600 font-medium leading-relaxed">{article.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 8: Receipt Acknowledgment Form (إقرار الاستلام) */}
        <div className="border border-dashed border-slate-300 p-4 sm:p-5 rounded-xl text-[10px] leading-relaxed text-slate-800 bg-slate-50/30">
          <strong className="block mb-2 text-slate-900 text-xs font-black border-b pb-1">نموذج إقرار استلام المخالصة وإبراء ذمة نهائي وتام:</strong>
          <p className="text-justify font-medium leading-relaxed">
            أقر أنا الموقع أدناه الموظف المستفيد: <strong className="text-slate-950">{employeeName || '......................................................'}</strong>، الجنسية: <strong className="text-slate-950">{isKuwaiti ? "الكويتية 🇰🇼" : (nationality ? `${nationality} 🌍` : "غير الكويتية (وافد)")}</strong>، بموجب البطاقة المدنية رقم: <strong className="text-slate-950 font-mono">{civilId || '......................................................'}</strong>، بأنني تسلمت من المنشأة <strong className="font-bold">{id ? 'صاحب العمل المذكور أعلاه' : '......................................................'}</strong>، كامل مستحقاتي العمالية والمالية الناتجة عن انتهاء خدمتي بالكامل وتصفية رصيدي، بما يشمل مكافأة نهاية الخدمة وتصفية رصيد الإجازات السنوية المتراكمة وكافة المزايا والرواتب المستحقة قانوناً، وذلك بعد مراجعته تفصيلاً وإقراري بصحة العمليات الرياضية الحسابية الواردة أعلاه، وإبراء ذمة الشركة إبراء شاملاً قاطعاً ومانعاً لأي مطالبة عمالية في الماضي أو الحاضر أو المستقبل.
          </p>

          {/* Signature fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-5 mt-4 border-t border-slate-200 text-xs text-slate-900">
            <div className="space-y-1.5">
              <span className="font-black text-slate-900 block border-b pb-1">الطرف الأول: الموظف المستفيد (المقر)</span>
              <p className="text-[10px]">الاسم الكامل: {employeeName || '......................................................'}</p>
              <p className="text-[10px]">الرقم المدني: {civilId || '......................................................'}</p>
              <p className="pt-4 font-bold">التوقيع وبصمة الإبهام: .......................................</p>
            </div>
            
            <div className="flex flex-col items-center justify-center">
              <div className="border-4 border-double border-emerald-700/60 rounded-full w-24 h-24 flex flex-col items-center justify-center text-center p-1 bg-white select-none rotate-6 shadow-3xs">
                <span className="text-[7px] font-bold text-emerald-800 leading-none">مكتب المستشار</span>
                <span className="text-[9px] font-black text-emerald-950 my-0.5 leading-none">صبري شطا</span>
                <span className="text-[6px] font-bold text-emerald-600 leading-none">مخالصة معتمدة وموثقة</span>
              </div>
            </div>

            <div className="space-y-1.5 text-left" dir="ltr">
              <span className="font-black text-slate-900 block border-b pb-1 text-right" dir="rtl">الطرف الثاني: المنشأة (صاحب العمل)</span>
              <div className="text-[10px] text-right space-y-1" dir="rtl">
                <p>اسم المفوض بالإدارة: ....................................................</p>
                <p>المسمى الوظيفي: ....................................................</p>
                <p className="pt-4 font-bold">توقيع المسؤول وختم المنشأة: .......................................</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info and Printing specifications */}
        <div className="border-t pt-3 flex flex-col sm:flex-row justify-between text-[8px] text-slate-400 font-mono">
          <span>عدالة - المنظومة الذكية المتكاملة للإدارة القانونية v3</span>
          <span>صفحة ١ من ١ | تاريخ التصدير: {printDate} م</span>
          <span className="font-sans">الكويت، منطقة شرق، شارع أحمد الجابر، برج القبلة والساحل</span>
        </div>

      </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* Certificate Body Container */}
          <div className="border border-slate-200 rounded-xl p-8 bg-slate-50/10 text-slate-800 leading-relaxed text-justify space-y-6 relative overflow-hidden">
            {/* Elegant Background Watermark for Experience */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.015] pointer-events-none select-none">
              <FileText className="w-[300px] h-[300px] text-[#134D41]" />
            </div>

            <div className="text-center font-black text-lg text-[#134D41] border-b-2 border-slate-100 pb-3 mb-4">
              إلى من يهمه الأمر
            </div>

            <p className="text-xs sm:text-sm leading-loose">
              تشهد المنشأة / شركة صاحب العمل المذكورة أدناه، وبناءً على سجلات الملفات الوظيفية المعتمدة لديها، بأن السيد / السيدة: <strong className="text-slate-950 font-black text-sm sm:text-base">{employeeName || '...........................................'}</strong>، الجنسية: <strong className="text-slate-950">{isKuwaiti ? "الكويتية 🇰🇼" : (nationality ? `${nationality} 🌍` : "غير الكويتية")}</strong>، ويحمل الرقم المدني الكويتي: <strong className="text-slate-950 font-mono text-xs">{civilId || '...........................................'}</strong>، قد كان يعمل لدى المنشأة وذلك وفق التفاصيل التعاقدية التالية:
            </p>

            {/* Certificate Meta Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white border border-slate-200/80 p-5 rounded-xl text-xs font-medium my-4">
              <div>
                <span className="text-slate-400 block font-bold">المسمى الوظيفي الأخير:</span>
                <span className="font-extrabold text-slate-900 text-xs sm:text-sm">{jobTitle || '...........................................'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold">القسم / الإدارة:</span>
                <span className="font-extrabold text-slate-900 text-xs sm:text-sm">{department || '...........................................'}</span>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-400 block font-bold">تاريخ الالتحاق والتعيين:</span>
                <span className="font-mono font-bold text-slate-900">{joiningDate} م</span>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-400 block font-bold">تاريخ مغادرة وانتهاء الخدمة:</span>
                <span className="font-mono font-bold text-slate-900">{exitDate} م</span>
              </div>
              <div className="pt-2 border-t border-slate-100 col-span-1 sm:col-span-2">
                <span className="text-slate-400 block font-bold">المدة الإجمالية للخدمة الفعلية الصافية:</span>
                <span className="font-extrabold text-[#134D41] text-xs sm:text-sm">
                  {duration.years} سنة، و {duration.months} شهر، و {duration.days} يوم (إجمالي {duration.activeDays} يوماً عمالياً صافياً بعد استقطاع فترات الانقطاع).
                </span>
              </div>
            </div>

            {/* Performance and behaviour notes section */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-black text-[#134D41] block border-r-4 border-[#134D41] pr-2.5">
                تقييم الأداء والملاحظات السلوكية والمهنية خلال فترة الخدمة:
              </span>
              <p className="text-xs text-slate-700 bg-[#134D41]/5 p-4 border border-emerald-100/30 rounded-xl leading-relaxed text-justify italic">
                {performanceNotes || "أبدى الموظف خلال فترة عمله انضباطاً عالياً، وتعاوناً مثمراً مع زملائه، وأظهر مهارات مهنية متميزة في أداء المهام الموكلة إليه، وكان نموذجاً يقتدى به في الجدية والالتزام بسلوكيات العمل وقوانين المنشأة."}
              </p>
            </div>

            <p className="text-[10px] sm:text-xs leading-loose text-slate-600 pt-3">
              وقد أُعطيت له هذه الشهادة بناءً على طلبه بموجب الحقوق المنصوص عليها في المادة (54) من قانون العمل الكويتي بالقطاع الأهلي، لتقديمها إلى من يهمه الأمر دون أدنى مسؤولية أو التزام مالي أو قانوني على الشركة تجاه الغير.
            </p>

            {/* Signatures for Certificate */}
            <div className="grid grid-cols-2 gap-12 pt-8 mt-6 border-t border-slate-100 text-xs text-slate-900">
              <div className="flex flex-col items-center justify-center">
                <div className="border-4 border-double border-emerald-700/60 rounded-full w-24 h-24 flex flex-col items-center justify-center text-center p-1 bg-white select-none rotate-6 shadow-3xs">
                  <span className="text-[7px] font-bold text-emerald-800 leading-none">مكتب المستشار</span>
                  <span className="text-[9px] font-black text-emerald-950 my-0.5 leading-none">صبري شطا</span>
                  <span className="text-[6px] font-bold text-emerald-600 leading-none">مخالصة معتمدة وموثقة</span>
                </div>
              </div>
              <div className="space-y-2 text-left" dir="ltr">
                <span className="font-black text-slate-900 block border-b pb-1 text-right" dir="rtl">توقيع واعتماد إدارة الموارد البشرية</span>
                <div className="text-[10px] text-right space-y-1" dir="rtl">
                  <p>اسم المسؤول: ....................................................</p>
                  <p>الصفة الوظيفية: مدير الموارد البشرية والشؤون الإدارية</p>
                  <p className="pt-4 font-bold">توقيع المسؤول وختم المنشأة: .......................................</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer info and Printing specifications */}
          <div className="border-t pt-3 flex flex-col sm:flex-row justify-between text-[8px] text-slate-400 font-mono">
            <span>عدالة - المنظومة الذكية المتكاملة للإدارة القانونية v3</span>
            <span>صفحة ١ من ١ | تاريخ التصدير: {printDate} م</span>
            <span className="font-sans">الكويت، منطقة شرق، شارع أحمد الجابر، برج القبلة والساحل</span>
          </div>
        </div>
      )}

      {/* Close button toolbar */}
      <div className="flex justify-end gap-3 print:hidden pt-8 border-t border-slate-200 mt-8">
        <button
          type="button"
          onClick={onClose}
          className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs px-5 py-2 rounded-xl cursor-pointer bg-white transition-colors"
        >
          إغلاق النافذة والعودة
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-1.5 bg-[#134D41] hover:bg-[#0c332b] text-white font-black text-xs px-6 py-2 rounded-xl shadow-xs cursor-pointer border-0 transition-all scale-100 hover:scale-[1.02]"
        >
          <Printer className="w-4 h-4" />
          <span>طباعة المستند الرسمي</span>
        </button>
      </div>

    </div>
  );
};
