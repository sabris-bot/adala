import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    calculateInheritance, 
    InheritanceCalculation, 
    HeirDefinition, 
    Gender, 
    CalculationMadhab, 
    CalculatedShare, 
    ExcludedHeir 
} from '../services/inheritanceEngine';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import TextArea from '../components/ui/TextArea';
import { useToast } from '../components/ui/Toast';
import Modal from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { 
    PieChart as RechartsPieChart, 
    Pie, 
    Cell, 
    ResponsiveContainer, 
    Tooltip as RechartsTooltip,
    Legend
} from 'recharts';
import { 
    Calculator, 
    Scale, 
    Info, 
    Printer, 
    Users, 
    PlusCircle, 
    Trash2, 
    Sparkles, 
    Upload, 
    Briefcase, 
    Download, 
    RefreshCw, 
    PieChart as IconPieChart, 
    FileText, 
    Coins, 
    CheckCircle2, 
    AlertTriangle, 
    ChevronDown, 
    BookOpen, 
    FileSpreadsheet, 
    Bookmark, 
    Brain, 
    Check, 
    ExternalLink, 
    Eye, 
    Folder,
    Calendar,
    Stamp,
    Layers,
    UserCheck,
    Lock,
    Maximize2
} from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f43f5e', '#14b8a6', '#6366f1', '#a855f7'];

const PRESETS = [
    {
        name: 'شائعة: زوجة، ابنان، وبنت (مع تصفية ديون)',
        total: 150000,
        debts: 5000,
        funeral: 1000,
        wills: 10000,
        heirs: [
            { id: 'h1', type: 'wife', label: 'زوجة', gender: 'F' as Gender, count: 1 },
            { id: 'h2', type: 'son', label: 'ابن', gender: 'M' as Gender, count: 2 },
            { id: 'h3', type: 'daughter', label: 'بنت', gender: 'F' as Gender, count: 1 }
        ]
    },
    {
        name: 'الغراوان: أب، أم، وزوج (ثلث الباقي)',
        total: 90000,
        debts: 0,
        funeral: 0,
        wills: 0,
        heirs: [
            { id: 'h1', type: 'husband', label: 'زوج', gender: 'M' as Gender, count: 1 },
            { id: 'h2', type: 'father', label: 'أب', gender: 'M' as Gender, count: 1 },
            { id: 'h3', type: 'mother', label: 'أم', gender: 'F' as Gender, count: 1 }
        ]
    },
    {
        name: 'العول: زوج، شقيقتان، وأم (تزاحم الفروض)',
        total: 120000,
        debts: 0,
        funeral: 0,
        wills: 0,
        heirs: [
            { id: 'h1', type: 'husband', label: 'زوج', gender: 'M' as Gender, count: 1 },
            { id: 'h2', type: 'mother', label: 'أم', gender: 'F' as Gender, count: 1 },
            { id: 'h3', type: 'full_sister', label: 'أخت شقيقة', gender: 'F' as Gender, count: 2 }
        ]
    },
    {
        name: 'الرد: زوجة، بنت، وأم (رد الباقي فرضاً ورداً)',
        total: 80000,
        debts: 0,
        funeral: 0,
        wills: 0,
        heirs: [
            { id: 'h1', type: 'wife', label: 'زوجة', gender: 'F' as Gender, count: 1 },
            { id: 'h2', type: 'daughter', label: 'بنت', gender: 'F' as Gender, count: 1 },
            { id: 'h3', type: 'mother', label: 'أم', gender: 'F' as Gender, count: 1 }
        ]
    }
];

const HEIR_TYPES_LIST = [
    { id: 'husband', label: 'زوج', genders: ['M'], max: 1, group: 'spouse', icon: '🤵' },
    { id: 'wife', label: 'زوجة', genders: ['F'], max: 4, group: 'spouse', icon: '👰' },
    { id: 'son', label: 'ابن مالي مباشر', genders: ['M'], max: 25, group: 'descendant', icon: '👦' },
    { id: 'daughter', label: 'بنت مباشرة', genders: ['F'], max: 25, group: 'descendant', icon: '👧' },
    { id: 'grandson', label: 'ابن ابن', genders: ['M'], max: 20, group: 'descendant', icon: '👦' },
    { id: 'granddaughter', label: 'بنت ابن', genders: ['F'], max: 20, group: 'descendant', icon: '👧' },
    { id: 'father', label: 'أب المتوفى', genders: ['M'], max: 1, group: 'ascendant', icon: '👨' },
    { id: 'mother', label: 'أم المتوفى', genders: ['F'], max: 1, group: 'ascendant', icon: '👩' },
    { id: 'paternal_grandfather', label: 'جد لأب (صحيح)', genders: ['M'], max: 1, group: 'ascendant', icon: '👴' },
    { id: 'paternal_grandmother', label: 'جدة لأب', genders: ['F'], max: 1, group: 'ascendant', icon: '👵' },
    { id: 'maternal_grandmother', label: 'جدة لأم', genders: ['F'], max: 1, group: 'ascendant', icon: '👵' },
    { id: 'full_brother', label: 'أخ شقيق', genders: ['M'], max: 20, group: 'sibling', icon: '👨' },
    { id: 'full_sister', label: 'أخت شقيقة', genders: ['F'], max: 20, group: 'sibling', icon: '👩' },
    { id: 'paternal_brother', label: 'أخ لأب', genders: ['M'], max: 20, group: 'sibling', icon: '👨' },
    { id: 'paternal_sister', label: 'أخت لأب', genders: ['F'], max: 20, group: 'sibling', icon: '👩' },
    { id: 'maternal_brother', label: 'أخ لأم', genders: ['M'], max: 10, group: 'sibling', icon: '👨' },
    { id: 'maternal_sister', label: 'أخت لأم', genders: ['F'], max: 10, group: 'sibling', icon: '👩' },
    { id: 'paternal_uncle', label: 'عم شقيق لأب', genders: ['M'], max: 10, group: 'relative', icon: '👤' },
    { id: 'paternal_cousin', label: 'ابن عم شقيق', genders: ['M'], max: 10, group: 'relative', icon: '👤' }
];

const InheritanceCalculatorPage: React.FC = () => {
    const { addToast } = useToast();
    
    // Core state
    const [activeView, setActiveView] = useState<'calculator' | 'saved' | 'comparison' | 'library'>('calculator');
    const [deceasedName, setDeceasedName] = useState<string>('');
    const [deceasedGender, setDeceasedGender] = useState<Gender>('M');
    const [dateOfDeath, setDateOfDeath] = useState<string>('');
    const [maritalStatus, setMaritalStatus] = useState<string>('married');
    const [civilId, setCivilId] = useState<string>('');
    const [madhab, setMadhab] = useState<CalculationMadhab>('sunni');
    const [note, setNote] = useState<string>('');
    
    // Asset inputs
    const [assetRealEstate, setAssetRealEstate] = useState<number>(0);
    const [assetCash, setAssetCash] = useState<number>(0);
    const [assetStocks, setAssetStocks] = useState<number>(0);
    const [assetOthers, setAssetOthers] = useState<number>(0);
    
    // Deductions
    const [debts, setDebts] = useState<number>(0);
    const [funeralExpenses, setFuneralExpenses] = useState<number>(0);
    const [wills, setWills] = useState<number>(0);
    
    // Heirs
    const [heirs, setHeirs] = useState<HeirDefinition[]>([]);
    
    // UI States
    const [isAddHeirOpen, setIsAddHeirOpen] = useState<boolean>(false);
    const [resultTab, setResultTab] = useState<'distribution' | 'exclusions' | 'steps' | 'sharia'>('distribution');
    const [showComparisonWidget, setShowComparisonWidget] = useState<boolean>(false);
    const [comparisonResult, setComparisonResult] = useState<{ sunni: InheritanceCalculation | null; jafari: InheritanceCalculation | null }>({ sunni: null, jafari: null });
    
    // Saved Cases state
    const [savedCases, setSavedCases] = useState<InheritanceCalculation[]>([]);
    
    // AI and Printing states
    const [naturalInputText, setNaturalInputText] = useState<string>('');
    const [isAILoading, setIsAILoading] = useState<boolean>(false);
    const [aiReportText, setAiReportText] = useState<string>('');
    const [isAIReportLoading, setIsAIReportLoading] = useState<boolean>(false);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
    const [selectedPrintCase, setSelectedPrintCase] = useState<InheritanceCalculation | null>(null);

    // Load saved cases from localStorage
    useEffect(() => {
        const cached = localStorage.getItem('adalah_inheritance_cases');
        if (cached) {
            try {
                setSavedCases(JSON.parse(cached));
            } catch (e) {
                console.error('Error parsing cached inheritance cases', e);
            }
        }
    }, []);

    // Derived asset calculations
    const totalEstate = useMemo(() => {
        return assetRealEstate + assetCash + assetStocks + assetOthers;
    }, [assetRealEstate, assetCash, assetStocks, assetOthers]);

    const netEstate = useMemo(() => {
        return Math.max(0, totalEstate - debts - funeralExpenses - wills);
    }, [totalEstate, debts, funeralExpenses, wills]);

    // Active Calculation Trigger
    const currentCalculation = useMemo(() => {
        if (heirs.length === 0 || totalEstate === 0) return null;
        return calculateInheritance({
            deceasedName,
            deceasedGender,
            totalEstate,
            debts,
            funeralExpenses,
            wills,
            heirs,
            madhab,
            dateOfDeath
        });
    }, [deceasedName, deceasedGender, totalEstate, debts, funeralExpenses, wills, heirs, madhab, dateOfDeath]);

    // Fast Add Heir Handler
    const handleAddHeir = (typeId: string) => {
        const typeInfo = HEIR_TYPES_LIST.find(t => t.id === typeId);
        if (!typeInfo) return;

        // Gender validations
        if (typeId === 'husband' && deceasedGender === 'M') {
            addToast({ type: 'error', title: 'خطأ إدخال منطقي', message: 'لا يمكن تعيين زوج لمورث مذكر.' });
            return;
        }
        if (typeId === 'wife' && deceasedGender === 'F') {
            addToast({ type: 'error', title: 'خطأ إدخال منطقي', message: 'لا يمكن تعيين زوجة لمورثة أنثى.' });
            return;
        }

        const existing = heirs.find(h => h.type === typeId);
        if (existing) {
            if (existing.count >= typeInfo.max) {
                addToast({ type: 'warning', title: 'الحد الأقصى للورثة', message: `الحد الأقصى المسموح به لهذا تصنيف القرابة هو ${typeInfo.max}.` });
                return;
            }
            setHeirs(heirs.map(h => h.type === typeId ? { ...h, count: h.count + 1 } : h));
        } else {
            setHeirs([...heirs, {
                id: Math.random().toString(36).substring(2, 9),
                type: typeId,
                label: typeInfo.label,
                gender: typeInfo.genders[0] as Gender,
                count: 1
            }]);
        }
        addToast({ type: 'success', title: 'تم تثبيت الوارث', message: `تم إدراج [${typeInfo.label}] في المعالجة بنجاح.` });
    };

    const handleUpdateCount = (id: string, count: number) => {
        const h = heirs.find(item => item.id === id);
        if (!h) return;
        const typeInfo = HEIR_TYPES_LIST.find(t => t.id === h.type);
        const max = typeInfo?.max || 20;
        const valid = Math.min(max, Math.max(1, count));
        setHeirs(heirs.map(item => item.id === id ? { ...item, count: valid } : item));
    };

    const handleRemoveHeir = (id: string) => {
        setHeirs(heirs.filter(item => item.id !== id));
        addToast({ type: 'success', title: 'تم الحذف', message: 'تم إرجاع الوارث من القائمة الاحتسابية.' });
    };

    // Load preset logic
    const handleLoadPreset = (preset: typeof PRESETS[0]) => {
        setDeceasedName('أحمد العجران (مثال للتجربة)');
        setDeceasedGender('M');
        setAssetCash(preset.total);
        setAssetRealEstate(0);
        setAssetStocks(0);
        setAssetOthers(0);
        setDebts(preset.debts);
        setFuneralExpenses(preset.funeral);
        setWills(preset.wills);
        setHeirs(preset.heirs);
        addToast({ type: 'success', title: 'تم استرداد القالب الشائع', message: 'تم ملء بيانات التركة وقائمة شجرة الورثة الجاهزة.' });
    };

    // Save current case logic
    const handleSaveCurrentCase = () => {
        if (!currentCalculation) {
            addToast({ type: 'warning', title: 'خطأ في الحفظ', message: 'يرجى إكمال المعطيات المالية وتحديد الورثة أولاً.' });
            return;
        }
        const updated = [...savedCases.filter(c => c.id !== currentCalculation.id), currentCalculation];
        setSavedCases(updated);
        localStorage.setItem('adalah_inheritance_cases', JSON.stringify(updated));
        addToast({ type: 'success', title: 'تم حفظ القضية بالتخزين الذاتي', message: 'تم الحفظ في الأرشيف المحلي للنظام بنجاح.' });
    };

    const handleDeleteCase = (id: string) => {
        const updated = savedCases.filter(c => c.id !== id);
        setSavedCases(updated);
        localStorage.setItem('adalah_inheritance_cases', JSON.stringify(updated));
        addToast({ type: 'success', title: 'تم الحذف من القضايا', message: 'تم إزالة سجل حصر الإرث.' });
    };

    // Comparative Simulation Work space
    const handleCompareScenarios = () => {
        if (heirs.length === 0 || totalEstate === 0) {
            addToast({ type: 'warning', title: 'لا يمكن تفعيل المقارنة', message: 'الرجاء إدخال بيانات التركة والورثة لإظهار سيناريوهات المذاهب.' });
            return;
        }
        const sunniCalc = calculateInheritance({
            deceasedName, deceasedGender, totalEstate, debts, funeralExpenses, wills, heirs, madhab: 'sunni', dateOfDeath
        });
        const jafariCalc = calculateInheritance({
            deceasedName, deceasedGender, totalEstate, debts, funeralExpenses, wills, heirs, madhab: 'jafari', dateOfDeath
        });
        setComparisonResult({ sunni: sunniCalc, jafari: jafariCalc });
        setShowComparisonWidget(true);
        addToast({ type: 'success', title: 'تمت المحاكاة التناظرية المزدوجة', message: 'يمكنك الآن مراجعة تقسيم التركة بين السنة والجعفري جنباً إلى جنب.' });
    };

    // AI Natural input scenario parser
    const handleAIParsing = async () => {
        if (!naturalInputText.trim()) {
            addToast({ type: 'warning', title: 'حقل فارغ', message: 'يرجى كتابة نص المكتوب لتجزيء التركة.' });
            return;
        }
        setIsAILoading(true);
        try {
            const prompt = `أنت فيلسوف وخبير قانون المواريث في دولة الكويت. لديك النص التالي الذي يصف عائلة متوفى وتركة بالتفصيل بالقرابة الطبيعية للأشخاص. 
            المطلوب هو تحليل وتفسير هذا النص، وتحويله إلى صيغة JSON دقيقة متوافقة مع الحواسب البرمجية.
            
            النص: "${naturalInputText}"
            
            الرجاء تقديم استجابة JSON خالصة فقط ولا تضف كلمات خارج نطاق الـ JSON. يجب أن يتوافق المخطط تماماً مع الشكل التالي:
            {
               "deceasedName": "اسم المتوفى أو فارغ",
               "deceasedGender": "M" أو "F",
               "totalEstate": رقم يمثل إجمالي قيمة التركات المالية بالدينار الكويتي,
               "debts": رقم الديون والالتزامات,
               "funeralExpenses": مصروفات الدفن وتجهيز الميت,
               "wills": الوصايا المالية,
               "heirs": [
                  { "type": "نوع الوريث من القائمة المسموحة", "count": عدد الورثة }
               ]
            }
            
            ملاحظة هامة: الأنواع المسموحة للورثة فقط هي:
            "husband", "wife", "son", "daughter", "grandson", "granddaughter", "father", "mother", "paternal_grandfather", "paternal_grandmother", "maternal_grandmother", "full_brother", "full_sister", "paternal_brother", "paternal_sister", "maternal_brother", "maternal_sister", "paternal_uncle", "paternal_cousin"`;

            const response = await fetch('/api/gemini/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    systemInstruction: "You are a legal AI assistant for inheritance data structuring. Return only valid raw JSON."
                })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error);

            // Clean json response form text
            let sanitized = data.text || '';
            sanitized = sanitized.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(sanitized);

            setDeceasedName(parsed.deceasedName || 'مورث افتراضي مبخر');
            setDeceasedGender(parsed.deceasedGender || 'M');
            setAssetCash(parsed.totalEstate || 100000);
            setAssetRealEstate(0);
            setDebts(parsed.debts || 0);
            setFuneralExpenses(parsed.funeralExpenses || 0);
            setWills(parsed.wills || 0);

            if (parsed.heirs && Array.isArray(parsed.heirs)) {
                const formattedHeirs: HeirDefinition[] = parsed.heirs.map((h: any) => {
                    const lookup = HEIR_TYPES_LIST.find(t => t.id === h.type);
                    return {
                        id: Math.random().toString(36).substring(2, 9),
                        type: h.type,
                        label: lookup?.label || h.type,
                        gender: lookup?.genders[0] as Gender || 'M',
                        count: h.count || 1
                    };
                });
                setHeirs(formattedHeirs);
            }
            addToast({ type: 'success', title: 'ذكاء عدالة AI', message: 'تم استخلاص وتحليل النص وإسقاط التوزع والورثة تلقائياً على الحاسبة.' });
        } catch (err: any) {
            console.error(err);
            addToast({ type: 'error', title: 'لم يكتمل تحليل التعبير الطبيعي', message: 'بنيان النص مفقود ومبهم للذكاء الاصطناعي، يرجى المحاولة بشكل أوضح.' });
        } finally {
            setIsAILoading(false);
        }
    };

    // Gemini Smart Legal Report Creator
    const handleGenerateAIReport = async () => {
        if (!currentCalculation) return;
        setIsAIReportLoading(true);
        try {
            const prompt = `أنت في مستشار قانوني وشرعي بمكتب "العيبان والوقيان للمحاماة والاستشارات القانونية" في الكويت. 
     قم بصياغة تقرير استشاري كامل وفتوى شرعية شاملة بخصوص قضية تقسيم الميراث التالية، موجهة للقضاء الشرعي ولأفراد العائلة. 
     اكتب بلغة جزلة وفخمة للغاية برصانة الفتاوى الرسمية والقانونية.
     
     بيان القضية:
     - اسم المورث: ${currentCalculation.deceasedName}
     - الجنس: ${currentCalculation.deceasedGender === 'M' ? 'ذكر' : 'أنثى'}
     - المذهب الاحتسابي: ${currentCalculation.madhab === 'sunni' ? 'قوانين الأحوال الشخصية الكويتية السنية' : 'لائحة الدوائر الجعفرية الاستئنافية بالكويت'}
     - القيمة الإجمالية للتركة: ${currentCalculation.totalEstate.toLocaleString()} د.ك
     - صافي التركة بعد تسديد الديون والوصايا: ${currentCalculation.netEstate.toLocaleString()} د.ك
     - الديون المصروفة: ${currentCalculation.debts.toLocaleString()} د.ك
     - الوصايا المنفذة: ${currentCalculation.wills.toLocaleString()} د.ك
     
     الورثة وتوزيعهم:
     ${currentCalculation.shares.map(s => `- الوارث: ${s.heirLabel}، النصيب: ${s.shareLabel} (${(s.shareValue * 100).toFixed(2)}%)، بمقدار مالي: ${s.amount.toLocaleString()} د.ك`).join('\n')}
     
     المحجوبون المحرومون لعدم القرابة الأقرب:
     ${currentCalculation.excludedHeirs.length > 0 ? currentCalculation.excludedHeirs.map(h => `- ${h.label}: محجوب بواسطة ${h.excludedBy} لعلة: ${h.reason}`).join('\n') : 'لا يوجد.'}
     
     تأكد بنهاية الفتوى بتوقيعك ككادر قضائي ومختص من مكتب الوقيان والعيبان، مبيناً المواد القانونية من قانون الأحوال الشخصية الكويتي.`;

            const response = await fetch('/api/gemini/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, systemInstruction: "You are the head of the Sharia and Estate division, writing in elegant legal Arabic." })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error);

            setAiReportText(data.text || '');
            addToast({ type: 'success', title: 'تمت صياغة الفتوى الاستشارية', message: 'صيغ الرأي القانوني المدجج بالأدلة الشرعية والقرآنية.' });
        } catch (err: any) {
            console.error(err);
            addToast({ type: 'error', title: 'فشل صياغة التقرير الذكي', message: 'قنوات الاتصال بالذكاء الاصطناعي ممتلئة.' });
        } finally {
            setIsAIReportLoading(false);
        }
    };

    // Print Command Handler
    const handleTriggerPrint = (calc: InheritanceCalculation) => {
        setSelectedPrintCase(calc);
        setIsPrintModalOpen(true);
    };

    const processBrowserPrint = () => {
        const printContent = document.getElementById('printable-estate-document');
        if (!printContent) return;

        const originalContent = document.body.innerHTML;
        const newContent = printContent.innerHTML;

        document.body.innerHTML = `
            <div dir="rtl" style="font-family: 'Inter', 'Amiri', 'serif'; padding: 40px; background-color: white; color: black;">
                ${newContent}
            </div>
        `;

        window.print();
        document.body.innerHTML = originalContent;
        window.location.reload(); // Re-bind React event handlers
    };

    return (
        <div className="space-y-8 pb-32 animate-in fade-in duration-500 rtl" dir="rtl" id="inheritance-suite-app">
            
            {/* STAGE HEADER DESIGN */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-800/20 to-transparent pointer-events-none"></div>
                <div className="flex items-center z-10">
                    <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center me-5 shadow-lg shadow-emerald-500/20">
                        <Scale className="w-9 h-9 text-slate-100" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="bg-emerald-500/15 text-emerald-300 text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full border border-emerald-500/30">الإصدار القضائي 3.2</span>
                        </div>
                        <h1 className="text-3xl font-black text-white mt-1.5 leading-none">نظام حاسبة المواريث المتكامل</h1>
                        <p className="text-slate-300 text-sm mt-2">منصة إلكترونية ذكية لتوزيع التركات والتحليل الشرعي وتوثيق الأنصبة وفقاً لقانون الأحوال الشخصية الكويتي والمذاهب الإسلامية</p>
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-2.5 z-10">
                    <Button 
                        variant={activeView === 'calculator' ? 'primary' : 'outline'} 
                        onClick={() => { setActiveView('calculator'); setShowComparisonWidget(false); }}
                        className={activeView === 'calculator' ? 'bg-emerald-600 hover:bg-emerald-700 h-12 text-sm font-bold rounded-2xl' : 'border-slate-700 hover:bg-slate-800 text-slate-300 h-12 text-sm font-bold rounded-2xl'}
                    >
                        <Calculator className="w-4 h-4 me-2" />
                        حاسبة التركات والورثة
                    </Button>
                    <Button 
                        variant={activeView === 'saved' ? 'primary' : 'outline'} 
                        onClick={() => setActiveView('saved')}
                        className={activeView === 'saved' ? 'bg-emerald-600 hover:bg-emerald-700 h-12 text-sm font-bold rounded-2xl' : 'border-slate-700 hover:bg-slate-800 text-slate-300 h-12 text-sm font-bold rounded-2xl'}
                    >
                        <Folder className="w-4 h-4 me-2" />
                        سجل قضايا المواريث ({savedCases.length})
                    </Button>
                    <Button 
                        variant={activeView === 'library' ? 'primary' : 'outline'} 
                        onClick={() => setActiveView('library')}
                        className={activeView === 'library' ? 'bg-emerald-600 hover:bg-emerald-700 h-12 text-sm font-bold rounded-2xl' : 'border-slate-700 hover:bg-slate-800 text-slate-300 h-12 text-sm font-bold rounded-2xl'}
                    >
                        <BookOpen className="w-4 h-4 me-2" />
                        المكتبة العلمية والمواد القانونية
                    </Button>
                </div>
            </div>

            {/* BENTO VIEW ROUTING */}
            {activeView === 'calculator' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* LEFT PANEL: INPUT FORM & HEIR PICKER */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* DECEASED METADATA */}
                        <Card className="p-8 border-none shadow-sm bg-white hover:shadow-md transition-all duration-300">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                                <h3 className="text-xl font-black text-slate-900 flex items-center">
                                    <UserCheck className="w-5 h-5 me-2.5 text-emerald-600 animate-pulse" />
                                    بيانات المورث والهيكل الفقهي
                                </h3>
                                <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
                                    <button 
                                        onClick={() => setMadhab('sunni')}
                                        className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${madhab === 'sunni' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                    >
                                        المذهب السني الكويتي
                                    </button>
                                    <button 
                                        onClick={() => setMadhab('jafari')}
                                        className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${madhab === 'jafari' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                    >
                                        المحكمة الجعفرية
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Input 
                                    label="اسم المورث الكامل" 
                                    placeholder="أدخل الاسم الثلاثي أو الرباعي" 
                                    value={deceasedName}
                                    onChange={e => setDeceasedName(e.target.value)}
                                    className="rounded-2xl border-slate-200"
                                />
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black text-slate-500">جنس المورث</label>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setDeceasedGender('M')}
                                            className={`flex-1 py-3 px-4 rounded-2xl border-2 transition-all font-black text-sm flex items-center justify-center gap-2 ${deceasedGender === 'M' ? 'border-blue-500 bg-blue-50/20 text-blue-700 shadow-sm' : 'border-slate-100 bg-slate-50/50 text-slate-400 hover:border-slate-200'}`}
                                        >
                                            👨 ذكر
                                        </button>
                                        <button 
                                            onClick={() => setDeceasedGender('F')}
                                            className={`flex-1 py-3 px-4 rounded-2xl border-2 transition-all font-black text-sm flex items-center justify-center gap-2 ${deceasedGender === 'F' ? 'border-pink-500 bg-pink-50/20 text-pink-700 shadow-sm' : 'border-slate-100 bg-slate-50/50 text-slate-400 hover:border-slate-200'}`}
                                        >
                                            👩 أنثى
                                        </button>
                                    </div>
                                </div>
                                <Input 
                                    label="تاريخ الوفاة المعتمد" 
                                    type="date"
                                    value={dateOfDeath}
                                    onChange={e => setDateOfDeath(e.target.value)}
                                    className="rounded-2xl border-slate-200"
                                />
                                <Input 
                                    label="الرقم المدني (اختياري)" 
                                    placeholder="280000000000" 
                                    value={civilId}
                                    onChange={e => setCivilId(e.target.value)}
                                    className="rounded-2xl border-slate-200"
                                />
                                <div className="space-y-1.5 col-span-2">
                                    <label className="text-xs font-black text-slate-500">ملاحظات قضائية مرافقة</label>
                                    <input 
                                        type="text"
                                        placeholder="مثال: وفاة طبيعية ولديه أملاك خارج البلاد"
                                        value={note}
                                        onChange={e => setNote(e.target.value)}
                                        className="w-full h-11 px-4 py-2 border border-slate-200 rounded-2xl text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* FINANCIAL VALUES AND OBLIGATIONS */}
                        <Card className="p-8 border-none shadow-sm bg-white hover:shadow-md transition-all duration-300">
                            <h3 className="text-xl font-black text-slate-900 flex items-center mb-6 pb-4 border-b border-slate-100">
                                <Coins className="w-5 h-5 me-2.5 text-emerald-600" />
                                تصفية التركة والذمة المالية والوصايا
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <label className="text-[10px] font-black text-slate-400 block mb-2">قيمة العقارات والأراضي (د.ك)</label>
                                    <input 
                                        type="number" 
                                        className="w-full bg-transparent font-black text-lg text-slate-800 border-none outline-none focus:ring-0 p-0"
                                        value={assetRealEstate || ''}
                                        onChange={e => setAssetRealEstate(Number(e.target.value))}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <label className="text-[10px] font-black text-slate-400 block mb-2">الأموال النقدية والودائع البنكية</label>
                                    <input 
                                        type="number" 
                                        className="w-full bg-transparent font-black text-lg text-slate-800 border-none outline-none focus:ring-0 p-0"
                                        value={assetCash || ''}
                                        onChange={e => setAssetCash(Number(e.target.value))}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <label className="text-[10px] font-black text-slate-400 block mb-2">الأسهم والحصص الاستثمارية</label>
                                    <input 
                                        type="number" 
                                        className="w-full bg-transparent font-black text-lg text-slate-800 border-none outline-none focus:ring-0 p-0"
                                        value={assetStocks || ''}
                                        onChange={e => setAssetStocks(Number(e.target.value))}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <label className="text-[10px] font-black text-slate-400 block mb-2">أصول أخرى ومقتنيات نفيسة</label>
                                    <input 
                                        type="number" 
                                        className="w-full bg-transparent font-black text-lg text-slate-800 border-none outline-none focus:ring-0 p-0"
                                        value={assetOthers || ''}
                                        onChange={e => setAssetOthers(Number(e.target.value))}
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-red-50/30 rounded-3xl border border-red-100 dark:border-none">
                                <Input 
                                    label="الديون والرهونات المترتبة (د.ك)" 
                                    type="number"
                                    value={debts.toString()}
                                    onChange={e => setDebts(Number(e.target.value))}
                                    className="rounded-2xl border-red-100 focus:border-red-400 focus:ring-red-400"
                                />
                                <Input 
                                    label="مصاريف الكفن والتجهيز" 
                                    type="number"
                                    value={funeralExpenses.toString()}
                                    onChange={e => setFuneralExpenses(Number(e.target.value))}
                                    className="rounded-2xl border-red-100 focus:border-red-400 focus:ring-red-400"
                                />
                                <Input 
                                    label="الوصايا الاختيارية المنفذة" 
                                    type="number"
                                    value={wills.toString()}
                                    onChange={e => setWills(Number(e.target.value))}
                                    className="rounded-2xl border-red-100 focus:border-red-400 focus:ring-red-400"
                                />
                            </div>

                            {wills > totalEstate / 3 && totalEstate > 0 && (
                                <div className="mt-4 p-4 bg-amber-50 rounded-2xl flex gap-3 text-xs text-amber-800 border-s-4 border-s-amber-500 leading-relaxed">
                                    <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600" />
                                    <p>انتباه شرعي للمحاماة: قيمة الوصايا تتعدى ثلث القيمة الكلية للممتلكات. قانون الأحوال الشخصية الكويتي مادة (290) يقر بالرد القسري لمقدار ثلث التركة فقط في حال عدم موافقة وإجماع الورثة بعد الممات.</p>
                                </div>
                            )}
                        </Card>

                        {/* HEIRS REGISTER TREE */}
                        <Card className="p-8 border-none shadow-sm bg-white hover:shadow-md transition-all duration-300 overflow-visible">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
                                <h3 className="text-xl font-black text-slate-900 flex items-center">
                                    <Users className="w-5 h-5 me-2.5 text-emerald-600" />
                                    شجرة الترتيب القرابي والمستحقين
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => setIsAddHeirOpen(true)}
                                        className="rounded-xl border-emerald-600 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-50 flex items-center gap-1"
                                    >
                                        <PlusCircle className="w-4 h-4" />
                                        إدراج وارث جديد
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        onClick={() => setHeirs([])} 
                                        className="text-xs font-black text-slate-400 hover:text-red-500"
                                    >
                                        ضبط وتصفير الكل
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[480px] overflow-y-auto pr-1 no-scrollbar">
                                {heirs.length > 0 ? heirs.map(heir => (
                                    <div key={heir.id} className="p-4 bg-slate-55 border border-slate-100 hover:border-slate-300 rounded-2xl transition-all flex items-center justify-between group">
                                        <div className="flex items-center">
                                            <div className="text-2xl me-3.5 bg-white p-2.5 rounded-xl shadow-sm border border-slate-100">
                                                {HEIR_TYPES_LIST.find(t => t.id === heir.type)?.icon || '👤'}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-slate-800">{heir.label}</h4>
                                                <p className="text-[10px] text-slate-400">الجنس: {heir.gender === 'M' ? 'ذكر' : 'أنثى'} | الفئة النسبية</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center bg-white border border-slate-100 rounded-xl p-1 shadow-inner">
                                                <button 
                                                    onClick={() => handleUpdateCount(heir.id, heir.count - 1)}
                                                    className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-800 font-bold"
                                                >
                                                    -
                                                </button>
                                                <span className="px-3 text-xs font-black text-slate-800">{heir.count}</span>
                                                <button 
                                                    onClick={() => handleUpdateCount(heir.id, heir.count + 1)}
                                                    className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-800 font-bold"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button 
                                                onClick={() => handleRemoveHeir(heir.id)}
                                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                title="إزالة من الحسبة"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-2 py-12 text-center border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50">
                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                                            <Users className="w-8 h-8 text-slate-300" />
                                        </div>
                                        <h5 className="text-sm font-black text-slate-700">شجرة المواريث فارغة</h5>
                                        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">لم تدرج أي قرابات عائلية لحصر الذمم حتى الآن. استعن بالقوالب الشائعة أو زر استيراد لتهيئة ورثة حقيقيين.</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                                <Button 
                                    className="flex-1 h-14 bg-emerald-600 hover:bg-emerald-700 font-black rounded-2xl text-md flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10"
                                    onClick={handleCompareScenarios}
                                    disabled={heirs.length === 0 || totalEstate === 0}
                                >
                                    <Layers className="w-5 h-5 animate-pulse" />
                                    دراسة وتناظر المحاكاة المذاهبية (محاكاة مزدوجة)
                                </Button>
                                {currentCalculation && (
                                    <Button 
                                        variant="outline"
                                        onClick={handleSaveCurrentCase}
                                        className="h-14 font-black border-slate-200 text-slate-800 px-6 rounded-2xl flex items-center justify-center"
                                    >
                                        <Bookmark className="w-5 h-5 me-2" />
                                        أرشفة بالملف الكلي
                                    </Button>
                                )}
                            </div>
                        </Card>

                        {/* AI NATURAL SCENARIO RECONSTRUCTION */}
                        <Card className="p-8 border-none shadow-sm bg-indigo-50/40 hover:shadow-md transition-all duration-300 border border-indigo-100/30">
                            <div className="flex items-center gap-2 mb-4">
                                <Brain className="w-5 h-5 text-indigo-600" />
                                <h4 className="text-base font-black text-slate-900">الذكاء القضائي: تجزئة وتحليل قضايا الميراث باللغة الطبيعية</h4>
                            </div>
                            <p className="text-slate-600 text-xs mb-4 leading-relaxed">اكتب تفاصيل المتوفى وورثته والتركة بلغة طبيعية شفوية كما يرويها الموكل، وسيقوم الذكاء الاصطناعي لـ AI بفرز الأرقام، تصفية الديون، واستنباط شجرة الورثة بدقة هائلة تلقائياً.</p>
                            
                            <div className="space-y-4">
                                <TextArea 
                                    placeholder="مثال: توفي سالم العبدالله ورثته الأم وزوجتان وبنتان وله ولد مباشر، وترك بيتاً مسجلاً بقيمة تفوق ثمانين ألف دينار، وكان عليه رصيد ديون بخمسة آلاف ومصاريف جنازة خمسمائة دينار..."
                                    value={naturalInputText}
                                    onChange={e => setNaturalInputText(e.target.value)}
                                    rows={3}
                                    className="rounded-2xl border-slate-200 text-xs"
                                />
                                <Button 
                                    className="bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-black rounded-xl h-10 w-full flex items-center justify-center gap-1.5"
                                    onClick={handleAIParsing}
                                    disabled={isAILoading}
                                >
                                    {isAILoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                    أمر الذكاء الاصطناعي للاستخراج المالي الفوري
                                </Button>
                            </div>
                        </Card>

                    </div>

                    {/* RIGHT SIDEBAR: INTELLIGENT RESULTS DASHBOARD */}
                    <div className="lg:col-span-4 space-y-8">
                        
                        {/* QUICK PRESETS PICKER */}
                        <Card className="p-6 border-none shadow-sm bg-white">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">قوالب سيناريوهات شرعية نموذجية</h4>
                            <div className="space-y-2">
                                {PRESETS.map((p, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => handleLoadPreset(p)}
                                        className="w-full p-3 text-start text-xs font-black bg-slate-50 hover:bg-emerald-55 hover:text-emerald-900 text-slate-700 rounded-xl transition-all border border-slate-100/80 flex items-center justify-between"
                                    >
                                        <span>{p.name}</span>
                                        <ChevronDown className="w-3.5 h-3.5 rotate-270 text-slate-300" />
                                    </button>
                                ))}
                            </div>
                        </Card>

                        {/* RESULT VISUALS */}
                        {currentCalculation ? (
                            <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
                                
                                <Card className="p-6 border-none shadow-lg bg-emerald-950 text-white relative overflow-hidden">
                                    <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-emerald-900 to-transparent opacity-40 pointer-events-none"></div>
                                    <p className="text-[10px] font-black tracking-widest uppercase text-emerald-400">حسبة التركة الصافية المعدة للورثة</p>
                                    <h4 className="text-3xl font-black mt-2 tracking-tight block font-mono">{currentCalculation.netEstate.toLocaleString()} <span className="text-sm font-sans font-normal text-emerald-300">د.ك</span></h4>
                                    
                                    <div className="grid grid-cols-2 gap-4 mt-6 border-t border-emerald-800/60 pt-4 z-10 relative">
                                        <div>
                                            <span className="text-[9px] text-emerald-300 block">إجمالي التركة الأصلي</span>
                                            <span className="text-sm font-black text-slate-100 font-mono">{currentCalculation.totalEstate.toLocaleString()} د.ك</span>
                                        </div>
                                        <div>
                                            <span className="text-[9px] text-emerald-300 block">الاستقطاعات والديون</span>
                                            <span className="text-sm font-black text-rose-300 font-mono">{(currentCalculation.totalEstate - currentCalculation.netEstate).toLocaleString()} د.ك</span>
                                        </div>
                                    </div>
                                </Card>

                                {/* REAL CHART */}
                                <Card className="p-6 border-none shadow-sm bg-white flex flex-col items-center">
                                    <h4 className="text-xs font-black text-slate-500 mb-4 text-start w-full flex items-center">
                                        <IconPieChart className="w-4 h-4 me-2 text-emerald-500" />
                                        المخطط البياني للتربة الوارثة
                                    </h4>
                                    <div className="w-full h-56">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RechartsPieChart>
                                                <Pie
                                                    data={currentCalculation.shares.filter(s => !s.isExcluded).map(s => ({
                                                        name: s.heirLabel,
                                                        value: s.amount
                                                    }))}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={50}
                                                    outerRadius={75}
                                                    paddingAngle={3}
                                                    dataKey="value"
                                                >
                                                    {currentCalculation.shares.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip formatter={(val: any) => `${val.toLocaleString()} د.ك`} />
                                                <Legend wrapperStyle={{ fontSize: '10px', direction: 'rtl' }} />
                                            </RechartsPieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card>

                                {/* PRINT/EXPORT QUICK BAR */}
                                <div className="flex gap-2.5">
                                    <Button 
                                        onClick={() => handleTriggerPrint(currentCalculation)}
                                        className="flex-1 bg-slate-900 hover:bg-slate-800 text-white h-11 text-xs font-bold rounded-xl"
                                        leftIcon={<Printer className="w-4 h-4" />}
                                    >
                                        طباعة صك حصر الإرث للطباعة
                                    </Button>
                                    <Button 
                                        variant="outline"
                                        onClick={handleGenerateAIReport}
                                        disabled={isAIReportLoading}
                                        className="bg-indigo-650 hover:bg-indigo-700 text-white border-none text-xs font-bold rounded-xl h-11"
                                    >
                                        {isAIReportLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                                        تقرير استشاري ذكي
                                    </Button>
                                </div>

                                {/* GENERATED REGULAR DECISION REPORT AI */}
                                {aiReportText && (
                                    <Card className="p-6 border-none shadow-sm bg-indigo-50/50 border border-indigo-100 rounded-[2rem] text-slate-900 select-all leading-relaxed whitespace-pre-wrap text-xs font-sans">
                                        <div className="flex items-center justify-between mb-4 border-b border-indigo-100 pb-2">
                                            <span className="font-black text-indigo-900 text-xs flex items-center gap-1.5">
                                                <Brain className="w-4 h-4" />
                                                توصيات وقرار الفتوى من عدالة AI
                                            </span>
                                            <button 
                                                onClick={() => {
                                                    navigator.clipboard.writeText(aiReportText);
                                                    addToast({ type: 'success', title: 'تم النسخ', message: 'تم نسخ الفتوى الاستشارية للحافظة.' });
                                                }}
                                                className="text-[10px] text-indigo-700 font-bold hover:underline"
                                            >
                                                مضاعفة ونسخ التقارير
                                            </button>
                                        </div>
                                        {aiReportText}
                                    </Card>
                                )}

                            </div>
                        ) : (
                            <div className="p-8 text-center bg-white border border-slate-100 rounded-[2rem] text-slate-400">
                                <Info className="w-8 h-8 mx-auto text-slate-300 mb-3" />
                                <h5 className="text-xs font-black text-slate-700">لا يوجد حساب نشط</h5>
                                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">قم بإدخال قيمة التركة المالية وقرابات الورثة لإنتاج محاكاة التقسيم الشرعي ومصح الإرث تلقائياً.</p>
                            </div>
                        )}

                    </div>

                    {/* CORE SHARES SHEET AND ANALYTICAL LOGS PANEL */}
                    {currentCalculation && (
                        <div className="lg:col-span-12 space-y-8 animate-in slide-in-from-bottom duration-700">
                            <Card className="p-8 border-none shadow-sm bg-white overflow-hidden">
                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-100 pb-4 mb-6">
                                    <div className="flex items-center gap-2">
                                        <span className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><Users className="w-5 h-5" /></span>
                                        <div>
                                            <h3 className="text-lg font-black text-slate-900">جدول توزيع الحصص وأنواع الفروض</h3>
                                            <p className="text-[11px] text-slate-400 mt-0.5">جدول مستنبط بدقة متجانس مع العول والرد وقوانين المواريث بالكويت</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold divide-x divide-slate-200 divide-x-reverse">
                                        <button 
                                            onClick={() => setResultTab('distribution')}
                                            className={`px-4 py-1.5 rounded-lg transition-all ${resultTab === 'distribution' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                        >
                                            حصص التركات والورثة
                                        </button>
                                        <button 
                                            onClick={() => setResultTab('exclusions')}
                                            className={`px-4 py-1.5 rounded-lg transition-all ${resultTab === 'exclusions' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                        >
                                            جدول المحجوبين ({currentCalculation.excludedHeirs.length})
                                        </button>
                                        <button 
                                            onClick={() => setResultTab('steps')}
                                            className={`px-4 py-1.5 rounded-lg transition-all ${resultTab === 'steps' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                        >
                                            صكوات التسلسل الحسابي
                                        </button>
                                        <button 
                                            onClick={() => setResultTab('sharia')}
                                            className={`px-4 py-1.5 rounded-lg transition-all ${resultTab === 'sharia' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                        >
                                            تخريج الأدلة القانونية
                                        </button>
                                    </div>
                                </div>

                                <AnimatePresence mode="wait">
                                    {resultTab === 'distribution' && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 15 }} 
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -15 }}
                                            className="overflow-x-auto"
                                        >
                                            <table className="w-full text-start">
                                                <thead>
                                                    <tr className="text-[11px] text-slate-400 font-bold border-b border-slate-100 pb-3">
                                                        <th className="text-start pb-3.5">الوارث ومقامه</th>
                                                        <th className="text-start pb-3.5">العدد التراكمي</th>
                                                        <th className="text-start pb-3.5">صلة الفرض والنصيب</th>
                                                        <th className="text-start pb-3.5">النسبة المئوية (%)</th>
                                                        <th className="text-start pb-3.5">المستحقات المالية الكلية بالدينار الكويتي</th>
                                                        <th className="text-end pb-3.5">حالة المورد</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {currentCalculation.shares.map((share, idx) => (
                                                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                                            <td className="py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                                                    <span className="text-sm font-black text-slate-900">{share.heirLabel}</span>
                                                                </div>
                                                            </td>
                                                            <td className="py-4 text-xs font-black text-slate-600">{share.count}</td>
                                                            <td className="py-4 text-xs font-bold text-slate-500">{share.shareLabel}</td>
                                                            <td className="py-4 text-sm font-mono font-black text-emerald-600">{(share.shareValue * 100).toFixed(2)}%</td>
                                                            <td className="py-4 text-sm font-bold text-slate-800 font-mono">{share.amount.toLocaleString()} د.ك</td>
                                                            <td className="py-4 text-end">
                                                                <Badge text="مستحق وراثي" variant="success" />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </motion.div>
                                    )}

                                    {resultTab === 'exclusions' && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 15 }} 
                                            animate={{ opacity: 1, y: 0 }}
                                            className="space-y-4"
                                        >
                                            {currentCalculation.excludedHeirs.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {currentCalculation.excludedHeirs.map((ex, idx) => (
                                                        <div key={idx} className="p-5 bg-red-50/25 border border-red-100 rounded-2xl flex gap-4">
                                                            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0 text-red-500">
                                                                <AlertTriangle className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <h4 className="text-sm font-black text-slate-800">{ex.label} <span className="text-xs text-slate-400">(العدد: {ex.count})</span></h4>
                                                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{ex.reason}</p>
                                                                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md inline-block mt-3">محجوب بواسطة: {ex.excludedBy}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="py-12 text-center text-slate-400 bg-slate-50/50 rounded-2xl">
                                                    <UserCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                                    <p className="text-xs">لا يوجد أي أشخاص محجوبين في تصفية هذه الورثة.</p>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    {resultTab === 'steps' && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 15 }} 
                                            animate={{ opacity: 1, y: 0 }}
                                            className="space-y-4"
                                        >
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                                                    <span className="text-[10px] text-slate-400 block">مخرج المسألة الأصلي (Denominator)</span>
                                                    <span className="text-2xl font-black text-slate-800 font-mono">{currentCalculation.baseProblem}</span>
                                                </div>
                                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                                                    <span className="text-[10px] text-slate-400 block">الحصص الفعلية (بعد موازنة العول/الرد)</span>
                                                    <span className="text-2xl font-black text-slate-800 font-mono">{currentCalculation.finalProblem || currentCalculation.baseProblem}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                {currentCalculation.steps.map((step, idx) => (
                                                    <div key={idx} className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                        <div className="w-8 h-8 bg-emerald-600 rounded-full text-white text-xs font-black flex items-center justify-center flex-shrink-0">
                                                            {idx + 1}
                                                        </div>
                                                        <p className="text-xs leading-relaxed text-slate-700 font-bold pt-1">{step}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}

                                    {resultTab === 'sharia' && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 15 }} 
                                            animate={{ opacity: 1, y: 0 }}
                                            className="space-y-6"
                                        >
                                            {currentCalculation.shares.map((share, idx) => (
                                                <div key={idx} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col md:flex-row gap-6 justify-between items-start">
                                                    <div className="space-y-2">
                                                        <h4 className="text-sm font-black text-slate-900 flex items-center">
                                                            <span className="w-2.5 h-2.5 rounded-full me-2" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                                                            شرح وتأصيل: {share.heirLabel} (نصيبه المقدر: {share.shareLabel})
                                                        </h4>
                                                        <p className="text-xs text-emerald-800 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 italic">
                                                            "{share.evidence.text}"
                                                        </p>
                                                    </div>
                                                    <div className="text-end flex-shrink-0">
                                                        <span className="text-[10px] bg-slate-200 text-slate-700 px-3 py-1.5 font-bold rounded-lg block mb-1">{share.evidence.source}</span>
                                                        <span className="text-[10px] text-emerald-600 font-bold block bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">{share.evidence.article}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Card>
                        </div>
                    )}

                </div>
            )}

            {/* VIEW SAVED CASES ARCHER */}
            {activeView === 'saved' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <Card className="p-8 border-none shadow-sm bg-white">
                        <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
                            <h3 className="text-xl font-black text-slate-900 flex items-center">
                                <Folder className="w-5 h-5 me-2.5 text-emerald-600" />
                                قضايا المواريث الموثقة والأرشيف الكويتي
                            </h3>
                            <Badge text={`${savedCases.length} قضية مستجوبة`} variant="success" />
                        </div>

                        {savedCases.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {savedCases.map((calc, idx) => (
                                    <div key={calc.id || idx} className="p-6 bg-slate-50 hover:bg-white border hover:border-emerald-500 rounded-3xl transition-all shadow-sm hover:shadow-lg flex flex-col justify-between">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="text-base font-black text-slate-800">{calc.deceasedName}</h4>
                                                    <p className="text-[10px] text-slate-400 mt-1">تاريخ الأرشفة: {new Date().toLocaleDateString('ar-KW')} | المذهب الاحتسابي: {calc.madhab === 'sunni' ? 'سني' : 'جعفري'}</p>
                                                </div>
                                                <Badge text={calc.madhab === 'sunni' ? 'حسب القانون والفرائض' : 'الفرقة الجعفرية'} variant={calc.madhab === 'sunni' ? 'primary' : 'success'} />
                                            </div>

                                            <div className="grid grid-cols-3 gap-2 py-4 border-y border-slate-100 text-center font-mono">
                                                <div>
                                                    <span className="text-[9px] text-slate-400 block">الورثة</span>
                                                    <span className="text-xs font-black text-slate-700">{calc.shares.length} مستحقين</span>
                                                </div>
                                                <div>
                                                    <span className="text-[9px] text-slate-400 block">قيمة التركة</span>
                                                    <span className="text-xs font-black text-emerald-600">{calc.totalEstate.toLocaleString()} د.ك</span>
                                                </div>
                                                <div>
                                                    <span className="text-[9px] text-slate-400 block">صافي القسمة</span>
                                                    <span className="text-xs font-black text-indigo-600">{calc.netEstate.toLocaleString()} د.ك</span>
                                                </div>
                                            </div>

                                            <p className="text-xs text-slate-500 leading-relaxed font-sans line-clamp-3">
                                                {calc.advisoryText}
                                            </p>
                                        </div>

                                        <div className="flex gap-2 mt-6">
                                            <Button 
                                                variant="outline" 
                                                className="flex-1 text-xs font-bold rounded-xl border-slate-200 hover:bg-slate-100 text-slate-800 h-10"
                                                onClick={() => {
                                                    setDeceasedName(calc.deceasedName);
                                                    setDeceasedGender(calc.deceasedGender);
                                                    setAssetCash(calc.netEstate); // fill back
                                                    setDebts(calc.debts);
                                                    setFuneralExpenses(calc.funeralExpenses);
                                                    setWills(calc.wills);
                                                    // Convert shares back to definition if loaded
                                                    const formatted = calc.shares.map((s, sIdx) => ({
                                                        id: `loaded-${sIdx}-${Math.random()}`,
                                                        type: s.heirType,
                                                        label: s.heirLabel,
                                                        gender: (s.heirType === 'husband' || s.heirType === 'son' || s.heirType === 'grandson' || s.heirType === 'father' || s.heirType === 'paternal_grandfather' || s.heirType === 'full_brother' || s.heirType === 'paternal_brother' || s.heirType === 'maternal_brother' || s.heirType === 'paternal_uncle' ? 'M' : 'F') as Gender,
                                                        count: s.count
                                                    }));
                                                    setHeirs(formatted);
                                                    setMadhab(calc.madhab);
                                                    setActiveView('calculator');
                                                    addToast({ type: 'success', title: 'تم فتح القضية', message: 'تم إرجاع معطيات التركة كاملة على الحاسبة.' });
                                                }}
                                            >
                                                استعراض وتعديل البيانات
                                            </Button>
                                            <Button 
                                                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl h-10"
                                                onClick={() => handleTriggerPrint(calc)}
                                            >
                                                طباعة الصك
                                            </Button>
                                            <button 
                                                className="p-2 text-slate-300 hover:text-red-500 rounded-xl"
                                                onClick={() => handleDeleteCase(calc.id)}
                                                title="حذف من السجلات"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center text-slate-400">
                                <Folder className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <h4 className="text-sm font-black text-slate-700">لا توجد قضايا مؤرشفة</h4>
                                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">عند القيام بحفظ القضايا المستعلمة بحاسبة المواريث، سيتم تثبيت السجلات المرجعية هنا للرجوع والطباعة السريعة.</p>
                            </div>
                        )}
                    </Card>
                </div>
            )}

            {/* VIEW LEGAL REFERENCE LIBRARY */}
            {activeView === 'library' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <Card className="p-8 border-none shadow-sm bg-white">
                        <div className="pb-4 border-b border-slate-100 mb-6">
                            <h3 className="text-xl font-black text-slate-900 flex items-center">
                                <BookOpen className="w-5 h-5 me-2.5 text-emerald-600" />
                                المدونات الفقهية والمواد الدستورية لقسم المواريث والوصايا
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">تفريغ دقيق لنصوص القرآن المباشرة وأبواب مجمع المواريث في قانون الأحوال الشخصية الكويتي رقم (51 لعام 1984)</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            
                            <div className="p-6 bg-slate-50 rounded-3xl space-y-4">
                                <h4 className="text-sm font-black text-emerald-800 border-s-4 border-s-emerald-600 ps-2">آيات المواريث بالقرآن الكريم</h4>
                                <ul className="space-y-3 font-sans text-xs text-slate-700 leading-relaxed">
                                    <li className="p-3 bg-white rounded-xl border border-slate-100">
                                        <h5 className="font-black text-slate-800 mb-1">المادة القرآنية [سورة النساء آية 11]:</h5>
                                        "يُوصِيكُمُ اللَّهُ فِي أَوْلادِكُمْ لِلذَّكَرِ مِثْلُ حَظِّ الأُنثَيَيْنِ فَإِن كُنَّ نِسَاء فَوْقَ اثْنَتَيْنِ فَلَهُنَّ ثُلُثَا مَا تَرَكَ وَإِن كَانَتْ وَاحِدَةً فَلَهَا النِّصْفُ..."
                                    </li>
                                    <li className="p-3 bg-white rounded-xl border border-slate-100">
                                        <h5 className="font-black text-slate-800 mb-1">المادة القرآنية [سورة النساء آية 12]:</h5>
                                        "وَلَكُمْ نِصْفُ مَا تَرَكَ أَزْوَاجُكُمْ إِن لَّمْ يَكُن لَّهُنَّ وَلَدٌ فَإِن كَانَ لَهُنَّ وَلَدٌ فَلَكُمُ الرُّبُعُ مِمَّا تَرَكْنَ..."
                                    </li>
                                </ul>
                            </div>

                            <div className="p-6 bg-slate-50 rounded-3xl space-y-4">
                                <h4 className="text-sm font-black text-slate-800 border-s-4 border-s-slate-700 ps-2">الأحوال الشخصية الكويتي (الباب الثالث)</h4>
                                <div className="space-y-3 text-xs text-slate-600 font-sans leading-relaxed">
                                    <div className="p-3.5 bg-white rounded-xl border border-slate-100">
                                        <span className="font-bold text-slate-800 block">المادة 288 [ميراث الزوج]:</span>
                                        يرث الزوج فرض النصف في حال انعدام الفرع الوارث للزوجة، ويرث السدس أو الربع في حال وجود فرع وارث مذكر أو مؤنث.
                                    </div>
                                    <div className="p-3.5 bg-white rounded-xl border border-slate-100">
                                        <span className="font-bold text-slate-800 block">المادة 291 [ميراث الأب]:</span>
                                        يكون السدس فرضاً للأب لوجود الفرع المذكر الوارث، وفي حال الخلو يرث بالتعصيب المحض.
                                    </div>
                                    <div className="p-3.5 bg-white rounded-xl border border-slate-100">
                                        <span className="font-bold text-slate-800 block">المادة 326 [حكم الرد]:</span>
                                        إذا لم توجد عصبة، يُرد الفائض من السهام الفرضية على أصحاب الفروض بقدر سهامهم، مع حجب الرد الصارم على الزوجين.
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-slate-50 rounded-3xl space-y-4">
                                <h4 className="text-sm font-black text-indigo-900 border-s-4 border-s-indigo-650 ps-2">مبادئ الإرث في المحاكم الجعفرية بالكويت</h4>
                                <div className="space-y-3 text-xs text-slate-600 font-sans leading-relaxed">
                                    <div className="p-3.5 bg-white rounded-xl border border-slate-100">
                                        <span className="font-bold text-indigo-950 block">مبدأ الطبقات المستبدلة:</span>
                                        تحجب طبقة الأبناء والوالدين بالكامل طبقة الإخوة والأخوات، ولا يرث الأخ بوجود البنت المباشرة إطلاقاً.
                                    </div>
                                    <div className="p-3.5 bg-white rounded-xl border border-slate-100">
                                        <span className="font-bold text-indigo-950 block">إبطال التعصيب الكلاسيكي:</span>
                                        لا يُقر المذهب الجعفري بتوزيع الباقي بالتعصيب لأعمام أو أبناء عم المتوفى بوجود شقيقة أو بنت، بل يُرد الفائض عليها فرضاً وقرابة.
                                    </div>
                                </div>
                            </div>

                        </div>
                    </Card>
                </div>
            )}

            {/* DYNAMIC CASE COMPARATIVE SCENARIO MODAL COMPARISON */}
            {showComparisonWidget && comparisonResult.sunni && comparisonResult.jafari && (
                <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-2xl relative border border-slate-700 animate-in slide-in-from-bottom duration-500">
                    <button 
                        onClick={() => setShowComparisonWidget(false)}
                        className="absolute top-6 left-6 text-xs bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl border border-slate-700 text-slate-300 transition-all font-black"
                    >
                        إغلاق مقارنة السيناريوهات 
                    </button>
                    
                    <div className="flex items-center gap-2 mb-6">
                        <Maximize2 className="w-5 h-5 text-emerald-500" />
                        <h4 className="text-xl font-black">تقرير محاكاة مقارنة التوزيع المذاهبي المزدوج</h4>
                    </div>
                    <p className="text-xs text-slate-400 max-w-2xl leading-relaxed mb-8">يقدم المحاكي دليلاً تناظرياً لمقارنة التركة المالية البالغة {totalEstate.toLocaleString()} د.ك (صافي التوزيع: {netEstate.toLocaleString()} د.ك) لتسهيل التقاضي الودي أو كتابة الرأي الفني للموكلين.</p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        
                        {/* SUNNI COLUMN */}
                        <div className="p-6 bg-slate-950 rounded-3xl border border-slate-800 space-y-4">
                            <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-800">
                                <span className="text-sm font-black text-slate-100">التوزيع بالمذهب السني الكويتي</span>
                                <Badge text="أصل المسألة وعولها" variant="primary" />
                            </div>
                            
                            <table className="w-full text-xs text-start">
                                <thead>
                                    <tr className="text-slate-500 border-b border-slate-800 pb-2">
                                        <th className="text-start pb-2">الوارث</th>
                                        <th className="text-start pb-2">النصيب</th>
                                        <th className="text-end pb-2">القيمة المالية الكلية</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {comparisonResult.sunni.shares.map((share, idx) => (
                                        <tr key={idx} className="border-b border-slate-900/40">
                                            <td className="py-2 text-slate-200 font-bold">{share.heirLabel}</td>
                                            <td className="py-2 text-slate-400">{share.shareLabel}</td>
                                            <td className="py-2 text-end text-emerald-400 font-bold font-mono">{share.amount.toLocaleString()} د.ك</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* JAFARI COLUMN */}
                        <div className="p-6 bg-slate-950 rounded-3xl border border-slate-800 space-y-4">
                            <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-800">
                                <span className="text-sm font-black text-slate-100">التوزيع بمبدأ الفقه الجعفري كويتيا</span>
                                <Badge text="التقسيم بالطبقات" variant="success" />
                            </div>
                            
                            <table className="w-full text-xs text-start">
                                <thead>
                                    <tr className="text-slate-500 border-b border-slate-800 pb-2">
                                        <th className="text-start pb-2">الوارث</th>
                                        <th className="text-start pb-2">الفئات والطبقة</th>
                                        <th className="text-end pb-2">المستحق المالي المباشر</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {comparisonResult.jafari.shares.map((share, idx) => (
                                        <tr key={idx} className="border-b border-slate-900/40">
                                            <td className="py-2 text-slate-200 font-bold">{share.heirLabel}</td>
                                            <td className="py-2 text-slate-400">{share.shareLabel}</td>
                                            <td className="py-2 text-end text-blue-400 font-bold font-mono">{share.amount.toLocaleString()} د.ك</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                    </div>
                    
                </div>
            )}

            {/* MODAL: REGULAR ADD HEIR */}
            <Modal
                isOpen={isAddHeirOpen}
                onClose={() => setIsAddHeirOpen(false)}
                title="إدراج وريث جديد بقائمة المورث"
                size="lg"
            >
                <div className="space-y-6">
                    <p className="text-xs text-slate-500">اختر صفة الوارث والجراب القرابي المعتمد لتنزيله بحاسبة المواريث وتطبيق القواعد الحسابية.</p>
                    
                    {/* Categories groups */}
                    {['spouse', 'descendant', 'ascendant', 'sibling', 'relative'].map(group => {
                        const filtered = HEIR_TYPES_LIST.filter(t => t.group === group);
                        const groupTitles: Record<string, string> = {
                            spouse: 'الزوجية المعتمدة',
                            descendant: 'الفرع الوارث (الأولاد والأحفاد)',
                            ascendant: 'الأصول الوارثة (الوالدان والأجداد)',
                            sibling: 'الأخوة والحواشي القريبة',
                            relative: 'العصابات والأرحام'
                        };

                        return (
                            <div key={group} className="space-y-2">
                                <h5 className="text-[10px] font-black text-slate-405 tracking-wider uppercase border-r-2 border-r-slate-400 pr-1.5">{groupTitles[group]}</h5>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {filtered.map(type => (
                                        <button
                                            key={type.id}
                                            onClick={() => {
                                                handleAddHeir(type.id);
                                                setIsAddHeirOpen(false);
                                            }}
                                            className="p-3 text-start bg-slate-50 hover:bg-emerald-55 border border-slate-100/50 hover:border-emerald-300 rounded-xl transition-all flex items-center justify-between group text-xs text-slate-700 font-bold"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span>{type.icon}</span>
                                                <span>{type.label}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Modal>

            {/* MODAL: EXCLUSIVELY STYLED PRINTABLE DOCUMENT VIEW */}
            <Modal
                isOpen={isPrintModalOpen}
                onClose={() => setIsPrintModalOpen(false)}
                title="معاينة صك حصر الإرث للطباعة"
                size="xl"
            >
                {selectedPrintCase ? (
                    <div className="space-y-6 font-sans">
                        <div className="p-4 bg-slate-100 rounded-xl text-xs text-slate-600 flex justify-between items-center sm:px-6">
                            <span>صك معتمد جاهز لإعداد مسوادات التقارير الرسمية والمستندات القضائية.</span>
                            <Button 
                                className="bg-emerald-600 text-slate-100 font-bold h-10 px-4 text-xs"
                                onClick={processBrowserPrint}
                            >
                                بدء الطباعة الفورية
                            </Button>
                        </div>

                        {/* EXQUISITE PRINT DOCUMENT CANVAS */}
                        <div 
                            id="printable-estate-document" 
                            className="p-10 bg-white border border-slate-200 rounded-3xl shadow-sm text-slate-900" 
                            style={{ fontFamily: 'Georgia, Amiri, serif', direction: 'rtl' }}
                        >
                            
                            {/* Document Head */}
                            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
                                <div className="space-y-1">
                                    <h4 className="text-xl font-bold tracking-tight text-slate-900 leading-none">مكتب الوقيان والعوضي والرويح للمحاماة</h4>
                                    <p className="text-[10px] text-slate-500">منظومة الإرساء القانوني والقضاء الشامل - دولة الكويت</p>
                                    <p className="text-[10px] text-slate-400 font-mono">تاريخ التحرير: {new Date().toLocaleDateString('ar-KW')}</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mx-auto mb-1 text-slate-100 font-bold text-lg border">
                                        ⚖
                                    </div>
                                    <span className="text-[9px] font-black uppercase text-slate-400">قسم التركات والمواريث</span>
                                </div>
                            </div>

                            {/* DOCUMENT TITLE */}
                            <div className="text-center mb-10 space-y-2">
                                <h3 className="text-2xl font-black text-slate-900">صك ومحمل حصر الإرث والأنصبة الشرعية</h3>
                                <p className="text-xs text-slate-500 font-sans">دراسة فنية وقانونية صادرة عن النظام المحوسب لقضاء التركات بالمكتب ومطابقة للقانون المحكم</p>
                            </div>

                            {/* PART 1: DESCRIPTION METADATA */}
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4 mb-8 text-xs font-sans">
                                <h4 className="text-sm font-black text-slate-800 border-s-4 border-s-slate-850 ps-2 leading-none">أولاً: بيانات المورث المتوفى والمحمل المالي الكلي للتركة</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 leading-relaxed pt-2">
                                    <div>
                                        <span className="text-slate-400 block">اسم المتوفى الكامل:</span>
                                        <span className="font-bold text-slate-800">{selectedPrintCase.deceasedName}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block">جنس المورث والوفاة:</span>
                                        <span className="font-bold text-slate-800">{selectedPrintCase.deceasedGender === 'M' ? 'ذكر' : 'أنثى'}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block">المذهب المعتمد بالتقسيم:</span>
                                        <span className="font-bold text-emerald-800">{selectedPrintCase.madhab === 'sunni' ? 'الأحوال الشخصية الكويتي (سني)' : 'الدوائر الاستئنافية الجعفرية'}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block">إجمالي القيمة الفنية للتركة:</span>
                                        <span className="font-bold text-slate-800">{selectedPrintCase.totalEstate.toLocaleString()} د.ك</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100 leading-relaxed font-sans text-xs">
                                    <div>
                                        <span className="text-slate-400 block">الديون والالتزامات المخصومة:</span>
                                        <span className="font-bold text-rose-700">{selectedPrintCase.debts.toLocaleString()} د.ك</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block">تجهيز ومصروف الكفن:</span>
                                        <span className="font-bold text-rose-700">{selectedPrintCase.funeralExpenses.toLocaleString()} د.ك</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block">قيمة صافي المواريث (للتوزيع):</span>
                                        <span className="font-bold text-emerald-700">{selectedPrintCase.netEstate.toLocaleString()} د.ك</span>
                                    </div>
                                </div>
                            </div>

                            {/* PART 2: DISTRIBUTION TABLE */}
                            <div className="space-y-4 mb-8 font-sans">
                                <h4 className="text-sm font-black text-slate-800 border-s-4 border-s-slate-850 ps-2 leading-none">ثانياً: جدول تقسيم حصص التركات والسهامية المقررة للفرقة</h4>
                                <table className="w-full text-start text-xs leading-relaxed border border-slate-200">
                                    <thead>
                                        <tr className="bg-slate-100 text-slate-755 border-b border-slate-200">
                                            <th className="py-2.5 px-3 text-start">اسم المستحق صلةً للنسب</th>
                                            <th className="py-2.5 px-3 text-start">الفرض المعتمد</th>
                                            <th className="py-2.5 px-3 text-start">النسبة المئوية</th>
                                            <th className="py-2.5 px-3 text-end">الحصة بالدينار الكويتي (صافي)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {selectedPrintCase.shares.map((s, idx) => (
                                            <tr key={idx}>
                                                <td className="py-2.5 px-3 font-bold text-slate-800">{s.heirLabel}</td>
                                                <td className="py-2.5 px-3 text-slate-500">{s.shareLabel}</td>
                                                <td className="py-2.5 px-3 font-mono">{(s.shareValue * 100).toFixed(2)}%</td>
                                                <td className="py-2.5 px-3 text-end font-bold font-mono text-slate-900">{s.amount.toLocaleString()} د.ك</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* PART 3: RECTIFICATION SHARIA/STATISTICS */}
                            {selectedPrintCase.excludedHeirs.length > 0 && (
                                <div className="space-y-4 mb-8 font-sans text-xs">
                                    <h4 className="text-sm font-black text-slate-800 border-s-4 border-s-slate-850 ps-2 leading-none">ثالثاً: ملحق كشف المحجوبين ومنطق حجب حرمانهم</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {selectedPrintCase.excludedHeirs.map((e, idx) => (
                                            <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                <span className="font-bold text-slate-800 block mb-1">{e.label} | العدد {e.count}</span>
                                                <span className="text-[10px] text-slate-500 leading-relaxed block">{e.reason}</span>
                                                <span className="text-[9px] text-rose-700 font-bold block mt-2">محجوب شرعاً بواسطة: {e.excludedBy}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* PART 4: LEGAL RULING EXPLANATORY */}
                            <div className="space-y-4 mb-10 font-sans text-xs">
                                <h4 className="text-sm font-black text-slate-800 border-s-4 border-s-slate-850 ps-2 leading-none">رابعاً: المنطوق التقني والتوجيه الشرعي</h4>
                                <p className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-slate-700 leading-relaxed text-xs">
                                    {selectedPrintCase.advisoryText}
                                </p>
                            </div>

                            {/* SIGNATURES & OFFICIAL SEAL STAMP */}
                            <div className="flex justify-between items-center border-t border-slate-200 pt-8 text-xs font-sans leading-relaxed text-slate-500">
                                <div>
                                    <span className="block font-bold text-slate-700">توقيع المستشار الفني والمصادقة:</span>
                                    <span className="block mt-1 font-mono">قسم المواريث والودائع الشرعية بالمكتب</span>
                                    <div className="h-10 mt-2 text-indigo-700 font-script font-bold text-base italic opacity-50">
                                        Wagayan & Partners
                                    </div>
                                </div>
                                <div className="text-center">
                                    <span className="block font-bold text-slate-700 mb-2">ختم المكتب واعتماده:</span>
                                    <div className="w-16 h-16 rounded-full border-4 border-slate-400 bg-slate-100/50 flex items-center justify-center border-dashed font-black text-[10px] text-slate-400 text-center select-none rotate-12 mx-auto leading-tight">
                                        محامو الأدلة <br /> مكرر
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                ) : null}
            </Modal>

        </div>
    );
};

export default InheritanceCalculatorPage;
