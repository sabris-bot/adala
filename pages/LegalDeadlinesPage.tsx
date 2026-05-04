import React, { useState, useMemo } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { 
    ClockIcon, InformationCircleIcon, BookOpenIcon, ScaleIcon, GavelIcon, 
    PrinterIcon, ArrowPathIcon, PlusCircleIcon, TrashIcon, FolderIcon,
    CheckCircleIcon, LightBulbIcon, BriefcaseIcon, BuildingLibraryIcon,
    HomeIcon, UsersIcon, BellAlertIcon, PencilIcon
} from '../constants';
import { initialCases } from '../data/caseData'; 
import { Case } from '../types';

// --- Types & Constants ---

interface Procedure {
    id: string;
    label: string;
    days: number;
    reference: string;
    category: string;
}

interface TrackedDeadline {
    id: string;
    caseName: string;
    caseNumber?: string;
    procedureName: string;
    eventDate: string;
    deadlineDate: string;
    notes: string;
    daysRemaining: number;
}

const KUWAIT_LEGAL_PROCEDURES: Procedure[] = [
    // Civil / Commercial (قانون المرافعات)
    { id: 'civil_appeal', label: 'استئناف حكم (مدني/تجاري)', days: 30, reference: 'مادة 129 مرافعات', category: 'مدني/تجاري' },
    { id: 'civil_urgent_appeal', label: 'استئناف حكم (مستعجل)', days: 15, reference: 'مادة 129 مرافعات', category: 'مدني/تجاري' },
    { id: 'civil_cassation', label: 'طعن بالتمييز (مدني/تجاري)', days: 60, reference: 'مادة 152 مرافعات', category: 'مدني/تجاري' },
    { id: 'civil_opposition', label: 'معارضة في حكم غيابي (مدني)', days: 8, reference: 'مادة 188 مرافعات', category: 'مدني/تجاري' },
    { id: 'civil_grievance_order', label: 'تظلم من أمر على عريضة', days: 10, reference: 'مادة 163 مرافعات', category: 'مدني/تجاري' },
    { id: 'civil_retrial', label: 'التماس إعادة النظر', days: 30, reference: 'مادة 149 مرافعات', category: 'مدني/تجاري' },
    { id: 'civil_grievance_performance', label: 'تظلم من أمر أداء', days: 10, reference: 'مادة 168 مرافعات', category: 'مدني/تجاري' },
    
    // Penal (قانون الإجراءات والمحاكمات الجزائية)
    { id: 'penal_appeal', label: 'استئناف حكم (جزائي)', days: 20, reference: 'مادة 202 إجراءات', category: 'جزائي' },
    { id: 'penal_cassation', label: 'تمييز حكم (جزائي)', days: 60, reference: 'قانون حالات الطعن بالتمييز', category: 'جزائي' },
    { id: 'penal_opposition', label: 'معارضة في حكم غيابي (جزائي)', days: 7, reference: 'مادة 188 إجراءات', category: 'جزائي' },
    
    // Family (قانون محكمة الأسرة)
    { id: 'family_appeal', label: 'استئناف حكم أسرة', days: 30, reference: 'قانون محكمة الأسرة', category: 'أسرة' },
    { id: 'family_cassation', label: 'تمييز حكم أسرة', days: 30, reference: 'قانون محكمة الأسرة', category: 'أسرة' },
    
    // Admin (القضاء الإداري)
    { id: 'admin_grievance', label: 'تظلم إداري (قبل الدعوى)', days: 60, reference: 'قانون الدائرة الإدارية', category: 'إداري' },
    { id: 'admin_suit', label: 'دعوى إلغاء قرار إداري', days: 60, reference: 'مادة 7 قانون 20/1981', category: 'إداري' },
    { id: 'admin_appeal', label: 'استئناف حكم إداري', days: 30, reference: 'قانون الدائرة الإدارية', category: 'إداري' },
    
    // Labor (قانون العمل)
    { id: 'labor_grievance', label: 'تظلم من جزاء تأديبي', days: 7, reference: 'مادة 116 قانون العمل', category: 'عمالي' },
    { id: 'labor_appeal', label: 'استئناف حكم عمالي', days: 30, reference: 'قانون المرافعات', category: 'عمالي' },
    
    // Rental (قانون الإيجارات)
    { id: 'rental_appeal', label: 'استئناف حكم إيجارات', days: 15, reference: 'مادة 26 مكرر قانون الإيجارات', category: 'إيجارات' },
];

const KUWAIT_HOLIDAYS: Record<number, { month: number; day: number; description: string }[]> = {
    2024: [
        { month: 1, day: 1, description: "رأس السنة الميلادية" },
        { month: 2, day: 8, description: "الإسراء والمعراج" },
        { month: 2, day: 25, description: "اليوم الوطني" },
        { month: 2, day: 26, description: "يوم التحرير" },
        { month: 4, day: 9, description: "عيد الفطر (تقريبي)" },
        { month: 4, day: 10, description: "عيد الفطر (تقريبي)" },
        { month: 4, day: 11, description: "عيد الفطر (تقريبي)" },
        { month: 6, day: 15, description: "وقفة عرفات (تقريبي)" },
        { month: 6, day: 16, description: "عيد الأضحى (تقريبي)" },
        { month: 6, day: 17, description: "عيد الأضحى (تقريبي)" },
        { month: 6, day: 18, description: "عيد الأضحى (تقريبي)" },
        { month: 7, day: 7, description: "رأس السنة الهجرية" },
        { month: 9, day: 15, description: "المولد النبوي" },
    ],
    2025: [
        { month: 1, day: 1, description: "رأس السنة الميلادية" },
        { month: 1, day: 27, description: "الإسراء والمعراج" },
        { month: 2, day: 25, description: "اليوم الوطني" },
        { month: 2, day: 26, description: "يوم التحرير" },
        { month: 3, day: 31, description: "عيد الفطر (تقريبي)" },
        { month: 4, day: 1, description: "عيد الفطر (تقريبي)" },
        { month: 4, day: 2, description: "عيد الفطر (تقريبي)" },
        { month: 6, day: 6, description: "وقفة عرفات (تقريبي)" },
        { month: 6, day: 7, description: "عيد الأضحى (تقريبي)" },
        { month: 6, day: 8, description: "عيد الأضحى (تقريبي)" },
        { month: 6, day: 26, description: "رأس السنة الهجرية" },
        { month: 9, day: 4, description: "المولد النبوي" },
    ],
    2026: [
        { month: 1, day: 1, description: "رأس السنة الميلادية" },
        { month: 2, day: 25, description: "اليوم الوطني" },
        { month: 2, day: 26, description: "يوم التحرير" },
        { month: 3, day: 20, description: "عيد الفطر (تقريبي)" },
        { month: 5, day: 27, description: "عيد الأضحى (تقريبي)" },
    ],
};

const isHoliday = (date: Date): string | null => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; 
    const day = date.getDate();
    return KUWAIT_HOLIDAYS[year]?.find(h => h.month === month && h.day === day)?.description || null;
};

const isWeekend = (date: Date): boolean => {
    const dayOfWeek = date.getDay(); 
    return dayOfWeek === 5 || dayOfWeek === 6; 
};

const formatDateFull = (date: Date): string => {
    return date.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

const LegalDeadlinesPage: React.FC = () => {
    const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [distance, setDistance] = useState<number>(0);
    const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedProcedureId, setSelectedProcedureId] = useState<string>('all');
    const [customDays, setCustomDays] = useState<number>(0);
    const [relatedCaseTitle, setRelatedCaseTitle] = useState('');
    const [relatedCaseNumber, setRelatedCaseNumber] = useState('');
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [trackedDeadlines, setTrackedDeadlines] = useState<TrackedDeadline[]>([]);

    const categories = ['الكل', ...new Set(KUWAIT_LEGAL_PROCEDURES.map(p => p.category))];

    const calculateDeadlines = (judgmentDateStr: string) => {
        if (!judgmentDateStr) return [];
        
        let procedures = [...KUWAIT_LEGAL_PROCEDURES];
        
        if (customDays > 0) {
            procedures.unshift({
                id: 'custom',
                label: `ميعاد مخصص (${customDays} يوماً)`,
                days: customDays,
                reference: 'حسب طلب المستخدم',
                category: 'مخصص'
            });
        }

        const filtered = procedures.filter(p => {
            const matchesCategory = selectedCategory === 'الكل' || p.category === selectedCategory || p.id === 'custom';
            const matchesSearch = p.label.includes(searchQuery) || p.reference.includes(searchQuery);
            const matchesId = selectedProcedureId === 'all' || p.id === selectedProcedureId || p.id === 'custom';
            return matchesCategory && matchesSearch && matchesId;
        });

        return filtered.map(proc => {
            let currentDate = new Date(judgmentDateStr);
            const breakdown: { title: string; date: string; icon: any; note?: string }[] = [];
            
            // Step 1: Judgment Date
            breakdown.push({ title: 'تاريخ صدور الحكم/الواقعة', date: formatDateFull(currentDate), icon: <GavelIcon className="w-4 h-4"/> });
            
            // Step 2: Start counting from next day (Art 17)
            currentDate.setDate(currentDate.getDate() + 1);
            breakdown.push({ title: 'بدء الميعاد (اليوم التالي - مادة 17)', date: formatDateFull(currentDate), icon: <ArrowPathIcon className="w-4 h-4"/> });
            
            // Step 3: Add basic days
            currentDate.setDate(currentDate.getDate() + proc.days - 1); // Subtract 1 because we already moved to next day which is day 1
            breakdown.push({ title: `إضافة مدة الميعاد القانوني (${proc.days} يوماً)`, date: formatDateFull(currentDate), icon: <ClockIcon className="w-4 h-4"/> });
            
            // Step 4: Add Distance (Art 16) - 1 day per 50km
            if (distance > 0) {
                const distanceDays = Math.ceil(distance / 50);
                currentDate.setDate(currentDate.getDate() + distanceDays);
                breakdown.push({ title: `إضافة ميعاد المسافة (${distance} كم = ${distanceDays} يوم)`, date: formatDateFull(currentDate), icon: <HomeIcon className="w-4 h-4"/> });
            }
            
            // Step 5: Handle weekend/holiday extension (Art 18)
            let extensionApplied = false;
            while (isWeekend(currentDate) || isHoliday(currentDate)) {
                const cause = isHoliday(currentDate) || (currentDate.getDay() === 5 ? 'عطلة الجمعة' : 'عطلة السبت');
                currentDate.setDate(currentDate.getDate() + 1);
                if (!extensionApplied) {
                    breakdown.push({ title: `امتداد قانوني (مادة 18) بسبب: ${cause}`, date: formatDateFull(currentDate), icon: <InformationCircleIcon className="w-4 h-4 text-orange-500"/> });
                    extensionApplied = true;
                } else {
                    // Update the last entry or add a note
                    breakdown[breakdown.length - 1].date = formatDateFull(currentDate);
                }
            }

            const diff = currentDate.getTime() - new Date().getTime();
            const daysRem = Math.ceil(diff / (1000 * 60 * 60 * 24));

            return {
                ...proc,
                finalDate: formatDateFull(currentDate),
                rawFinalDate: currentDate.toISOString().split('T')[0],
                breakdown,
                daysRemaining: daysRem,
                isExpired: daysRem < 0
            };
        });
    };

    const results = useMemo(() => calculateDeadlines(startDate), [startDate, distance, selectedCategory, customDays, searchQuery, selectedProcedureId]);

    const handleSave = (res: any) => {
        setTrackedDeadlines(prev => [...prev, {
            id: `dl-${Date.now()}`,
            caseName: relatedCaseTitle || 'بدون عنوان',
            caseNumber: relatedCaseNumber,
            procedureName: res.label,
            eventDate: startDate,
            deadlineDate: res.rawFinalDate,
            notes: res.breakdown.map((b: any) => `${b.title}: ${b.date}`).join('\n'),
            daysRemaining: res.daysRemaining
        }]);
        alert(`تم حفظ ميعاد ${res.label} في سجل المتابعة.`);
    };

    const handleImport = (c: Case) => {
        setRelatedCaseTitle(c.title);
        setRelatedCaseNumber(c.caseNumber);
        if (c.judgmentDate) setStartDate(c.judgmentDate);
        setIsImportModalOpen(false);
    };

    const [selectedReport, setSelectedReport] = useState<any>(null);

    const availableProcedures = useMemo(() => {
        return KUWAIT_LEGAL_PROCEDURES.filter(p => selectedCategory === 'الكل' || p.category === selectedCategory);
    }, [selectedCategory]);

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-dm-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 no-print">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-2xl">
                        <ScaleIcon className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">نظام حصاد المواعيد القانونية</h1>
                        <p className="text-sm text-gray-500">حاسبة ذكية وحافظة مواعيد متكاملة (تحديث 2026)</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setIsImportModalOpen(true)} variant="outline" leftIcon={<FolderIcon className="w-5 h-5"/>}>استيراد ميعاد</Button>
                    <Button onClick={() => window.print()} variant="primary" leftIcon={<PrinterIcon className="w-5 h-5"/>}>طباعة التقرير</Button>
                </div>
            </div>

            {/* Category Tabs & Quick Search */}
            <div className="space-y-4 no-print">
                <div className="flex flex-wrap gap-2 bg-gray-50 dark:bg-gray-800/20 p-2 rounded-2xl border border-gray-100 dark:border-gray-800">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => {
                                setSelectedCategory(cat);
                                setSelectedProcedureId('all'); // Reset specific selection when category changes
                            }}
                            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                                selectedCategory === cat 
                                ? 'bg-primary text-white shadow-md shadow-primary/20' 
                                : 'bg-white dark:bg-dm-card text-gray-500 hover:text-primary border border-gray-100 dark:border-gray-800'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <ClockIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                            value={selectedProcedureId}
                            onChange={(e) => setSelectedProcedureId(e.target.value)}
                            className="block w-full pr-10 pl-3 py-3 text-sm border-gray-200 dark:border-gray-700 bg-white dark:bg-dm-card rounded-xl focus:ring-primary focus:border-primary transition-all font-bold"
                        >
                            <option value="all">عرض كافة مواعيد هذا القسم</option>
                            {availableProcedures.map(p => (
                                <option key={p.id} value={p.id}>{p.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <PlusCircleIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="بحث سريع في المواعيد أو المواد القانونية..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pr-10 pl-3 py-3 text-sm border-gray-200 dark:border-gray-700 bg-white dark:bg-dm-card rounded-xl focus:ring-primary focus:border-primary transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Input */}
                <div className="lg:col-span-4 space-y-6 no-print">
                    <Card className="border-none shadow-md overflow-hidden">
                        <div className="bg-primary p-4 text-white">
                            <h2 className="font-bold flex items-center gap-2"><PencilIcon className="w-5 h-5"/> معايير الحساب</h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <Input 
                                label="تاريخ الواقعة / صدور الحكم" 
                                type="date" 
                                value={startDate} 
                                onChange={e => setStartDate(e.target.value)}
                                className="!border-gray-200"
                                helperText="سيتم بدء الحساب من اليوم التالي (مادة 17)"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <Input 
                                    label="مدد إضافية (مخصص)" 
                                    type="number" 
                                    value={customDays.toString()} 
                                    onChange={e => setCustomDays(parseInt(e.target.value) || 0)}
                                    placeholder="أيام.."
                                />
                                <Input 
                                    label="ميعاد المسافة (كم)" 
                                    type="number" 
                                    value={distance.toString()} 
                                    onChange={e => setDistance(parseInt(e.target.value) || 0)}
                                    placeholder="كم.."
                                />
                            </div>
                            {relatedCaseTitle && (
                                <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-lg shadow-sm">
                                            <BriefcaseIcon className="w-4 h-4 text-primary"/>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">القضية الحالية</p>
                                            <p className="text-xs font-bold text-gray-800">{relatedCaseTitle}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    <Card title="الأحكام القانونية المعتمدة" icon={<BookOpenIcon className="w-5 h-5 text-primary"/>}>
                        <div className="space-y-4 text-xs">
                            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-r-4 border-primary">
                                <p className="font-bold text-gray-800 dark:text-gray-200 mb-1">المادة 17 مرافعات:</p>
                                <p className="text-gray-500">لا يحسب يوم الإعلان أو صدور الحكم ضمن الميعاد.</p>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-r-4 border-orange-400">
                                <p className="font-bold text-gray-800 dark:text-gray-200 mb-1">المادة 18 مرافعات:</p>
                                <p className="text-gray-500">إذا صادف آخر الميعاد عطلة رسمية امتد إلى أول يوم عمل بعدها.</p>
                            </div>
                            <div className="flex items-center gap-2 p-3 text-primary-dark font-bold bg-primary/5 rounded-lg">
                                <LightBulbIcon className="w-4 h-4"/>
                                يتم تحديث العطلات الرسمية آلياً
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right: Results Timeline */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between no-print">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-tertiary">المواعيد القانونية المستخرجة</h2>
                        <span className="text-[10px] font-mono text-gray-400 uppercase">Automatic Calculation Based on Law 38/1980</span>
                    </div>

                    <div className="space-y-4">
                        {results.map((res, idx) => (
                            <div key={idx} className="bg-white dark:bg-dm-card rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden group hover:border-primary/30 transition-all duration-300">
                                <div className="p-5 flex flex-col md:flex-row gap-6">
                                    {/* Left Info */}
                                    <div className="md:w-1/3 border-l-0 md:border-l border-gray-100 dark:border-gray-800 pr-0 md:pr-4 flex flex-col justify-between">
                                        <div>
                                            <span className="text-[8px] font-black uppercase text-accent-dark px-2 py-0.5 bg-accent/10 rounded-full">{res.category}</span>
                                            <h3 className="text-lg font-black text-gray-800 dark:text-white mt-1">{res.label}</h3>
                                            <p className="text-[10px] text-gray-400 mt-0.5">{res.reference}</p>
                                        </div>
                                        <div className="mt-4">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-2xl font-black text-primary">{res.days}</span>
                                                <span className="text-[10px] font-bold text-gray-400 italic">يوم ميعاد</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Center: Calculation Process (The specific request field) */}
                                    <div className="md:w-1/2">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                                            <ArrowPathIcon className="w-3 h-3"/> تفاصيل خوارزمية الحساب
                                        </p>
                                        <div className="space-y-3">
                                            {res.breakdown.map((step: any, sIdx: number) => (
                                                <div key={sIdx} className="flex items-start gap-2 relative">
                                                    {sIdx < res.breakdown.length - 1 && (
                                                        <div className="absolute top-5 right-2 w-px h-4 bg-gray-200"></div>
                                                    )}
                                                    <div className="w-4 h-4 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 z-10">
                                                        {step.icon}
                                                    </div>
                                                    <div className="text-[11px]">
                                                        <span className="text-gray-500">{step.title}: </span>
                                                        <span className="font-bold text-gray-800 dark:text-gray-200">{step.date}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Right: Final Result */}
                                    <div className="md:w-1/4 flex flex-col justify-center items-center bg-gray-50 dark:bg-gray-800/20 rounded-xl p-4 border border-gray-100 dark:border-gray-700/50">
                                        <p className="text-[10px] font-bold text-gray-400 mb-1">الموعد النهائي</p>
                                        <p className={`text-xl font-black text-center ${res.isExpired ? 'text-red-500' : 'text-primary-dark dark:text-primary-light'}`}>
                                            {res.finalDate}
                                        </p>
                                        <div className="mt-3 w-full space-y-2">
                                            <div className={`text-[10px] font-bold py-1 px-3 rounded-full text-center ${res.isExpired ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                                {res.isExpired ? 'انتهى الميعاد' : `متبقي ${res.daysRemaining} يوم`}
                                            </div>
                                            <div className="flex gap-2 w-full">
                                                <Button 
                                                    fullWidth 
                                                    size="sm" 
                                                    variant="secondary" 
                                                    className="no-print !text-[10px]" 
                                                    onClick={() => setSelectedReport(res)}
                                                    leftIcon={<PrinterIcon className="w-3 h-3"/>}
                                                >
                                                    تقرير مطبوع
                                                </Button>
                                                <Button 
                                                    fullWidth 
                                                    size="sm" 
                                                    variant="ghost" 
                                                    className="no-print !text-[10px]" 
                                                    onClick={() => handleSave(res)}
                                                    leftIcon={<PlusCircleIcon className="w-3 h-3"/>}
                                                >
                                                    حفظ
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tracking List */}
            <Card title="سجل المواعيد قيد المتابعة" icon={<BellAlertIcon className="w-5 h-5 text-red-500"/>} className="no-print">
                {trackedDeadlines.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                            <thead className="bg-gray-50 text-gray-400"><tr className="border-b">
                                <th className="py-3 px-4">القضية</th>
                                <th className="py-3 px-4">الإجراء</th>
                                <th className="py-3 px-4">تاريخ الاستحقاق</th>
                                <th className="py-3 px-4 text-center">المتبقي</th>
                                <th className="py-3 px-4 text-center">حذف</th>
                            </tr></thead>
                            <tbody>{trackedDeadlines.map(d => (
                                <tr key={d.id} className="border-b transition-colors hover:bg-gray-50/50">
                                    <td className="py-4 px-4 font-bold">{d.caseName}</td>
                                    <td className="py-4 px-4">{d.procedureName}</td>
                                    <td className="py-4 px-4 font-black">{new Date(d.deadlineDate).toLocaleDateString('ar-EG')}</td>
                                    <td className="py-4 px-4 text-center">
                                        <span className={`px-2 py-0.5 rounded-full font-bold ${d.daysRemaining <= 3 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                            {d.daysRemaining} يوم
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        <Button size="sm" variant="ghost" onClick={() => setTrackedDeadlines(prev => prev.filter(x => x.id !== d.id))}>
                                            <TrashIcon className="w-4 h-4 text-red-400"/>
                                        </Button>
                                    </td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-10 text-gray-400 italic">لا توجد مواعيد محفوظة للمتابعة</div>
                )}
            </Card>

            <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="استيراد بيانات القضية" size="lg">
                <div className="grid gap-3 pt-2">
                    {initialCases.slice(0, 5).map(c => (
                        <div 
                            key={c.id} 
                            onClick={() => handleImport(c)} 
                            className="p-4 border rounded-2xl hover:bg-primary/5 cursor-pointer flex justify-between items-center group transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-primary/10 transition-colors">
                                    <BriefcaseIcon className="w-5 h-5 text-gray-400 group-hover:text-primary"/>
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-gray-800 dark:text-white">{c.title}</p>
                                    <p className="text-[10px] text-gray-500">{c.caseNumber} • {c.courtLevel}</p>
                                </div>
                            </div>
                            <ArrowPathIcon className="w-5 h-5 text-gray-200 group-hover:text-primary"/>
                        </div>
                    ))}
                </div>
            </Modal>

            {/* Legal Report Print Modal */}
            <Modal 
                isOpen={!!selectedReport} 
                onClose={() => setSelectedReport(null)} 
                title="معاينة التقرير القانوني" 
                size="lg"
            >
                {selectedReport && (
                    <div className="space-y-6">
                        <div id="legal-print-area" className="p-10 bg-white text-black border border-gray-200 rounded-lg shadow-sm">
                            {/* Watermark/Header for Print */}
                            <div className="border-b-2 border-primary pb-4 mb-6 flex justify-between items-center">
                                <div className="text-right">
                                    <h2 className="text-xl font-bold text-gray-900">تقرير احتساب ميعاد قانوني</h2>
                                    <p className="text-xs text-gray-500">منظومة عدالة للإدارة القانونية - الكويت</p>
                                </div>
                                <ScaleIcon className="w-10 h-10 text-primary opacity-50" />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
                                <div>
                                    <p className="font-bold text-gray-400 text-[10px] uppercase">بيانات القضية/الواقعة</p>
                                    <p className="text-lg font-bold">{relatedCaseTitle || 'طلب استشاري'}</p>
                                    <p className="text-xs text-gray-600">{relatedCaseNumber || '---'}</p>
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-gray-400 text-[10px] uppercase">تاريخ التقرير</p>
                                    <p className="font-bold">{new Date().toLocaleDateString('ar-EG')}</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl mb-6 border-r-4 border-primary">
                                <h3 className="font-bold text-gray-800 mb-1">{selectedReport.label}</h3>
                                <p className="text-xs text-gray-500">المرجع القانوني: {selectedReport.reference}</p>
                            </div>

                            <div className="space-y-4 mb-8">
                                <h4 className="text-xs font-bold text-gray-400 uppercase border-b pb-1">خوارزمية الاحتساب (التفاصيل القانونية)</h4>
                                {selectedReport.breakdown.map((step: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                                        <span className="text-gray-600">{step.title}</span>
                                        <span className="font-bold">{step.date}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col items-center justify-center p-6 bg-primary/5 rounded-2xl border-2 border-dashed border-primary/20">
                                <p className="text-xs text-gray-500 mb-1 font-bold">الموعد النهائي القانوني (سقوط الحق)</p>
                                <p className="text-3xl font-black text-primary">{selectedReport.finalDate}</p>
                            </div>

                            <div className="mt-10 text-[9px] text-gray-400 text-center italic">
                                * تم هذا الاحتساب آلياً وفقاً لمواد قانون المرافعات الكويتي (16، 17، 18).
                                يرجى مراجعة التقويم الرسمي المعتمد من وزارة العدل للتأكد من مواعيد الإجازات الرسمية الطارئة.
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 no-print">
                            <Button variant="outline" onClick={() => setSelectedReport(null)}>إلغاء</Button>
                            <Button 
                                variant="primary" 
                                leftIcon={<PrinterIcon className="w-5 h-5"/>}
                                onClick={() => {
                                    const printContents = document.getElementById('legal-print-area')?.innerHTML;
                                    const originalContents = document.body.innerHTML;
                                    document.body.innerHTML = printContents || '';
                                    window.print();
                                    document.body.innerHTML = originalContents;
                                    window.location.reload(); // Reload to restore React state
                                }}
                            >
                                طباعة الآن
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default LegalDeadlinesPage;
