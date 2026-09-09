import React, { useState, useEffect } from 'react';
import { 
    Sparkles, 
    FileText, 
    Copy, 
    Check, 
    Printer, 
    Download, 
    RefreshCw, 
    Scale, 
    ShieldCheck, 
    UserCheck, 
    ArrowRight, 
    Building, 
    BadgeCheck, 
    Send,
    Edit3
} from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { InheritanceCalculation } from '../../services/inheritanceEngine';
import { useToast } from '../ui/Toast';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    calculation: InheritanceCalculation | null;
}

type DraftType = 'court_lawsuit' | 'amicable_agreement' | 'fatwa_memo' | 'bailiff_notice';

export const LegalInheritanceDraftModal: React.FC<Props> = ({
    isOpen,
    onClose,
    calculation
}) => {
    const { addToast } = useToast();
    const [draftType, setDraftType] = useState<DraftType>('court_lawsuit');
    const [courtLocation, setCourtLocation] = useState<string>('محكمة الأسرة الكلية - قصر العدل (محافظة العاصمة)');
    const [draftText, setDraftText] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isCopied, setIsCopied] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [customToneInstructions, setCustomToneInstructions] = useState<string>('');

    // Generate draft upon opening or changing type
    useEffect(() => {
        if (isOpen && calculation) {
            handleGenerateDraft();
        }
    }, [isOpen, draftType, calculation]);

    if (!calculation) return null;

    const buildDraftLocally = (type: DraftType, calc: InheritanceCalculation): string => {
        const deceasedName = calc.deceasedName || 'المرحوم / المورث';
        const netEstateFormatted = calc.netEstate.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + ' د.ك';
        const totalEstateFormatted = calc.totalEstate.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + ' د.ك';
        const debtsFormatted = (calc.debts + calc.funeralExpenses).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + ' د.ك';
        const madhabLabel = calc.madhab === 'sunni' ? 'قانون الأحوال الشخصية الكويتي رقم 51 لسنة 1984 (المذهب السني)' : 'أحكام المذهب الجعفري (الطبقات)';
        const formattedDate = new Date().toLocaleDateString('ar-KW', { year: 'numeric', month: 'long', day: 'numeric' });
        const caseRef = `ADL-INHR-${Date.now().toString().slice(-6)}`;

        const heirsTableText = calc.shares.map((s, idx) => 
            `  ${idx + 1}. [${s.heirLabel}] - العدد: (${s.count}) | نوع الفرض والصفة: [${s.shareLabel}] | النسبة: ${(s.shareValue * 100).toFixed(2)}% | الصافي المستحق: (${s.amount.toLocaleString(undefined, { minimumFractionDigits: 3 })} د.ك) | السند: [${s.evidence.article}]`
        ).join('\n');

        const excludedText = calc.excludedHeirs && calc.excludedHeirs.length > 0 
            ? calc.excludedHeirs.map(e => `  - [${e.label}] (العدد: ${e.count}): محجوب شرعاً بسبب (${e.reason}) وحجبه [${e.excludedBy}]`).join('\n')
            : '  - لا يوجد ورثة محجوبون في هذه المسألة، وجميع الأقارب المدخلين مستحقون.';

        if (type === 'court_lawsuit') {
            return `
صحيفة دعوى حصر وراثة وقسمة تركة شرعية وفرز وتجنيب
أمام محكمة الأسرة الكلية بدولة الكويت
الدائرة: أحوال شخصية / تركات - ${courtLocation}
الرقم المرجعي: ${caseRef} | التاريخ: ${formattedDate}

بناءً على طلب السادة / الورثة طالبي القسمة والممثلين بموجب توكيل رسمي عام قضايا لدى:
مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية والتحكيم
الكائن مقره في: دولة الكويت - مجمع المحاكم

أنا .................... مندوب الإعلان بإدارة التنفيذ بوزارة العدل قد انتقلت وأعلنت:
السيد / مصفّي التركة وباقي أطراف النزاع والورثة الشركاء في الشيوع المقيمين بدولة الكويت:
...................................................................................................

الموضوع:
طلب الحكم بحصر تركة المرحوم (${deceasedName})، وتصفيتها، وفرز وتجنيب أنصبة الشركاء وفقاً للفريضة الشرعية.

أولاً: الوقائع:
1. بتاريخ .................... انتقل إلى رحمة الله تعالى المورث (${deceasedName})، وانحصر إرثه الشرعي في الورثة المبينين بالجدول أدناه.
2. خلّف المورث تركة مالية وعينية بلغت قيمتها الإجمالية مبلغ (${totalEstateFormatted})، جرى تصفيتها واستقطاع مصاريف التجهيز والديون المرسلة والعينية البالغة (${debtsFormatted}) إعمالاً للترتيب الوارد بنص المادة (289) من قانون الأحوال الشخصية الكويتي رقم (51 لسنة 1984).
3. يبلغ صافي التركة القابل للقسمة والفرز بين الورثة مبلغاً وقدره (${netEstateFormatted}).
4. وحيث إن أعيان التركة شائعة بين الورثة، وقد تعذرت القسمة الرضائية الودية فيما بينهم، الأمر الذي حدا بالطالبين إلى إقامة هذه الدعوى لفرز وتجنيب حصصهم قضاءً.

ثانياً: الأساس والأسانيد الشرعية والقانونية:
- استناداً لنصوص المواد (288 إلى 345) من قانون الأحوال الشخصية الكويتي رقم 51 لسنة 1984.
- استناداً لأصل المسألة الفقهية المحدد بـ (${calc.baseProblem || 'مقرر شرعاً'}) ${calc.isAoul ? 'مع تطبيق أحكام العول لتزاحم الفروض' : calc.isRadd ? 'مع تطبيق الرد على أصحاب الفروض' : 'مسألة عادلة متوازنة'}.
- تفصيل وتأصيل الأنصبة المستحقة لكل وارث:
${heirsTableText}

- بيان المحجوبين والموانع الشرعية:
${excludedText}

بناءً عليه:
يلتمس المدعون من عدالة المحكمة الموقرة الحكم بالآتي:
أولاً: بقبول الدعوى شكلاً.
ثانياً: وفي الموضوع:
1. اعتماد صك الحصر والتوزيع الشرعي للتركة وفقاً للأنصبة المبينة تفصيلاً بصحيفة الدعوى.
2. ندب خبير حسابي وقضائي من إدارة الخبراء بوزارة العدل لحصر أعيان التركة وبيان ما إذا كانت قابلة للقسمة عيناً من عدمه.
3. في حال تعذر القسمة العينية، بيع الأصول غير القابلة للقسمة بالمزاد العلني وإيداع الثمن خزينة المحكمة لتوزيعه على الورثة كل بحسب فرضه وسهمه الشرعي.
4. إلزام المدعى عليهم بالمصروفات ومقابل أتعاب المحاماة الفعلية.

مع حفظ كافة حقوق الطالبين الأخرى بسائر أنواعها.
وكيل المدعين / المحامي صبري شطا
            `.trim();
        } else if (type === 'amicable_agreement') {
            return `
عقد اتفاق وقسمة رضائية وتخارج شرعي لتركة موثق
حرر هذا العقد في دولة الكويت بتاريخ: ${formattedDate}
المرجع المكتبي: ${caseRef}
صادر عن: مكتب المحامي صبري شطا للاستشارات القانونية

تم بحمد الله وتوفيقه الاتفاق والتراضي التام بين كل من:
أولاً: أطراف العقد (الورثة المستحقون في تركة المرحوم / ${deceasedName}):
${calc.shares.map((s, idx) => `الطرف (${idx + 1}): ورثة فئة [${s.heirLabel}] - العدد: (${s.count}) - ممثلين عن أنفسهم.`).join('\n')}

التمهيد:
لما كان المورث (${deceasedName}) قد وافته المنية، وانحصرت تركته الصافية المقررة بموجب حساب التركات الشرعي في مبلغ وقدره (${netEstateFormatted})، خالية من الديون وحقوق الغير بعد تصفية ديون المتوفى البالغة (${debtsFormatted}) طبقاً للمادة (289) من القانون الكويتي.
ولما كان جميع الأطراف كامل الأهلية المعتبرة شرعاً وقانوناً، ورغبوا في قسمة التركة وتوزيعها رضائياً ودياً دون اللجوء للمنازعات القضائية، فقد اتفقوا على البنود الآتية:

البند الأول:
يعتبر التمهيد السابق وجدول الأنصبة الشرعية المرفق بهذا العقد جزءاً لا يتجزأ منه ومفسراً ومتمماً لبنوده.

البند الثاني (توزيع الحصص والمبالغ):
يقر جميع الأطراف بصحة أصل المسألة (${calc.baseProblem || '-'}) وبأنصبة كل طرف المقررة بالدينار الكويتي على النحو التالي:
${heirsTableText}

البند الثالث (التخارج والإبراء):
يقر كل طرف باستلامه لكامل حصته ومستحقاته الشرعية والمالية بموجب شيكات مصرفية مصدقة / تحويلات بنكية معتمدة، ويعد توقيعه على هذا العقد مخالصة تامة ونهائية وإبراءً لذمة التركة وباقي الورثة من أي مطالبة حالية أو مستقبلية.

البند الرابع (التوثيق والاعتماد):
يوكل الأطراف مكتب المحامي صبري شطا لتوثيق هذا العقد لدى إدارة التسجيل العقاري والتوثيق بوزارة العدل بدولة الكويت واعتماده رسمياً.

توقيعات أطراف العقد:
 الطرف الأول: ....................     الطرف الثاني: ....................
 الطرف الثالث: ....................    الطرف الرابع: ....................
اعتماد وتوثيق: مكتب المحامي صبري شطا للاستشارات القانونية
            `.trim();
        } else if (type === 'fatwa_memo') {
            return `
مذكرة فتوى واستشارة شرعية وقضائية معتمدة
في بيان تأصيل الفريضة الشرعية لتركة المرحوم: ${deceasedName}
صادرة عن: قسم المواريث والتركات - مكتب المحامي صبري شطا (دولة الكويت)
الرقم المرجعي: ${caseRef} | التاريخ: ${formattedDate}

الحمد لله وحده والصلاة والسلام على من لا نبي بعده، وبعد؛
بناءً على طلب ذوي الشأن، قمنا بالتدقيق الفقهي والقضائي لمعطيات تركة المرحوم (${deceasedName}) المنتهية وفاته بتاريخ مؤكد، طبقاً لأحكام ${madhabLabel}:

أولاً: التكييف المالي والتصفية التمهيدية:
- إجمالي الأصول المقومة: (${totalEstateFormatted}).
- الديون والتجهيز المستقطع بموجب المادة (289): (${debtsFormatted}).
- صافي التركة المتاح للورثة المستحقين: (${netEstateFormatted}).

ثانياً: تأصيل المسألة الشرعية:
- أصل الفريضة: (${calc.baseProblem || '-'}) ${calc.isAoul ? 'وقد طرأ عليها العول لزيادة السهام عن الأصل' : calc.isRadd ? 'وقد رُد الباقي على أصحاب الفروض عدا الزوجين' : 'وهي فريضة عادلة مستقيمة'}.
- تفصيل الأنصبة الشرعية المستحقة:
${heirsTableText}

ثالثاً: أحكام الحجب والموانع:
${excludedText}

رابعاً: الرأي القانوني النهائي:
إن هذه الفريضة مطابقة لأحكام الشريعة الإسلامية ومواد قانون الأحوال الشخصية الكويتي المستقرة بأحكام محكمة التمييز، ويحق للورثة الشروع الفوري في استخراج حصر الوراثة الرسمي أو القسمة الرضائية بموجبها.

المستشار القانوني والشرعي المعتمد:
المحامي صبري شطا - دولة الكويت
            `.trim();
        } else {
            // bailiff_notice
            return `
إنذار رسمي على يد محضر بإفصاح وقسمة تركة شرعية
وزارة العدل - إدارة التنفيذ (دولة الكويت)
التاريخ: ${formattedDate} | المرجع: ${caseRef}

بناءً على طلب السيد/ .................... (أحد ورثة المرحوم / ${deceasedName})
وموطنه المختار: مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية - مجمع المحاكم.

أنا .................... مندوب الإعلان قد انتقلت وأعلنت:
السيد / .................... (واضع اليد على أعيان التركة / الشريك الممتنع)
المقيم في: .................... مخاطباً مع: ....................

الموضوع والإنذار:
1. حيث إن المنذر إليه يحوز أو يضع يده على أعيان وأموال تركة المرحوم (${deceasedName}) والتي تبلغ قيمتها الصافية بعد خصم الديون (${netEstateFormatted}).
2. وحيث إن الطالب يستحق في التركة حصة شرعية وقدرها بموجب جدول الأنصبة الشرعية، وقد امتنع المنذر إليه عن القسمة أو تمكين الطالب من نصيبه دون مسوغ قانوني.
3. تفصيل الحصة الشرعية للطالب وباقي الورثة:
${heirsTableText}

بناءً عليه:
ينذر الطالب المنذر إليه بوجوب:
أولاً: الإفصاح الكامل وتقديم كشف حساب شامل لكافة أصول وإيرادات التركة وثمارها خلال مهلة أقصاها (سبعة أيام) من تاريخ إعلانه.
ثانياً: الشروع فوراً في إجراءات القسمة الرضائية وسداد حصة الطالب الشرعية المبينة أعلاه.
وإلا فإن الطالب سيضطر آسفاً إلى اتخاذ كافة الإجراءات القضائية ورفع دعوى القسمة والفرز والتجنيب، مع المطالبة بريع الحصة ومصروفات التقاضي والتعويض.

ولأجل العلم،،،
مندوب الإعلان / ....................          وكيل المنذر / المحامي صبري شطا
            `.trim();
        }
    };

    const handleGenerateDraft = async () => {
        setIsLoading(true);
        setIsEditing(false);
        try {
            const prompt = `
أنت رئيس قسم صياغة صحف الدعاوى والمذكرات القضائية والتركات في مكتب «المحامي صبري شطا للمحاماة والاستشارات القانونية بدولة الكويت».
المطلوب صياغة مسودة قانونية احترافية ومحكمة وفق أصول الصياغة القضائية المعتمدة بالمحاكم الكويتية.

نوع المسودة المطلوبة: ${
    draftType === 'court_lawsuit' ? 'صحيفة دعوى حصر وراثة وقسمة تركة وفرز وتجنيب أمام محكمة الأسرة الكلية بدولة الكويت' :
    draftType === 'amicable_agreement' ? 'عقد اتفاق وقسمة رضائية وتخارج شرعي لتركة موثق' :
    draftType === 'fatwa_memo' ? 'مذكرة فتوى واستشارة شرعية وقضائية معتمدة' :
    'إنذار رسمي على يد محضر بإفصاح وقسمة تركة شرعية'
}

المعطيات القضائية والمالية المستخرجة تلقائياً من حاسبة التركات:
- اسم المورث: ${calculation.deceasedName || 'المورث'} (${calculation.deceasedGender === 'M' ? 'متوفى' : 'متوفاة'})
- الرقم المدني للمتوفى: ${calculation.civilId || 'مرفق بالصك'}
- المذهب القضائي: ${calculation.madhab === 'sunni' ? 'قانون الأحوال الشخصية الكويتي رقم 51 لسنة 1984 (المذهب السني)' : 'المذهب الجعفري (الدوائر الاستئنافية الجعفرية)'}
- إجمالي أموال التركة: ${calculation.totalEstate.toLocaleString()} د.ك
- الديون والتجهيز المقضاة: ${(calculation.debts + calculation.funeralExpenses).toLocaleString()} د.ك
- صافي التركة الخالص للورثة: ${calculation.netEstate.toLocaleString()} د.ك
- أصل المسألة: ${calculation.baseProblem || '-'} (${calculation.isAoul ? 'عول' : calculation.isRadd ? 'رد' : 'عادلة'})
- جدول الورثة والأنصبة والحصص بالدينار الكويتي:
${calculation.shares.map((s, i) => `${i + 1}. [${s.heirLabel}] - العدد: ${s.count} | الفرض: ${s.shareLabel} | النسبة: ${(s.shareValue * 100).toFixed(2)}% | الصافي: ${s.amount.toLocaleString()} د.ك | السند القانوني: ${s.evidence.article}`).join('\n')}
${calculation.excludedHeirs && calculation.excludedHeirs.length > 0 ? `\nالمحجوبون:\n${calculation.excludedHeirs.map(e => `- ${e.label} محجوب بسبب ${e.reason} بواسطة ${e.excludedBy}`).join('\n')}` : ''}

${customToneInstructions ? `تعليمات وتوجيهات خاصة من المحامي: ${customToneInstructions}` : ''}

شروط الصياغة:
1. استخدام ديباجة رسمية كويتية فخمة تذكر اسم مكتب المحامي صبري شطا.
2. تضمين تفاصيل الورثة والأنصبة بدقة تامة وبأرقامها المحددة أعلاه.
3. الاستناد الدقيق لمواد قانون الأحوال الشخصية رقم 51 لسنة 1984 (المادة 289 وما بعدها).
4. اختتام المسودة بالطلبات الختامية المحكمة أو بنود التخارج والإبراء.
            `;

            const response = await fetch('/api/gemini/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    systemInstruction: 'أنت مستشار قانوني كويتي متخصص في صياغة صحف التركات والمواريث بالصيغة القضائية المعتمدة بدولة الكويت.'
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.text && data.text.length > 100) {
                    setDraftText(data.text);
                } else {
                    setDraftText(buildDraftLocally(draftType, calculation));
                }
            } else {
                setDraftText(buildDraftLocally(draftType, calculation));
            }
        } catch (err) {
            console.warn("AI generation fallback to local template:", err);
            setDraftText(buildDraftLocally(draftType, calculation));
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(draftText);
        setIsCopied(true);
        addToast({ type: 'success', title: 'تم النسخ', message: 'تم نسخ المسودة القانونية بالكامل إلى الحافظة.' });
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleDownloadTxt = () => {
        const element = document.createElement('a');
        const file = new Blob([draftText], { type: 'text/plain;charset=utf-8' });
        element.href = URL.createObjectURL(file);
        element.download = `مسودة_${draftType}_${calculation.deceasedName || 'تركة'}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        addToast({ type: 'success', title: 'تم التحميل', message: 'تم حفظ المسودة كملف نصي على جهازك.' });
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            window.print();
            return;
        }
        printWindow.document.write(`
            <!DOCTYPE html>
            <html dir="rtl" lang="ar">
            <head>
                <meta charset="utf-8" />
                <title>مسودة قانونية - ${calculation.deceasedName || 'التركة'}</title>
                <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Tajawal:wght@400;500;700;900&display=swap" rel="stylesheet">
                <style>
                    body {
                        font-family: 'Tajawal', 'Amiri', Tahoma, sans-serif;
                        color: #0f172a;
                        background: #ffffff;
                        padding: 30px;
                        margin: 0;
                        direction: rtl;
                        font-size: 13px;
                        line-height: 1.8;
                    }
                    pre {
                        white-space: pre-wrap;
                        font-family: inherit;
                        font-size: 13px;
                        line-height: 1.8;
                    }
                    @media print {
                        body { padding: 0; }
                    }
                </style>
            </head>
            <body>
                <pre>${draftText}</pre>
                <script>
                    window.onload = function() {
                        window.print();
                        window.onafterprint = function() { window.close(); };
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="نموذج صياغة مذكرة إرث وصحيفة دعوى بالذكاء الاصطناعي"
            size="xl"
        >
            <div className="space-y-5">
                {/* Top Info Banner with Pre-filled Metadata Badges */}
                <div className="bg-gradient-to-r from-[#0F2744] via-[#0A1C30] to-[#0F2744] p-4 rounded-2xl border border-[#D4AF37]/40 shadow-sm text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#D4AF37] text-slate-950 flex items-center justify-center font-bold flex-shrink-0 shadow-sm">
                            <Sparkles className="w-5 h-5 text-slate-950" />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-[#D4AF37] block">
                                ربط آلي مباشر بمخرجات الحاسبة
                            </span>
                            <h4 className="text-sm font-black text-white">
                                مسودة قضائية لتركة: {calculation.deceasedName || 'المورث'} (صافي: {calculation.netEstate.toLocaleString()} د.ك)
                            </h4>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-[#D4AF37]/30 text-amber-300">
                            {calculation.shares.length} ورثة مستحقين
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-300">
                            أصل {calculation.baseProblem || '-'}
                        </span>
                    </div>
                </div>

                {/* Draft Type Switcher Tabs */}
                <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
                    <button
                        type="button"
                        onClick={() => setDraftType('court_lawsuit')}
                        className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            draftType === 'court_lawsuit'
                                ? 'bg-[#0F2744] text-white dark:bg-[#D4AF37] dark:text-slate-950 shadow-sm'
                                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <Scale className="w-3.5 h-3.5" />
                        <span>صحيفة دعوى فرز وتجنيب</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setDraftType('amicable_agreement')}
                        className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            draftType === 'amicable_agreement'
                                ? 'bg-[#0F2744] text-white dark:bg-[#D4AF37] dark:text-slate-950 shadow-sm'
                                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <BadgeCheck className="w-3.5 h-3.5" />
                        <span>عقد قسمة رضائية موثق</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setDraftType('fatwa_memo')}
                        className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            draftType === 'fatwa_memo'
                                ? 'bg-[#0F2744] text-white dark:bg-[#D4AF37] dark:text-slate-950 shadow-sm'
                                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <FileText className="w-3.5 h-3.5" />
                        <span>مذكرة فتوى واستشارة</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setDraftType('bailiff_notice')}
                        className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            draftType === 'bailiff_notice'
                                ? 'bg-[#0F2744] text-white dark:bg-[#D4AF37] dark:text-slate-950 shadow-sm'
                                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <Send className="w-3.5 h-3.5" />
                        <span>إنذار رسمي على يد محضر</span>
                    </button>
                </div>

                {/* Additional Guidance / Prompt Input bar */}
                <div className="flex flex-col sm:flex-row items-center gap-2">
                    <div className="relative flex-1 w-full">
                        <input
                            type="text"
                            placeholder="توجيهات إضافية للذكاء الاصطناعي (مثال: التركيز على رعاية القصر عبر هيئة شؤون القصر، أو المطالبة بالبيع بالمزاد العلني)..."
                            value={customToneInstructions}
                            onChange={(e) => setCustomToneInstructions(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleGenerateDraft(); }}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#D4AF37]"
                        />
                    </div>
                    <Button
                        size="sm"
                        onClick={handleGenerateDraft}
                        disabled={isLoading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                    >
                        {isLoading ? (
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <RefreshCw className="w-3.5 h-3.5" />
                        )}
                        <span>إعادة التوليد بـ AI</span>
                    </Button>
                </div>

                {/* Editor / Preview Area */}
                <div className="relative">
                    <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-t-2xl border-t border-x border-slate-200 dark:border-slate-700 text-xs">
                        <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-[#D4AF37]" />
                            مسودة المستند القانوني (قابلة للمراجعة والتعديل المباشر)
                        </span>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setIsEditing(!isEditing)}
                                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                                    isEditing 
                                        ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300' 
                                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                                }`}
                            >
                                <Edit3 className="w-3 h-3" />
                                <span>{isEditing ? 'وضع التحرير نشط' : 'تعديل النص'}</span>
                            </button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="h-96 flex flex-col items-center justify-center bg-white dark:bg-slate-900 border-b border-x border-slate-200 dark:border-slate-700 rounded-b-2xl space-y-3">
                            <div className="w-8 h-8 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                                جارٍ تأصيل المسألة وتوليد المسودة القضائية بالذكاء الاصطناعي...
                            </span>
                        </div>
                    ) : isEditing ? (
                        <textarea
                            value={draftText}
                            onChange={(e) => setDraftText(e.target.value)}
                            rows={16}
                            className="w-full bg-white dark:bg-slate-900 border-b border-x border-slate-200 dark:border-slate-700 rounded-b-2xl p-4 text-xs font-mono leading-relaxed text-slate-900 dark:text-slate-100 focus:outline-none"
                            dir="rtl"
                        />
                    ) : (
                        <div className="max-h-96 overflow-y-auto bg-white dark:bg-slate-900 border-b border-x border-slate-200 dark:border-slate-700 rounded-b-2xl p-4 sm:p-6 text-xs text-slate-800 dark:text-slate-200 font-sans leading-loose whitespace-pre-wrap select-text">
                            {draftText}
                        </div>
                    )}
                </div>

                {/* Modal Footer Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            onClick={handleCopy}
                            className="bg-[#0F2744] hover:bg-[#0A1C30] text-white font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer"
                        >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#D4AF37]" />}
                            <span>{isCopied ? 'تم النسخ!' : 'نسخ المسودة'}</span>
                        </Button>

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleDownloadTxt}
                            className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs h-9 px-3.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
                        >
                            <Download className="w-3.5 h-3.5" />
                            <span>حفظ كملف نصي</span>
                        </Button>

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handlePrint}
                            className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs h-9 px-3.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            <span>طباعة المسودة</span>
                        </Button>
                    </div>

                    <Button
                        size="sm"
                        onClick={onClose}
                        variant="outline"
                        className="border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-xs h-9 px-4 rounded-xl cursor-pointer"
                    >
                        إغلاق
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
