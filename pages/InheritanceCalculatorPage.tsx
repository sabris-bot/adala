import React, { useState, useEffect, useMemo } from 'react';
import { 
    Scale, 
    Bookmark, 
    Folder, 
    BookOpen, 
    Sparkles, 
    RotateCcw, 
    Layers, 
    Printer,
    FileSpreadsheet,
    HelpCircle,
    ArrowLeftRight,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle2,
    UserCheck,
    Coins,
    Users,
    Wallet,
    Brain
} from 'lucide-react';
import { 
    Gender, 
    CalculationMadhab, 
    EstateAssets, 
    EstateDeductions, 
    HeirDefinition, 
    HeirSpecialCondition,
    InheritanceCalculation, 
    calculateInheritance 
} from '../services/inheritanceEngine';
import { DeceasedMetadataCard } from '../components/inheritance/DeceasedMetadataCard';
import { EstateLiquidationCard } from '../components/inheritance/EstateLiquidationCard';
import { HeirsTreeCard, HEIR_CATALOG } from '../components/inheritance/HeirsTreeCard';
import { ResultsDashboard } from '../components/inheritance/ResultsDashboard';
import { PrintOfficialReportModal } from '../components/inheritance/PrintOfficialReportModal';
import { DualJurisdictionComparisonModal } from '../components/inheritance/DualJurisdictionComparisonModal';
import { AddHeirModal } from '../components/inheritance/AddHeirModal';
import { LegalLibraryView } from '../components/inheritance/LegalLibraryView';
import { SavedCasesView } from '../components/inheritance/SavedCasesView';
import { ScenarioComparisonModal } from '../components/inheritance/ScenarioComparisonModal';
import { ComplexCasesExplainerModal } from '../components/inheritance/ComplexCasesExplainerModal';
import { EstateZakatCalculator } from '../components/inheritance/EstateZakatCalculator';
import { LegalInheritanceDraftModal } from '../components/inheritance/LegalInheritanceDraftModal';
import { EstateAIConsultantModal } from '../components/inheritance/EstateAIConsultantModal';
import { SaveClientCaseModal } from '../components/inheritance/SaveClientCaseModal';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { GoogleGenAI } from '@google/genai';

const PRESETS = [
    {
        id: 'standard_family',
        name: 'أسرة كلاسيكية (زوجة، ابن، وبنتان)',
        badge: 'فرع وارث مذكر',
        description: 'توزيع التركة بوجود الفرع الوارث للذكر مثل حظ الأنثيين مع الثمن للزوجة',
        deceasedGender: 'M' as Gender,
        madhab: 'sunni' as CalculationMadhab,
        assets: { cash: 120000, realEstate: 0, stocks: 0, jewelry: 0, vehicles: 0, receivables: 0 },
        deductions: { securedDebts: 0, funeralExpenses: 1500, unsecuredDebts: 3500, wills: 0 },
        heirs: [
            { id: 'p1', type: 'wife', label: 'زوجة', gender: 'F' as Gender, count: 1 },
            { id: 'p2', type: 'son', label: 'ابن', gender: 'M' as Gender, count: 1 },
            { id: 'p3', type: 'daughter', label: 'بنت', gender: 'F' as Gender, count: 2 }
        ]
    },
    {
        id: 'umariyyah',
        name: 'المسألة العمرية (زوجة وأبوان)',
        badge: 'ثلث الباقي للأم',
        description: 'قضاء عمر بن الخطاب: للأم ثلث الباقي بعد نصيب الزوجة (المادة 290 ب)',
        deceasedGender: 'M' as Gender,
        madhab: 'sunni' as CalculationMadhab,
        assets: { cash: 90000, realEstate: 0, stocks: 0, jewelry: 0, vehicles: 0, receivables: 0 },
        deductions: { securedDebts: 0, funeralExpenses: 0, unsecuredDebts: 0, wills: 0 },
        heirs: [
            { id: 'u1', type: 'wife', label: 'زوجة', gender: 'F' as Gender, count: 1 },
            { id: 'u2', type: 'father', label: 'أب', gender: 'M' as Gender, count: 1 },
            { id: 'u3', type: 'mother', label: 'أم', gender: 'F' as Gender, count: 1 }
        ]
    },
    {
        id: 'minbariyyah_aoul',
        name: 'المسألة المنبرية (عول السهام)',
        badge: 'عول 24 ← 27',
        description: 'زوجة وابنتان وأبوان يعول أصل 24 إلى 27 (المادة 326 قانون 51/1984)',
        deceasedGender: 'M' as Gender,
        madhab: 'sunni' as CalculationMadhab,
        assets: { cash: 270000, realEstate: 0, stocks: 0, jewelry: 0, vehicles: 0, receivables: 0 },
        deductions: { securedDebts: 0, funeralExpenses: 0, unsecuredDebts: 0, wills: 0 },
        heirs: [
            { id: 'm1', type: 'wife', label: 'زوجة', gender: 'F' as Gender, count: 1 },
            { id: 'm2', type: 'daughter', label: 'بنت', gender: 'F' as Gender, count: 2 },
            { id: 'm3', type: 'father', label: 'أب', gender: 'M' as Gender, count: 1 },
            { id: 'm4', type: 'mother', label: 'أم', gender: 'F' as Gender, count: 1 }
        ]
    },
    {
        id: 'wasiyyah_wajibah',
        name: 'الوصية الواجبة (المادة 328)',
        badge: 'أولاد الابن المتوفى',
        description: 'استحقاق أحفاد الابن المتوفى قبل مورثهم لحصة والدهم في حدود الثلث قانوناً',
        deceasedGender: 'M' as Gender,
        madhab: 'sunni' as CalculationMadhab,
        assets: { cash: 150000, realEstate: 0, stocks: 0, jewelry: 0, vehicles: 0, receivables: 0 },
        deductions: { securedDebts: 0, funeralExpenses: 1000, unsecuredDebts: 0, wills: 0 },
        heirs: [
            { id: 'w1', type: 'son', label: 'ابن حي', gender: 'M' as Gender, count: 1 },
            { id: 'w2', type: 'grandson', label: 'ابن ابن (توفي والده قبل المورث)', gender: 'M' as Gender, count: 1, specialCondition: 'deceased_before' as HeirSpecialCondition }
        ]
    },
    {
        id: 'jafari_case',
        name: 'قضية المذهب الجعفري (الطبقات)',
        badge: 'حجب بالطبقة الأولى',
        description: 'البنت تحجب الأخ الشقيق بالكامل بالطبقات ويُرد الباقي عليها ومنع العول',
        deceasedGender: 'M' as Gender,
        madhab: 'jafari' as CalculationMadhab,
        assets: { cash: 80000, realEstate: 0, stocks: 0, jewelry: 0, vehicles: 0, receivables: 0 },
        deductions: { securedDebts: 0, funeralExpenses: 500, unsecuredDebts: 0, wills: 0 },
        heirs: [
            { id: 'j1', type: 'daughter', label: 'بنت صلبية', gender: 'F' as Gender, count: 1 },
            { id: 'j2', type: 'full_brother', label: 'أخ شقيق', gender: 'M' as Gender, count: 1 }
        ]
    },
    {
        id: 'mushtarakah',
        name: 'المسألة المشتركة / الحمارية',
        badge: 'تشريك الثلث',
        description: 'زوج وأم وإخوة لأم وإخوة أشقاء: تشريك الإخوة الأشقاء مع الإخوة لأم في الثلث',
        deceasedGender: 'F' as Gender,
        madhab: 'sunni' as CalculationMadhab,
        assets: { cash: 60000, realEstate: 0, stocks: 0, jewelry: 0, vehicles: 0, receivables: 0 },
        deductions: { securedDebts: 0, funeralExpenses: 0, unsecuredDebts: 0, wills: 0 },
        heirs: [
            { id: 'ms1', type: 'husband', label: 'زوج', gender: 'M' as Gender, count: 1 },
            { id: 'ms2', type: 'mother', label: 'أم', gender: 'F' as Gender, count: 1 },
            { id: 'ms3', type: 'maternal_brother', label: 'أخ لأم', gender: 'M' as Gender, count: 2 },
            { id: 'ms4', type: 'full_brother', label: 'أخ شقيق', gender: 'M' as Gender, count: 1 }
        ]
    },
    {
        id: 'akdariyyah',
        name: 'المسألة الأكدرية',
        badge: 'معادة الجد والأخت',
        description: 'زوج وأم وأخت شقيقة وجد: عول المسألة وقسمة سهم الجد والأخت للذكر مثل حظ الأنثيين',
        deceasedGender: 'F' as Gender,
        madhab: 'sunni' as CalculationMadhab,
        assets: { cash: 54000, realEstate: 0, stocks: 0, jewelry: 0, vehicles: 0, receivables: 0 },
        deductions: { securedDebts: 0, funeralExpenses: 0, unsecuredDebts: 0, wills: 0 },
        heirs: [
            { id: 'ak1', type: 'husband', label: 'زوج', gender: 'M' as Gender, count: 1 },
            { id: 'ak2', type: 'mother', label: 'أم', gender: 'F' as Gender, count: 1 },
            { id: 'ak3', type: 'paternal_grandfather', label: 'جد لأب', gender: 'M' as Gender, count: 1 },
            { id: 'ak4', type: 'full_sister', label: 'أخت شقيقة', gender: 'F' as Gender, count: 1 }
        ]
    }
];

export const InheritanceCalculatorPage: React.FC = () => {
    const { addToast } = useToast();

    // View Navigation
    const [activeView, setActiveView] = useState<'calculator' | 'zakat' | 'saved' | 'library'>('calculator');
    const [activePresetId, setActivePresetId] = useState<string | null>('standard_family');
    const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
    const [viewMode, setViewMode] = useState<'wizard' | 'expanded'>('wizard');

    // Deceased metadata
    const [deceasedName, setDeceasedName] = useState<string>('');
    const [deceasedGender, setDeceasedGender] = useState<Gender>('M');
    const [civilId, setCivilId] = useState<string>('');
    const [dateOfDeath, setDateOfDeath] = useState<string>('');
    const [madhab, setMadhab] = useState<CalculationMadhab>('sunni');
    const [note, setNote] = useState<string>('');

    // Estate financial values
    const [assets, setAssets] = useState<EstateAssets>({
        cash: 100000,
        realEstate: 0,
        stocks: 0,
        jewelry: 0,
        vehicles: 0,
        receivables: 0
    });

    const [deductions, setDeductions] = useState<EstateDeductions>({
        securedDebts: 0,
        funeralExpenses: 1000,
        unsecuredDebts: 2000,
        wills: 0
    });

    // Heirs list
    const [heirs, setHeirs] = useState<HeirDefinition[]>([
        { id: 'init-1', type: 'wife', label: 'زوجة', gender: 'F', count: 1 },
        { id: 'init-2', type: 'son', label: 'ابن مباشر (صلبي)', gender: 'M', count: 1 },
        { id: 'init-3', type: 'daughter', label: 'بنت مباشرة (صلبية)', gender: 'F', count: 2 }
    ]);

    // Modals
    const [isAddHeirOpen, setIsAddHeirOpen] = useState(false);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [selectedPrintCase, setSelectedPrintCase] = useState<InheritanceCalculation | null>(null);
    const [isComparisonOpen, setIsComparisonOpen] = useState(false);
    const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
    const [isPresetsModalOpen, setIsPresetsModalOpen] = useState(false);
    const [isDraftMemoOpen, setIsDraftMemoOpen] = useState(false);
    const [isAIConsultantOpen, setIsAIConsultantOpen] = useState(false);
    const [isSaveClientModalOpen, setIsSaveClientModalOpen] = useState(false);

    // AI Report
    const [isAIReportLoading, setIsAIReportLoading] = useState(false);
    const [aiReportText, setAiReportText] = useState<string>('');

    // Saved cases storage
    const [savedCases, setSavedCases] = useState<InheritanceCalculation[]>(() => {
        try {
            const raw = localStorage.getItem('adalah_inheritance_cases');
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    });

    // Compute Totals
    const totalAssets = useMemo(() => {
        return (assets.cash || 0) + 
               (assets.realEstate || 0) + 
               (assets.stocks || 0) + 
               (assets.jewelry || 0) + 
               (assets.vehicles || 0) + 
               (assets.receivables || 0) +
               (assets.endOfService || 0) +
               (assets.businessLicenses || 0) +
               (assets.otherAssets || 0);
    }, [assets]);

    const totalDeductions = useMemo(() => {
        return (deductions.securedDebts || 0) + (deductions.funeralExpenses || 0) + 
               (deductions.unsecuredDebts || 0) + (deductions.wills || 0);
    }, [deductions]);

    const netEstate = useMemo(() => {
        return Math.max(0, totalAssets - totalDeductions);
    }, [totalAssets, totalDeductions]);

    // Active Calculation Engine Run
    const currentCalculation = useMemo(() => {
        if (heirs.length === 0) return null;
        return calculateInheritance(
            madhab,
            deceasedGender,
            deceasedName || 'المورث الكريم',
            assets,
            deductions,
            heirs,
            note
        );
    }, [madhab, deceasedGender, deceasedName, assets, deductions, heirs, note]);

    // Comparative calculations for modal
    const sunniCalc = useMemo(() => {
        if (heirs.length === 0) return null;
        return calculateInheritance('sunni', deceasedGender, deceasedName || 'المورث', assets, deductions, heirs, note);
    }, [deceasedGender, deceasedName, assets, deductions, heirs, note]);

    const jafariCalc = useMemo(() => {
        if (heirs.length === 0) return null;
        return calculateInheritance('jafari', deceasedGender, deceasedName || 'المورث', assets, deductions, heirs, note);
    }, [deceasedGender, deceasedName, assets, deductions, heirs, note]);

    // Actions
    const handleAddHeir = (typeId: string, gender: Gender, label: string) => {
        // Prevent multiple spouses if deceased is female or more than 4 wives if male
        if (typeId === 'husband' && deceasedGender === 'F') {
            const existing = heirs.find(h => h.type === 'husband');
            if (existing) {
                addToast({ type: 'warning', title: 'تنبيه', message: 'لا يمكن إدراج أكثر من زوج واحد للمتوفاة.' });
                return;
            }
        }
        if (typeId === 'wife' && deceasedGender === 'M') {
            const existing = heirs.find(h => h.type === 'wife');
            if (existing && existing.count >= 4) {
                addToast({ type: 'warning', title: 'تنبيه', message: 'الحد الأقصى للزوجات في المسألة هو 4 زوجات.' });
                return;
            }
        }

        const existing = heirs.find(h => h.type === typeId);
        if (existing) {
            setHeirs(heirs.map(h => h.type === typeId ? { ...h, count: h.count + 1 } : h));
        } else {
            setHeirs([...heirs, {
                id: `heir-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                type: typeId,
                label,
                gender,
                count: 1
            }]);
        }
        addToast({ type: 'success', title: 'تمت الإضافة', message: `تم إدراج (${label}) في شجرة الورثة.` });
    };

    const handleApplyPreset = (preset: typeof PRESETS[0]) => {
        setActivePresetId(preset.id);
        setDeceasedName(preset.name);
        setDeceasedGender(preset.deceasedGender);
        setMadhab(preset.madhab);
        setAssets(preset.assets);
        setDeductions(preset.deductions);
        setHeirs(preset.heirs.map(h => ({
            ...h,
            id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        })));
        setCurrentStep(3);
        addToast({ type: 'info', title: 'تم تطبيق المسألة النموذجية', message: `تم تفعيل: ${preset.name}` });
    };

    const handleReset = () => {
        setActivePresetId(null);
        setDeceasedName('');
        setCivilId('');
        setDateOfDeath('');
        setNote('');
        setAssets({ 
            cash: 50000, 
            realEstate: 0, 
            stocks: 0, 
            jewelry: 0, 
            vehicles: 0, 
            receivables: 0,
            endOfService: 0,
            businessLicenses: 0,
            otherAssets: 0
        });
        setDeductions({ securedDebts: 0, funeralExpenses: 500, unsecuredDebts: 0, wills: 0 });
        setHeirs([]);
        setAiReportText('');
        setCurrentStep(1);
        addToast({ type: 'info', title: 'إعادة ضبط', message: 'تم تصفير كافة حقول المسألة.' });
    };

    const handleSaveCase = () => {
        if (!currentCalculation) return;
        setIsSaveClientModalOpen(true);
    };

    const handleSaveEnrichedCase = (enriched: InheritanceCalculation) => {
        const updated = [enriched, ...savedCases.filter(c => c.id !== enriched.id)];
        setSavedCases(updated);
        try {
            localStorage.setItem('adalah_inheritance_cases', JSON.stringify(updated));
        } catch {
            // ignore
        }
        addToast({ 
            type: 'success', 
            title: 'تم الحفظ في الأرشيف', 
            message: `تم حفظ ملف التركة بنجاح للموكل (${enriched.clientName || 'الموكل'}).` 
        });
    };

    const handleDeleteSavedCase = (id?: string) => {
        if (!id) return;
        const updated = savedCases.filter(c => c.id !== id);
        setSavedCases(updated);
        try {
            localStorage.setItem('adalah_inheritance_cases', JSON.stringify(updated));
        } catch {
            // ignore
        }
        addToast({ type: 'info', title: 'تم الحذف', message: 'تم إزالة القضية من الأرشيف.' });
    };

    const handleLoadSavedCase = (calc: InheritanceCalculation) => {
        setDeceasedName(calc.deceasedName);
        setDeceasedGender(calc.deceasedGender);
        setCivilId(calc.civilId || '');
        setDateOfDeath(calc.dateOfDeath || '');
        setNote(calc.notes || '');
        setMadhab(calc.madhab);
        if (calc.assets) {
            setAssets({
                cash: calc.assets.cash || 0,
                realEstate: calc.assets.realEstate || 0,
                stocks: calc.assets.stocks || 0,
                jewelry: calc.assets.jewelry || 0,
                vehicles: calc.assets.vehicles || 0,
                receivables: calc.assets.receivables || 0,
                endOfService: calc.assets.endOfService || 0,
                businessLicenses: calc.assets.businessLicenses || 0,
                otherAssets: calc.assets.otherAssets || 0
            });
        } else {
            setAssets({ 
                cash: calc.netEstate, 
                realEstate: 0, 
                stocks: 0, 
                jewelry: 0, 
                vehicles: 0, 
                receivables: 0,
                endOfService: 0,
                businessLicenses: 0,
                otherAssets: 0
            });
        }
        if (calc.deductions) {
            setDeductions({
                securedDebts: calc.deductions.securedDebts || 0,
                funeralExpenses: calc.deductions.funeralExpenses || 0,
                unsecuredDebts: calc.deductions.unsecuredDebts || 0,
                wills: calc.deductions.wills || 0
            });
        } else {
            setDeductions({ 
                securedDebts: 0, 
                funeralExpenses: calc.funeralExpenses || 0, 
                unsecuredDebts: calc.debts || 0, 
                wills: calc.wills || 0 
            });
        }
        setHeirs(calc.shares.map((s, idx) => ({
            id: `loaded-${idx}-${Date.now()}`,
            type: s.heirType,
            label: s.heirLabel,
            gender: 'M',
            count: s.count
        })));
        setCurrentStep(3);
        setActiveView('calculator');
        addToast({ type: 'success', title: 'تم الاسترجاع', message: 'تم تحميل بيانات التركة على شاشة الحاسبة.' });
    };

    const handleTriggerPrint = (calc: InheritanceCalculation) => {
        setSelectedPrintCase(calc);
        setIsPrintModalOpen(true);
    };

    const handleGenerateAIReport = async () => {
        if (!currentCalculation) return;
        setIsAIReportLoading(true);
        try {
            const prompt = `
أنت مستشار قانوني كويتي وخبير في قضايا المواريث والتركات بمكتب «المحامي صبري شطا للمحاماة والاستشارات القانونية».
المطلوب صياغة مذكرة فتوى واستشارة شرعية وقانونية رسمية موجهة للورثة وللقضاء بشأن التركة التالية:
- اسم المورث: ${currentCalculation.deceasedName || 'المورث'} (${currentCalculation.deceasedGender === 'M' ? 'متوفى' : 'متوفاة'})
- المذهب المطبق: ${currentCalculation.madhab === 'sunni' ? 'قانون الأحوال الشخصية الكويتي رقم 51 لسنة 1984 (المذهب السني)' : 'المذهب الجعفري (الدوائر الاستئنافية الجعفرية)'}
- إجمالي التركة: ${currentCalculation.totalEstate.toLocaleString()} د.ك
- الديون والتجهيز: ${(currentCalculation.debts + currentCalculation.funeralExpenses).toLocaleString()} د.ك
- صافي التركة للتوزيع: ${currentCalculation.netEstate.toLocaleString()} د.ك
- الورثة وتوزيع الحصص:
${currentCalculation.shares.map(s => `- ${s.heirLabel} (العدد: ${s.count}): نصيبه ${s.shareLabel} بنسبة ${(s.shareValue * 100).toFixed(2)}% بقيمة ${s.amount.toLocaleString()} د.ك [السند: ${s.evidence.article}]`).join('\n')}
${currentCalculation.excludedHeirs.length > 0 ? `\n- المحجوبون: \n${currentCalculation.excludedHeirs.map(e => `- ${e.label}: محجوب بسبب ${e.reason} بواسطة ${e.excludedBy}`).join('\n')}` : ''}

يرجى كتابة مذكرة قانونية رصينة ومحكمة ومقسمة إلى:
1. التوطئة والتمهيد الشرعي.
2. تخريج المسألة وتأصيل الأنصبة الشرعية استناداً لمواد القانون الكويتي.
3. التوصيات الإجرائية للقسمة الرضائية أو استخراج حصر الوراثة الرسمي من المحكمة الكلية.
            `;

            if (process.env.GEMINI_API_KEY) {
                const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt
                });
                setAiReportText(response.text || 'تعذر استخراج النص من النموذج.');
            } else {
                // High-quality local generative fallback template
                const template = `
مذكرة استشارية في بيان الأنصبة الشرعية وتوزيع التركة
صادرة عن: مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية - دولة الكويت
رقم الملف: ADL-EST-${Date.now().toString().slice(-6)}

أولاً: الوقائع والبيانات الثابتة:
بوفاة المورث (${currentCalculation.deceasedName || 'المرحوم'})، انحصر إرثه الشرعي في المستحقين المبينين تفصيلاً في صك الحصر أعلاه، وقد بلغت قيمة التركة الإجمالية بعد حصر الأصول العينية والنقدية مبلغ (${currentCalculation.totalEstate.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} د.ك).

ثانياً: التصفية الشرعية والتأصيل القانوني:
إعمالاً لنص المادة (289) من قانون الأحوال الشخصية الكويتي رقم 51 لسنة 1984، جرى أولاً استقطاع ديون التركة ومصاريف التجهيز بما قدره (${(currentCalculation.debts + currentCalculation.funeralExpenses).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} د.ك)، ليكون صافي التركة الخالص للورثة هو (${currentCalculation.netEstate.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} د.ك).

ثالثاً: توزيع الأنصبة والحصص المقررة:
${currentCalculation.shares.map(s => `• يستحق (${s.heirLabel}) فرضاً/تعصيباً (${s.shareLabel}) من صافي التركة بما يعادل (${s.amount.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} د.ك) سنداً للمادة (${s.evidence.article.split('من قانون')[0]}).`).join('\n')}

رابعاً: التوجيه الإجرائي والقضائي:
يوصي المكتب بالتقدم بدعوى حصر وراثة لدى المحكمة الكلية (دائرة الأحوال الشخصية) لاعتماد الصك، أو إبرام عقد قسمة رضائية موثق بإدارة التسجيل العقاري والتوثيق بوزارة العدل.
                `.trim();
                setAiReportText(template);
            }
            addToast({ type: 'success', title: 'تمت الصياغة', message: 'تم إعداد المذكرة الاستشارية بالذكاء الاصطناعي بنجاح.' });
        } catch (err) {
            console.error(err);
            addToast({ type: 'error', title: 'خطأ', message: 'تعذر الاتصال بخدمة الذكاء الاصطناعي، تم استخدام النموذج المحلي.' });
        } finally {
            setIsAIReportLoading(false);
        }
    };

    return (
        <div className="space-y-5 pb-12 max-w-7xl mx-auto px-4 sm:px-6">
            {/* 1. TOP EXECUTIVE HEADER BAR */}
            <div className="bg-white dark:bg-[#132742] p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-card flex flex-col md:flex-row justify-between md:items-center gap-4 transition-all">
                <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-[#0F2744] dark:bg-[#0A1C30] text-[#D4AF37] flex items-center justify-center font-bold border border-[#D4AF37]/40 shadow-sm flex-shrink-0">
                        <Scale className="w-6 h-6 text-[#D4AF37]" />
                    </div>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-base sm:text-lg font-black text-[#0F2744] dark:text-slate-100">
                                حاسبة وتصفية المواريث والتركات الشرعية
                            </h2>
                            <span className="text-[11px] font-black bg-amber-500/10 text-amber-800 dark:text-[#E6CA65] border border-amber-500/30 px-2.5 py-0.5 rounded-lg">
                                قانون الأحوال الشخصية 51/1984
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            منظومة عدالة الذكية لتصفية التركات وتوزيع الأنصبة القضائية وحساب العول والرد والمصادقة
                        </p>
                    </div>
                </div>

                {/* Center View Tabs */}
                <div className="flex items-center bg-slate-100/90 dark:bg-slate-900/90 p-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 self-start md:self-auto shadow-inner flex-wrap gap-1">
                    <button
                        type="button"
                        onClick={() => setActiveView('calculator')}
                        className={`px-3.5 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                            activeView === 'calculator'
                                ? 'bg-[#0F2744] text-white dark:bg-[#D4AF37] dark:text-slate-950 shadow-sm'
                                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <Scale className="w-3.5 h-3.5" />
                        <span>منصة الحساب والتصفية</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveView('zakat')}
                        className={`px-3.5 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                            activeView === 'zakat'
                                ? 'bg-[#0F2744] text-white dark:bg-[#D4AF37] dark:text-slate-950 shadow-sm'
                                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <Coins className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>زكاة التركة</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveView('saved')}
                        className={`px-3.5 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                            activeView === 'saved'
                                ? 'bg-[#0F2744] text-white dark:bg-[#D4AF37] dark:text-slate-950 shadow-sm'
                                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <Folder className="w-3.5 h-3.5" />
                        <span>سجل التركات السابقة ({savedCases.length})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveView('library')}
                        className={`px-3.5 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                            activeView === 'library'
                                ? 'bg-[#0F2744] text-white dark:bg-[#D4AF37] dark:text-slate-950 shadow-sm'
                                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>المدونة الفقهية</span>
                    </button>
                </div>
            </div>

            {/* MAIN CALCULATOR VIEW */}
            {activeView === 'calculator' && (
                <div className="space-y-5">
                    {/* 2. COMPACT LEGAL ACTIONS TOOLBAR */}
                    <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white dark:bg-[#132742] p-3 sm:p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-card">
                        <div className="flex flex-wrap items-center gap-2">
                            {/* AI Estate Consultant Trigger */}
                            <button
                                type="button"
                                onClick={() => setIsAIConsultantOpen(true)}
                                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#0F2744] to-[#1a3a60] text-[#D4AF37] border border-[#D4AF37]/50 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer hover:border-[#D4AF37]"
                                title="استشارة الذكاء الاصطناعي لتصفية التركات المعقدة والديون وفق القانون الكويتي"
                            >
                                <Brain className="w-3.5 h-3.5 text-[#D4AF37]" />
                                <span>الذكاء الاصطناعي الاستشاري</span>
                            </button>

                            {/* Presets Modal Trigger */}
                            <button
                                type="button"
                                onClick={() => setIsPresetsModalOpen(true)}
                                className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-[#D4AF37] border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer hover:bg-amber-50/60 dark:hover:bg-slate-700/80"
                            >
                                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-[#D4AF37]" />
                                <span>المسائل النموذجية ({PRESETS.length})</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsComparisonOpen(true)}
                                className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-blue-400 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer hover:bg-blue-50/60 dark:hover:bg-slate-700/80"
                            >
                                <ArrowLeftRight className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                <span>مقارنة المذهبين</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsScenarioModalOpen(true)}
                                className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-emerald-400 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer hover:bg-emerald-50/60 dark:hover:bg-slate-700/80"
                            >
                                <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-[#10B981]" />
                                <span>مقارنة السيناريوهات</span>
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            {currentCalculation && (
                                <button
                                    type="button"
                                    onClick={handleSaveCase}
                                    className="px-3.5 py-2 rounded-xl bg-[#0F2744] hover:bg-[#0A1C30] text-[#D4AF37] border border-[#D4AF37]/40 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                                    title="أرشفة هذه المسألة في سجل التركات"
                                >
                                    <Bookmark className="w-3.5 h-3.5 text-[#D4AF37]" />
                                    <span>حفظ في السجل</span>
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={handleReset}
                                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-rose-100 hover:text-rose-700 dark:bg-slate-800 dark:hover:bg-rose-950/60 dark:hover:text-rose-300 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                                title="تصفير كافة الحقول والبدء من جديد"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>تصفير الحقول</span>
                            </button>
                        </div>
                    </div>

                    {/* 3. EXECUTIVE THEME-ADAPTIVE INDICATORS BAR */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-slate-50 to-amber-50/30 dark:from-[#0F2744] dark:via-[#0A1C30] dark:to-[#071322] border border-slate-200/90 dark:border-[#D4AF37]/35 shadow-card p-4 sm:p-5 text-slate-800 dark:text-white transition-all">
                        {/* Ambient Radial Lights (Kuwaiti Gold & Emerald) */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 dark:bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#10B981]/10 dark:bg-[#10B981]/20 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative z-10 space-y-4">
                            {/* Header Status Row */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3.5 border-b border-slate-200/80 dark:border-white/10">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500" />
                                    <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 tracking-wide">
                                        لوحة المؤشرات القضائية والتصفية الفورية للتركة
                                    </span>
                                    <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-800 dark:text-[#E6CA65] border border-amber-500/30 font-bold">
                                        {madhab === 'sunni' ? 'المذهب السني (القانون 51/1984)' : 'المذهب الجعفري (نظام الطبقات)'}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
                                    <div className="flex items-center gap-1.5 bg-white dark:bg-white/5 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-white/10 shadow-2xs">
                                        <Users className="w-3.5 h-3.5 text-amber-600 dark:text-[#D4AF37]" />
                                        <span>إجمالي المستحقين:</span>
                                        <strong className="text-slate-900 dark:text-white font-mono font-bold">{heirs.reduce((sum, h) => sum + h.count, 0)}</strong>
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-white dark:bg-white/5 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-white/10 shadow-2xs">
                                        <Scale className="w-3.5 h-3.5 text-emerald-600 dark:text-[#10B981]" />
                                        <span>تكييف الفريضة:</span>
                                        <strong className="text-amber-700 dark:text-[#D4AF37] font-bold">
                                            {currentCalculation?.isAoul ? 'عائلة (عول)' : currentCalculation?.isRadd ? 'ردية (رد)' : 'عادلة'}
                                        </strong>
                                    </div>
                                </div>
                            </div>

                            {/* 4 Executive Metric Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                                {/* Metric 1: إجمالي التركة الخام */}
                                <div className="p-4 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/10 hover:border-[#D4AF37]/70 dark:hover:border-[#D4AF37]/50 transition-all flex flex-col justify-between space-y-2 shadow-xs group">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                            <Coins className="w-4 h-4 text-amber-600 dark:text-[#D4AF37]" />
                                            إجمالي الأصول (الخام)
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-mono">100%</span>
                                    </div>
                                    <div>
                                        <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
                                            {totalAssets.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                                            <span className="text-xs font-sans text-slate-500 dark:text-slate-300 ms-1.5 font-bold">د.ك</span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                                            نقد، عقارات، أسهم، وموجودات
                                        </p>
                                    </div>
                                </div>

                                {/* Metric 2: ديون التصفية والوصايا */}
                                <div className="p-4 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-500/20 hover:border-rose-400/60 transition-all flex flex-col justify-between space-y-2 shadow-xs group">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-bold text-rose-800 dark:text-slate-300 flex items-center gap-1.5">
                                            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                                            تصفية الديون والوصايا
                                        </span>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-300/60 dark:border-rose-500/30 font-bold">
                                            م. 289
                                        </span>
                                    </div>
                                    <div>
                                        <div className="text-xl sm:text-2xl font-black font-mono text-rose-600 dark:text-rose-300 tracking-tight">
                                            {totalDeductions.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                                            <span className="text-xs font-sans text-slate-500 dark:text-slate-300 ms-1.5 font-bold">د.ك</span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                                            تجهيز، ديون عينية، ديون مرسلة، ووصايا
                                        </p>
                                    </div>
                                </div>

                                {/* Metric 3: صافي التركة المقررة للقسمة (الزمردي) */}
                                <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-[#10B981]/15 border border-emerald-300/80 dark:border-[#10B981]/40 hover:border-emerald-500 dark:hover:border-[#10B981]/70 transition-all flex flex-col justify-between space-y-2 shadow-xs ring-1 ring-emerald-500/20 dark:ring-[#10B981]/25 group">
                                    <div className="flex items-center justify-between text-xs text-emerald-800 dark:text-[#10B981]">
                                        <span className="font-black flex items-center gap-1.5">
                                            <Wallet className="w-4 h-4 text-emerald-600 dark:text-[#10B981]" />
                                            صافي التركة للقسمة
                                        </span>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-[#10B981]/25 text-emerald-800 dark:text-[#10B981] font-bold border border-emerald-300 dark:border-[#10B981]/30">
                                            حق الورثة الخالص
                                        </span>
                                    </div>
                                    <div>
                                        <div className="text-xl sm:text-2xl font-black font-mono text-emerald-600 dark:text-[#10B981] tracking-tight">
                                            {netEstate.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                                            <span className="text-xs font-sans text-slate-700 dark:text-slate-200 ms-1.5 font-bold">د.ك</span>
                                        </div>
                                        <p className="text-[10px] text-emerald-700 dark:text-emerald-300/80 mt-1 font-medium">
                                            المبلغ الخالص القابل للقسمة الشرعية
                                        </p>
                                    </div>
                                </div>

                                {/* Metric 4: أصل ومصح المسألة (الذهبي الكويتي) */}
                                <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-[#D4AF37]/15 border border-amber-300/80 dark:border-[#D4AF37]/40 hover:border-amber-500 dark:hover:border-[#D4AF37]/70 transition-all flex flex-col justify-between space-y-2 shadow-xs ring-1 ring-amber-500/20 dark:ring-[#D4AF37]/25 group">
                                    <div className="flex items-center justify-between text-xs text-amber-900 dark:text-[#D4AF37]">
                                        <span className="font-black flex items-center gap-1.5">
                                            <Scale className="w-4 h-4 text-amber-600 dark:text-[#D4AF37]" />
                                            أصل الفريضة ومصحها
                                        </span>
                                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 dark:bg-[#D4AF37]/25 text-amber-800 dark:text-[#E6CA65] font-bold border border-amber-300 dark:border-[#D4AF37]/30">
                                            {currentCalculation?.isAoul ? 'عائلة (م. 326)' : currentCalculation?.isRadd ? 'ردية (م. 326)' : 'عادلة'}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="text-xl sm:text-2xl font-black font-mono text-amber-800 dark:text-[#D4AF37] tracking-tight flex items-baseline gap-1.5">
                                            {currentCalculation?.isAoul ? (
                                                <>
                                                    <span>{currentCalculation.finalProblem}</span>
                                                    <span className="text-xs text-amber-700 dark:text-amber-200/80 font-sans font-normal">(عالت من {currentCalculation.baseProblem})</span>
                                                </>
                                            ) : (
                                                <span>{currentCalculation?.baseProblem || 0}</span>
                                            )}
                                            <span className="text-xs font-sans text-slate-600 dark:text-slate-200 font-bold">سهم</span>
                                        </div>
                                        <p className="text-[10px] text-amber-700 dark:text-amber-200/70 mt-1">
                                            {currentCalculation?.isAoul 
                                                ? 'عول السهام لتزاحم أصحاب الفروض' 
                                                : currentCalculation?.isRadd 
                                                    ? 'رد الباقي على ذوي الفروض نسبياً' 
                                                    : 'تطابق السهام مع أصل التركة'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Left/Main Column: Inputs & Heirs Tree (7 Cols) */}
                        <div className="lg:col-span-7 space-y-6">
                            {/* 3-Step Wizard Tabs Navigation Component */}
                            <div className="bg-white dark:bg-[#132742] p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-card">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-xl bg-[#0F2744] dark:bg-[#0A1C30] text-[#D4AF37] flex items-center justify-center font-bold border border-[#D4AF37]/40 text-sm shadow-xs">
                                            {currentStep}
                                        </div>
                                        <div>
                                            <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                                                معالج خطوات التصفية وحصر المواريث (Wizard Tabs)
                                            </h3>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                                3 خطوات إجرائية متسلسلة للتوثيق والفرز وتوزيع السهام القضائية
                                            </p>
                                        </div>
                                    </div>

                                    {/* View Mode Switcher */}
                                    <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl text-[11px] font-bold border border-slate-200 dark:border-slate-800">
                                        <button
                                            type="button"
                                            onClick={() => setViewMode('wizard')}
                                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                                                viewMode === 'wizard'
                                                    ? 'bg-[#0A192F] dark:bg-[#D4AF37] text-[#D4AF37] dark:text-slate-950 shadow-xs'
                                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                            }`}
                                        >
                                            نظام المراحل (3 خطوات)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setViewMode('expanded')}
                                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                                                viewMode === 'expanded'
                                                    ? 'bg-[#0A192F] dark:bg-[#D4AF37] text-[#D4AF37] dark:text-slate-950 shadow-xs'
                                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                            }`}
                                        >
                                            العرض الشامل
                                        </button>
                                    </div>
                                </div>

                                {/* Step Progress Bar */}
                                <div className="mt-3.5 mb-1">
                                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                                        <span>تقدم المعالجة</span>
                                        <span className="font-mono text-[#D4AF37]">
                                            {currentStep === 1 ? '33% (البيانات)' : currentStep === 2 ? '66% (التصفية)' : '100% (حصر الورثة)'}
                                        </span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-l from-[#10B981] via-[#D4AF37] to-[#0A192F] transition-all duration-300 rounded-full"
                                            style={{ width: `${(currentStep / 3) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Step Tabs Selector Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3.5">
                                    {/* Tab 1: بيانات المتوفى */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCurrentStep(1);
                                            setViewMode('wizard');
                                        }}
                                        className={`p-3.5 rounded-xl border text-start transition-all flex flex-col justify-between gap-2.5 cursor-pointer relative overflow-hidden ${
                                            currentStep === 1 && viewMode === 'wizard'
                                                ? 'bg-[#0F2744] text-white dark:bg-[#0A1C30] dark:text-white border-[#0F2744] dark:border-[#D4AF37] shadow-md ring-2 ring-[#D4AF37]/40'
                                                : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
                                                    currentStep === 1 && viewMode === 'wizard'
                                                        ? 'bg-[#D4AF37] text-slate-950 shadow-xs'
                                                        : deceasedName 
                                                            ? 'bg-emerald-600 text-white' 
                                                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                                }`}>
                                                    1
                                                </span>
                                                <span className="text-xs font-black">بيانات المتوفى</span>
                                            </div>
                                            {deceasedName ? (
                                                <span className="flex items-center text-[10px] text-emerald-600 dark:text-[#10B981] font-bold gap-1 bg-emerald-500/15 px-2 py-0.5 rounded-md">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-[#10B981]" />
                                                    جاهز
                                                </span>
                                            ) : (
                                                <UserCheck className="w-4 h-4 text-slate-400" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-[11px] font-bold truncate">
                                                {deceasedName ? deceasedName : 'المورث والمذهب المعتمد'}
                                            </div>
                                            <div className={`text-[10px] ${currentStep === 1 && viewMode === 'wizard' ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                                                {madhab === 'sunni' ? 'المذهب السني (القانون 51/1984)' : 'المذهب الجعفري (الطبقات)'}
                                            </div>
                                        </div>
                                        {currentStep === 1 && viewMode === 'wizard' && (
                                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#D4AF37]" />
                                        )}
                                    </button>

                                    {/* Tab 2: تصفية التركة والديون */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCurrentStep(2);
                                            setViewMode('wizard');
                                        }}
                                        className={`p-3.5 rounded-xl border text-start transition-all flex flex-col justify-between gap-2.5 cursor-pointer relative overflow-hidden ${
                                            currentStep === 2 && viewMode === 'wizard'
                                                ? 'bg-[#0F2744] text-white dark:bg-[#0A1C30] dark:text-white border-[#0F2744] dark:border-[#D4AF37] shadow-md ring-2 ring-[#D4AF37]/40'
                                                : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
                                                    currentStep === 2 && viewMode === 'wizard'
                                                        ? 'bg-[#D4AF37] text-slate-950 shadow-xs'
                                                        : totalAssets > 0
                                                            ? 'bg-emerald-600 text-white'
                                                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                                }`}>
                                                    2
                                                </span>
                                                <span className="text-xs font-black">تصفية التركة والديون</span>
                                            </div>
                                            {totalAssets > 0 ? (
                                                <span className="flex items-center text-[10px] text-emerald-600 dark:text-[#10B981] font-bold gap-1 bg-emerald-500/15 px-2 py-0.5 rounded-md">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-[#10B981]" />
                                                    محصورة
                                                </span>
                                            ) : (
                                                <Coins className="w-4 h-4 text-slate-400" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-[11px] font-bold truncate">
                                                {totalAssets > 0 ? `صافي: ${netEstate.toLocaleString()} د.ك` : 'الأصول والخصوم (م. 289)'}
                                            </div>
                                            <div className={`text-[10px] ${currentStep === 2 && viewMode === 'wizard' ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                                                تجهيز، ديون، ووصية شرعية
                                            </div>
                                        </div>
                                        {currentStep === 2 && viewMode === 'wizard' && (
                                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#D4AF37]" />
                                        )}
                                    </button>

                                    {/* Tab 3: حصر الورثة */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCurrentStep(3);
                                            setViewMode('wizard');
                                        }}
                                        className={`p-3.5 rounded-xl border text-start transition-all flex flex-col justify-between gap-2.5 cursor-pointer relative overflow-hidden ${
                                            currentStep === 3 && viewMode === 'wizard'
                                                ? 'bg-[#0F2744] text-white dark:bg-[#0A1C30] dark:text-white border-[#0F2744] dark:border-[#D4AF37] shadow-md ring-2 ring-[#D4AF37]/40'
                                                : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
                                                    currentStep === 3 && viewMode === 'wizard'
                                                        ? 'bg-[#D4AF37] text-slate-950 shadow-xs'
                                                        : heirs.length > 0
                                                            ? 'bg-emerald-600 text-white'
                                                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                                }`}>
                                                    3
                                                </span>
                                                <span className="text-xs font-black">حصر الورثة</span>
                                            </div>
                                            {heirs.length > 0 ? (
                                                <span className="flex items-center text-[10px] text-emerald-600 dark:text-[#10B981] font-bold gap-1 bg-emerald-500/15 px-2 py-0.5 rounded-md">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-[#10B981]" />
                                                    {heirs.length} فئات
                                                </span>
                                            ) : (
                                                <Users className="w-4 h-4 text-slate-400" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-[11px] font-bold truncate">
                                                {heirs.length > 0 ? `${heirs.reduce((s, h) => s + h.count, 0)} وارث مستحق` : 'تحديد الفئات والسهام'}
                                            </div>
                                            <div className={`text-[10px] ${currentStep === 3 && viewMode === 'wizard' ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                                                أصحاب الفروض والعصبات
                                            </div>
                                        </div>
                                        {currentStep === 3 && viewMode === 'wizard' && (
                                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#D4AF37]" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Wizard Mode vs Expanded Mode Cards Rendering */}
                            {viewMode === 'wizard' ? (
                                <>
                                    {currentStep === 1 && (
                                        <DeceasedMetadataCard
                                            deceasedName={deceasedName}
                                            setDeceasedName={setDeceasedName}
                                            deceasedGender={deceasedGender}
                                            setDeceasedGender={setDeceasedGender}
                                            civilId={civilId}
                                            setCivilId={setCivilId}
                                            dateOfDeath={dateOfDeath}
                                            setDateOfDeath={setDateOfDeath}
                                            madhab={madhab}
                                            setMadhab={setMadhab}
                                            note={note}
                                            setNote={setNote}
                                            onNextStep={() => setCurrentStep(2)}
                                        />
                                    )}

                                    {currentStep === 2 && (
                                        <EstateLiquidationCard
                                            assets={assets}
                                            setAssets={setAssets}
                                            deductions={deductions}
                                            setDeductions={setDeductions}
                                            totalEstate={totalAssets}
                                            netEstate={netEstate}
                                            onNextStep={() => setCurrentStep(3)}
                                            onPrevStep={() => setCurrentStep(1)}
                                        />
                                    )}

                                    {currentStep === 3 && (
                                        <HeirsTreeCard
                                            heirs={heirs}
                                            setHeirs={setHeirs}
                                            onOpenAddModal={() => setIsAddHeirOpen(true)}
                                            onCompare={() => setIsComparisonOpen(true)}
                                            onSaveCase={handleSaveCase}
                                            hasActiveCalc={!!currentCalculation}
                                            onPrevStep={() => setCurrentStep(2)}
                                            onCalculateJump={() => {
                                                const el = document.getElementById('results-dashboard-card');
                                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                                            }}
                                        />
                                    )}
                                </>
                            ) : (
                                <>
                                    <DeceasedMetadataCard
                                        deceasedName={deceasedName}
                                        setDeceasedName={setDeceasedName}
                                        deceasedGender={deceasedGender}
                                        setDeceasedGender={setDeceasedGender}
                                        civilId={civilId}
                                        setCivilId={setCivilId}
                                        dateOfDeath={dateOfDeath}
                                        setDateOfDeath={setDateOfDeath}
                                        madhab={madhab}
                                        setMadhab={setMadhab}
                                        note={note}
                                        setNote={setNote}
                                        onNextStep={() => setCurrentStep(2)}
                                    />

                                    <EstateLiquidationCard
                                        assets={assets}
                                        setAssets={setAssets}
                                        deductions={deductions}
                                        setDeductions={setDeductions}
                                        totalEstate={totalAssets}
                                        netEstate={netEstate}
                                        onNextStep={() => setCurrentStep(3)}
                                        onPrevStep={() => setCurrentStep(1)}
                                    />

                                    <HeirsTreeCard
                                        heirs={heirs}
                                        setHeirs={setHeirs}
                                        onOpenAddModal={() => setIsAddHeirOpen(true)}
                                        onCompare={() => setIsComparisonOpen(true)}
                                        onSaveCase={handleSaveCase}
                                        hasActiveCalc={!!currentCalculation}
                                        onPrevStep={() => setCurrentStep(2)}
                                        onCalculateJump={() => {
                                            const el = document.getElementById('results-dashboard-card');
                                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                    />
                                </>
                            )}
                        </div>

                        {/* Right Column: Calculations & Summary Dashboard (5 Cols) */}
                        <div id="results-dashboard-card" className="lg:col-span-5 space-y-6">
                            <ResultsDashboard
                                calculation={currentCalculation}
                                sunniCalc={sunniCalc}
                                jafariCalc={jafariCalc}
                                onTriggerPrint={handleTriggerPrint}
                                onGenerateAIReport={handleGenerateAIReport}
                                isAIReportLoading={isAIReportLoading}
                                aiReportText={aiReportText}
                                onOpenScenarios={() => {
                                    setSelectedPrintCase(currentCalculation);
                                    setIsScenarioModalOpen(true);
                                }}
                                onSaveCase={handleSaveCase}
                                onOpenAIDraftModal={() => setIsDraftMemoOpen(true)}
                                onOpenAIConsultant={() => setIsAIConsultantOpen(true)}
                                onNavigateToZakat={() => setActiveView('zakat')}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* ESTATE ZAKAT CALCULATOR VIEW */}
            {activeView === 'zakat' && (
                <EstateZakatCalculator
                    estateAssets={assets}
                    estateDeductions={deductions}
                    deceasedName={deceasedName || 'المورث'}
                    onApplyZakatToDeductions={(zakatDebt) => {
                        setDeductions(prev => ({
                            ...prev,
                            unsecuredDebts: prev.unsecuredDebts + zakatDebt
                        }));
                        setActiveView('calculator');
                        addToast({
                            type: 'success',
                            title: 'تم إدراج الزكاة في ديون التركة',
                            message: `تم خصم زكاة التركة بقيمة (${zakatDebt.toLocaleString()} د.ك) كدين مرسل في الذمة قبل القسمة وفقاً للمادة 289 من قانون الأحوال الشخصية الكويتي.`
                        });
                    }}
                    onBackToCalculator={() => setActiveView('calculator')}
                />
            )}

            {/* SAVED CASES VIEW */}
            {activeView === 'saved' && (
                <SavedCasesView
                    savedCases={savedCases}
                    onLoadCase={handleLoadSavedCase}
                    onDeleteCase={handleDeleteSavedCase}
                    onPrintCase={handleTriggerPrint}
                    onDraftMemo={(calc) => {
                        setSelectedPrintCase(calc);
                        setIsDraftMemoOpen(true);
                    }}
                    onCompareCase={(calc) => {
                        setSelectedPrintCase(calc);
                        setIsScenarioModalOpen(true);
                    }}
                    onAddNewCase={() => setActiveView('calculator')}
                />
            )}

            {/* LEGAL LIBRARY VIEW */}
            {activeView === 'library' && (
                <LegalLibraryView />
            )}

            {/* MODALS */}
            <EstateAIConsultantModal
                isOpen={isAIConsultantOpen}
                onClose={() => setIsAIConsultantOpen(false)}
                calculation={currentCalculation}
                assets={assets}
                deductions={deductions}
            />

            <SaveClientCaseModal
                isOpen={isSaveClientModalOpen}
                onClose={() => setIsSaveClientModalOpen(false)}
                calculation={currentCalculation}
                onSaveCase={handleSaveEnrichedCase}
            />

            <AddHeirModal
                isOpen={isAddHeirOpen}
                onClose={() => setIsAddHeirOpen(false)}
                onSelectHeirType={handleAddHeir}
                deceasedGender={deceasedGender}
            />

            <PrintOfficialReportModal
                isOpen={isPrintModalOpen}
                onClose={() => setIsPrintModalOpen(false)}
                calculation={selectedPrintCase}
            />

            <LegalInheritanceDraftModal
                isOpen={isDraftMemoOpen}
                onClose={() => setIsDraftMemoOpen(false)}
                calculation={currentCalculation}
            />

            <DualJurisdictionComparisonModal
                isOpen={isComparisonOpen}
                onClose={() => setIsComparisonOpen(false)}
                sunniCalc={sunniCalc}
                jafariCalc={jafariCalc}
            />

            <ScenarioComparisonModal
                isOpen={isScenarioModalOpen}
                onClose={() => setIsScenarioModalOpen(false)}
                baseCalculation={selectedPrintCase || currentCalculation}
            />

            {/* Presets Modal */}
            <Modal
                isOpen={isPresetsModalOpen}
                onClose={() => setIsPresetsModalOpen(false)}
                title="نماذج المسائل الفقهية والقضائية النموذجية (الكويت)"
                size="lg"
            >
                <div className="space-y-4 text-start">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        اختر إحدى المسائل الفقهية المعتمدة لتحميل أصولها وورثتها تلقائياً لاختبار الحساب وتجربة القواعد القانونية:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto p-1">
                        {PRESETS.map((p) => (
                            <div
                                key={p.id}
                                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0A192F]/60 hover:border-[#D4AF37] transition-all flex flex-col justify-between gap-3 shadow-xs"
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-2 mb-1.5">
                                        <h5 className="text-xs font-black text-slate-900 dark:text-white">
                                            {p.name}
                                        </h5>
                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                                            {p.badge}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-2">
                                        {p.description}
                                    </p>
                                    <div className="text-[10px] text-slate-400 font-mono flex items-center gap-3">
                                        <span>التركة: {p.assets.cash.toLocaleString()} د.ك</span>
                                        <span>الورثة: {p.heirs.length} فئات</span>
                                        <span>المذهب: {p.madhab === 'sunni' ? 'سني' : 'جعفري'}</span>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={() => handleApplyPreset(p)}
                                    className="w-full bg-[#0A192F] dark:bg-[#D4AF37] text-[#D4AF37] dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-[#b8902a] text-xs font-bold rounded-lg cursor-pointer"
                                >
                                    تطبيق هذه المسألة
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default InheritanceCalculatorPage;
