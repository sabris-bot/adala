
import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import TextArea from '../components/ui/TextArea';
import { initialCases } from '../data/caseData';
import { 
    CalculatorIcon, 
    InformationCircleIcon, 
    ScaleIcon, 
    PrinterIcon,
    ArrowPathIcon,
    BanknotesIcon,
    CalendarDaysIcon,
    BriefcaseIcon,
    MagnifyingGlassIcon,
    DocumentTextIcon
} from '../constants';
import { useJurisdiction } from '../components/JurisdictionContext';

type InterestType = 'commercial' | 'civil' | 'bank_discount' | 'custom';
type YearBasis = '365' | '360' | '366';

const LegalInterestCalculatorPage: React.FC = () => {
    const { selectedJurisdiction } = useJurisdiction();
    const [amount, setAmount] = useState<number>(0);
    const [interestType, setInterestType] = useState<InterestType>('commercial');
    const [customRate, setCustomRate] = useState<number>(0);
    const [marginRate, setMarginRate] = useState<number>(0);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [yearBasis, setYearBasis] = useState<YearBasis>('365');
    const [includeAttorneyFees, setIncludeAttorneyFees] = useState<boolean>(false);
    const [judgmentText, setJudgmentText] = useState<string>('');
    const [evidenceNotes, setEvidenceNotes] = useState<string>('');
    const [caseTitle, setCaseTitle] = useState<string>('');
    
    // Import Modal State
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importSearch, setImportSearch] = useState('');
    
    const [result, setResult] = useState<{
        caseLabel: string;
        interestAmount: number;
        attorneyFees: number;
        totalAmount: number;
        days: number;
        years: number;
        rate: number;
        isCapped: boolean;
        judgmentText?: string;
        evidenceNotes?: string;
    } | null>(null);

    const interestOptions = [
        { value: 'commercial', label: `فائدة تجارية ثابتة (${selectedJurisdiction.legalInterest.commercialRate}%)`, details: 'تطبق على الديون التجارية' },
        { value: 'civil', label: `فائدة مدنية ثابتة (${selectedJurisdiction.legalInterest.civilRate}%)`, details: 'تطبق على الديون المدنية' },
        { value: 'bank_discount', label: `سعر الخصم المركزي + هامش`, details: 'يتغير حسب قرارات البنك المركزي' },
        { value: 'custom', label: 'نسبة مخصصة (%)', details: 'إدخال يدوي لنسبة متفق عليها' },
    ];

    const yearBasisOptions = [
        { value: '365', label: 'سنة بسيطة (365 يوم)' },
        { value: '360', label: 'سنة تجارية (360 يوم)' },
        { value: '366', label: 'سنة كبيسة (366 يوم)' },
    ];

    const currentDiscountRate = selectedJurisdiction.code === 'KW' ? 4.25 : 3.00;

    const filteredCases = initialCases.filter(c => 
        c.title.includes(importSearch) || c.caseNumber.includes(importSearch)
    );

    const handleImportCase = (caseObj: any) => {
        setCaseTitle(caseObj.title);
        if (caseObj.budget) setAmount(caseObj.budget);
        setIsImportModalOpen(false);
    };

    const calculateInterest = () => {
        if (!amount || !startDate || !endDate) return;

        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = end.getTime() - start.getTime();
        
        if (diffTime < 0) return;

        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const basis = parseInt(yearBasis);
        const diffYears = diffDays / basis;

        let rate = selectedJurisdiction.legalInterest.commercialRate;
        if (interestType === 'civil') rate = selectedJurisdiction.legalInterest.civilRate;
        else if (interestType === 'bank_discount') rate = currentDiscountRate + marginRate;
        else if (interestType === 'custom') rate = customRate;

        let interestAmount = amount * (rate / 100) * diffYears;
        let isCapped = false;

        // Capped logic based on jurisdiction
        if (selectedJurisdiction.legalInterest.isCappedAtPrincipal && interestAmount > amount) {
            interestAmount = amount;
            isCapped = true;
        }

        let attorneyFees = 0;
        if (includeAttorneyFees) {
            const percent = selectedJurisdiction.legalInterest.defaultAttorneyFeesPercent || 0;
            const min = selectedJurisdiction.legalInterest.defaultAttorneyFeesMin || 0;
            attorneyFees = Math.max(min, interestAmount * (percent / 100));
        }

        const totalAmount = amount + interestAmount + attorneyFees;

        setResult({
            caseLabel: caseTitle || 'طلب احتساب عام',
            interestAmount,
            attorneyFees,
            totalAmount,
            days: diffDays,
            years: diffYears,
            rate,
            isCapped,
            judgmentText,
            evidenceNotes
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center me-4">
                        <BanknotesIcon className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-DM-Text-Primary">حاسبة الفوائد القانونية - {selectedJurisdiction.name}</h1>
                        <p className="text-sm text-gray-500">حسب القوانين والأنظمة في {selectedJurisdiction.name}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        leftIcon={<BriefcaseIcon className="w-4"/>} 
                        onClick={() => setIsImportModalOpen(true)}
                    >
                        استيراد قضية
                    </Button>
                    <Button variant="outline" size="sm" leftIcon={<PrinterIcon className="w-4"/>} onClick={() => window.print()}>
                        طباعة
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card title="بيانات المديونية" icon={<CalculatorIcon className="w-5 h-5 text-primary"/>}>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input 
                                    label="مسمى المديونية / القضية" 
                                    value={caseTitle} 
                                    onChange={(e) => setCaseTitle(e.target.value)} 
                                    placeholder="مثلاً: مطالبة شركة (أ) ضد (ب)"
                                />
                                <Input 
                                    label={`المبلغ الأصلي (${selectedJurisdiction.currencySymbol})`} 
                                    type="number" 
                                    value={amount.toString()} 
                                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)} 
                                    placeholder="أدخل مبلغ الدين"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Select 
                                    label="نوع الفائدة القانونية" 
                                    options={interestOptions} 
                                    value={interestType} 
                                    onChange={(e) => setInterestType(e.target.value as InterestType)} 
                                />
                                <Select 
                                    label="طريقة حساب السنة" 
                                    options={yearBasisOptions} 
                                    value={yearBasis} 
                                    onChange={(e) => setYearBasis(e.target.value as YearBasis)} 
                                />
                            </div>

                            <div className="p-4 bg-gray-50 dark:bg-dm-background rounded-xl border border-gray-100 dark:border-gray-800">
                                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                    <InformationCircleIcon className="w-4 h-4 inline-block me-1 text-primary-light" />
                                    {interestOptions.find(o => o.value === interestType)?.details}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {interestType === 'bank_discount' && (
                                    <Input 
                                        label="الهامش الإضافي (x%)" 
                                        type="number" 
                                        value={marginRate.toString()} 
                                        onChange={(e) => setMarginRate(parseFloat(e.target.value) || 0)} 
                                        placeholder="مثلاً: 1.0"
                                    />
                                )}
                                {interestType === 'custom' && (
                                    <Input 
                                        label="النسبة المتفق عليها (%)" 
                                        type="number" 
                                        value={customRate.toString()} 
                                        onChange={(e) => setCustomRate(parseFloat(e.target.value) || 0)} 
                                        placeholder="أدخل النسبة"
                                    />
                                )}
                                <Input 
                                    label="تاريخ الاستحقاق (البدء)" 
                                    type="date" 
                                    value={startDate} 
                                    onChange={(e) => setStartDate(e.target.value)} 
                                />
                                <Input 
                                    label="تاريخ السداد (النهاية)" 
                                    type="date" 
                                    value={endDate} 
                                    onChange={(e) => setEndDate(e.target.value)} 
                                />
                            </div>

                            <div className="space-y-4">
                                <TextArea 
                                    label="منطوق الحكم / مبررات الحسبة"
                                    placeholder="أدخل نص الحكم الصادر بالفوائد أو أي ملاحظات قانونية إضافية..."
                                    value={judgmentText}
                                    onChange={(e) => setJudgmentText(e.target.value)}
                                    rows={3}
                                />
                                <Input 
                                    label="دليل الحسبة / المادة القانونية المستند إليها"
                                    placeholder="مثلاً: مادة 110 تجاري كويتي..."
                                    value={evidenceNotes}
                                    onChange={(e) => setEvidenceNotes(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/10">
                                <input 
                                    type="checkbox" 
                                    id="attorney_fees" 
                                    className="w-4 h-4 text-primary rounded"
                                    checked={includeAttorneyFees}
                                    onChange={(e) => setIncludeAttorneyFees(e.target.checked)}
                                />
                                <label htmlFor="attorney_fees" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                    إدراج تقدير أتعاب المحاماة (وفقاً للمرسوم 78/2025)
                                </label>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col sm:flex-row gap-3">
                            <Button 
                                onClick={calculateInterest} 
                                size="lg" 
                                className="flex-1"
                                leftIcon={<CalculatorIcon className="w-5 h-5"/>}
                            >
                                احسب الفوائد المستحقة
                            </Button>
                            <Button 
                                variant="ghost" 
                                onClick={() => {
                                    setAmount(0);
                                    setResult(null);
                                    setStartDate('');
                                }}
                                leftIcon={<ArrowPathIcon className="w-5 h-5"/>}
                            >
                                إعادة ضبط
                            </Button>
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                    {result ? (
                        <Card title="ملخص الحساب" className="border-primary/20 sticky top-6">
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">القضية:</span>
                                        <span className="font-bold text-gray-900 dark:text-DM-Text-Primary truncate max-w-[150px]">{result.caseLabel}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">مدة التأخير:</span>
                                        <span className="font-bold text-gray-900 dark:text-DM-Text-Primary">{result.days} يوم</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">النسبة المطبقة:</span>
                                        <span className="font-bold text-primary">{result.rate}% سنوي</span>
                                    </div>
                                </div>

                                {result.judgmentText && (
                                    <div className="p-3 bg-gray-50 dark:bg-dm-background rounded-xl border border-gray-100 dark:border-gray-800">
                                        <p className="text-[10px] font-bold text-gray-400 mb-1">منطوق الحكم / الملاحظات:</p>
                                        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed italic">{result.judgmentText}</p>
                                    </div>
                                )}

                                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 text-center">
                                    <p className="text-xs text-primary mb-1 uppercase font-bold tracking-wider">مبلغ الفوائد</p>
                                    <p className="text-3xl font-black text-primary">{result.interestAmount.toFixed(3)} <span className="text-sm font-normal">{selectedJurisdiction.currencySymbol}</span></p>
                                    {result.isCapped && (
                                        <p className="text-[10px] text-red-500 mt-2 font-bold leading-tight">
                                            (تم الوصول للحد الأقصى - الفائدة تساوت مع أصل الدين)
                                        </p>
                                    )}
                                </div>

                                {result.attorneyFees > 0 && (
                                    <div className="p-3 bg-amber-50 dark:bg-dm-card/50 rounded-xl border border-amber-100 dark:border-amber-900/30 text-center">
                                        <p className="text-[10px] text-amber-600 mb-1 font-bold">أتعاب المحاماة المقدرة</p>
                                        <p className="text-lg font-bold text-amber-700 dark:text-amber-500">{result.attorneyFees.toFixed(3)} {selectedJurisdiction.currencySymbol}</p>
                                    </div>
                                )}

                                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold text-gray-400">إجمالي المبلغ المستحق</span>
                                    </div>
                                    <p className="text-4xl font-black text-gray-900 dark:text-DM-Text-Primary">{result.totalAmount.toFixed(3)} <span className="text-sm font-normal">{selectedJurisdiction.currencySymbol}</span></p>
                                </div>

                                <div className="text-[10px] text-gray-400 leading-relaxed italic">
                                    * الحسابات تقريبية وتخضع لتقدير محكمة الموضوع. تم الاحتساب بناءً على سنة مكونة من {yearBasis} يوم.
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-dm-card/30 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                            <div className="w-16 h-16 bg-white dark:bg-dm-background rounded-full flex items-center justify-center mb-4 shadow-sm">
                                <CalculatorIcon className="w-8 h-8 text-gray-300" />
                            </div>
                            <p className="text-sm text-gray-400 text-center">أدخل البيانات المطلوبة لعرض ملخص الحساب التفصيلي</p>
                        </div>
                    )}

                    <Card title="إرشادات قانونية" icon={<ScaleIcon className="w-5 h-5 text-primary"/>} className="bg-gray-900 text-white border-none shadow-xl">
                        <div className="space-y-4 text-xs">
                            <div className="flex gap-3">
                                <div className="mt-1"><InformationCircleIcon className="w-4 h-4 text-primary-light"/></div>
                                <p className="text-gray-300 leading-relaxed">
                                    <strong className="text-white block mb-1">تاريخ سريان الفائدة:</strong>
                                    تبدأ الفوائد عادة من تاريخ المطالبة القضائية الرسمية، ما لم يوجد اتفاق مكتوب يحدد تاريخ استحقاق سابق.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <div className="mt-1"><InformationCircleIcon className="w-4 h-4 text-primary-light"/></div>
                                <p className="text-gray-300 leading-relaxed">
                                    <strong className="text-white block mb-1">سقف الفائدة:</strong>
                                    وفقاً للمنتظم في القضاء الكويتي، لا يجوز أن تجاوز الفوائد أصل الدين في المسائل المدنية والتجارية للأفراد.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Case Selection Modal */}
            <Modal 
                isOpen={isImportModalOpen} 
                onClose={() => setIsImportModalOpen(false)} 
                title="استيراد مديونية من القضايا"
                size="md"
            >
                <div className="space-y-4">
                    <div className="relative">
                        <Input 
                            value={importSearch}
                            onChange={(e) => setImportSearch(e.target.value)}
                            placeholder="بحث برقم القضية أو الاسم..."
                        />
                        <div className="absolute right-3 top-10">
                            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                        </div>
                    </div>
                    
                    <div className="max-h-[400px] overflow-y-auto space-y-2 text-right">
                        {filteredCases.map((c) => (
                            <div 
                                key={c.id} 
                                className="p-3 border border-gray-100 dark:border-gray-800 rounded-xl hover:bg-primary/5 cursor-pointer transition-colors flex justify-between items-center group"
                                onClick={() => handleImportCase(c)}
                            >
                                <div className="text-right">
                                    <p className="text-sm font-bold text-gray-800 dark:text-DM-Text-Primary">{c.title}</p>
                                    <p className="text-[10px] text-gray-500">{c.caseNumber} • {c.courtName}</p>
                                    {c.budget && (
                                        <p className="text-[10px] text-primary">{c.budget.toLocaleString()} {selectedJurisdiction.currencySymbol}</p>
                                    )}
                                </div>
                                <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100">اختيار</Button>
                            </div>
                        ))}
                        {filteredCases.length === 0 && (
                            <p className="text-center py-10 text-gray-400 text-sm">لا توجد نتائج مطابقة</p>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default LegalInterestCalculatorPage;

