import React, { useState, useMemo } from 'react';
import { 
    Compass, Scale, AlertCircle, CheckCircle, ArrowRight, 
    ShieldAlert, ShieldCheck, PlusCircle, FileText, Info, 
    AlertTriangle, Sparkles, Check
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { 
    VIOLATIONS_LAW_CATALOG, 
    KUWAIT_LABOR_LAW_DISCIPLINARY_LIMITS, 
    KuwaitLawViolation 
} from './DisciplinaryTypes';

interface DisciplinarySimulatorTabProps {
    onApplyToNewDecision: (violationType: string, sanctionType: string, deductionDays: number) => void;
}

export const DisciplinarySimulatorTab: React.FC<DisciplinarySimulatorTabProps> = ({
    onApplyToNewDecision
}) => {
    const [selectedViolationType, setSelectedViolationType] = useState<string>(VIOLATIONS_LAW_CATALOG[0].type);
    const [repetitionCount, setRepetitionCount] = useState<number>(1);
    const [hasInvestigationArt35, setHasInvestigationArt35] = useState<boolean>(true);
    const [jobTier, setJobTier] = useState<string>('إداري/تنفيذي');
    const [customDays, setCustomDays] = useState<number>(0);

    // Selected catalog rule
    const currentRule: KuwaitLawViolation = useMemo(() => {
        return VIOLATIONS_LAW_CATALOG.find(v => v.type === selectedViolationType) || VIOLATIONS_LAW_CATALOG[0];
    }, [selectedViolationType]);

    // Simulator calculation
    const verdict = useMemo(() => {
        // Article 35: Investigation is mandatory before any financial sanction
        if (!hasInvestigationArt35) {
            return {
                status: 'danger' as const,
                title: 'الجزاء باطل بطلاناً مطلقاً (مخالفة المادة 35)',
                article: 'المادة 35 من قانون العمل الكويتي رقم 6 لسنة 2010',
                description: 'تنص المادة 35 صراحة على أنه: "لا يجوز توقيع جزاء على العامل إلا بعد إبلاغه كتابة بما نسب إليه وسماع أقواله وتحقيق دفاعه وإثبات ذلك في محضر يودع في ملفه الخاص". أي خصم أو قرار يصدر دون تحقيق كتابي يعد لاغياً أمام هيئة القوى العاملة والقضاء العمالي.',
                recommendedSanction: 'إلغاء أية عقوبة وإحالة الواقعة للتحقيق وسماع الأقوال فوراً.',
                calculatedDays: 0,
                canApply: false
            };
        }

        let stepIndex = Math.min(repetitionCount - 1, currentRule.progressiveLadder.length - 1);
        let recommendedStep = currentRule.progressiveLadder[stepIndex] || 'إنذار كتابي';
        let days = 0;

        if (recommendedStep.includes('خصم نصف يوم')) days = 0.5;
        else if (recommendedStep.includes('يومين')) days = 2;
        else if (recommendedStep.includes('3 أيام')) days = 3;
        else if (recommendedStep.includes('4 أيام')) days = 4;
        else if (recommendedStep.includes('5 أيام')) days = 5;

        // Check if proposed custom days exceed 5 days limit
        const limitExceeded = customDays > KUWAIT_LABOR_LAW_DISCIPLINARY_LIMITS.maxDeductionDaysPerViolation;

        if (limitExceeded) {
            return {
                status: 'warning' as const,
                title: 'تحذير: تجاوز السقف القانوني للخصم (المادة 102)',
                article: 'المادة 102 من قانون العمل الكويتي',
                description: `يحظر القانون خصم أكثر من أجر 5 أيام عن المخالفة الواحدة. تم تعديل السقف الموصى به تلقائياً إلى 5 أيام لضمان التحصين القانوني.`,
                recommendedSanction: recommendedStep,
                calculatedDays: 5,
                canApply: true
            };
        }

        return {
            status: 'safe' as const,
            title: 'القرار متطابق 100% مع سلم العقوبات القانوني',
            article: `${currentRule.articleReference}`,
            description: `الإجراء سليم ومحصن لائحياً. تدرج العقوبة للواقعة بالمرة (${repetitionCount}) يستوجب تطبيق: "${recommendedStep}".`,
            recommendedSanction: recommendedStep,
            calculatedDays: days || currentRule.maxDays,
            canApply: true
        };
    }, [hasInvestigationArt35, repetitionCount, currentRule, customDays]);

    return (
        <div className="space-y-6">
            
            {/* Header banner */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#113F36] to-[#1A5C4F] text-[#C19A5B] flex items-center justify-center shadow-xs">
                        <Compass className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                            محاكي قانون العمل والتدقيق الآلي للجزاءات
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200/50">
                                Kuwait Labor Law AI Simulator
                            </span>
                        </h3>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                            التحقق الفوري من مشروعية القرار، وحساب سلم العقوبات المتدرج وفق القانون رقم 6 لسنة 2010.
                        </p>
                    </div>
                </div>

                <div className="text-left font-mono text-[10px] font-bold text-slate-500">
                    <span>سقف الخصم القانوني: أجر 5 أيام / مخالفة</span>
                </div>
            </div>

            {/* Main Simulator Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Inputs Column */}
                <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-4 shadow-xs text-xs font-bold">
                    
                    <div className="space-y-1.5">
                        <label className="text-slate-700 dark:text-slate-300 block">1. اختر طبيعة المخالفة المرتكبة:</label>
                        <select
                            value={selectedViolationType}
                            onChange={e => setSelectedViolationType(e.target.value)}
                            className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                        >
                            {VIOLATIONS_LAW_CATALOG.map((v, idx) => (
                                <option key={idx} value={v.type}>{v.type} ({v.category})</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-slate-700 dark:text-slate-300 block">2. تكرار الواقعة خلال السنة/الشهر:</label>
                        <div className="grid grid-cols-5 gap-1.5">
                            {[1, 2, 3, 4, 5].map(num => (
                                <button
                                    key={num}
                                    onClick={() => setRepetitionCount(num)}
                                    className={`py-2 rounded-xl text-xs font-mono font-black border transition-all ${
                                        repetitionCount === num
                                            ? 'bg-[#113F36] text-white border-[#113F36] shadow-xs'
                                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                                    }`}
                                >
                                    المرة {num}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-slate-700 dark:text-slate-300 block">3. الكادر الوظيفي للموظف:</label>
                        <select
                            value={jobTier}
                            onChange={e => setJobTier(e.target.value)}
                            className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                        >
                            <option value="إداري/تنفيذي">كادر إداري وتنفيذي</option>
                            <option value="مهني/ميداني">كادر فني ومهني ميداني</option>
                            <option value="إشرافي/قيادي">كادر إشرافي وقيادي</option>
                        </select>
                    </div>

                    {/* Investigation Compliance Checkbox */}
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                        <span className="text-[10px] font-black text-[#113F36] dark:text-teal-400 block uppercase">
                            شرط التحقيق الكتابي (المادة 35):
                        </span>
                        <label className="flex items-center gap-2 cursor-pointer text-slate-800 dark:text-slate-200">
                            <input
                                type="checkbox"
                                checked={hasInvestigationArt35}
                                onChange={e => setHasInvestigationArt35(e.target.checked)}
                                className="w-4 h-4 accent-[#113F36] rounded"
                            />
                            <span className="text-xs">تم إخطار العامل وسماع أقواله وتدوين دفاعه بمحضر مكتوب</span>
                        </label>
                    </div>

                </div>

                {/* Legal Verdict & Progressive Ladder */}
                <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-5 shadow-xs">
                    
                    {/* Verdict Card */}
                    <div className={`p-4 rounded-xl border space-y-2 ${
                        verdict.status === 'danger'
                            ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 text-rose-900 dark:text-rose-200'
                            : verdict.status === 'warning'
                            ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 text-amber-900 dark:text-amber-200'
                            : 'bg-teal-50 dark:bg-teal-950/30 border-teal-200 text-teal-900 dark:text-teal-200'
                    }`}>
                        <div className="flex items-center gap-2">
                            {verdict.status === 'danger' ? (
                                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                            ) : verdict.status === 'warning' ? (
                                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                            ) : (
                                <CheckCircle className="w-5 h-5 text-teal-700 shrink-0" />
                            )}
                            <div>
                                <h4 className="text-xs font-black">{verdict.title}</h4>
                                <span className="text-[10px] font-bold opacity-80">{verdict.article}</span>
                            </div>
                        </div>

                        <p className="text-xs leading-relaxed font-medium pt-1">
                            {verdict.description}
                        </p>
                    </div>

                    {/* Recommended Sanction Box */}
                    <div className="p-4 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 rounded-xl space-y-1">
                        <span className="text-[10px] font-black text-amber-800 dark:text-amber-300 block uppercase">
                            العقوبة المستحقة نظاماً:
                        </span>
                        <p className="text-sm font-black text-[#113F36] dark:text-[#E5C185]">
                            {verdict.recommendedSanction}
                        </p>
                    </div>

                    {/* Progressive Ladder Visualizer */}
                    <div className="space-y-2.5">
                        <span className="text-[10px] font-black text-slate-500 block uppercase tracking-wider">
                            السلم المتدرج للعقوبات لهذه المخالفة (المادة 102):
                        </span>
                        
                        <div className="flex flex-wrap items-center gap-1.5">
                            {currentRule.progressiveLadder.map((step, idx) => {
                                const isCurrent = idx + 1 === repetitionCount;

                                return (
                                    <React.Fragment key={idx}>
                                        <div className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                                            isCurrent
                                                ? 'bg-[#113F36] text-white border-[#113F36] shadow-sm ring-2 ring-[#C19A5B]/30'
                                                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                                        }`}>
                                            <span className="text-[9px] opacity-75 font-mono ml-1">[{idx + 1}]</span>
                                            {step}
                                        </div>
                                        {idx < currentRule.progressiveLadder.length - 1 && (
                                            <ArrowRight className="w-3.5 h-3.5 text-slate-400 rotate-180" />
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>

                    {/* Action Button: Apply to new decision */}
                    {verdict.canApply && (
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => onApplyToNewDecision(selectedViolationType, verdict.recommendedSanction, verdict.calculatedDays)}
                                className="bg-[#113F36] hover:bg-[#0d312a] text-white font-black text-xs h-9 px-5 rounded-xl shadow-xs"
                            >
                                <PlusCircle className="w-4 h-4 ml-1.5 text-[#C19A5B]" />
                                تطبيق هذه التوصية في قرار تأديبي جديد
                            </Button>
                        </div>
                    )}

                </div>

            </div>

        </div>
    );
};
