
import React, { useState, useMemo } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import { initialCases } from '../data/caseData';
import { 
    CalculatorIcon, 
    InformationCircleIcon, 
    GavelIcon, 
    PrinterIcon, 
    ScaleIcon, 
    PlusCircleIcon,
    BriefcaseIcon,
    MagnifyingGlassIcon,
    ArrowPathIcon
} from '../constants';
import { useJurisdiction } from '../components/JurisdictionContext';
import { Jurisdiction } from '../types';

type CaseTypeForFees = 
    | 'known_value' // المادة 6
    | 'petition_orders' // 10 KD - المادة 7
    | 'performance_order' // 50 KD - المادة 7
    | 'urgent_matter' // 50 KD - المادة 7
    | 'temporary_orders' // 50 KD - المادة 7
    | 'total_court' // 100 KD - المحكمة الكلية
    | 'partial_court' // 100 KD - المحكمة الجزئية
    | 'appeal' // 100 KD - الاستئناف
    | 'cassation' // 100 KD - التمييز
    | 'execution_dispute' // 150 KD - إشكالات التنفيذ
    | 'judge_recusal' // 300 KD - المادة 7
    | 'real_estate_sale' // 500 KD - المادة 7
    | 'expert_deposit' // أمانة خبير
    | 'notary' // كاتب العدل
    | 'official_warning' // 5 KD - المادة 18
    | 'renew_striking' // 5 KD - مادة 10
    | 'refile_within_3m' // 10% - مادة 10
    | 'attorney_fees' // اتعاب المحامي
    | 'bankruptcy' // 100 KD
    | 'retrial'
    | 'intervention'
    | 'third_party_opposition'; 

const CourtFeesPage: React.FC = () => {
    const { selectedJurisdiction } = useJurisdiction();
    const [claimAmount, setClaimAmount] = useState<number>(0);
    const [caseType, setCaseType] = useState<CaseTypeForFees>('known_value');
    const [expertType, setExpertType] = useState<'accounting' | 'engineering' | 'medical' | 'other'>('accounting');
    const [caseTitle, setCaseTitle] = useState<string>('');
    const [selectedReport, setSelectedReport] = useState<any>(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importSearch, setImportSearch] = useState('');
    
    const [result, setResult] = useState<{
        caseLabel: string;
        proportionalFee: number;
        fixedFee: number;
        bailAmount: number;
        totalFee: number;
        notes: string[];
        lawReference: string;
    } | null>(null);

    const caseTypeOptions = [
        { value: 'known_value', label: 'دعوى معلومة القيمة (رسم نسبي) - مادة (6)', example: 'مطالبة بمبلغ مالي، تعويض، دين' },
        { value: 'total_court', label: 'دعاوى المحكمة الكلية الثابتة (100 د.ك)', example: 'الدعاوى غير مقدرة القيمة / أحوال شخصية' },
        { value: 'partial_court', label: 'دعاوى المحكمة الجزئية الثابتة (100 د.ك)', example: 'التظلم من الأوامر والعرائض' },
        { value: 'appeal', label: 'الاستئناف (100 د.ك) - مادة (7)', example: 'الطعن أمام محكمة الاستئناف' },
        { value: 'cassation', label: 'الطعن بالتمييز (100 د.ك) - مادة (7)', example: 'الطعن أمام محكمة التمييز' },
        { value: 'execution_dispute', label: 'إشكالات التنفيذ والوقتية (150 د.ك)', example: 'القضايا المستعجلة / الإشكالات' },
        { value: 'petition_orders', label: 'الطلبات والأوامر على عرائض (10 د.ك)', example: 'أمر وقتي / حجز تحفظي' },
        { value: 'performance_order', label: 'أمر الأداء (50 د.ك) - مادة (7)', example: 'طلب استصدار أمر أداء بمبلغ ثابت' },
        { value: 'judge_recusal', label: 'طلبات رد القاضي أو الخبير (300 د.ك)', example: 'رد الهيئة القضائية أو الخبير' },
        { value: 'renew_striking', label: 'تجديد الدعوى من الشطب (5 د.ك)', example: 'تجديد دعوى مشطوبة أو تعجيلها' },
        { value: 'refile_within_3m', label: 'إعادة رفع الدعوى خلال 3 أشهر (10%)', example: 'دعاوى كأن لم تكن أو المتروكة' },
        { value: 'attorney_fees', label: 'طلب أتعاب المحامي (مادة 6)', example: 'إثبات أتعاب في صحيفة الدعوى' },
        { value: 'expert_deposit', label: 'أمانة خبير (تقديري)', example: 'رسوم ندب خبير في الدعوى' },
        { value: 'official_warning', label: 'الإنذارات الرسمية (5 د.ك)', example: 'إنذار عدلي / إعلان حكم' },
        { value: 'notary', label: 'خدمات كاتب العدل', example: 'توثيق وكالات / إقرارات' },
    ];

    const filteredCases = initialCases.filter(c => 
        c.title.includes(importSearch) || c.caseNumber.includes(importSearch)
    );

    const handleImportCase = (caseObj: any) => {
        setCaseTitle(caseObj.title);
        if (caseObj.budget) setClaimAmount(caseObj.budget);
        setIsImportModalOpen(false);
    };

    // Logic based on Jurisdiction config
    const calculateProportionalFee = (amount: number, jurisdiction: Jurisdiction): { fee: number; notes: string[] } => {
        let fee = 0;
        let notes: string[] = [];
        const config = jurisdiction.courtFeesConfig.proportionalRules;

        if (amount <= 0) return { fee: 0, notes: ["المبلغ يجب أن يكون أكبر من صفر."] };

        let remainingAmount = amount;
        let prevLimit = 0;

        for (const tier of config.tiers) {
            const slabAmount = Math.min(remainingAmount, tier.limit - prevLimit);
            if (slabAmount > 0) {
                const slabFee = slabAmount * tier.rate;
                fee += slabFee;
                if (tier.limit === Infinity) {
                  notes.push(`- رسم (${(tier.rate * 100).toFixed(1)}%) على ما زاد عن ${prevLimit.toLocaleString()} ${jurisdiction.currencySymbol} = ${slabFee.toFixed(3)} ${jurisdiction.currencySymbol}`);
                } else {
                  notes.push(`- رسم (${(tier.rate * 100).toFixed(1)}%) على الشريحة (${prevLimit.toLocaleString()} لغاية ${tier.limit.toLocaleString()}) = ${slabFee.toFixed(3)} ${jurisdiction.currencySymbol}`);
                }
                remainingAmount -= slabAmount;
            }
            prevLimit = tier.limit;
            if (remainingAmount <= 0) break;
        }

        if (fee < config.minFee) {
            fee = config.minFee;
            notes.push(`- الحد الأدنى للرسوم = ${config.minFee.toFixed(3)} ${jurisdiction.currencySymbol}`);
        }

        return { fee, notes };
    };

    const handleCalculate = () => {
        let proportionalFee = 0;
        let fixedFee = 0;
        let bailAmount = 0;
        let lawReference = "قانون الرسوم القضائية";
        let notes: string[] = [`* الحساب وفقاً للأنظمة واللوائح في ${selectedJurisdiction.name}.`];
        const selectedOption = caseTypeOptions.find(o => o.value === caseType);
        const caseLabel = selectedOption ? selectedOption.label : 'دعوى عامة';
        const config = selectedJurisdiction.courtFeesConfig;

        switch (caseType) {
            case 'known_value':
                if (claimAmount > 0) {
                    const proportionalResult = calculateProportionalFee(claimAmount, selectedJurisdiction);
                    proportionalFee = proportionalResult.fee;
                    notes.push(...proportionalResult.notes);
                    lawReference = "الرسم النسبي / قانون الرسوم";
                } else { notes.push("الرجاء إدخال قيمة المطالبة."); }
                break;

            case 'total_court':
                fixedFee = config.fixedFees.totalCourt;
                lawReference = "المحكمة الكلية";
                notes.push(`- دعاوى المحكمة الكلية الثابتة (${fixedFee.toFixed(3)} ${selectedJurisdiction.currencySymbol}).`);
                break;

            case 'partial_court':
                fixedFee = config.fixedFees.partialCourt;
                lawReference = "المحكمة الجزئية";
                notes.push(`- دعاوى المحكمة الجزئية الثابتة (${fixedFee.toFixed(3)} ${selectedJurisdiction.currencySymbol}).`);
                break;
                
            case 'appeal':
                fixedFee = config.fixedFees.appeal;
                lawReference = "الاستئناف";
                notes.push(`- رسم ثابت للاستئناف (${fixedFee.toFixed(3)} ${selectedJurisdiction.currencySymbol}).`);
                break;

            case 'cassation':
                fixedFee = config.fixedFees.cassation;
                lawReference = "التمييز / النقض";
                notes.push(`- رسم ثابت للطعن (${fixedFee.toFixed(3)} ${selectedJurisdiction.currencySymbol}).`);
                break;

            case 'execution_dispute':
                fixedFee = 150;
                lawReference = "المادة 7 - فقرة د";
                notes.push("- إشكالات التنفيذ والقضايا المستعجلة (150 د.ك).");
                break;

            case 'judge_recusal':
                fixedFee = 300;
                lawReference = "المادة 7 - فقرة هـ";
                notes.push("- طلبات رد القاضي أو الخبير أو المحكمة (300 د.ك).");
                notes.push("* ملاحظة: يتعدد الرسم بتعدد المطلوب ردهم.");
                break;

            case 'renew_striking':
                fixedFee = 5;
                lawReference = "المادة 10 - فقرة 2";
                notes.push("- تجديد دعوى من الشطب أو تعجيلها (5 د.ك).");
                break;

            case 'refile_within_3m':
                if (claimAmount > 0) {
                    const original = calculateProportionalFeeDecree78(claimAmount);
                    proportionalFee = original.fee * 0.1;
                    lawReference = "المادة 10 - فقرة 3";
                    notes.push("- إعادة رفع الدعوى خلال 3 أشهر (10% من الرسم المستحق).");
                    notes.push(`* الرسم الأصلي المستحق: ${original.fee.toFixed(3)} د.ك`);
                } else {
                    notes.push("الرجاء إدخال قيمة المطالبة الأصلية لحساب النسبة.");
                }
                break;

            case 'attorney_fees':
                if (claimAmount > 0) {
                    const proportionalResult = calculateProportionalFeeDecree78(claimAmount);
                    proportionalFee = Math.max(10, proportionalResult.fee);
                    lawReference = "أتعاب المحامي - مرسوم 78/2025";
                    notes.push("- تخضع أتعاب المحامي لأحكام الرسم النسبي.");
                    notes.push("- الحد الأدنى لأتعاب المحامي (10 د.ك).");
                } else {
                    proportionalFee = 10;
                    notes.push("- الحد الأدنى لأتعاب المحامي (10 د.ك).");
                }
                break;

            case 'real_estate_sale':
                fixedFee = 500;
                lawReference = "المادة 7 - فقرة و";
                notes.push("- رسم ثابت لطلبات إحالة العقار للبيع (500 د.ك).");
                break;

            case 'retrial':
                fixedFee = 30;
                lawReference = "المادة 7 من قانون الرسوم";
                notes.push("- رسم ثابت لالتماس إعادة النظر (30 د.ك).");
                break;

            case 'intervention':
                fixedFee = 20;
                lawReference = "المادة 7 من قانون الرسوم";
                notes.push("- رسم ثابت لطلبات التدخل في الخصومة (20 د.ك).");
                break;

            case 'third_party_opposition':
                fixedFee = 50;
                lawReference = "المادة 7 من قانون الرسوم";
                notes.push("- رسم ثابت لمعارضة الخارج عن الخصومة (50 د.ك).");
                break;

            case 'expert_deposit':
                fixedFee = 300; // أمانة تقديرية تبدأ غالباً من 300
                lawReference = "قرار وزارة العدل - خبراء";
                notes.push("- أمانة خبير تقديرية (المتوسط المعتاد 300 د.ك).");
                notes.push("- قد يتغير المبلغ بناءً على قرار القاضي المختص.");
                break;

            case 'notary':
                fixedFee = 12; // رسم كاتب العدل المتوقع للوكالات أو التصديقات
                lawReference = "قانون كاتب العدل";
                notes.push("- رسوم تصديق أو توثيق محررات (تقديري 12 د.ك).");
                break;

            case 'bankruptcy':
                 fixedFee = 100;
                 lawReference = "قانون الإفلاس الجديد لسنة 2020";
                 notes.push("- دعاوى الإفلاس (تعامل معاملة دعاوى المحكمة الكلية الثابتة 100 د.ك).");
                 break;

            case 'official_warning':
                fixedFee = 5;
                lawReference = "المادة 18 مرافعات";
                notes.push("- رسم الإنذار الرسمي والإعلانات (5 د.ك).");
                break;
        }

        const totalFee = proportionalFee + fixedFee + bailAmount;
        setResult({ caseLabel, proportionalFee, fixedFee, bailAmount, totalFee, notes, lawReference });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center">
                <CalculatorIcon className="w-8 h-8 text-primary me-3" />
                <h1 className="text-3xl font-bold text-primary-dark">حاسبة الرسوم القضائية - {selectedJurisdiction.name}</h1>
            </div>

            <Card className="bg-blue-50 border-blue-200">
                <div className="flex items-start">
                    <InformationCircleIcon className="w-6 h-6 text-blue-600 me-3 mt-1" />
                    <div>
                        <p className="text-sm text-blue-700">
                            تم تحديث هذه الأداة لتتوافق مع الأنظمة والقوانين السارية في <strong>{selectedJurisdiction.name}</strong>.
                        </p>
                        <p className="text-xs text-blue-600 mt-2">
                            <strong>إخلاء مسؤولية:</strong> النتائج هي تقديرية ولأغراض إرشادية فقط. يجب دائمًا مراجعة قلم كتاب المحكمة المختصة للتأكد من الرسوم النهائية المستحقة.
                        </p>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="إدخال بيانات الدعوى">
                    <div className="space-y-4">
                        <div className="flex gap-2 items-end">
                            <div className="flex-1">
                                <Input 
                                    label="اسم القضية / الموكل (اختياري)" 
                                    value={caseTitle} 
                                    onChange={(e) => setCaseTitle(e.target.value)} 
                                    placeholder="مثلاً: شركة الفوز التجارية ضد..."
                                />
                            </div>
                            <Button 
                                variant="outline" 
                                className="mb-1"
                                onClick={() => setIsImportModalOpen(true)}
                                leftIcon={<BriefcaseIcon className="w-4 h-4"/>}
                            >
                                استيراد
                            </Button>
                        </div>
                        <Select label="نوع الدعوى/الإجراء" options={caseTypeOptions} value={caseType} onChange={(e) => setCaseType(e.target.value as CaseTypeForFees)} />
                        
                        <div className="p-3 bg-gray-50 dark:bg-dm-card/50 border border-gray-100 dark:border-gray-800 rounded-xl">
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">مثال توضيحي:</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{caseTypeOptions.find(o => o.value === caseType)?.example}</p>
                        </div>

                        {(caseType === 'known_value') && (
                            <Input label={`قيمة المطالبة (${selectedJurisdiction.currencySymbol})`} type="number" value={claimAmount.toString()} onChange={(e) => setClaimAmount(parseFloat(e.target.value) || 0)} placeholder="أدخل المبلغ المطالب به" />
                        )}

                        {caseType === 'expert_deposit' && (
                            <Select 
                                label="نوع الخبرة" 
                                options={[
                                    { value: 'accounting', label: 'حسابية / بنوك' },
                                    { value: 'engineering', label: 'هندسية / مقاولات' },
                                    { value: 'medical', label: 'طبية' },
                                    { value: 'other', label: 'أخرى' }
                                ]} 
                                value={expertType}
                                onChange={(e) => setExpertType(e.target.value as any)}
                            />
                        )}
                    </div>
                    <div className="mt-6 flex flex-col gap-3">
                        <Button 
                            fullWidth
                            onClick={handleCalculate} 
                            size="lg" 
                            leftIcon={<CalculatorIcon className="w-5 h-5"/>}
                        >
                            احسب الرسوم
                        </Button>
                        <Button 
                            fullWidth
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setCaseTitle('');
                                setClaimAmount(0);
                                setCaseType('known_value');
                                setResult(null);
                            }}
                            leftIcon={<ArrowPathIcon className="w-4 h-4"/>}
                        >
                            إعادة ضبط الحقول
                        </Button>
                    </div>
                </Card>

                {result && (
                    <Card title="الرسوم القضائية المقدرة" className="bg-primary-light/5">
                        <div className="space-y-4">
                            <div className="p-6 bg-white dark:bg-dm-card rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm text-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
                                <p className="text-xs text-gray-400 font-bold uppercase mb-1">إجمالي الرسوم المستحقة</p>
                                <p className="text-4xl font-black text-primary dark:text-primary-light">{result.totalFee.toFixed(3)} <span className="text-sm">{selectedJurisdiction.currencySymbol}</span></p>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <div className="p-3 bg-gray-50 dark:bg-dm-background rounded-xl border border-gray-100 dark:border-gray-800 text-center">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase">نسبي</p>
                                    <p className="font-bold text-xs">{result.proportionalFee.toFixed(3)}</p>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-dm-background rounded-xl border border-gray-100 dark:border-gray-800 text-center">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase">ثابت</p>
                                    <p className="font-bold text-xs">{result.fixedFee.toFixed(3)}</p>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-dm-background rounded-xl border border-gray-100 dark:border-gray-800 text-center">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase">كفالة</p>
                                    <p className="font-bold text-xs">{result.bailAmount.toFixed(3)}</p>
                                </div>
                            </div>

                            {caseType === 'known_value' && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase px-1">
                                        <span>توزيع الشرائح (مادة 6)</span>
                                        <span>النسبة</span>
                                    </div>
                                    <div className="grid grid-cols-1 gap-1">
                                        {selectedJurisdiction.courtFeesConfig.proportionalRules.tiers.map((tier, idx) => (
                                          <div key={idx} className="flex justify-between p-2 bg-gray-50 dark:bg-dm-background rounded-lg border border-gray-100 dark:border-gray-800 text-[10px]">
                                              <span>{tier.limit === Infinity ? 'ما زاد' : `لغاية ${tier.limit.toLocaleString()} ${selectedJurisdiction.currencySymbol}`}</span>
                                              <span className="font-bold text-primary">{(tier.rate * 100).toFixed(1)}%</span>
                                          </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="p-4 bg-primary/5 rounded-2xl">
                                <p className="text-xs font-bold text-primary mb-2 flex items-center gap-2">
                                    <ScaleIcon className="w-4 h-4"/> المرجع القانوني: {result.lawReference}
                                </p>
                                <ul className="space-y-1">
                                    {result.notes.map((note, index) => (
                                        <li key={index} className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">• {note}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="flex gap-2">
                                <Button 
                                    fullWidth 
                                    variant="secondary" 
                                    leftIcon={<PrinterIcon className="w-5 h-5"/>}
                                    onClick={() => setSelectedReport(result)}
                                >
                                    طباعة التقرير
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
            
            <Card title="دليل الرسوم القضائية (مرسوم 78 لسنة 2024)" icon={<GavelIcon className="w-5 h-5"/>}>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-bold text-primary-dark mb-2">المادة (6): الرسوم النسبية</h4>
                            <p className="text-xs mb-2">يفرض على الدعاوى معلومة القيمة رسم نسبي على الوجه الآتي:</p>
                            <ul className="text-xs space-y-1 list-inside bg-gray-50 dark:bg-dm-card/50 p-3 rounded">
                                <li><strong>5.0%</strong> لغاية 30,000 دينار.</li>
                                <li><strong>3.5%</strong> من 30,001 ولغاية 150,000 دينار.</li>
                                <li><strong>2.5%</strong> من 150,001 ولغاية 500,000 دينار.</li>
                                <li><strong>1.5%</strong> من 500,001 ولغاية 5,000,000 دينار.</li>
                                <li><strong>1.0%</strong> فوق 5,000,000 دينار.</li>
                                <li>شريطة ألا يقل الرسم عن <strong>10 د.ك</strong>.</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-primary-dark mb-2">المادة (7): الرسوم الثابتة</h4>
                            <ul className="text-xs space-y-1 list-inside bg-gray-50 dark:bg-dm-card/50 p-3 rounded">
                                <li><strong>100 د.ك:</strong> دعاوى الكلية، الجزئية، الاستئناف، التمييز.</li>
                                <li><strong>150 د.ك:</strong> إشكالات التنفيذ والقضايا المستعجلة.</li>
                                <li><strong>300 د.ك:</strong> طلبات رد القاضي أو الخبير.</li>
                                <li><strong>5 د.ك:</strong> تجديد من الشطب / إنذارات رسمية.</li>
                                <li><strong>10%:</strong> إعادة الرفع خلال 3 أشهر (المادة 10).</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Print Modal */}
            <Modal 
                isOpen={!!selectedReport} 
                onClose={() => setSelectedReport(null)} 
                title="معاينة تقرير الرسوم القضائية"
                size="lg"
            >
                {selectedReport && (
                    <div className="space-y-6">
                        <div id="fees-print-area" className="p-10 bg-white text-black border border-gray-200 rounded-lg">
                            <div className="border-b-2 border-primary pb-4 mb-6 flex justify-between items-center text-right">
                                <div>
                                    <h2 className="text-xl font-bold">تقرير تقدير الرسوم القضائية</h2>
                                    <p className="text-xs text-gray-500">حسب الأنظمة والقوانين السارية - {selectedJurisdiction.name}</p>
                                </div>
                                <ScaleIcon className="w-10 h-10 text-primary opacity-30" />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8 text-sm text-right">
                                <div className="space-y-2">
                                    <p><span className="font-bold text-gray-400">بيانات القضية:</span> {caseTitle || 'استعلام عام'}</p>
                                    <p><span className="font-bold text-gray-400">نوع الإجراء:</span> {selectedReport.caseLabel}</p>
                                    {claimAmount > 0 && <p><span className="font-bold text-gray-400">قيمة المطالبة:</span> {claimAmount.toLocaleString()} {selectedJurisdiction.currencySymbol}</p>}
                                </div>
                                <div className="text-left">
                                    <p><span className="font-bold text-gray-400">تاريخ التقرير:</span> {new Date().toLocaleDateString('ar-EG')}</p>
                                    <p><span className="font-bold text-gray-400">المرجع:</span> {selectedReport.lawReference}</p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-10 text-right">
                                <h3 className="text-sm font-bold border-b pb-2">تفصيل الرسوم</h3>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span>الرسم النسبي</span>
                                    <span className="font-bold">{selectedReport.proportionalFee.toFixed(3)} {selectedJurisdiction.currencySymbol}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span>الرسم الثابت</span>
                                    <span className="font-bold">{selectedReport.fixedFee.toFixed(3)} {selectedJurisdiction.currencySymbol}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span>مبلغ الكفالة (إن وجد)</span>
                                    <span className="font-bold">{selectedReport.bailAmount.toFixed(3)} {selectedJurisdiction.currencySymbol}</span>
                                </div>
                                <div className="flex justify-between items-center py-4 bg-primary/5 px-4 rounded-xl mt-4">
                                    <span className="text-lg font-bold text-primary">إجمالي المبلغ المستحق</span>
                                    <span className="text-2xl font-black text-primary">{selectedReport.totalFee.toFixed(3)} {selectedJurisdiction.currencySymbol}</span>
                                </div>
                            </div>

                            <div className="space-y-2 text-right">
                                <h4 className="text-xs font-bold text-gray-400">ملاحظات الحساب:</h4>
                                <ul className="text-[10px] text-gray-500 space-y-1">
                                    {selectedReport.notes.map((n: string, i: number) => <li key={i}>- {n}</li>)}
                                </ul>
                            </div>

                            <div className="mt-20 flex justify-between items-end border-t pt-2 text-[10px] text-gray-400 font-bold">
                                <span>صادر عن منظومة عدالة الذكية</span>
                                <span>توقيع المراجع</span>
                                <span>ختم المكتب/الإدارة</span>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 no-print">
                            <Button variant="outline" onClick={() => setSelectedReport(null)}>إغلاق</Button>
                            <Button 
                                variant="primary" 
                                leftIcon={<PrinterIcon className="w-5 h-5"/>}
                                onClick={() => {
                                    const printContents = document.getElementById('fees-print-area')?.innerHTML;
                                    const originalContents = document.body.innerHTML;
                                    document.body.innerHTML = printContents || '';
                                    window.print();
                                    document.body.innerHTML = originalContents;
                                    window.location.reload();
                                }}
                            >
                                طباعة الآن
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Case Selection Modal */}
            <Modal 
                isOpen={isImportModalOpen} 
                onClose={() => setIsImportModalOpen(false)} 
                title="استيراد بيانات من القضايا"
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

export default CourtFeesPage;
