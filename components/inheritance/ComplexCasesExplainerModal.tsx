import React, { useState } from 'react';
import { 
    BookOpen, 
    Scale, 
    Layers, 
    Sparkles, 
    ShieldAlert, 
    HelpCircle, 
    Baby, 
    Copy, 
    Check, 
    X,
    ExternalLink,
    ChevronLeft
} from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useToast } from '../ui/Toast';

export interface ComplexCaseTopic {
    id: string;
    title: string;
    subtitle: string;
    category: 'classical' | 'principles' | 'special_status';
    badge: string;
    articleRef: string;
    historicalContext: string;
    shariaRule: string;
    calculationExample: {
        scenario: string;
        baseProblem: string;
        distribution: Array<{ heir: string; share: string; note: string }>;
        finalResolution: string;
    };
    kuwaitLawQuote: string;
}

export const COMPLEX_CASES_DATA: ComplexCaseTopic[] = [
    {
        id: 'omariyyatan',
        title: 'المسألتان العمريتان (الغراوان)',
        subtitle: 'قضاء أمير المؤمنين عمر بن الخطاب في ميراث أحد الزوجين مع الأبوين',
        category: 'classical',
        badge: 'مسألة فقهية مشهورة',
        articleRef: 'المادة (292) من قانون الأحوال الشخصية الكويتي رقم 51/1984',
        historicalContext: 'عُرضت على عمر بن الخطاب رضي الله عنه مسألة فيها (زوج وأم وأب)، فلو أخذت الأم ثلث كل التركة (2 من 6) لأخذت ضعف الأب (1 من 6 بالتعصيب) وهو خلاف قاعدة (للذكر مثل حظ الأنثيين)، فقضى بأن تأخذ الأم ثلث ما يبقى بعد فرض الزوج، ووافقه جمهور الصحابة ومنهم عثمان وابن مسعود وزيد بن ثابت رضي الله عنهم.',
        shariaRule: 'للأم ثلث الباقي بعد نصيب أحد الزوجين إذا انحصر الورثة في: (زوج وأم وأب) أو (زوجة وأم وأب).',
        calculationExample: {
            scenario: 'ماتت وتركت: زوجاً، وأماً، وأباً.',
            baseProblem: 'أصل المسألة من (6) أسهم',
            distribution: [
                { heir: 'الزوج', share: 'النصف (3 أسهم من 6)', note: 'فرضه لعدم وجود فرع وارث' },
                { heir: 'الأم', share: 'ثلث الباقي (سهم واحد من 6)', note: 'ثلث الباقي (3 ÷ 3 = 1) لئلا تزيد على الأب' },
                { heir: 'الأب', share: 'الباقي تعصيباً (سهمان من 6)', note: 'يأخذ ضعف الأم (للذكر مثل حظ الأنثيين)' }
            ],
            finalResolution: 'تقسم التركة إلى 6 أسهم: 3 للزوج، 1 للأم، 2 للأب.'
        },
        kuwaitLawQuote: 'نصت المادة (292) فقرة (ب): "إذا لم يوجد أحد ممن ذكروا وكان مع الأم أحد الزوجين والأب، كان للأم ثلث ما يبقى بعد فرض أحد الزوجين، وللأب الباقي تعصيباً".'
    },
    {
        id: 'aoul_rules',
        title: 'قواعد العول وتزاحم الفروض (المسألة المنبرية والمباهلة)',
        subtitle: 'زيادة مجموع السهام المفروضة على أصل المسألة ودخول النقص على الجميع بالنسب',
        category: 'principles',
        badge: 'أصول التأصيل الشرعي',
        articleRef: 'المادة (326) فقرة (أ) من قانون الأحوال الشخصية الكويتي',
        historicalContext: 'أول من قضى بالعول في الإسلام هو أمير المؤمنين عمر بن الخطاب رضي الله عنه باستشارة الصحابة الكرام في مسألة (زوج وأختين شقيقتين)، فقال: "إن بدأت بالزوج نقصت الأختان وإن بدأت بالأختين نقصت الزوج"، فأشار عليه العباس بن عبد المطلب وزيد بن ثابت بالعول قياساً على قسمة الغرماء عند ضيق مال المدين المفلس.',
        shariaRule: 'الأصول التي تعول ثلاثة فقط من أصل سبعة أصول: (6 يعول إلى 7، 8، 9، 10) - (12 يعول إلى 13، 15، 17) - (24 يعول إلى 27 وتسمى المسألة المنبرية).',
        calculationExample: {
            scenario: 'المسألة المنبرية: مات وترك زوجة، وابنتين، وأماً، وأباً (سُئل عنها علي رضي الله عنه وهو على المنبر بالكوفة فقال: صار ثمنها تسعاً).',
            baseProblem: 'الأصل (24) عالت إلى (27)',
            distribution: [
                { heir: 'الزوجة', share: 'الثمن = 3 أسهم', note: 'تنقص حصتها من 3/24 إلى 3/27 (أي التسع)' },
                { heir: 'البنتان', share: 'الثلثان = 16 سهماً', note: 'تنقص حصتهما إلى 16/27 (لكل بنت 8 أسهم)' },
                { heir: 'الأم', share: 'السدس = 4 أسهم', note: 'تنقص حصتها إلى 4/27' },
                { heir: 'الأب', share: 'السدس = 4 أسهم', note: 'تنقص حصته إلى 4/27' }
            ],
            finalResolution: 'مجموع السهام 3+16+4+4 = 27 سهماً، وتقسم التركة على 27 بدلاً من 24 ليدخل النقص على الجميع بالعدل.'
        },
        kuwaitLawQuote: 'نصت المادة (326) فقرة (أ): "العول: هو زيادة في مجموع سهام أصحاب الفروض على أصل المسألة، ونقصان في مقادير أنصبائهم بنسبة سهام كل منهم".'
    },
    {
        id: 'radd_rules',
        title: 'قواعد الرد وفائض التركة',
        subtitle: 'رد الفاضل من التركة على أصحاب الفروض النسبية عند عدم وجود عصبة',
        category: 'principles',
        badge: 'تصفية الفائض',
        articleRef: 'المادة (326) فقرة (ب) من قانون الأحوال الشخصية الكويتي',
        historicalContext: 'قضى به جمهور الصحابة (علي وابن مسعود وابن عباس رضي الله عنهم) استناداً إلى قوله تعالى: ﴿وَأُولُو الْأَرْحَامِ بَعْضُهُمْ أَوْلَىٰ بِبَعْضٍ فِي كِتَابِ اللَّهِ﴾، فإذا أخذ أصحاب الفروض أنصبتهم وبقي فائض ولا يوجد عصبة، يُرد الفائض عليهم بنسبة فروضهم.',
        shariaRule: 'يُرد الفائض على جميع أصحاب الفروض بنسبة أنصبتهم ما عدا الزوجين، فلا يُرد عليهما إلا إذا لم يوجد أي صاحب فرض نسبي ولا عصبة على الإطلاق وفقاً للقانون الكويتي.',
        calculationExample: {
            scenario: 'مات وترك: بنتاً، وأماً (ولا عصبة معهما).',
            baseProblem: 'أصل الفريضة (6) يُرد إلى (4)',
            distribution: [
                { heir: 'البنت', share: 'النصف فرضاً (3 أسهم) + الرد (سهم واحد)', note: 'تأخذ 3 أسهم من 4 (75% من التركة)' },
                { heir: 'الأم', share: 'السدس فرضاً (سهم واحد) + الرد (سهم من الفائض)', note: 'تأخذ سهماً واحداً من 4 (25% من التركة)' }
            ],
            finalResolution: 'تقسم التركة من 4 أسهم بدلاً من 6: للبنت 3 أسهم وللأم سهم واحد فرضاً ورداً.'
        },
        kuwaitLawQuote: 'نصت المادة (326) فقرة (ب): "إذا زادت التركة على فروض أصحاب الفروض ولم توجد عصبة، رُد الزائد على أصحاب الفروض بنسبة فروضهم، ما عدا الزوجين ما لم يوجد غيرهما".'
    },
    {
        id: 'wasiyyah_wajibah',
        title: 'أحكام الوصية الواجبة (المادة 328)',
        subtitle: 'استحقاق أبناء الابن أو البنت المتوفى في حياة أبيه لحصته حكماً في حدود الثلث',
        category: 'special_status',
        badge: 'حماية الأحفاد الأيتام',
        articleRef: 'المادة (328) من قانون الأحوال الشخصية الكويتي رقم 51/1984',
        historicalContext: 'استحدثها المشرع الكويتي والمصري لحماية الأحفاد الذين مات والدهم أو والدتهم في حياة الجد/الجدة وحجبهم أعمامهم، استناداً إلى قول طائفة من أئمة التابعين (كابن جرير الطبري وطاووس والحسن البصري) في وجوب الوصية للأقارب غير الوارثين استدلالاً بآية الوصية ﴿كُتِبَ عَلَيْكُمْ إِذَا حَضَرَ أَحَدَكُمُ الْمَوْتُ...﴾.',
        shariaRule: 'يُعطى أولاد الابن أو أولاد البنت المتوفى قبل مورثه حصة والدهم كما لو كان حياً على ألا تتجاوز ثلث التركة، وتقدم الوصية الواجبة على الوصايا الاختيارية وعلى سائر أنصبة الورثة.',
        calculationExample: {
            scenario: 'مات وترك: ابناً حياً، وأولاد ابن متوفى قبله (حفيدين)، والتركة 150,000 د.ك.',
            baseProblem: 'افتراض حياة الابن المتوفى لمعرفة حصته',
            distribution: [
                { heir: 'أولاد الابن المتوفى', share: 'الوصية الواجبة = 50,000 د.ك (الثلث)', note: 'حصتهم لو كان والدهم حياً (نصف التركة = 75,000، ولكن خُفضت إلى حد الثلث 50,000 د.ك)' },
                { heir: 'الابن الحي', share: 'باقي التركة = 100,000 د.ك', note: 'يأخذ باقي التركة تعصيباً بعد حسم الوصية الواجبة' }
            ],
            finalResolution: 'تُستقطع 50,000 د.ك أولاً وتوزع على الحفيدين، ويأخذ الابن الحي المتبقي 100,000 د.ك.'
        },
        kuwaitLawQuote: 'نصت المادة (328): "إذا مات الولد ذكراً كان أو أنثى في حياة أبيه أو أمه، فلأولاده وصية واجبة بمقدار حصة والدهم لو كان حياً على ألا يتجاوز ثلث التركة".'
    },
    {
        id: 'mushtaraka',
        title: 'المسألة المشتركة (الحمارية / اليمية / الحجرية)',
        subtitle: 'تشريك الإخوة الأشقاء مع الإخوة لأم في الثلث عند استغراق الفروض',
        category: 'classical',
        badge: 'مسألة فقهية مشهورة',
        articleRef: 'المادة (301) من قانون الأحوال الشخصية الكويتي',
        historicalContext: 'سُميت بالحمارية أو اليمية لأن الإخوة الأشقاء قالوا لعمر بن الخطاب رضي الله عنه حين أسقطهم لاستغراق الفروض: "هب أن أبانا كان حماراً أو حجراً ملقى في اليم، ألسنا نشترك معهم في أم واحدة؟"، فاستحسن عمر حجتهم وشرّك بينهم وبين الإخوة لأم في الثلث بالسوية.',
        shariaRule: 'تتحقق بوجود: (زوج + أم أو جدة + اثنان فأكثر من الإخوة لأم + أخ شقيق فأكثر). يشترك الإخوة الأشقاء مع الإخوة لأم في فرض الثلث ويقتسمونه بينهم بالعد والإناث كالذكور.',
        calculationExample: {
            scenario: 'ماتت وتركت: زوجاً، وأماً، وأخوين لأم، وأخاً شقيقاً.',
            baseProblem: 'أصل المسألة من (6) أسهم',
            distribution: [
                { heir: 'الزوج', share: 'النصف (3 أسهم)', note: 'فرضه الكامل لعدم وجود فرع وارث' },
                { heir: 'الأم', share: 'السدس (سهم واحد)', note: 'لوجود جمع من الإخوة' },
                { heir: 'الإخوة لأم والأخ الشقيق', share: 'الثلث المشترك (سهمان)', note: 'يشتركون في سهمي الثلث بالتساوي لكل واحد حصة متساوية' }
            ],
            finalResolution: 'المجموع 3 + 1 + 2 = 6 أسهم كاملة مستغرقة دون حرمان للأشقاء.'
        },
        kuwaitLawQuote: 'أخذ قانون الأحوال الشخصية الكويتي برأي جمهور الفقهاء وقضاء عمر في تشريك الأشقاء في الثلث مع الإخوة لأم.'
    },
    {
        id: 'akdariyya',
        title: 'المسألة الأكدرية',
        subtitle: 'استثناء ميراث الجد مع الأخت الشقيقة أو لأب بفرض السدس ثم المقاسمة',
        category: 'classical',
        badge: 'استثناء باب الجد',
        articleRef: 'المادة (299) من قانون الأحوال الشخصية الكويتي',
        historicalContext: 'سُميت بالأكدرية لأنها كدرت على زيد بن ثابت رضي الله عنه أصوله في باب الجد؛ إذ الأصل ألا يفرض للأخت مع الجد وإنما تقاسمه، لكن هنا لو قاسمته لورث أقل من السدس، ففرض لها النصف وللجد السدس ثم جمع السهام وقسمها للذكر مثل حظ الأنثيين.',
        shariaRule: 'تتحقق بوجود: (زوج + أم + جد صحيح + أخت شقيقة أو لأب). لا ترث الأخت بالفرض مع الجد إلا في هذه المسألة، حيث تعول المسألة من 6 إلى 9 ثم تصح من 27.',
        calculationExample: {
            scenario: 'ماتت وتركت: زوجاً، وأماً، وجداً، وأختاً شقيقة.',
            baseProblem: 'أصلها من 6 عالت إلى 9 ثم صحت من 27',
            distribution: [
                { heir: 'الزوج', share: 'النصف (9 أسهم من 27)', note: 'فرضه المستقر' },
                { heir: 'الأم', share: 'الثلث (6 أسهم من 27)', note: 'فرضها لعدم وجود جمع إخوة وفرع وارث' },
                { heir: 'الجد والأخت', share: 'مجموع حصتيهما (12 سهماً من 27)', note: 'يقسم بينهما للذكر مثل حظ الأنثيين (للجد 8 أسهم وللأخت 4 أسهم)' }
            ],
            finalResolution: 'توزع التركة من 27: الزوج 9، الأم 6، الجد 8، الأخت 4.'
        },
        kuwaitLawQuote: 'مقررة في قضاء الأحوال الشخصية الكويتي ومأخوذة من فقه الإمام زيد بن ثابت المعتمد.'
    },
    {
        id: 'impediments',
        title: 'موانع الإرث الشرعية (المادتين 341 و342)',
        subtitle: 'أسباب الحرمان المطلق من الميراث: القتل العمد العدوان واختلاف الدين',
        category: 'special_status',
        badge: 'موانع قانونية',
        articleRef: 'المادتان (341) و(342) من قانون الأحوال الشخصية الكويتي',
        historicalContext: 'قاعدة فقهية نبوية قطعية: «ليس لقاتل من الميراث شيء» وقاعدة: «لا يرث المسلم الكافر ولا الكافر المسلم»؛ منعاً للذرائع وحفظاً لحرمة الدماء والأموال.',
        shariaRule: 'الوارث الممنوع من الإرث بمانع شرعي كالمعدوم، فلا يرث شيئاً ولا يحجب غيره حجب حرمان أو حجب نقصان.',
        calculationExample: {
            scenario: 'مات وترك: ابناً قاتلاً لمورثه عمداً، وأخاً شقيقاً.',
            baseProblem: 'سقوط الابن القاتل بالكلية',
            distribution: [
                { heir: 'الابن القاتل', share: 'محروم (صفر)', note: 'مانع القتل طبقاً للمادة 341' },
                { heir: 'الأخ الشقيق', share: 'كامل التركة تعصيباً (100%)', note: 'يرث كأنه لا يوجد ابن أصلاً' }
            ],
            finalResolution: 'تؤول التركة بالكامل للأخ الشقيق دون اعتبار لوجود الابن القاتل.'
        },
        kuwaitLawQuote: 'نصت المادة 341: "يمنع من الإرث القتل العمد العدوان للمورث..."، ونصت المادة 342: "لا توارث مع اختلاف الدين".'
    }
];

interface Props {
    isOpen: boolean;
    onClose: () => void;
    initialTopicId?: string;
}

export const ComplexCasesExplainerModal: React.FC<Props> = ({
    isOpen,
    onClose,
    initialTopicId
}) => {
    const { addToast } = useToast();
    const [selectedTopicId, setSelectedTopicId] = useState<string>(initialTopicId || 'omariyyatan');
    const [copied, setCopied] = useState(false);

    const activeTopic = COMPLEX_CASES_DATA.find(t => t.id === selectedTopicId) || COMPLEX_CASES_DATA[0];

    const handleCopyTopic = () => {
        const text = `【${activeTopic.title}】\n${activeTopic.subtitle}\n\nالسند القانوني: ${activeTopic.articleRef}\n\nالتأصيل الفقهي والتاريخي:\n${activeTopic.historicalContext}\n\nالقاعدة الشرعية:\n${activeTopic.shariaRule}\n\nمثال وتطبيق عملي (${activeTopic.calculationExample.scenario}):\nأصل المسألة: ${activeTopic.calculationExample.baseProblem}\n` +
        activeTopic.calculationExample.distribution.map(d => `- ${d.heir}: ${d.share} (${d.note})`).join('\n') +
        `\nالنتيجة النهائية: ${activeTopic.calculationExample.finalResolution}\n\nالنص القانوني: ${activeTopic.kuwaitLawQuote}`;
        
        navigator.clipboard.writeText(text);
        setCopied(true);
        addToast({ type: 'success', title: 'تم النسخ', message: 'تم نسخ الشرح الفقهي والقانوني للحافظة بنجاح.' });
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="الموسوعة الفقهية والقانونية للمسائل الكبرى والمعقدة"
            size="xl"
        >
            <div className="flex flex-col md:flex-row gap-6">
                {/* Topics Sidebar Navigation */}
                <div className="w-full md:w-72 flex-shrink-0 space-y-2 border-b md:border-b-0 md:border-l border-slate-200 dark:border-slate-800 pb-4 md:pb-0 md:pl-4 max-h-[550px] overflow-y-auto">
                    <span className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block px-2 mb-2">
                        فهرس المسائل والأصول الفقهية
                    </span>

                    {COMPLEX_CASES_DATA.map(topic => {
                        const isSelected = topic.id === activeTopic.id;
                        return (
                            <button
                                key={topic.id}
                                type="button"
                                onClick={() => setSelectedTopicId(topic.id)}
                                className={`w-full text-start p-3 rounded-2xl transition-all flex flex-col gap-1 border ${
                                    isSelected
                                        ? 'bg-slate-900 dark:bg-slate-800 text-white border-slate-900 dark:border-slate-700 shadow-sm'
                                        : 'bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black truncate">{topic.title}</span>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                        isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                    }`}>
                                        {topic.badge}
                                    </span>
                                </div>
                                <span className={`text-[10px] line-clamp-1 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                                    {topic.subtitle}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Main Content Pane */}
                <div className="flex-1 space-y-5 max-h-[550px] overflow-y-auto pr-1">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 px-2 py-0.5 rounded-lg">
                                    {activeTopic.badge}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">{activeTopic.articleRef}</span>
                            </div>
                            <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                                {activeTopic.title}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                                {activeTopic.subtitle}
                            </p>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopyTopic}
                            className="text-xs font-bold rounded-xl border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex-shrink-0"
                        >
                            {copied ? <Check className="w-3.5 h-3.5 me-1 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 me-1 text-slate-500" />}
                            <span>{copied ? 'تم النسخ' : 'نسخ الشرح'}</span>
                        </Button>
                    </div>

                    {/* Historical and Fiqhi Background */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl space-y-2 text-xs">
                        <h5 className="font-black text-slate-900 dark:text-slate-200 flex items-center gap-1.5 text-xs">
                            <BookOpen className="w-4 h-4 text-amber-500" />
                            التأصيل الفقهي والسياق التاريخي والقضائي:
                        </h5>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                            {activeTopic.historicalContext}
                        </p>
                    </div>

                    {/* Sharia Rule */}
                    <div className="p-4 bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/60 rounded-2xl space-y-1.5 text-xs">
                        <h5 className="font-black text-amber-900 dark:text-amber-300 flex items-center gap-1.5 text-xs">
                            <Scale className="w-4 h-4 text-amber-600" />
                            القاعدة الفقهية وضابط التطبيق:
                        </h5>
                        <p className="text-amber-950 dark:text-amber-200 leading-relaxed font-medium">
                            {activeTopic.shariaRule}
                        </p>
                    </div>

                    {/* Practical Calculation Example */}
                    <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3 shadow-xs">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
                            <span className="font-black text-slate-900 dark:text-white text-xs flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-emerald-600" />
                                تطبيق عملي توضيحي: {activeTopic.calculationExample.scenario}
                            </span>
                            <span className="text-[10px] font-bold font-mono bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-2 py-0.5 rounded">
                                {activeTopic.calculationExample.baseProblem}
                            </span>
                        </div>

                        <div className="space-y-2 text-xs">
                            {activeTopic.calculationExample.distribution.map((item, idx) => (
                                <div key={idx} className="p-2.5 bg-slate-50 dark:bg-slate-700/50 rounded-xl flex items-start justify-between gap-3">
                                    <div>
                                        <span className="font-black text-slate-800 dark:text-slate-200">{item.heir}</span>
                                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">{item.note}</span>
                                    </div>
                                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 text-xs">
                                        {item.share}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300">
                            الخلاصة: {activeTopic.calculationExample.finalResolution}
                        </div>
                    </div>

                    {/* Law Citation */}
                    <div className="p-3 bg-slate-900 text-white dark:bg-slate-900 border border-slate-800 rounded-2xl text-xs space-y-1">
                        <span className="text-[10px] font-bold text-amber-400 block">النص القانوني المعتمد في دولة الكويت:</span>
                        <p className="text-slate-300 italic text-[11px] leading-relaxed">
                            {activeTopic.kuwaitLawQuote}
                        </p>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
