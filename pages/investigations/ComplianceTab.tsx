import React from 'react';
import Card from '../../components/ui/Card';
import { ShieldCheck, Check, Info } from 'lucide-react';

interface ComplianceTabProps {
    selectedCase: any;
    onToggleSafeguard: (field: string) => void;
}

export const ComplianceTab: React.FC<ComplianceTabProps> = ({ selectedCase, onToggleSafeguard }) => {
    const checks = selectedCase.safeguards || {
        within15Days: true,
        writtenNotice: false,
        heardEmployee: false,
        signedOnPages: false,
        proportionalPenalty: false
    };

    const validCount = Object.values(checks).filter(Boolean).length;
    const scorePercentage = Math.round((validCount / 5) * 100);

    const checklistItems = [
        {
            field: 'within15Days',
            title: 'مباشرة التحقيق خلال 15 يوماً من تاريخ ثبوت المخالفة (المادة 115)',
            desc: 'وجوب عدم فوات الميعاد القانوني تفادياً لسقوط حق المؤاخذة والمساءلة التأديبية عمالياً.'
        },
        {
            field: 'writtenNotice',
            title: 'إخطار الموظف كتابياً بالاستدعاء وموعد التحقيق والمخالفة المنسوبة إليه',
            desc: 'توجيه طلب استدعاء رسمي محدد به الأفعال والاتهامات والزمان لتمكينه من إعداد أوجه الدفاع.'
        },
        {
            field: 'heardEmployee',
            title: 'سماع أقوال الموظف وتحريرها كتابياً مع تفنيد وتقديم دفوعه الكلية بمحاضر السماع',
            desc: 'وجوب تدوين إجابات الموظف حرفياً وإتاحة الفرصة له لتقديم المستندات والشهود اللازمين لنفي الاتهام.'
        },
        {
            field: 'signedOnPages',
            title: 'توقيع الموظف المشكو في حقه والباحث المحقق على كافة صفحات محضر الجلسات والتحقيق',
            desc: 'ضمان سلامة الإجراءات إثباتاً لحضور وسماع أطراف اللجان ومنعاً لبطلان أو تعديل التدوينات.'
        },
        {
            field: 'proportionalPenalty',
            title: 'تناسب الجزاء التأديبي المقترح مع فداحة المخالفة الثابتة وتطبيق التدرج العقابي اللائحي',
            desc: 'التحقق من تماشي العقوبة المقررة مع جدول الجزاءات المعتمدة قانونياً لدرء عيوب التعسف أو البطلان.'
        }
    ];

    return (
        <div className="space-y-6 animate-fade-in text-right" style={{ direction: 'rtl' }}>
            <Card className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-6">
                
                {/* Header and Compliance Progress Banner */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100/80 pb-5">
                    <div className="space-y-1 text-right">
                        <div className="flex items-center gap-2 justify-start flex-row-reverse">
                            <h3 className="text-xs font-extrabold text-slate-900">الضمانات الإجرائية الكلية وقانون الامتثال عمالياً</h3>
                            <span className="p-1.5 rounded-lg bg-slate-50 text-slate-700">
                                <ShieldCheck className="w-4 h-4 text-slate-600" />
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-550 font-bold leading-relaxed mt-1">
                            تفعيل البنود الخمسة يضمن تلافي بطلان القرار الإداري أمام دوائر المحاكم العمالية الكويتية.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-50/60 border border-slate-100 px-4 py-2 rounded-xl shrink-0 shadow-3xs">
                        <span className="text-[10px] font-bold text-slate-450">مؤشر الامتثال الإجرائي:</span>
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold ${
                            scorePercentage === 100 
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' 
                                : scorePercentage >= 60 
                                    ? 'bg-slate-100 text-slate-850 border border-slate-200' 
                                    : 'bg-amber-50 text-amber-800 border border-amber-100'
                        }`}>
                            {scorePercentage}% مكتمل
                        </span>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-500 ${
                                scorePercentage === 100 ? 'bg-emerald-500' : scorePercentage >= 60 ? 'bg-slate-900' : 'bg-amber-500'
                            }`}
                            style={{ width: `${scorePercentage}%` }} 
                        />
                    </div>
                </div>

                {/* Interactive checklist rows */}
                <div className="space-y-3 pt-2">
                    {checklistItems.map((item, idx) => {
                        const isChecked = !!checks[item.field];
                        return (
                            <div 
                                id={`compliance-item-${item.field}`}
                                key={item.field}
                                onClick={() => onToggleSafeguard(item.field)}
                                className={`p-5 rounded-xl border transition-all cursor-pointer flex gap-4 items-start select-none shadow-3xs ${
                                    isChecked 
                                        ? 'bg-slate-900 text-white border-transparent hover:bg-slate-800' 
                                        : 'bg-white border-slate-150 hover:bg-slate-50/50 hover:border-slate-250'
                                }`}
                            >
                                <span className={`text-[10px] font-bold font-mono mt-0.5 shrink-0 ${isChecked ? 'text-slate-350' : 'text-slate-400'}`}>
                                    {idx + 1}.
                                </span>
                                
                                <div className={`mt-0.5 rounded-lg p-0.5 shrink-0 transition-all ${
                                    isChecked 
                                        ? 'bg-white text-slate-950' 
                                        : 'bg-slate-100 text-slate-400'
                                }`}>
                                    <Check className="w-3.5 h-3.5" />
                                </div>

                                <div className="space-y-1 text-right flex-grow">
                                    <h4 className={`text-xs font-extrabold leading-snug transition-colors ${
                                        isChecked ? 'text-white' : 'text-slate-900'
                                    }`}>
                                        {item.title}
                                    </h4>
                                    <p className={`text-[11px] leading-relaxed ${isChecked ? 'text-slate-300/90 font-medium' : 'text-slate-500 font-semibold'}`}>
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Info block */}
                <div className="bg-slate-50/60 border border-slate-100 p-4 rounded-xl flex items-start gap-2.5 text-xs shadow-3xs">
                    <Info className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-500 leading-relaxed font-bold">
                        تنويه استشاري: طبقاً للمادة 115 من قانون العمل الكويتي بالقطاع الأهلي (قانون رقم 6 لسنة 2010)، لا يجوز توقيع عقوبة على العامل إلا بعد سماع أقواله وتحقيق دفاعه وإثبات ذلك بمحضر يودع بملفه الخاص، ويشترط البدء الفعلي في التحقيق في غضون 15 يوماً عمل من تاريخ اكتشاف المخالفة والتقصير.
                    </p>
                </div>
            </Card>
        </div>
    );
};
