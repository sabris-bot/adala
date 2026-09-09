import React, { useState } from 'react';
import { 
    BookOpen, 
    Search, 
    ShieldCheck, 
    Scale, 
    FileText, 
    Sparkles, 
    Copy, 
    Check, 
    ExternalLink,
    ChevronRight,
    HelpCircle
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useToast } from '../ui/Toast';
import { ComplexCasesExplainerModal, COMPLEX_CASES_DATA } from './ComplexCasesExplainerModal';

export const LegalLibraryView: React.FC = () => {
    const { addToast } = useToast();
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'sunni' | 'jafari' | 'complex'>('sunni');
    const [copiedArticleId, setCopiedArticleId] = useState<string | null>(null);

    // Modal state
    const [isExplainerOpen, setIsExplainerOpen] = useState(false);
    const [selectedTopicId, setSelectedTopicId] = useState<string>('omariyyatan');

    const sunniArticles = [
        {
            id: 'art-288',
            num: 'المادة 288',
            title: 'أحكام ومقادير ميراث الزوجين',
            text: 'يرث الزوج النصف عند عدم وجود الفرع الوارث للزوجة، والربع عند وجوده. وترث الزوجة أو الزوجات الربع عند عدم وجود الفرع الوارث، والثمن عند وجوده ويشتركن فيه بالسوية.',
            tags: ['زوج', 'زوجة', 'أصحاب الفروض']
        },
        {
            id: 'art-289',
            num: 'المادة 289',
            title: 'ترتيب الحقوق المتعلقة بالتركة والتصفية',
            text: 'تؤدى من التركة بحسب الترتيب الآتي: أولاً: ما تعلق بعين التركة من حقوق (الرهون والضمانات). ثانياً: نفقات تجهيز الميت وتكفينه بالمعروف. ثالثاً: ديون الميت للعباد ولله تعالى. رابعاً: الوصية في حدود الثلث للوارث وغير الوارث بإجازة الورثة أو دونه.',
            tags: ['ديون', 'تجهيز', 'وصايا', 'تصفية']
        },
        {
            id: 'art-291',
            num: 'المادة 291',
            title: 'ميراث الأب والجد الصحيح (أبو الأب)',
            text: 'يرث الأب السدس فرضاً مع وجود الفرع الوارث المذكر (الابن وابن الابن)، ويرث السدس فرضاً والباقي تعصيباً مع الفرع الوارث المؤنث (البنت وبنت الابن)، ويرث بالتعصيب المحض عند انعدام الفرع الوارث مطلقاً. والجد كالأب إلا أنه يحجب بالأب.',
            tags: ['أب', 'جد', 'عصبة', 'فرض']
        },
        {
            id: 'art-292',
            num: 'المادة 292',
            title: 'ميراث الأم والجدات والمسألتين العمريتين',
            text: 'ترث الأم الثلث عند انعدام الفرع الوارث والجمع من الإخوة، والسدس عند وجود الفرع الوارث أو اثنين فأكثر من الإخوة والأخوات. وفي المسألتين العمريتين ترث ثلث الباقي بعد نصيب أحد الزوجين مع الأب.',
            tags: ['أم', 'جدة', 'المسألة العمرية', 'ثلث الباقي'],
            hasComplexLink: 'omariyyatan'
        },
        {
            id: 'art-294',
            num: 'المادة 294',
            title: 'ميراث البنات الصلبيات وبنات الابن',
            text: 'ترث البنت الواحدة النصف، والاثنتان فأكثر الثلثين بالسوية، ومع الابن للذكر مثل حظ الأنثيين عصبة بالغير. وترث بنت الابن السدس تكملة للثلثين مع البنت الواحدة إذا لم يوجد معصب في درجتها.',
            tags: ['بنات', 'بنات الابن', 'عصبة بالغير']
        },
        {
            id: 'art-296',
            num: 'المادة 296',
            title: 'ميراث الأخوات الشقيقات والأخوات لأب',
            text: 'للواحدة النصف، وللاثنتين فأكثر الثلثان، ومع الأخ الشقيق عصبة بالغير للذكر مثل حظ الأنثيين. وتصير الشقيقة عصبة مع الغير مع البنات أو بنات الابن (اجعلوا الأخوات مع البنات عصبة).',
            tags: ['أخوات', 'عصبة مع الغير']
        },
        {
            id: 'art-301',
            num: 'المادة 301',
            title: 'المسألة المشتركة (تشريك الأشقاء مع الإخوة لأم)',
            text: 'إذا استغرقت الفروض التركة وكان من بين الورثة زوج وأم أو جدة وإخوة لأم وإخوة أشقاء، شُرّك الإخوة الأشقاء مع الإخوة لأم في الثلث بالسوية بين الذكر والأنثى.',
            tags: ['المشتركة', 'الحمارية', 'أشقاء'],
            hasComplexLink: 'mushtaraka'
        },
        {
            id: 'art-326',
            num: 'المادة 326',
            title: 'أحكام وقواعد العول والرد',
            text: 'العول: هو زيادة في مجموع السهام على أصل المسألة ونقصان في مقادير الأنصبة بنسبة سهامهم. الرد: إذا فضلت من التركة فضلة بعد أصحاب الفروض ولم توجد عصبة، رُدت على أصحاب الفروض بقدر سهامهم عدا الزوجين إلا إذا انعدم غيرهما.',
            tags: ['العول', 'الرد', 'المسألة المنبرية'],
            hasComplexLink: 'aoul_rules'
        },
        {
            id: 'art-328',
            num: 'المادة 328',
            title: 'أحكام الوصية الواجبة للأحفاد',
            text: 'إذا توفي الولد (ذكراً كان أو أنثى) في حياة أبيه أو أمه، فلأولاده وصية واجبة في تركته بمقدار حصة والدهم لو كان حياً في حدود الثلث، وتُقدم على الوصايا الاختيارية وعلى سائر الأنصبة.',
            tags: ['الوصية الواجبة', 'أحفاد', 'ثلث التركة'],
            hasComplexLink: 'wasiyyah_wajibah'
        },
        {
            id: 'art-341',
            num: 'المادة 341 - 342',
            title: 'موانع الإرث الشرعية (القتل واختلاف الدين)',
            text: 'يمنع من الإرث: القتل العمد العدوان للمورث سواء كان فاعلاً أصلياً أو شريكاً أو متسبباً، واختلاف الدين بين المورث والوارث فلا يرث غير المسلم من المسلم ولا المسلم من غير المسلم.',
            tags: ['موانع الإرث', 'القتل المانع', 'اختلاف الدين'],
            hasComplexLink: 'impediments'
        }
    ];

    const jafariRules = [
        {
            id: 'jaf-1',
            title: 'نظام الطبقات الثلاث الحاصرة للقرابة',
            text: 'الطبقة الأولى: الأبوان والأولاد وبنوهم وإن نزلوا. الطبقة الثانية: الأجداد والجدات والإخوة والأخوات وأولادهم. الطبقة الثالثة: الأعمام والعمات والأخوال والخالات وبنوهم. لا يرث أحد من الطبقة اللاحقة مع وجود أحد من الطبقة السابقة.',
            badge: 'أساس المذهب الجعفري'
        },
        {
            id: 'jaf-2',
            title: 'إبطال العول وحصر النقص على جهة معينة',
            text: 'لا يدخل العول في المذهب الجعفري إطلاقاً؛ فإذا زادت السهام المفروضة عن أصل التركة وقع النقص حصراً على البنات والأخوات الأبويات، ولا ينقص نصيب الزوجين ولا الأبوين ولا الإخوة لأم.',
            badge: 'قاعدة عدم العول'
        },
        {
            id: 'jaf-3',
            title: 'الرد على ذوي الفروض بالنسب دون العصبات البعيدة',
            text: 'إذا زادت التركة عن السهام المفروضة، يُرد الفائض على ذوي الفروض بالنسب عدا الزوجة، ولا يُعطى الباقي لعصبة الميت البعيدة (كالأعمام وبني العم) مع وجود أحد من الطبقة الأولى كالبنت.',
            badge: 'قاعدة الرد القرابي'
        },
        {
            id: 'jaf-4',
            title: 'حرمان الزوجة من عين العقار والأراضي',
            text: 'ترث الزوجة من منقولات التركة وقيمة الأبنية والأشجار في العقار دون عين الأرض والرقبة العقارية طبقاً للمشهور في الفقه الجعفري.',
            badge: 'ميراث الزوجة من العقار'
        }
    ];

    const handleCopyArticle = (id: string, title: string, num: string, text: string) => {
        const fullText = `【${num}: ${title}】\n${text}\n(قانون الأحوال الشخصية الكويتي - منظومة عدالة)`;
        navigator.clipboard.writeText(fullText);
        setCopiedArticleId(id);
        addToast({ type: 'success', title: 'تم النسخ', message: `تم نسخ نص ${num} للحافظة بنجاح.` });
        setTimeout(() => setCopiedArticleId(null), 2000);
    };

    const filteredSunni = sunniArticles.filter(a => 
        a.num.includes(search) || a.title.includes(search) || a.text.includes(search) || a.tags.some(t => t.includes(search))
    );

    const filteredJafari = jafariRules.filter(r =>
        r.title.includes(search) || r.text.includes(search) || r.badge.includes(search)
    );

    const openTopicModal = (topicId: string) => {
        setSelectedTopicId(topicId);
        setIsExplainerOpen(true);
    };

    return (
        <Card className="p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 rounded-3xl space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-slate-900 dark:bg-slate-800 text-amber-400 flex items-center justify-center font-bold shadow-xs">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                            المكتبة والمدونة الفقهية والقانونية التفاعلية للمواريث
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            المواد التشريعية من قانون الأحوال الشخصية الكويتي (51/1984) وأحكام الدائرة الجعفرية وشروح المسائل المعقدة
                        </p>
                    </div>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="ابحث في المواد، المسائل، الكلمات المفتاحية..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full h-10 pr-10 pl-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                </div>
            </div>

            {/* Quick Access Complex Cases Banner */}
            <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950 text-white rounded-3xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider">
                            أزرار الوصول السريع لشرح المسائل المعقدة والتأصيل الفقهي:
                        </h4>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold hidden sm:inline">نقر واحد لفتح الشرح والتطبيق العملي</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {COMPLEX_CASES_DATA.slice(0, 4).map(topic => (
                        <button
                            key={topic.id}
                            type="button"
                            onClick={() => openTopicModal(topic.id)}
                            className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-400 rounded-2xl transition-all text-start group flex flex-col justify-between"
                        >
                            <span className="text-xs font-black text-white group-hover:text-amber-300 transition-colors">
                                {topic.title}
                            </span>
                            <span className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                                <span>{topic.badge}</span>
                                <ChevronRight className="w-3 h-3 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Category Switcher Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <button
                    type="button"
                    onClick={() => setActiveTab('sunni')}
                    className={`px-4 py-2 rounded-2xl font-black text-xs transition-all flex items-center gap-2 ${
                        activeTab === 'sunni'
                            ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                >
                    <Scale className="w-4 h-4 text-amber-400" />
                    <span>قانون الأحوال الشخصية الكويتي (سني)</span>
                    <span className="text-[10px] bg-slate-700 text-amber-300 px-1.5 py-0.5 rounded-md font-mono">{filteredSunni.length}</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('jafari')}
                    className={`px-4 py-2 rounded-2xl font-black text-xs transition-all flex items-center gap-2 ${
                        activeTab === 'jafari'
                            ? 'bg-emerald-800 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                >
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>أحكام وقواعد الدائرة الجعفرية</span>
                    <span className="text-[10px] bg-emerald-900 text-emerald-200 px-1.5 py-0.5 rounded-md font-mono">{filteredJafari.length}</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('complex')}
                    className={`px-4 py-2 rounded-2xl font-black text-xs transition-all flex items-center gap-2 ${
                        activeTab === 'complex'
                            ? 'bg-amber-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                >
                    <BookOpen className="w-4 h-4 text-amber-200" />
                    <span>دليل المسائل الكبرى ({COMPLEX_CASES_DATA.length})</span>
                </button>
            </div>

            {/* Tab 1: Sunni Articles */}
            {activeTab === 'sunni' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredSunni.map(art => {
                        const isCopied = copiedArticleId === art.id;
                        return (
                            <div
                                key={art.id}
                                className="p-4 bg-slate-50/80 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-3xl transition-all shadow-xs hover:shadow-md flex flex-col justify-between space-y-3"
                            >
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-black text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                                            {art.num}
                                        </span>
                                        <span className="font-bold text-amber-700 dark:text-amber-400 text-[11px] truncate max-w-[150px]">
                                            {art.title}
                                        </span>
                                    </div>

                                    <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed font-sans pt-1">
                                        {art.text}
                                    </p>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-1 pt-1">
                                        {art.tags.map((t, i) => (
                                            <span key={i} className="text-[9px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                                    {art.hasComplexLink ? (
                                        <button
                                            type="button"
                                            onClick={() => openTopicModal(art.hasComplexLink!)}
                                            className="text-[11px] font-black text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                                        >
                                            <Sparkles className="w-3 h-3" />
                                            <span>شرح تفصيلي للمسألة</span>
                                        </button>
                                    ) : (
                                        <span className="text-[10px] text-slate-400">قانون 51/1984</span>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => handleCopyArticle(art.id, art.title, art.num, art.text)}
                                        className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex items-center gap-1 text-[11px] font-bold"
                                    >
                                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                        <span>{isCopied ? 'تم النسخ' : 'نسخ المادة'}</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Tab 2: Jafari Rules */}
            {activeTab === 'jafari' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredJafari.map(rule => (
                        <div
                            key={rule.id}
                            className="p-5 bg-emerald-50/30 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-3xl space-y-3"
                        >
                            <div className="flex items-center justify-between">
                                <h5 className="font-black text-sm text-emerald-900 dark:text-emerald-300">
                                    {rule.title}
                                </h5>
                                <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-lg border border-emerald-300 dark:border-emerald-700">
                                    {rule.badge}
                                </span>
                            </div>

                            <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed font-sans">
                                {rule.text}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Tab 3: Complex Cases Catalog */}
            {activeTab === 'complex' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {COMPLEX_CASES_DATA.map(topic => (
                        <div
                            key={topic.id}
                            onClick={() => openTopicModal(topic.id)}
                            className="p-5 bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:border-amber-400 rounded-3xl transition-all shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between space-y-3 group"
                        >
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-lg">
                                        {topic.badge}
                                    </span>
                                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors" />
                                </div>

                                <h4 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                    {topic.title}
                                </h4>

                                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                                    {topic.subtitle}
                                </p>
                            </div>

                            <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center justify-between">
                                <span>عرض التأصيل والتطبيق العملي</span>
                                <ExternalLink className="w-3 h-3" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Complex Cases Explainer Modal */}
            <ComplexCasesExplainerModal
                isOpen={isExplainerOpen}
                onClose={() => setIsExplainerOpen(false)}
                initialTopicId={selectedTopicId}
            />
        </Card>
    );
};
