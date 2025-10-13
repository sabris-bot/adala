import React, { useState, useMemo } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { CalculatorIcon, InformationCircleIcon } from '../constants';

type CaseTypeForFees = 
    'known_value' | 
    'unknown_value' | 
    'personal_status' | 
    'appeal_known' | 
    'cassation' | 
    'payment_order' |
    'bankruptcy' |
    'misdemeanor_direct_claim';

type CourtTypeForUnknown = 'partial' | 'plenary';

const CourtFeesPage: React.FC = () => {
    const [claimAmount, setClaimAmount] = useState<number>(0);
    const [caseType, setCaseType] = useState<CaseTypeForFees>('known_value');
    const [courtType, setCourtType] = useState<CourtTypeForUnknown>('plenary');
    
    const [result, setResult] = useState<{
        proportionalFee: number;
        fixedFee: number;
        totalFee: number;
        notes: string[];
    } | null>(null);

    const caseTypeOptions = [
        { value: 'known_value', label: 'دعوى مقدرة القيمة (أول درجة)' },
        { value: 'unknown_value', label: 'دعوى غير مقدرة القيمة' },
        { value: 'appeal_known', label: 'استئناف على دعوى مقدرة القيمة' },
        { value: 'cassation', label: 'طعن بالتمييز (مدني/تجاري/أحوال شخصية)' },
        { value: 'personal_status', label: 'دعوى أحوال شخصية (غير مقدرة القيمة)' },
        { value: 'payment_order', label: 'أمر أداء على دين' },
        { value: 'bankruptcy', label: 'دعوى إشهار إفلاس أو صلح واقٍ' },
        { value: 'misdemeanor_direct_claim', label: 'ادعاء مباشر في جنحة' },
    ];
    
    const courtTypeOptions = [
        { value: 'plenary', label: 'محكمة كلية' },
        { value: 'partial', label: 'محكمة جزئية' },
    ];
    
    const calculateProportionalFeeNewLaw = (amount: number): { fee: number; notes: string[] } => {
        let fee = 0;
        let notes: string[] = [];
        const minFee = 10;

        if (amount <= 0) return { fee: 0, notes: ["المبلغ يجب أن يكون أكبر من صفر."] };

        if (amount <= 30000) {
            fee = amount * 0.05;
            notes.push(`- شريحة 1 (5% على المبلغ ${amount.toFixed(3)} د.ك) = ${fee.toFixed(3)} د.ك`);
        } else if (amount <= 100000) {
            const fee1 = 30000 * 0.05;
            const fee2 = (amount - 30000) * 0.035;
            fee = fee1 + fee2;
            notes.push(`- شريحة 1 (5% على أول 30,000 د.ك) = ${fee1.toFixed(3)} د.ك`);
            notes.push(`- شريحة 2 (3.5% على المبلغ المتبقي ${(amount - 30000).toFixed(3)} د.ك) = ${fee2.toFixed(3)} د.ك`);
        } else if (amount <= 500000) {
            const fee1 = 30000 * 0.05;
            const fee2 = 70000 * 0.035;
            const fee3 = (amount - 100000) * 0.025;
            fee = fee1 + fee2 + fee3;
            notes.push(`- شريحة 1 (5% على أول 30,000 د.ك) = ${fee1.toFixed(3)} د.ك`);
            notes.push(`- شريحة 2 (3.5% على الـ 70,000 د.ك التالية) = ${fee2.toFixed(3)} د.ك`);
            notes.push(`- شريحة 3 (2.5% على المبلغ المتبقي ${(amount - 100000).toFixed(3)} د.ك) = ${fee3.toFixed(3)} د.ك`);
        } else { // amount > 500000
            const fee1 = 30000 * 0.05;
            const fee2 = 70000 * 0.035;
            const fee3 = 400000 * 0.025;
            const fee4 = (amount - 500000) * 0.015;
            fee = fee1 + fee2 + fee3 + fee4;
            notes.push(`- شريحة 1 (5% على أول 30,000 د.ك) = ${fee1.toFixed(3)} د.ك`);
            notes.push(`- شريحة 2 (3.5% على الـ 70,000 د.ك التالية) = ${fee2.toFixed(3)} د.ك`);
            notes.push(`- شريحة 3 (2.5% على الـ 400,000 د.ك التالية) = ${fee3.toFixed(3)} د.ك`);
            notes.push(`- شريحة 4 (1.5% على ما زاد عن 500,000 د.ك) = ${fee4.toFixed(3)} د.ك`);
        }

        if (fee < minFee) {
            notes.push(`- تم تطبيق الحد الأدنى للرسم وهو ${minFee.toFixed(3)} د.ك حيث كان الرسم المحسوب أقل منه.`);
            return { fee: minFee, notes };
        }
        
        return { fee, notes };
    };

    const handleCalculate = () => {
        let proportionalFee = 0;
        let fixedFee = 0;
        let notes: string[] = ['* الحساب تقديري ومبني على التعديلات الجديدة المقترحة لقانون الرسوم القضائية.'];

        switch (caseType) {
            case 'known_value':
                if (claimAmount > 0) {
                    const proportionalResult = calculateProportionalFeeNewLaw(claimAmount);
                    proportionalFee = proportionalResult.fee;
                    notes.push(...proportionalResult.notes);
                } else { notes.push("الرجاء إدخال قيمة مطالبة أكبر من صفر."); }
                break;
            case 'appeal_known':
                if (claimAmount > 0) {
                    const proportionalResult = calculateProportionalFeeNewLaw(claimAmount);
                    proportionalFee = proportionalResult.fee / 4; // New rule: 1/4 of first instance fee
                    notes.push("- رسم الاستئناف هو ربع رسم أول درجة (مادة 6 الجديدة).");
                    notes.push(...proportionalResult.notes);
                    notes.push(`- إجمالي الرسم النسبي للاستئناف (${proportionalResult.fee.toFixed(3)} / 4) = ${proportionalFee.toFixed(3)} د.ك`);
                } else { notes.push("الرجاء إدخال قيمة المطالبة الأصلية لحساب رسم الاستئناف."); }
                break;
            case 'payment_order':
                 if (claimAmount > 0) {
                    const proportionalResult = calculateProportionalFeeNewLaw(claimAmount);
                    proportionalFee = proportionalResult.fee / 2;
                    notes.push("- رسم أمر الأداء هو نصف الرسم النسبي المقرر للدعوى (مادة 10).");
                    notes.push(...proportionalResult.notes);
                    notes.push(`- إجمالي الرسم النسبي لأمر الأداء (${proportionalResult.fee.toFixed(3)} / 2) = ${proportionalFee.toFixed(3)} د.ك`);
                } else { notes.push("الرجاء إدخال قيمة الدين لحساب رسم أمر الأداء."); }
                break;
            case 'unknown_value':
                fixedFee = courtType === 'plenary' ? 20 : 10;
                notes.push(`- الدعاوى غير مقدرة القيمة تستحق رسمًا ثابتًا (مادة 3 الجديدة). تم احتساب رسم ${courtType === 'plenary' ? 'المحكمة الكلية' : 'المحكمة الجزئية'} وهو ${fixedFee.toFixed(3)} د.ك.`);
                break;
            case 'cassation':
                fixedFee = 50;
                notes.push(`- الطعن بالتمييز يستحق رسمًا ثابتًا قدره ${fixedFee.toFixed(3)} د.ك (مادة 7 الجديدة).`);
                break;
            case 'personal_status':
                fixedFee = 20;
                notes.push(`- دعاوى الأحوال الشخصية (غير مقدرة القيمة) تستحق رسمًا ثابتًا قدره ${fixedFee.toFixed(3)} د.ك (مادة 9 الجديدة).`);
                break;
            case 'bankruptcy':
                fixedFee = 20;
                notes.push(`- دعوى شهر الإفلاس أو طلب الصلح الواقي يستحق رسمًا ثابتًا قدره ${fixedFee.toFixed(3)} د.ك (مادة 11 الجديدة).`);
                break;
            case 'misdemeanor_direct_claim':
                fixedFee = 10;
                notes.push(`- الادعاء المباشر في الجنح يستحق رسمًا ثابتًا قدره ${fixedFee.toFixed(3)} د.ك (مادة 8 الجديدة).`);
                break;
        }

        const totalFee = proportionalFee + fixedFee;
        setResult({ proportionalFee, fixedFee, totalFee, notes });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center">
                <CalculatorIcon className="w-8 h-8 text-primary me-3" />
                <h1 className="text-3xl font-bold text-primary-dark">حاسبة الرسوم القضائية (وفق التعديلات الجديدة)</h1>
            </div>

            <Card className="bg-blue-50 border-blue-200">
                <div className="flex items-start">
                    <InformationCircleIcon className="w-6 h-6 text-blue-600 me-3 mt-1" />
                    <div>
                        <p className="text-sm text-blue-700">
                            تم تحديث هذه الأداة لتعكس التعديلات الجديدة على قانون الرسوم القضائية، والتي تشمل تغيير شرائح الحساب، إلغاء الحد الأقصى، وتعديل الرسوم الثابتة.
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
                        <Select label="نوع الدعوى/الإجراء" options={caseTypeOptions} value={caseType} onChange={(e) => setCaseType(e.target.value as CaseTypeForFees)} />
                        
                        {(caseType === 'known_value' || caseType === 'appeal_known' || caseType === 'payment_order') && (
                            <Input label="قيمة المطالبة (د.ك)" type="number" value={claimAmount.toString()} onChange={(e) => setClaimAmount(parseFloat(e.target.value) || 0)} placeholder="أدخل المبلغ المطالب به" />
                        )}
                        {caseType === 'unknown_value' && (
                            <Select label="نوع المحكمة (غير مقدرة القيمة)" options={courtTypeOptions} value={courtType} onChange={(e) => setCourtType(e.target.value as CourtTypeForUnknown)} />
                        )}
                    </div>
                    <div className="mt-6 flex justify-center">
                        <Button onClick={handleCalculate} size="lg">احسب الرسوم</Button>
                    </div>
                </Card>

                {result && (
                    <Card title="الرسوم القضائية المقدرة" className="bg-primary-light/5">
                        <div className="space-y-3 text-center">
                            <div className="p-4 bg-gray-100 dark:bg-dm-card rounded-md">
                                <p className="text-sm text-gray-600 dark:text-gray-300">إجمالي الرسوم المقدرة</p>
                                <p className="text-3xl font-bold text-primary dark:text-primary-light">{result.totalFee.toFixed(3)} د.ك</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div className="p-3 bg-gray-50 dark:bg-dm-background rounded">
                                    <p className="text-gray-500 dark:text-gray-400">الرسم النسبي</p>
                                    <p className="font-semibold">{result.proportionalFee.toFixed(3)} د.ك</p>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-dm-background rounded">
                                    <p className="text-gray-500 dark:text-gray-400">الرسم الثابت</p>
                                    <p className="font-semibold">{result.fixedFee.toFixed(3)} د.ك</p>
                                </div>
                            </div>
                            <div className="mt-4 pt-3 border-t dark:border-secondary-dark text-right text-xs text-gray-600 dark:text-gray-300">
                                <p className="font-semibold mb-1">تفاصيل وخطوات الحساب:</p>
                                <ul className="list-disc list-inside space-y-1">
                                    {result.notes.map((note, index) => <li key={index}>{note}</li>)}
                                </ul>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
            
            <Card title="دليل الرسوم القضائية وأمثلة عملية (وفق التعديلات الجديدة)">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                    <h4>أساس حساب الرسوم النسبية الجديد</h4>
                    <p>يُحسب الرسم النسبي على شرائح تصاعدية وتم إلغاء الحد الأقصى:</p>
                    <ul>
                        <li><strong>5%</strong> على ما لا يتجاوز 30,000 دينار.</li>
                        <li><strong>3.5%</strong> على ما زاد عن 30,000 وحتى 100,000 دينار.</li>
                        <li><strong>2.5%</strong> على ما زاد عن 100,000 وحتى 500,000 دينار.</li>
                        <li><strong>1.5%</strong> على ما زاد عن 500,000 دينار.</li>
                        <li><strong>الحد الأدنى للرسم:</strong> 10 دنانير.</li>
                    </ul>

                    <h4>أمثلة عملية جديدة</h4>
                    
                    <div className="p-3 my-2 border rounded-md bg-gray-50 dark:bg-dm-card/50">
                        <p><strong>مثال 1: دعوى مدنية بقيمة 25,000 د.ك</strong></p>
                        <ul className="text-xs">
                           <li>الرسم = 25,000 * 5% = 1,250.000 د.ك</li>
                           <li><strong>الإجمالي = 1,250.000 د.ك</strong></li>
                        </ul>
                    </div>

                     <div className="p-3 my-2 border rounded-md bg-gray-50 dark:bg-dm-card/50">
                        <p><strong>مثال 2: استئناف على الدعوى السابقة (25,000 د.ك)</strong></p>
                        <ul className="text-xs">
                           <li>رسم الاستئناف هو ربع رسم أول درجة (1,250.000 د.ك).</li>
                           <li><strong>الإجمالي = 1,250.000 / 4 = 312.500 د.ك</strong></li>
                        </ul>
                    </div>

                     <div className="p-3 my-2 border rounded-md bg-gray-50 dark:bg-dm-card/50">
                        <p><strong>مثال 3: دعوى تجارية بقيمة 120,000 د.ك</strong></p>
                        <ul className="text-xs">
                           <li>رسم أول 30,000 = 30000 * 5% = 1500.000 د.ك</li>
                           <li>رسم الـ 70,000 التالية = 70000 * 3.5% = 2450.000 د.ك</li>
                           <li>رسم المبلغ المتبقي (20,000) = 20000 * 2.5% = 500.000 د.ك</li>
                           <li><strong>الإجمالي = 1500 + 2450 + 500 = 4,450.000 د.ك</strong></li>
                        </ul>
                    </div>
                    
                     <div className="p-3 my-2 border rounded-md bg-gray-50 dark:bg-dm-card/50">
                        <p><strong>مثال 4: دعوى أحوال شخصية (نفقة) غير مقدرة القيمة</strong></p>
                        <ul className="text-xs">
                           <li>تستحق رسمًا ثابتًا جديدًا.</li>
                           <li><strong>الإجمالي = 20.000 د.ك</strong></li>
                        </ul>
                    </div>
                </div>
            </Card>

        </div>
    );
};

export default CourtFeesPage;