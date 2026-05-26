import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    ArrowRightLeft, FileCheck, AlertTriangle, HelpCircle, 
    Copy, Sparkles, BookOpen, Scaling, CheckCircle2, ShieldAlert
} from 'lucide-react';
import Card from '../ui/Card';
import { useToast } from '../ui/Toast';

interface ComparisonItem {
    id: string;
    section: string;
    standardClause: string;
    draftClause: string;
    status: 'compliant' | 'missing' | 'risky';
    reason: string;
    suggestion: string;
}

export const ContractComparisonEngine: React.FC = () => {
    const { addToast } = useToast();
    const [selectedTemplate, setSelectedTemplate] = useState('temp-hr');

    // Live mock data for comparison elements
    const comparisonResults = useMemo(() => {
        if (selectedTemplate === 'temp-hr') {
            return [
                {
                    id: 'comp-1',
                    section: 'أطراف التعاقد وصحة الصفة',
                    standardClause: 'شركة الأنظمة الرقمية ويمثلها الشريك المدير العام بموجب السجل التجاري كطرف أول، والموظف المرشح بالبطاقة المدنية كطرف ثان.',
                    draftClause: 'شركة الأنظمة والشركات الزميلة منسوبة للمشاريع كطرف أول، والشخص الطبيعي كطرف ثان دون إدراج بطاقته المدنية.',
                    status: 'risky' as const,
                    reason: 'إغفال الرقم المدني للطرف الثاني وهشاشة تحديد الطرف الأول قد تعرض العقد للبطلان لعدم ثبوت الأهلية والصفة بمحاكم دولة الكويت.',
                    suggestion: 'تحديد اسم الشركة بدقة طبقاً لشهادة السجل التجاري الصادر عن وزارة التجارة والصناعة، مع إثبات شهادة الرقم المدني للموظف.'
                },
                {
                    id: 'comp-2',
                    section: 'فترة التجربة (مادة ١٧)',
                    standardClause: 'يخضع الموظف لفترة تجربة لا تزيد عن ١٠٠ يوم عمل فعلي تبدأ من تاريخ مباشرة العمل الفعلي.',
                    draftClause: 'يبقى الطرف الثاني رهن فترة تجربة وتقييم أداء لمدة ١٢٠ يوماً قابلة للتمديد برغبة الطرف الأول.',
                    status: 'risky' as const,
                    reason: 'مخالف صراحةً للمادة ١٧ من قانون العمل الأهلي الكويتي التي تحدد السقف الأقصى بـ ١٠٠ يوم فقط كشرط نظامي عام، والتمديد لـ ١٢٠ باطل وغير نافذ.',
                    suggestion: 'صياغة البند: "يخضع الطرف الثاني لفترة تجربة مدتها تسعون (٩٠) يوماً تبدأ من مباشرة العمل الفعلي."'
                },
                {
                    id: 'comp-3',
                    section: 'ساعات العمل الرسمية (مادة ٦٤)',
                    standardClause: 'الحد الأقصى لساعات العمل اليومية هو ٨ ساعات في اليوم، أو ٤٨ ساعة أسبوعياً مع يوما كامل للراحة والعبادة مدفوع الأجر.',
                    draftClause: 'ساعات العمل المقررة هي ٤٨ ساعة عمل أسبوعياً، مع التزام العامل بأي ساعات عمل إضافية مجانية تطلبها الإدارة في أوقات الطوارئ.',
                    status: 'risky' as const,
                    reason: 'قانون العمل الكويتي يوجب تعويض الساعات الإضافية بنسبة ١٢٥٪ عن الساعات النهارية و١٥٠٪ عن الساعات الليلية وأيام الراحة. النص على إضافي مجاني يعتبر شروطاً باطلة بطلاناً مطلقاً.',
                    suggestion: 'إضافة فقرة: "وفي حال تكليف الموظف بساعات إضافية، يتم احتساب التعويض والبدلات النقدي طبقاً لأحكام المادة ٦٦ من قانون العمل الكويتي رقم ٦/٢٠١٠."'
                },
                {
                    id: 'comp-4',
                    section: 'مكافأة نهاية الخدمة (مادة ٥١)',
                    standardClause: 'يستحق العامل عند انتهاء خدمته مكافأة تحسب على أساس نصف راتب شهر عن كل سنة من السنوات الخمس الأولى، وراتب شهر عن كل سنة تالية.',
                    draftClause: 'يتنازل الطرف الثاني صراحةً عن مستحقاته نهاية الخدمة لقاء برامج التدريب والتجهيز التي توفرها الشركة.',
                    status: 'risky' as const,
                    reason: 'مكافأة نهاية الخدمة هي حق ركائز أساسية متعلق بالانتظام العام طبقاً للقانون الكويتي. أي تنازل أو إبراء يسبق انتهاء علاقة العمل يعتبر باطلاً ولا يعتد به قانوناً.',
                    suggestion: 'شطب جملة التنازل وإحالة مستحقات نهاية الخدمة لأحكام المادة ٥١ و٦٣ من قانون العمل لترسيخ الالتزام.'
                }
            ];
        } else {
            return [
                {
                    id: 'comp-l1',
                    section: 'القيمة الإيجارية ومواعيد السداد',
                    standardClause: 'تلتزم الشركة بسداد القيمة الإيجارية البالغة ٢,٠٠٠ د.ك شهرياً في الأسبوع الأول من كل شهر ميلادي وبموجب إيصالات رسمية.',
                    draftClause: 'تسدد القيمة الإيجارية شهرياً، مع أحقية المؤجر في زيادة الأجرة السنوية بنسبة ٥٪ تلقائياً دون الرجوع للمستأجر.',
                    status: 'risky' as const,
                    reason: 'قانون الإيجارات الكويتي رقم ٣٥ لعام ١٩٧٨ يقيد حق المؤجر في طلب زيادة الأجرة ويحظر الزيادات التلقائية مالم يتم التراضي القانوني المكتوب أو بقرار لجنة الإيجارات.',
                    suggestion: 'تثبيت الأجرة طيلة مدة العقد، وإلغاء الزيادة القسرية التلقائية لتتوافق بنود العقد مع قانون الإيجارات الكويتي.'
                },
                {
                    id: 'comp-l2',
                    section: 'إجراءات الإخلاء وفسخ العقد',
                    standardClause: 'عند رغبة أحد الطرفين بإنهاء العلاقة الإيجارية يتوجب إخطار الطرف الآخر بإنذار رسمي قبل ٣ أشهر كحد أدنى.',
                    draftClause: 'يحق للمالك إخلاء العين المؤجرة فوراً وقطع التيار الكهربائي والمرفقات في حال تأخر السداد لأكثر من أسبوعين دون إنذار.',
                    status: 'risky' as const,
                    reason: 'قطع الخدمات والمرافق قسرياً يعتبر تعدي على الحيازة ويعاقب عليه القانون. الإخلاء لا يتم إلا من خلال دعوى إخلاء أمام محكمة الإيجارات وبموجب حكم قضائي مشمول بالنفاذ.',
                    suggestion: 'تعديل الصياغة لطلب دعاوى الإخلاء القضائية مع منح فترة إمهال مدتها شهر طبقاً لنصوص قانون الإيجارات.'
                }
            ];
        }
    }, [selectedTemplate]);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        addToast({
            type: 'success',
            title: 'تم نسخ البند البديل المقترح',
            message: 'تم حفظ البند المعدل في الحافظة ليرفق في محرر الصياغة.'
        });
    };

    return (
        <div id="contract-comparison-container" className="space-y-6">
            <div className="bg-white dark:bg-dm-card p-6 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800/80">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-50 dark:border-slate-800 pb-5 mb-6">
                    <div>
                        <h3 className="text-md font-black text-slate-800 dark:text-white flex items-center gap-2">
                            <ArrowRightLeft className="w-5 h-5 text-indigo-600" /> محرك مقارنة العقود ومطابقته باللوائح الوطنية
                        </h3>
                        <p className="text-[11px] text-slate-500 font-bold mt-1">
                            قارن المسودة المعروضة بداخل عارض التدقيق مع قالب الشركة الرسمي والمعايير المهنية لتحديد نسبة المخاطر والبنود الشاذة.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[10px] font-black text-slate-400">قالب المقارنة المستهدف:</span>
                        <select
                            value={selectedTemplate}
                            onChange={(e) => setSelectedTemplate(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs font-black h-9 px-3 rounded-xl focus:ring-1 focus:ring-indigo-600"
                        >
                            <option value="temp-hr">عقد العمل الأهلي المعتمد (مادة ٦/٢٠١٠)</option>
                            <option value="temp-lease">عقد الإيجار التجاري النموذجي للكويت</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    {/* General statistics & comparison report */}
                    <div className="md:col-span-3 space-y-4">
                        <div className="bg-indigo-950 text-white p-5 rounded-[2rem] space-y-4 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-505/10 rounded-full -mr-12 -mt-12 blur-xl" />
                            
                            <div>
                                <span className="text-[10px] font-black text-indigo-300 block">مؤشر توافق الاتساق</span>
                                <h4 className="text-3xl font-black mt-1">72%</h4>
                                <p className="text-[10px] text-slate-350 font-bold mt-1">المسودة المقارنة تنتهك بعض الالتزامات الآمرة لقانون العمل.</p>
                            </div>

                            <div className="space-y-2 pt-2 border-t border-slate-800">
                                <div className="flex justify-between text-[10px] font-bold">
                                    <span className="text-slate-400">البنود المخالفة للقانون</span>
                                    <span className="text-rose-400 font-black">٣ بنود مخالفة</span>
                                </div>
                                <div className="flex justify-between text-[10px] font-bold">
                                    <span className="text-slate-400">البنود ذات المخاطر</span>
                                    <span className="text-amber-400 font-black">بند واحد تنبيه</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl text-[10px] font-semibold text-slate-500 space-y-2 leading-relaxed">
                            <h5 className="font-extrabold text-slate-700 dark:text-slate-300">ملاحظة التدقيق الكويتي:</h5>
                            <p>
                                تنص أحكام البطلان في المادة ٦ من قانون العمل أنه يقع باطلاً كل شرط يخالف أحكام هذا القانون أو ينقص من حقوق العامل المقررة، ولو كان سابقاً على العمل به.
                            </p>
                        </div>
                    </div>

                    {/* Compare differences table list view */}
                    <div className="md:col-span-9 space-y-5">
                        <div className="space-y-4 max-h-[600px] overflow-y-auto">
                            {comparisonResults.map((item) => (
                                <div 
                                    key={item.id}
                                    className="border border-slate-100 dark:border-slate-800/80 rounded-[2rem] overflow-hidden bg-slate-50/50 dark:bg-slate-900/10 p-5 space-y-4 relative"
                                >
                                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/60 pb-3">
                                        <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                                            {item.section}
                                        </h4>
                                        <span className="px-2.5 py-1 bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-450 rounded-lg text-[9px] font-black">
                                            مخالفة للامتثال والنظام العام
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                                        {/* Standard Template approved text */}
                                        <div className="p-4 rounded-2xl bg-emerald-58/20 border border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-950/30 space-y-1.5">
                                            <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-450 uppercase flex items-center gap-1">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> البند النموذجي الكويتي المعتمد:
                                            </span>
                                            <p className="text-xs font-bold text-emerald-950 dark:text-emerald-200 leading-relaxed">
                                                {item.standardClause}
                                            </p>
                                        </div>

                                        {/* Draft text with deviation */}
                                        <div className="p-4 rounded-2xl bg-rose-50/20 border border-rose-100 dark:bg-rose-950/10 dark:border-rose-950/30 space-y-1.5">
                                            <span className="text-[9px] font-black text-rose-750 dark:text-rose-450 uppercase flex items-center gap-1">
                                                <ShieldAlert className="w-3.5 h-3.5" /> الفقرة المستخرجة من عقدك الحالي:
                                            </span>
                                            <p className="text-xs font-bold text-rose-950 dark:text-rose-200 leading-relaxed">
                                                {item.draftClause}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Evaluation Analysis Result & Alternatives */}
                                    <div className="bg-white dark:bg-dm-card p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                                        <div className="flex gap-2 items-start text-[11px] font-black text-rose-600">
                                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="underline block">أثر المخالفة القانونية:</p>
                                                <p className="font-bold text-slate-600 dark:text-slate-405 mt-1 leading-relaxed">
                                                    {item.reason}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-indigo-50/40 dark:bg-indigo-950/15 p-3 rounded-xl border border-indigo-100/60 dark:border-indigo-900/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                            <div className="space-y-1 text-right">
                                                <span className="text-[10px] font-black text-indigo-750 dark:text-indigo-400 block">بديل مقترح متوافق مئة بالمائة:</span>
                                                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                                                    {item.suggestion}
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => handleCopy(item.suggestion)}
                                                className="px-3 py-1.5 bg-white dark:bg-dm-card hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px] font-black text-indigo-600 border border-indigo-150 rounded-lg flex items-center gap-1.5 shrink-0 self-end sm:self-auto"
                                            >
                                                <Copy className="w-3.5 h-3.5" />
                                                نسخ البند البديل
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
