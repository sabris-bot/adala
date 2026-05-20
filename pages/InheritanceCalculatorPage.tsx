
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { useToast } from '../components/ui/Toast';
import Modal from '../components/ui/Modal';
import TextArea from '../components/ui/TextArea';
import { Badge } from '../components/ui/Badge';
import { 
    PieChart, 
    Pie, 
    Cell, 
    ResponsiveContainer, 
    Tooltip as RechartsTooltip,
    Legend
} from 'recharts';
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
    ArrowDownTrayIcon,
    ArrowPathIcon,
    ChartPieIcon,
    DocumentTextIcon,
    BanknotesIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ChevronDownIcon,
    BookOpenIcon
} from '../constants';

// --- TYPES & INTERFACES ---

type Gender = 'M' | 'F';

interface HeirDefinition {
    id: string;
    type: string;
    label: string;
    gender: Gender;
    count: number;
    notes?: string;
}

interface CalculatedShare {
    heirLabel: string;
    heirType: string;
    shareLabel: string; // e.g. "1/6", "1/4", "Assaba"
    shareValue: number; // percentage or fraction
    amount: number;
    isExcluded: boolean;
    exclusionReason?: string;
    evidence: {
        source: string; // Quran, Hadith, Law
        text: string;
        article?: string;
    };
}

interface InheritanceCase {
    id: string;
    deceasedName: string;
    deceasedGender: Gender;
    totalEstate: number;
    debts: number;
    funeralExpenses: number;
    wills: number;
    heirs: HeirDefinition[];
    netEstate: number;
    calculationResult?: {
        baseProblem: number; // أصل المسألة
        totalShares: number;
        shares: CalculatedShare[];
        steps: string[];
    };
}

// --- CONSTANTS & DATA ---

const HEIR_TYPES = [
    { id: 'husband', label: 'زوج', genders: ['M'], max: 1 },
    { id: 'wife', label: 'زوجة', genders: ['F'], max: 4 },
    { id: 'father', label: 'أب', genders: ['M'], max: 1 },
    { id: 'mother', label: 'أم', genders: ['F'], max: 1 },
    { id: 'son', label: 'ابن', genders: ['M'], max: 20 },
    { id: 'daughter', label: 'بنت', genders: ['F'], max: 20 },
    { id: 'grandson', label: 'ابن ابن', genders: ['M'], max: 20 },
    { id: 'granddaughter', label: 'بنت ابن', genders: ['F'], max: 20 },
    { id: 'paternal_grandfather', label: 'جد صحيح (لأب)', genders: ['M'], max: 1 },
    { id: 'paternal_grandmother', label: 'جدةلأب', genders: ['F'], max: 1 },
    { id: 'maternal_grandmother', label: 'جدةلأم', genders: ['F'], max: 1 },
    { id: 'full_brother', label: 'أخ شقيق', genders: ['M'], max: 10 },
    { id: 'full_sister', label: 'أخت شقيقة', genders: ['F'], max: 10 },
    { id: 'paternal_brother', label: 'أخ لأب', genders: ['M'], max: 10 },
    { id: 'paternal_sister', label: 'أخت لأب', genders: ['F'], max: 10 },
    { id: 'maternal_brother', label: 'أخ لأم', genders: ['M'], max: 10 },
    { id: 'maternal_sister', label: 'أخت لأم', genders: ['F'], max: 10 },
    { id: 'paternal_uncle', label: 'عم شقيق', genders: ['M'], max: 10 },
    { id: 'paternal_cousin', label: 'ابن عم شقيق', genders: ['M'], max: 10 },
];

const LEGAL_EVIDENCE: Record<string, any> = {
    husband_1_2: { 
        source: 'سورة النساء، الآية 12', 
        text: 'وَلَكُمْ نِصْفُ مَا تَرَكَ أَزْوَاجُكُمْ إِن لَّمْ يَكُن لَّهُنَّ وَلَدٌ',
        article: 'المادة 288 من قانون الأحوال الشخصية الكويتي'
    },
    husband_1_4: { 
        source: 'سورة النساء، الآية 12', 
        text: 'فَإِن كَانَ لَهُنَّ وَلَدٌ فَلَكُمُ الرُّبُعُ مِمَّا تَرَكْنَ',
        article: 'المادة 288 من قانون الأحوال الشخصية الكويتي'
    },
    wife_1_4: { 
        source: 'سورة النساء، الآية 12', 
        text: 'وَلَهُنَّ الرُّبُعُ مِمَّا تَرَكْتُمْ إِن لَّمْ يَكُن لَّكُمْ وَلَدٌ',
        article: 'المادة 289 من قانون الأحوال الشخصية الكويتي'
    },
    wife_1_8: { 
        source: 'سورة النساء، الآية 12', 
        text: 'فَإِن كَانَ لَكُمْ وَلَدٌ فَلَهُنَّ الثُّمُنُ مِمَّا تَرَكْتُم',
        article: 'المادة 289 من قانون الأحوال الشخصية الكويتي'
    },
    mother_1_6: { 
        source: 'سورة النساء، الآية 11', 
        text: 'وَلِأَبَوَيْهِ لِكُلِّ وَاحِدٍ مِّنْهُمَا السُّدُسُ مِمَّا تَرَكَ إِن كَانَ لَهُ وَلَدٌ',
        article: 'المادة 290 من قانون الأحوال الشخصية الكويتي'
    },
    mother_1_3: { 
        source: 'سورة النساء، الآية 11', 
        text: 'فَإِن لَّمْ يَكُن لَّهُ وَلَدٌ وَوَرِثَهُ أَبَوَاهُ فَلِأُمِّهِ الثُّلُثُ',
        article: 'المادة 290 من قانون الأحوال الشخصية الكويتي'
    },
    father_1_6: { 
        source: 'سورة النساء، الآية 11', 
        text: 'وَلِأَبَوَيْهِ لِكُلِّ وَاحِدٍ مِّنْهُمَا السُّدُسُ مِمَّا تَرَكَ إِن كَانَ لَهُ وَلَدٌ',
        article: 'المادة 291 من قانون الأحوال الشخصية الكويتي'
    },
    daughter_1_2: { 
        source: 'سورة النساء، الآية 11', 
        text: 'وَإِن كَانَتْ وَاحِدَةً فَلَهَا النِّصْفُ',
        article: 'المادة 293 من قانون الأحوال الشخصية الكويتي'
    },
    daughter_2_3: { 
        source: 'سورة النساء، الآية 11', 
        text: 'فَإِن كُنَّ نِسَاءً فَوْقَ اثْنَتَيْنِ فَلَهُنَّ ثُلُثَا مَا تَرَكَ',
        article: 'المادة 293 من قانون الأحوال الشخصية الكويتي'
    },
    assaba: { 
        source: 'الحديث النبوي الشريف', 
        text: 'ألحقوا الفرائض بأهلها، فما بقي فهو لأولى رجل ذكر',
        article: 'المادة 292 و 293 من قانون الأحوال الشخصية الكويتي'
    }
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

// --- COMPONENT ---

const InheritanceCalculatorPage: React.FC = () => {
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState<'calculator' | 'saved' | 'info'>('calculator');
    const [deceasedName, setDeceasedName] = useState('');
    const [deceasedGender, setDeceasedGender] = useState<Gender>('M');
    const [totalEstate, setTotalEstate] = useState<number>(0);
    const [debts, setDebts] = useState<number>(0);
    const [funeralExpenses, setFuneralExpenses] = useState<number>(0);
    const [wills, setWills] = useState<number>(0);
    const [heirs, setHeirs] = useState<HeirDefinition[]>([]);
    
    // UI States
    const [isAddHeirModalOpen, setIsAddHeirModalOpen] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [calculation, setCalculation] = useState<InheritanceCase | null>(null);
    const [resultTab, setResultTab] = useState<'summary' | 'steps' | 'evidence'>('summary');

    // Derived
    const netEstate = Math.max(0, totalEstate - debts - funeralExpenses - wills);
    const totalDeductions = debts + funeralExpenses + wills;

    const handleAddHeir = (typeId: string) => {
        const typeInfo = HEIR_TYPES.find(t => t.id === typeId);
        if (!typeInfo) return;

        // Validation based on deceased gender
        if (typeId === 'husband' && deceasedGender === 'M') {
            addToast({
                type: 'error',
                title: 'خطأ في الإضافة',
                message: 'لا يمكن إضافة زوج لمتوفى ذكر'
            });
            return;
        }
        if (typeId === 'wife' && deceasedGender === 'F') {
            addToast({
                type: 'error',
                title: 'خطأ في الإضافة',
                message: 'لا يمكن إضافة زوجة لمتوفاة أنثى'
            });
            return;
        }

        // Limit validation
        const existing = heirs.find(h => h.type === typeId);
        if (existing && existing.count >= typeInfo.max) {
            addToast({
                type: 'warning',
                title: 'تجاوز الحد الأقصى',
                message: `لا يمكن إضافة أكثر من ${typeInfo.max} من هذا النوع`
            });
            return;
        }

        if (existing) {
            setHeirs(heirs.map(h => h.type === typeId ? { ...h, count: h.count + 1 } : h));
        } else {
            setHeirs([...heirs, {
                id: Math.random().toString(36).substr(2, 9),
                type: typeId,
                label: typeInfo.label,
                gender: typeInfo.genders[0] as Gender,
                count: 1
            }]);
        }
        setIsAddHeirModalOpen(false);
    };

    const removeHeir = (id: string) => {
        setHeirs(heirs.filter(h => h.id !== id));
    };

    const updateHeirCount = (id: string, newCount: number) => {
        const heir = heirs.find(h => h.id === id);
        if (!heir) return;
        const typeInfo = HEIR_TYPES.find(t => t.id === heir.type);
        const validCount = Math.min(typeInfo?.max || 20, Math.max(1, newCount));
        setHeirs(heirs.map(h => h.id === id ? { ...h, count: validCount } : h));
    };

    const runCalculation = () => {
        // --- ISLAMIC INHERITANCE LOGIC (Kuwaiti Simplified Version) ---
        // This logic handles the main Fardh, Hajb and basic Assaba scenarios.
        
        const steps: string[] = ["بدء احتساب التركة بعد خصم الديون والوصايا والوصية الواجبة.", "تحديد الورثة المستحقين وتطبيق قواعد الحجب الشرعي."];
        const resultShares: CalculatedShare[] = [];
        
        const hasChildren = heirs.some(h => (h.type === 'son' || h.type === 'daughter' || h.type === 'grandson' || h.type === 'granddaughter'));
        const hasMaleBranch = heirs.some(h => (h.type === 'son' || h.type === 'grandson'));
        const hasParent = heirs.some(h => (h.type === 'father'));
        const totalSiblings = heirs.filter(h => h.type.includes('brother') || h.type.includes('sister')).reduce((acc, curr) => acc + curr.count, 0);
        const hasMultipleSiblings = totalSiblings >= 2;

        let remainingAmount = netEstate;
        let totalAssabaUnits = 0;

        // 1. Fixed Shares (Fardh)
        
        // --- SPOUSE ---
        let spouseShare = 0;
        const husband = heirs.find(h => h.type === 'husband');
        if (husband) {
            const shareRatio = hasChildren ? 0.25 : 0.5;
            spouseShare = netEstate * shareRatio;
            resultShares.push({
                heirLabel: 'الزوج',
                heirType: 'husband',
                shareLabel: hasChildren ? '1/4' : '1/2',
                shareValue: shareRatio,
                amount: spouseShare,
                isExcluded: false,
                evidence: hasChildren ? LEGAL_EVIDENCE.husband_1_4 : LEGAL_EVIDENCE.husband_1_2
            });
            remainingAmount -= spouseShare;
        }

        const wife = heirs.find(h => h.type === 'wife');
        if (wife) {
            const shareRatio = hasChildren ? 0.125 : 0.25;
            spouseShare = netEstate * shareRatio;
            resultShares.push({
                heirLabel: `الزوجة (${wife.count})`,
                heirType: 'wife',
                shareLabel: hasChildren ? '1/8' : '1/4',
                shareValue: shareRatio,
                amount: spouseShare,
                isExcluded: false,
                evidence: hasChildren ? LEGAL_EVIDENCE.wife_1_8 : LEGAL_EVIDENCE.wife_1_4
            });
            remainingAmount -= spouseShare;
        }

        // --- MOTHER ---
        const mother = heirs.find(h => h.type === 'mother');
        const father = heirs.find(h => h.type === 'father');
        if (mother) {
            let shareRatio = 0;
            let shareLabel = '';
            let evidence = null;

            if (hasChildren || hasMultipleSiblings) {
                shareRatio = 1/6;
                shareLabel = '1/6';
                evidence = LEGAL_EVIDENCE.mother_1_6;
            } else if (father && (husband || wife) && heirs.length === 3) {
                // Al-Ghrawayn Case: Mother takes 1/3 of REMAINING after spouse
                shareRatio = (1/3) * (remainingAmount / netEstate);
                shareLabel = '1/3 الباقي (الغراوين)';
                evidence = LEGAL_EVIDENCE.mother_1_3;
                steps.push("تطبيق حالة (الغراوين): استبعاد الأم بثلث الباقي لوجود الأب وأحد الزوجين فقط.");
            } else {
                shareRatio = 1/3;
                shareLabel = '1/3';
                evidence = LEGAL_EVIDENCE.mother_1_3;
            }

            const amount = netEstate * shareRatio;
            resultShares.push({
                heirLabel: 'الأم',
                heirType: 'mother',
                shareLabel,
                shareValue: shareRatio,
                amount,
                isExcluded: false,
                evidence
            });
            remainingAmount -= amount;
        }

        // --- FATHER ---
        if (father) {
            if (hasMaleBranch) {
                // Fixed Share 1/6 only
                const amount = netEstate * (1/6);
                resultShares.push({
                    heirLabel: 'الأب',
                    heirType: 'father',
                    shareLabel: '1/6',
                    shareValue: 1/6,
                    amount,
                    isExcluded: false,
                    evidence: LEGAL_EVIDENCE.father_1_6
                });
                remainingAmount -= amount;
            } else if (hasChildren) {
                // Fixed 1/6 + Assaba
                const amount = netEstate * (1/6);
                resultShares.push({
                    heirLabel: 'الأب',
                    heirType: 'father',
                    shareLabel: '1/6 + تعصيب',
                    shareValue: 1/6,
                    amount,
                    isExcluded: false,
                    evidence: LEGAL_EVIDENCE.father_1_6
                });
                remainingAmount -= amount;
                totalAssabaUnits += 1;
            } else {
                // Full Assaba
                totalAssabaUnits += 1;
                resultShares.push({
                    heirLabel: 'الأب',
                    heirType: 'father',
                    shareLabel: 'تعصيب',
                    shareValue: 0, 
                    amount: 0, 
                    isExcluded: false,
                    evidence: LEGAL_EVIDENCE.assaba
                });
            }
        }

        // Daughters (if no sons)
        const daughters = heirs.find(h => h.type === 'daughter');
        const sons = heirs.find(h => h.type === 'son');
        if (daughters && !sons) {
            const shareRatio = daughters.count === 1 ? 0.5 : (2/3);
            const amount = netEstate * shareRatio;
            resultShares.push({
                heirLabel: `البنات (${daughters.count})`,
                heirType: 'daughter',
                shareLabel: daughters.count === 1 ? '1/2' : '2/3',
                shareValue: shareRatio,
                amount,
                isExcluded: false,
                evidence: daughters.count === 1 ? LEGAL_EVIDENCE.daughter_1_2 : LEGAL_EVIDENCE.daughter_2_3
            });
            remainingAmount -= amount;
        }

        // 2. Assaba (Residue) Distribution
        if (remainingAmount > 0) {
            if (sons) {
                const sonUnits = sons.count * 2;
                const daughterUnits = (daughters?.count || 0);
                const totalUnits = sonUnits + daughterUnits;
                const unitValue = remainingAmount / totalUnits;

                resultShares.push({
                    heirLabel: `الأبناء (${sons.count})`,
                    heirType: 'son',
                    shareLabel: 'تعصيب',
                    shareValue: (sonUnits / totalUnits),
                    amount: unitValue * sonUnits,
                    isExcluded: false,
                    evidence: LEGAL_EVIDENCE.assaba
                });

                if (daughters) {
                    // Note: If daughters were already added as Fardh (above), this logic needs to merge.
                    // But Sharia says if there are sons, daughters become Assaba with them.
                    const existingDaughter = resultShares.findIndex(s => s.heirType === 'daughter');
                    if (existingDaughter > -1) resultShares.splice(existingDaughter, 1);
                    
                    resultShares.push({
                        heirLabel: `البنات (${daughters.count})`,
                        heirType: 'daughter',
                        shareLabel: 'تعصيب بالغير',
                        shareValue: (daughterUnits / totalUnits),
                        amount: unitValue * daughterUnits,
                        isExcluded: false,
                        evidence: LEGAL_EVIDENCE.assaba
                    });
                }
                remainingAmount = 0;
            } else if (father && (!hasMaleBranch)) {
                // Father took residue
                const fatherIdx = resultShares.findIndex(s => s.heirType === 'father');
                if (fatherIdx > -1) {
                    resultShares[fatherIdx].amount += remainingAmount;
                    resultShares[fatherIdx].shareValue += (remainingAmount / netEstate);
                }
                remainingAmount = 0;
            }
        }

        // Final result structure
        setCalculation({
            id: Math.random().toString(36).substr(2, 9),
            deceasedName: deceasedName || 'حالة افتراضية',
            deceasedGender,
            totalEstate,
            debts,
            funeralExpenses,
            wills,
            heirs,
            netEstate,
            calculationResult: {
                baseProblem: 0,
                totalShares: resultShares.length,
                shares: resultShares,
                steps: [
                    `تحديد الديون والوصايا وحسمها من التركة (المبلغ المحسوم: ${totalDeductions} د.ك).`,
                    `صافي التركة بعد الاستقطاعات القانونية والشرعية: ${netEstate} د.ك.`,
                    `توزيع الأنصبة المفروضة على أصحاب الفروض (الزوج/الزوجة، الأم، الأب).`,
                    `توزيع المتبقي من التركة بالتعصيب (للذكر مثل حظ الأنثيين).`
                ]
            }
        });
        setShowResults(true);
    };

    const loadExample = () => {
        setDeceasedName('أحمد الراشد');
        setDeceasedGender('M');
        setTotalEstate(150000);
        setDebts(5000);
        setFuneralExpenses(1000);
        setWills(10000);
        setHeirs([
            { id: '1', type: 'wife', label: 'زوجة', gender: 'F', count: 1 },
            { id: '2', type: 'son', label: 'ابن', gender: 'M', count: 2 },
            { id: '3', type: 'daughter', label: 'بنت', gender: 'F', count: 1 },
            { id: '4', type: 'father', label: 'أب', gender: 'M', count: 1 },
            { id: '5', type: 'mother', label: 'أم', gender: 'F', count: 1 },
        ]);
    };

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-500 rtl" dir="rtl">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white dark:bg-dm-card p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex items-center">
                    <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center me-5 shadow-inner">
                        <ScaleIcon className="w-9 h-9 text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-DM-Text-Primary">حاسبة المواريث الشرعية</h1>
                        <p className="text-gray-500 text-sm mt-1">نظام دقيق لتوزيع التركة وحساب الأنصبة وفقاً لأحكام الشريعة والقانون الكويتي</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button 
                        variant="primary" 
                        leftIcon={<PlusCircleIcon className="w-5" />}
                        onClick={() => {
                            setHeirs([]);
                            setTotalEstate(0);
                            setShowResults(false);
                            setDeceasedName('');
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200 dark:shadow-none"
                    >
                        حالة جديدة
                    </Button>
                    <Button 
                        variant="secondary" 
                        leftIcon={<SparklesIcon className="w-5" />}
                        onClick={loadExample}
                        className="text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30"
                    >
                        مثال افتراضي
                    </Button>
                    <div className="h-10 w-px bg-gray-200 mx-2 hidden lg:block"></div>
                    <Button variant="ghost" className="text-gray-400">
                        <PrinterIcon className="w-5" />
                    </Button>
                    <Button variant="ghost" className="text-gray-400">
                        <ArrowDownTrayIcon className="w-5" />
                    </Button>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Side: Input Form */}
                <div className="lg:col-span-12 space-y-6">
                    <Card className="p-8 border-none shadow-sm overflow-visible">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            {/* Deceased Info */}
                            <div className="lg:col-span-1 space-y-6">
                                <h3 className="text-lg font-black text-gray-900 dark:text-DM-Text-Primary flex items-center mb-4">
                                    <InformationCircleIcon className="w-5 h-5 me-2 text-emerald-500" />
                                    بيانات المتوفى
                                </h3>
                                <Input 
                                    label="اسم المتوفى" 
                                    placeholder="أدخل الاسم الرباعي" 
                                    value={deceasedName}
                                    onChange={e => setDeceasedName(e.target.value)}
                                />
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">جنس المتوفى</label>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setDeceasedGender('M')}
                                            className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all font-bold text-sm ${deceasedGender === 'M' ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200'}`}
                                        >
                                            ذكر
                                        </button>
                                        <button 
                                            onClick={() => setDeceasedGender('F')}
                                            className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all font-bold text-sm ${deceasedGender === 'F' ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-sm' : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200'}`}
                                        >
                                            أنثى
                                        </button>
                                    </div>
                                </div>
                                <Input label="تاريخ الوفاة" type="date" />
                                <TextArea label="ملاحظات حول الوفاة" rows={2} />
                            </div>

                            {/* Estate Info */}
                            <div className="lg:col-span-1 space-y-6 border-s border-gray-100 dark:border-gray-800 ps-8">
                                <h3 className="text-lg font-black text-gray-900 dark:text-DM-Text-Primary flex items-center mb-4">
                                    <BanknotesIcon className="w-5 h-5 me-2 text-emerald-500" />
                                    تفاصيل التركة
                                </h3>
                                <Input 
                                    label="إجمالي قيمة التركة (د.ك)" 
                                    type="number" 
                                    value={totalEstate.toString()}
                                    onChange={e => setTotalEstate(Number(e.target.value))}
                                    className="text-lg font-black"
                                />
                                <div className="space-y-4">
                                    <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20">
                                        <h4 className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-3">الالتزامات والخصومات</h4>
                                        <div className="space-y-3">
                                            <Input label="إجمالي الديون" type="number" value={debts.toString()} onChange={e => setDebts(Number(e.target.value))} />
                                            <Input label="مصروفات التجهيز" type="number" value={funeralExpenses.toString()} onChange={e => setFuneralExpenses(Number(e.target.value))} />
                                            <Input label="الوصايا (بحد أقصى الثلث)" type="number" value={wills.toString()} onChange={e => setWills(Number(e.target.value))} />
                                        </div>
                                    </div>
                                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-emerald-700">صافي التركة للتقسيم:</span>
                                            <span className="text-md font-black text-emerald-900 dark:text-emerald-100">{netEstate.toLocaleString()} د.ك</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Heirs Info */}
                            <div className="lg:col-span-2 space-y-6 border-s border-gray-100 dark:border-gray-800 ps-8">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-black text-gray-900 dark:text-DM-Text-Primary flex items-center">
                                        <UsersIcon className="w-5 h-5 me-2 text-emerald-500" />
                                        قائمة الورثة المستحقين
                                    </h3>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        leftIcon={<PlusCircleIcon className="w-4" />}
                                        onClick={() => setIsAddHeirModalOpen(true)}
                                        className="rounded-xl"
                                    >
                                        إضافة وريث
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto no-scrollbar pb-4 px-1">
                                    {heirs.length > 0 ? heirs.map(heir => (
                                        <div key={heir.id} className="p-4 bg-white dark:bg-dm-background rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center me-3 ${heir.gender === 'M' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'} dark:bg-opacity-10`}>
                                                        <UsersIcon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-gray-900 dark:text-DM-Text-Primary">{heir.label}</p>
                                                        <p className="text-[10px] text-gray-400">{heir.gender === 'M' ? 'ذكر' : 'أنثى'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center bg-gray-50 dark:bg-dm-card px-2 py-1 rounded-lg border border-gray-100 dark:border-gray-800">
                                                        <button onClick={() => updateHeirCount(heir.id, heir.count - 1)} className="p-1 hover:text-primary transition-colors"><ChevronDownIcon className="w-3 h-3 rotate-180" /></button>
                                                        <span className="mx-2 text-xs font-black">{heir.count}</span>
                                                        <button onClick={() => updateHeirCount(heir.id, heir.count + 1)} className="p-1 hover:text-primary transition-colors"><ChevronDownIcon className="w-3 h-3" /></button>
                                                    </div>
                                                    <button 
                                                        onClick={() => removeHeir(heir.id)}
                                                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="col-span-2 py-12 text-center border-2 border-dashed border-gray-50 dark:border-gray-800 rounded-[2rem]">
                                            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <UsersIcon className="w-8 h-8 text-gray-300" />
                                            </div>
                                            <p className="text-sm text-gray-400">لم يتم إضافة ورثة بعد. ابدأ بإضافة الورثة لتوزيع التركة.</p>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-6 mt-4 border-t border-gray-50 dark:border-gray-800">
                                    <Button 
                                        fullWidth 
                                        size="lg" 
                                        className="h-14 font-black rounded-2xl bg-emerald-600 hover:bg-emerald-700" 
                                        leftIcon={<CalculatorIcon className="w-6" />}
                                        onClick={runCalculation}
                                        disabled={heirs.length === 0 || totalEstate === 0}
                                    >
                                        احتساب الأنصبة الشرعية والقانونية
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Results Section */}
                {showResults && calculation && (
                    <div className="lg:col-span-12 animate-in slide-in-from-bottom duration-700">
                        <Card className="p-8 border-none shadow-xl overflow-hidden bg-white dark:bg-dm-card">
                            <div className="flex flex-col lg:flex-row gap-10">
                                {/* Visual Summary */}
                                <div className="lg:w-1/3 space-y-6">
                                    <h3 className="text-xl font-black text-gray-900 border-s-4 border-emerald-500 ps-3">ملخص الحسبة النهائية</h3>
                                    <div className="h-64 relative border border-emerald-100 rounded-[2rem] p-4 bg-emerald-50/10">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={calculation.calculationResult?.shares.map(s => ({
                                                        name: s.heirLabel,
                                                        value: s.amount
                                                    }))}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={90}
                                                    paddingAngle={2}
                                                    dataKey="value"
                                                >
                                                    {calculation.calculationResult?.shares.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip formatter={(val: any) => `${val.toLocaleString()} د.ك`} />
                                                <Legend wrapperStyle={{fontSize: '10px'}} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100">
                                            <p className="text-[10px] text-emerald-600 font-black uppercase">صافي التركة</p>
                                            <p className="text-xl font-black text-emerald-900">{calculation.netEstate.toLocaleString()} <span className="text-xs">د.ك</span></p>
                                        </div>
                                        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-2xl border border-blue-100">
                                            <p className="text-[10px] text-blue-600 font-black uppercase">عدد الورثة</p>
                                            <p className="text-xl font-black text-blue-900">{calculation.heirs.length}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Detailed Tabs */}
                                <div className="lg:w-2/3 space-y-6">
                                    <div className="flex bg-gray-50 dark:bg-dm-background p-1 rounded-2xl border border-gray-100 dark:border-gray-800">
                                        <button 
                                            onClick={() => setResultTab('summary')}
                                            className={`flex-1 flex items-center justify-center py-3 text-xs font-bold rounded-xl transition-all ${resultTab === 'summary' ? 'bg-white dark:bg-dm-card text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                        >
                                            <ChartPieIcon className="w-4 h-4 me-2" />
                                            جدول الأنصبة
                                        </button>
                                        <button 
                                            onClick={() => setResultTab('steps')}
                                            className={`flex-1 flex items-center justify-center py-3 text-xs font-bold rounded-xl transition-all ${resultTab === 'steps' ? 'bg-white dark:bg-dm-card text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                        >
                                            <ArrowPathIcon className="w-4 h-4 me-2" />
                                            خطوات الحساب
                                        </button>
                                        <button 
                                            onClick={() => setResultTab('evidence')}
                                            className={`flex-1 flex items-center justify-center py-3 text-xs font-bold rounded-xl transition-all ${resultTab === 'evidence' ? 'bg-white dark:bg-dm-card text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                        >
                                            <BookOpenIcon className="w-4 h-4 me-2" />
                                            الأدلة الشرعية
                                        </button>
                                    </div>

                                    {/* Tab Content */}
                                    <AnimatePresence mode="wait">
                                        {resultTab === 'summary' && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="overflow-x-auto"
                                            >
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="text-[10px] text-gray-400 font-black border-b border-gray-50 dark:border-gray-800 pb-3">
                                                            <th className="text-start pb-3">الوارث</th>
                                                            <th className="text-start pb-3">نوع الاستحقاق</th>
                                                            <th className="text-start pb-3">النصيب</th>
                                                            <th className="text-start pb-3">القيمة المالية</th>
                                                            <th className="text-end pb-3">الحالة</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                                        {calculation.calculationResult?.shares.map((share, idx) => (
                                                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-dm-background transition-colors">
                                                                <td className="py-4">
                                                                    <div className="flex items-center">
                                                                        <div className="w-2 h-2 rounded-full me-3" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                                                        <span className="text-sm font-black text-gray-900 dark:text-DM-Text-Primary">{share.heirLabel}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="py-4 text-xs font-bold text-gray-500">{share.shareLabel}</td>
                                                                <td className="py-4 font-mono font-black text-emerald-600">{(share.shareValue * 100).toFixed(2)}%</td>
                                                                <td className="py-4 text-sm font-black text-gray-900">{share.amount.toLocaleString()} د.ك</td>
                                                                <td className="py-4 text-end">
                                                                    <Badge text="مستحق" variant="success" />
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </motion.div>
                                        )}

                                        {resultTab === 'steps' && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="space-y-4"
                                            >
                                                {calculation.calculationResult?.steps.map((step, idx) => (
                                                    <div key={idx} className="flex gap-4 p-4 bg-gray-50 dark:bg-dm-background rounded-2xl border border-gray-100 shadow-sm border-s-4 border-s-emerald-500">
                                                        <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 text-sm font-black">
                                                            {idx + 1}
                                                        </div>
                                                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed pt-1">{step}</p>
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}

                                        {resultTab === 'evidence' && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="space-y-6"
                                            >
                                                {calculation.calculationResult?.shares.map((share, idx) => (
                                                    <div key={idx} className="p-6 bg-white dark:bg-dm-card rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm border-s-4" style={{ borderLeftColor: COLORS[idx % COLORS.length] }}>
                                                        <div className="flex justify-between items-center mb-3">
                                                            <h4 className="text-sm font-black text-gray-900">{share.heirLabel} (نصيب: {share.shareLabel})</h4>
                                                            <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{share.evidence.source}</span>
                                                        </div>
                                                        <p className="text-xs text-gray-600 bg-gray-50 dark:bg-dm-background/50 p-3 rounded-xl italic mb-4 leading-relaxed">
                                                            "{share.evidence.text}"
                                                        </p>
                                                        <div className="flex items-center text-[10px] font-bold text-emerald-600">
                                                            <CheckCircleIcon className="w-3 h-3 me-1" />
                                                            {share.evidence.article}
                                                        </div>
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
            </div>

            {/* Modal: Add Heir */}
            <Modal
                isOpen={isAddHeirModalOpen}
                onClose={() => setIsAddHeirModalOpen(false)}
                title="إضافة وريث جديد"
                size="lg"
            >
                <div className="space-y-6">
                    <p className="text-sm text-gray-500">اختر نوع الوارث لتهيئته في القائمة وحساب نصيبه مستقبلاً.</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {HEIR_TYPES.map(type => (
                            <button
                                key={type.id}
                                onClick={() => handleAddHeir(type.id)}
                                className="flex flex-col items-center gap-3 p-4 border border-gray-100 bg-gray-50/50 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
                            >
                                <UsersIcon className="w-6 h-6 text-gray-400 group-hover:text-emerald-600" />
                                <span className="text-xs font-bold text-gray-700 group-hover:text-emerald-900">{type.label}</span>
                            </button>
                        ))}
                    </div>
                    <div className="p-4 bg-amber-50 rounded-2xl flex gap-3 text-xs text-amber-700 leading-relaxed">
                        <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
                        <p>يتم استخراج النتائج بناءً على علاقة الورثة بعضهم ببعض. تأكد من إدخال جميع الورثة بدقة بما في ذلك الإناث والذكور.</p>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default InheritanceCalculatorPage;
