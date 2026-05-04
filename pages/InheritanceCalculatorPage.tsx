
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import { 
    CalculatorIcon, 
    ScaleIcon, 
    InformationCircleIcon, 
    PrinterIcon, 
    UsersIcon, 
    PlusCircleIcon, 
    TrashIcon,
    SparklesIcon,
    CloudArrowUpIcon,
    BriefcaseIcon,
    ArrowDownTrayIcon
} from '../constants';

// --- TYPES ---
enum InheritanceJurisdiction {
    SUNNI = 'سني (حسب القانون الكويتي)',
    JAAFARI = 'جعفري (شيعي)',
    NON_MUSLIM = 'لغير المسلمين'
}

interface Heir {
    id: string;
    type: string;
    gender: 'M' | 'F';
    quantity: number;
    relation: string;
}

const HEIR_TYPES = [
    { value: 'son', label: 'ابن', gender: 'M' },
    { value: 'daughter', label: 'بنت', gender: 'F' },
    { value: 'husband', label: 'زوج', gender: 'M' },
    { value: 'wife', label: 'زوجة', gender: 'F' },
    { value: 'father', label: 'أب', gender: 'M' },
    { value: 'mother', label: 'أم', gender: 'F' },
    { value: 'paternal_grandfather', label: 'جد (لأب)', gender: 'M' },
    { value: 'paternal_grandmother', label: 'جدة (لأب)', gender: 'F' },
    { value: 'maternal_grandmother', label: 'جدة (لأم)', gender: 'F' },
    { value: 'full_brother', label: 'أخ شقيق', gender: 'M' },
    { value: 'full_sister', label: 'أخت شقيقة', gender: 'F' },
    { value: 'paternal_brother', label: 'أخ لأب', gender: 'M' },
    { value: 'paternal_sister', label: 'أخت لأب', gender: 'F' },
    { value: 'maternal_sibling', label: 'أخ/أخت لأم', gender: 'N' },
];

const InheritanceCalculatorPage: React.FC = () => {
    const [jurisdiction, setJurisdiction] = useState<InheritanceJurisdiction>(InheritanceJurisdiction.SUNNI);
    const [totalEstate, setTotalEstate] = useState<number>(0);
    const [debts, setDebts] = useState<number>(0);
    const [willAmount, setWillAmount] = useState<number>(0);
    const [heirs, setHeirs] = useState<Heir[]>([]);
    const [activeTab, setActiveTab] = useState<'calculator' | 'examples' | 'docs' | 'info'>('calculator');
    const [calculationResult, setCalculationResult] = useState<any>(null);

    const netEstate = Math.max(0, totalEstate - debts - willAmount);

    const addHeir = (typeValue: string) => {
        const typeInfo = HEIR_TYPES.find(t => t.value === typeValue);
        if (!typeInfo) return;

        // Prevent multiple husbands
        if (typeValue === 'husband' && heirs.some(h => h.type === 'husband')) {
            alert("لا يمكن إضافة أكثر من زوج واحد");
            return;
        }

        const existing = heirs.find(h => h.type === typeValue);
        if (existing) {
            setHeirs(heirs.map(h => h.id === existing.id ? { ...h, quantity: h.quantity + 1 } : h));
        } else {
            setHeirs([...heirs, {
                id: Math.random().toString(36).substr(2, 9),
                type: typeValue,
                gender: typeInfo.gender as any,
                quantity: 1,
                relation: typeInfo.label
            }]);
        }
    };

    const removeHeir = (id: string) => {
        setHeirs(heirs.filter(h => h.id !== id));
    };

    const updateHeirQuantity = (id: string, q: number) => {
        setHeirs(heirs.map(h => h.id === id ? { ...h, quantity: Math.max(1, q) } : h));
    };

    const calculateInheritance = () => {
        // This is a SIMPLIFIED logic for presentation. Real inheritance logic is extremely complex.
        // We will mock the result but provide realistic-locking shares for common cases.
        
        let shares: any[] = [];
        let remaining = netEstate;

        const husband = heirs.find(h => h.type === 'husband');
        const wife = heirs.find(h => h.type === 'wife');
        const sons = heirs.find(h => h.type === 'son');
        const daughters = heirs.find(h => h.type === 'daughter');
        const father = heirs.find(h => h.type === 'father');
        const mother = heirs.find(h => h.type === 'mother');

        const hasChildren = (sons?.quantity || 0) + (daughters?.quantity || 0) > 0;

        if (jurisdiction === InheritanceJurisdiction.SUNNI) {
            // Sunni Simplified Logic
            if (husband) {
                const portion = hasChildren ? 0.25 : 0.5;
                const value = netEstate * portion;
                shares.push({ 
                    name: 'الزوج', 
                    portion: portion === 0.5 ? '1/2' : '1/4', 
                    value,
                    evidence: portion === 0.5 
                        ? 'مستحق للنصف لعدم وجود فرع وارث (سورة النساء: 12)' 
                        : 'مستحق للربع لوجود فرع وارث (سورة النساء: 12)'
                });
                remaining -= value;
            }
            if (wife) {
                const portion = hasChildren ? 0.125 : 0.25;
                const value = netEstate * portion;
                shares.push({ 
                    name: `الزوجة (${wife.quantity})`, 
                    portion: portion === 0.25 ? '1/4' : '1/8', 
                    value,
                    evidence: portion === 0.25 
                        ? 'مستحقة للربع لعدم وجود فرع وارث (سورة النساء: 12)' 
                        : 'مستحقة للثمن لوجود فرع وارث (سورة النساء: 12)'
                });
                remaining -= value;
            }
            if (mother) {
                const portion = hasChildren ? 1/6 : 1/3;
                const value = netEstate * portion;
                shares.push({ 
                    name: 'الأم', 
                    portion: portion === 1/3 ? '1/3' : '1/6', 
                    value,
                    evidence: portion === 1/3 
                        ? 'مستحقة للثلث لعدم وجود فرع وارث أو عدد من الإخوة (سورة النساء: 11)' 
                        : 'مستحقة للسدس لوجود فرع وارث (سورة النساء: 11)'
                });
                remaining -= value;
            }
            if (father) {
                const portion = 1/6;
                const value = netEstate * portion;
                shares.push({ 
                    name: 'الأب', 
                    portion: '1/6', 
                    value,
                    evidence: 'مستحق للسدس فرضاً لوجود فرع وارث ذكر (سورة النساء: 11)'
                });
                remaining -= value;
            }

            // Residue (Asaba) to children
            if (hasChildren) {
                const totalUnits = (sons?.quantity || 0) * 2 + (daughters?.quantity || 0);
                const unitValue = remaining / totalUnits;
                if (sons) shares.push({ 
                    name: `الأبناء (${sons.quantity})`, 
                    portion: 'تعصيب محض', 
                    value: unitValue * 2 * sons.quantity,
                    evidence: 'للذكر مثل حظ الأنثيين (سورة النساء: 11، المادة 292 قانون الأحوال الشخصية)'
                });
                if (daughters) shares.push({ 
                    name: `البنات (${daughters.quantity})`, 
                    portion: 'تعصيب بالغير', 
                    value: unitValue * daughters.quantity,
                    evidence: 'يرثن بالتعصيب مع الإخوة الذكور (سورة النساء: 11)'
                });
            }
        } else if (jurisdiction === InheritanceJurisdiction.JAAFARI) {
            // Ja'afari Simplified Logic (Priority classes)
            // Class 1: Parents and Children
            if (hasChildren || father || mother) {
                if (husband) {
                    const portion = hasChildren ? 0.25 : 0.5;
                    const value = netEstate * portion;
                    shares.push({ 
                        name: 'الزوج', 
                        portion: portion === 0.5 ? '1/2' : '1/4', 
                        value,
                        evidence: 'نصيب الزوج بالفرض حسب فقه الإمامية والقرآن الكريم'
                    });
                    remaining -= value;
                }
                if (wife) {
                    const portion = hasChildren ? 0.125 : 0.25;
                    const value = netEstate * portion;
                    shares.push({ 
                        name: `الزوجة (${wife.quantity})`, 
                        portion: portion === 0.25 ? '1/4' : '1/8', 
                        value,
                        evidence: 'نصيب الزوجة بالفرض (مع مراعاة عدم إرثها من رقبة الأرض في بعض الآراء)'
                    });
                    remaining -= value;
                }
                
                // Class 1 residue distribution
                const class1Remaining = remaining;
                if (hasChildren) {
                  const totalUnits = (sons?.quantity || 0) * 2 + (daughters?.quantity || 0);
                  const unitValue = class1Remaining / (totalUnits || 1);
                   if (sons) shares.push({ 
                       name: `الأبناء (${sons.quantity})`, 
                       portion: 'بقية الطبقة الأولى', 
                       value: unitValue * 2 * sons.quantity,
                       evidence: 'توزيع التركة على الطبقة الأولى بنظام القرابة'
                   });
                   if (daughters) shares.push({ 
                       name: `البنات (${daughters.quantity})`, 
                       portion: 'بقية الطبقة الأولى', 
                       value: unitValue * daughters.quantity,
                       evidence: 'مشاركة البنات في الطبقة الأولى بالفرض أو الرد'
                   });
                } else {
                   if (father) shares.push({ name: 'الأب', portion: 'الفرض والرد', value: class1Remaining / ((father ? 1:0) + (mother ? 1:0)), evidence: 'استحقاق الطبقة الأولى عند انفرادها' });
                   if (mother) shares.push({ name: 'الأم', portion: 'الفرض والرد', value: class1Remaining / ((father ? 1:0) + (mother ? 1:0)), evidence: 'استحقاق الطبقة الأولى عند انفرادها' });
                }
            }
        } else {
            // Non-Muslim common rule (equality or specific law)
            const totalCount = heirs.reduce((acc, h) => acc + h.quantity, 0);
            const valuePerPerson = netEstate / (totalCount || 1);
            heirs.forEach(h => {
                shares.push({ 
                    name: h.relation, 
                    portion: `1/${totalCount}`, 
                    value: valuePerPerson * h.quantity,
                    evidence: 'مبدأ المساواة في المواريث (حسب القواعد المدنية لغير المسلمين)'
                });
            });
        }

        setCalculationResult({
            netEstate,
            shares,
            jurisdiction,
            timestamp: new Date().toLocaleString('ar-KW')
        });
    };

    const virtualExamples = [
        {
            title: 'وفاة زوج وترك زوجة وبنتين وأب',
            details: 'التركة: 100,000 د.ك - المذهب: سني',
            setup: () => {
                setTotalEstate(100000);
                setJurisdiction(InheritanceJurisdiction.SUNNI);
                setHeirs([
                    { id: '1', type: 'wife', gender: 'F', quantity: 1, relation: 'زوجة' },
                    { id: '2', type: 'daughter', gender: 'F', quantity: 2, relation: 'بنت' },
                    { id: '3', type: 'father', gender: 'M', quantity: 1, relation: 'أب' }
                ]);
            }
        },
        {
            title: 'وفاة زوجة وتركت زوج وأخ وأخت شقيفة',
            details: 'التركة: 60,000 د.ك - المذهب: جعفري',
            setup: () => {
                setTotalEstate(60000);
                setJurisdiction(InheritanceJurisdiction.JAAFARI);
                setHeirs([
                    { id: '4', type: 'husband', gender: 'M', quantity: 1, relation: 'زوج' },
                    { id: '5', type: 'full_brother', gender: 'M', quantity: 1, relation: 'أخ شقيق' },
                    { id: '6', type: 'full_sister', gender: 'F', quantity: 1, relation: 'أخت شقيقة' }
                ]);
            }
        }
    ];

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-sans text-right" dir="rtl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">حاسبة المواريث الشرعية</h1>
                    <p className="text-gray-500">حساب أنصبة الورثة وتوزيع التركة حسب القانون الكويتي (سني وجعفري)</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" leftIcon={<PrinterIcon className="w-5 h-5" />} onClick={() => window.print()}>طباعة التقرير</Button>
                    <Button leftIcon={<PlusCircleIcon className="w-5 h-5" />} onClick={() => {
                        setCalculationResult(null);
                        setHeirs([]);
                        setTotalEstate(0);
                    }}>حساب جديد</Button>
                </div>
            </div>

            <div className="flex border-b border-gray-200 mb-8 overflow-x-auto whitespace-nowrap">
                <button 
                    onClick={() => setActiveTab('calculator')}
                    className={`px-6 py-4 text-sm font-medium transition-all relative ${activeTab === 'calculator' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    الحاسبة الذكية
                    {activeTab === 'calculator' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                </button>
                <button 
                    onClick={() => setActiveTab('examples')}
                    className={`px-6 py-4 text-sm font-medium transition-all relative ${activeTab === 'examples' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    أمثلة افتراضية
                    {activeTab === 'examples' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                </button>
                <button 
                    onClick={() => setActiveTab('docs')}
                    className={`px-6 py-4 text-sm font-medium transition-all relative ${activeTab === 'docs' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    مستندات القضايا
                    {activeTab === 'docs' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                </button>
                <button 
                    onClick={() => setActiveTab('info')}
                    className={`px-6 py-4 text-sm font-medium transition-all relative ${activeTab === 'info' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    شرح الأنصبة الشرعية
                    {activeTab === 'info' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <AnimatePresence mode="wait">
                        {activeTab === 'calculator' && (
                            <motion.div 
                                key="calc"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                <Card>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <label className="text-sm font-bold text-gray-700 mb-2 block">المذهب / النطاق القانوني</label>
                                            <div className="flex gap-4">
                                                {Object.values(InheritanceJurisdiction).map(j => (
                                                    <button
                                                        key={j}
                                                        onClick={() => setJurisdiction(j)}
                                                        className={`flex-1 p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${jurisdiction === j ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'}`}
                                                    >
                                                        <input type="radio" checked={jurisdiction === j} readOnly className="sr-only" />
                                                        <ScaleIcon className="w-6 h-6" />
                                                        <span className="text-xs font-bold leading-tight">{j}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <Input 
                                            label="إجمالي قيمة التركة (Legacy)" 
                                            type="number" 
                                            value={totalEstate} 
                                            onChange={(e) => setTotalEstate(Number(e.target.value))} 
                                            placeholder="أدخل مبلغا د.ك"
                                            helperText="المبلغ الإجمالي قبل خصم أي التزامات"
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input 
                                                label="الديون / الالتزامات" 
                                                type="number" 
                                                value={debts} 
                                                onChange={(e) => setDebts(Number(e.target.value))} 
                                                placeholder="د.ك"
                                            />
                                            <Input 
                                                label="الوصية (بحد أقصى الثلث)" 
                                                type="number" 
                                                value={willAmount} 
                                                onChange={(e) => setWillAmount(Number(e.target.value))} 
                                                placeholder="د.ك"
                                            />
                                        </div>
                                    </div>
                                </Card>

                                <Card title="قائمة الورثة">
                                    <div className="mb-6">
                                        <label className="text-sm font-bold text-gray-700 mb-3 block">إضافة وريث جديد</label>
                                        <div className="flex flex-wrap gap-2">
                                            {HEIR_TYPES.map(type => (
                                                <button
                                                    key={type.value}
                                                    onClick={() => addHeir(type.value)}
                                                    className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs hover:border-primary hover:text-primary transition-all flex items-center gap-1"
                                                >
                                                    <PlusCircleIcon className="w-4 h-4" />
                                                    {type.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {heirs.length === 0 ? (
                                            <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                                <UsersIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                <p className="text-sm text-gray-400">لم يتم إضافة أي ورثة بعد</p>
                                            </div>
                                        ) : (
                                            heirs.map(heir => (
                                                <div key={heir.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`p-2 rounded-xl ${heir.gender === 'M' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                                                            <UsersIcon className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900">{heir.relation}</div>
                                                            <div className="text-xs text-gray-500">{heir.gender === 'M' ? 'ذكر' : 'أنثى'}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-500">العدد:</span>
                                                            <input 
                                                                type="number" 
                                                                value={heir.quantity} 
                                                                onChange={(e) => updateHeirQuantity(heir.id, Number(e.target.value))}
                                                                className="w-16 p-2 rounded-lg border border-gray-200 text-center text-sm font-bold"
                                                                min="1"
                                                            />
                                                        </div>
                                                        <button onClick={() => removeHeir(heir.id)} className="p-2 text-danger hover:bg-red-50 rounded-lg transition-colors">
                                                            <TrashIcon className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-gray-100">
                                        <Button 
                                            fullWidth 
                                            size="lg" 
                                            leftIcon={<CalculatorIcon className="w-6 h-6" />}
                                            onClick={calculateInheritance}
                                            disabled={totalEstate <= 0 || heirs.length === 0}
                                        >
                                            بدء حساب الأنصبة
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        )}

                        {activeTab === 'examples' && (
                            <motion.div 
                                key="examples"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="grid gap-4"
                            >
                                {virtualExamples.map((ex, idx) => (
                                    <div key={idx} className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-primary/30 transition-all cursor-pointer" onClick={() => { ex.setup(); setActiveTab('calculator'); }}>
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-primary/5 transition-colors">
                                                <InformationCircleIcon className="w-6 h-6 text-gray-400 group-hover:text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">{ex.title}</h4>
                                                <p className="text-sm text-gray-500">{ex.details}</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" rightIcon={<SparklesIcon className="w-5 h-5" />}>تطبيق المثال</Button>
                                    </div>
                                ))}
                            </motion.div>
                        )}

                        {activeTab === 'docs' && (
                            <motion.div key="docs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                <Card title="استيراد من قضية موجودة">
                                    <p className="text-sm text-gray-500 mb-4">يمكنك جلب بيانات الورثة المسجلة في ملفات القضايا الحالية لتسريع عملية الحساب.</p>
                                    <div className="p-10 border-2 border-dashed border-gray-200 rounded-3xl text-center">
                                        <BriefcaseIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <Button variant="outline" size="sm">اختيار قضية عائلية</Button>
                                    </div>
                                </Card>
                                <Card title="رفع ملفات (حصر ورثة)">
                                    <p className="text-sm text-gray-500 mb-4">ارفع صورة "حصر الورثة" لاستخراج أسماء المستحقين آلياً باستخدام الذكاء الاصطناعي.</p>
                                    <div className="p-10 border-2 border-dashed border-primary/20 bg-primary/5 rounded-3xl text-center">
                                        <CloudArrowUpIcon className="w-12 h-12 text-primary/40 mx-auto mb-4" />
                                        <Button size="sm">رفع مستند</Button>
                                    </div>
                                </Card>
                            </motion.div>
                        )}

                        {activeTab === 'info' && (
                            <motion.div key="info" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                <Card title="قواعد المواريث في القانون الكويتي">
                                    <div className="prose prose-sm max-w-none text-right" dir="rtl">
                                        <h3 className="text-lg font-bold mb-4">أولاً: القانون السني (قانون الأحوال الشخصية 1984)</h3>
                                        <p>يعتمد القانون الكويتي للسنة على قواعد الفقه الإسلامي (المذهب المالكي بصفة أساسية) في تقسيم الفرائض.</p>
                                        <ul className="list-disc list-inside space-y-2 mb-6">
                                            <li><strong>أصحاب الفروض:</strong> الذين لهم نصيب محدد كالنصف والربع والثمن.</li>
                                            <li><strong>العصبات:</strong> الذين يأخذون ما تبقى بعد أصحاب الفروض.</li>
                                            <li><strong>الحجب:</strong> قواعد تمنع بعض الورثة من الإرث في حال وجود وريث أقرب.</li>
                                        </ul>

                                        <h3 className="text-lg font-bold mb-4">ثانياً: القانون الجعفري</h3>
                                        <p>يعتمد على تقسيم الورثة إلى ثلاث طبقات، حيث تمنع كل طبقة الطبقة التي تليها:</p>
                                        <ul className="list-disc list-inside space-y-2">
                                            <li><strong>الطبقة الأولى:</strong> الوالدان والأولاد وإن نزلوا.</li>
                                            <li><strong>الطبقة الثانية:</strong> الأجداد والجدات والإخوة والأخوات.</li>
                                            <li><strong>الطبقة الثالثة:</strong> الأعمام والعمات والأخوال والخالات.</li>
                                        </ul>
                                    </div>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="lg:col-span-1">
                    <Card title="ملخص الحساب">
                        {calculationResult ? (
                            <div className="space-y-6">
                                <div className="text-center p-6 bg-primary/5 rounded-3xl">
                                    <div className="text-sm text-gray-500 mb-1">صافي التركة القابلة للقسمة</div>
                                    <div className="text-3xl font-bold text-primary">{calculationResult.netEstate.toLocaleString()} د.ك</div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-gray-700 border-b pb-2">توزيع الأنصبة ({calculationResult.jurisdiction})</h4>
                                    {calculationResult.shares.map((share: any, idx: number) => (
                                        <div key={idx} className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-primary/20 transition-all">
                                            <div className="flex justify-between items-center mb-3">
                                                <div>
                                                    <div className="font-bold text-sm text-gray-900">{share.name}</div>
                                                    <div className="text-[10px] text-gray-400">النصيب الفرضي: {share.portion}</div>
                                                </div>
                                                <div className="text-left">
                                                    <div className="font-bold text-primary text-sm">{share.value.toLocaleString(undefined, {maximumFractionDigits: 2})} د.ك</div>
                                                </div>
                                            </div>
                                            {share.evidence && (
                                                <div className="bg-gray-50 p-2 rounded-lg text-[10px] text-gray-600 flex gap-2">
                                                    <ScaleIcon className="w-3 h-3 text-primary flex-shrink-0" />
                                                    <span><strong>المستند الشرعي/القانوني:</strong> {share.evidence}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-200">
                                    <div className="flex gap-2 text-xs text-yellow-800 leading-relaxed font-medium">
                                        <InformationCircleIcon className="w-5 h-5 flex-shrink-0" />
                                        <span>تنبيه: هذه الحسابات استرشادية وافتراضية. يجب الرجوع لحصر ورثة رسمي صادر من محاكم الكويت المختصة لضمان الدقة القانونية.</span>
                                    </div>
                                </div>

                                <Button fullWidth variant="outline" leftIcon={<ArrowDownTrayIcon className="w-5 h-5" />}>تصدير PDF</Button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                    <CalculatorIcon className="w-10 h-10 text-gray-300" />
                                </div>
                                <h4 className="font-bold text-gray-900 mb-2">لا توجد نتائج لعرضها</h4>
                                <p className="text-xs text-gray-500">أدخل بيانات التركة والورثة ثم اضغط على زر الحساب لبدء استخراج النتائج.</p>
                            </div>
                        )}
                    </Card>

                    <div className="mt-4 p-4 bg-primary text-white rounded-3xl shadow-lg relative overflow-hidden group">
                        <div className="relative z-10">
                            <h4 className="font-bold mb-1 flex items-center gap-2">
                                <SparklesIcon className="w-5 h-5" />
                                استشارة المساعد الذكي
                            </h4>
                            <p className="text-[10px] opacity-80 leading-relaxed mb-3">هل لديك حالة معقدة أو تسلسل نادر للورثة؟ استشر المحامي الذكي فوراً.</p>
                            <Button size="sm" variant="ghost" className="bg-white/20 hover:bg-white/30 text-white border-0 text-[10px]">بدء الاستشارة</Button>
                        </div>
                        <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-all duration-500"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InheritanceCalculatorPage;
