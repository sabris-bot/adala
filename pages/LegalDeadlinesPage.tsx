import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { ClockIcon, InformationCircleIcon } from '../constants';

// --- Data and Helper Functions ---

// Note: Islamic holidays are approximate. A proper library would be needed for future-proof accuracy.
// These are for 2024 and 2025 as an example.
const kuwaitHolidays: Record<number, { month: number; day: number; description: string }[]> = {
    2024: [
        { month: 1, day: 1, description: "رأس السنة الميلادية" },
        { month: 2, day: 8, description: "الإسراء والمعراج (تقديري)" },
        { month: 2, day: 25, description: "اليوم الوطني" },
        { month: 2, day: 26, description: "يوم التحرير" },
        { month: 4, day: 10, description: "عيد الفطر (اليوم الأول)" },
        { month: 4, day: 11, description: "عيد الفطر (اليوم الثاني)" },
        { month: 4, day: 12, description: "عيد الفطر (اليوم الثالث)" },
        { month: 6, day: 16, description: "وقفة عرفات (تقديري)" },
        { month: 6, day: 17, description: "عيد الأضحى (اليوم الأول)" },
        { month: 6, day: 18, description: "عيد الأضحى (اليوم الثاني)" },
        { month: 6, day: 19, description: "عيد الأضحى (اليوم الثالث)" },
        { month: 7, day: 7, description: "رأس السنة الهجرية (تقديري)" },
        { month: 9, day: 15, description: "المولد النبوي الشريف (تقديري)" },
    ],
    2025: [
        { month: 1, day: 1, description: "رأس السنة الميلادية" },
        { month: 1, day: 27, description: "الإسراء والمعراج (تقديري)" },
        { month: 2, day: 25, description: "اليوم الوطني" },
        { month: 2, day: 26, description: "يوم التحرير" },
        { month: 3, day: 30, description: "عيد الفطر (اليوم الأول)" },
        { month: 3, day: 31, description: "عيد الفطر (اليوم الثاني)" },
        { month: 4, day: 1, description: "عيد الفطر (اليوم الثالث)" },
        { month: 6, day: 6, description: "وقفة عرفات (تقديري)" },
        { month: 6, day: 7, description: "عيد الأضحى (اليوم الأول)" },
        { month: 6, day: 8, description: "عيد الأضحى (اليوم الثاني)" },
        { month: 6, day: 9, description: "عيد الأضحى (اليوم الثالث)" },
        { month: 6, day: 26, description: "رأس السنة الهجرية (تقديري)" },
        { month: 9, day: 4, description: "المولد النبوي الشريف (تقديري)" },
    ],
};

const isHoliday = (date: Date): string | null => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // JS month is 0-11
    const day = date.getDate();
    
    const holidaysForYear = kuwaitHolidays[year] || [];
    const holiday = holidaysForYear.find(h => h.month === month && h.day === day);
    
    return holiday ? holiday.description : null;
};

const isWeekend = (date: Date): boolean => {
    const dayOfWeek = date.getDay(); // 0=Sunday, 6=Saturday
    return dayOfWeek === 5 || dayOfWeek === 6; // Friday or Saturday
};

const LegalDeadlinesPage: React.FC = () => {
    const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [days, setDays] = useState<number>(30);
    const [distance, setDistance] = useState<number>(0);

    const [selectedProcedure, setSelectedProcedure] = useState<string>('');
    const [excludeHolidays, setExcludeHolidays] = useState<boolean>(true);
    const [extendOnHoliday, setExtendOnHoliday] = useState<boolean>(true);
    const [addDistance, setAddDistance] = useState<boolean>(false);

    const [result, setResult] = useState<{
        endDate: string;
        calculationNotes: string[];
    } | null>(null);

    const commonDeadlines = [
        { label: 'اختر إجراءً شائعًا (سيتم ملء الأيام تلقائيًا)', value: '', days: 0 },
        { label: 'استئناف حكم محكمة كلية (30 يومًا)', value: 'appeal_plenary', days: 30 },
        { label: 'استئناف حكم محكمة جزئية (15 يومًا)', value: 'appeal_partial', days: 15 },
        { label: 'طعن بالتمييز (30 يومًا)', value: 'cassation', days: 30 },
        { label: 'التماس إعادة النظر (30 يومًا)', value: 'reconsideration', days: 30 },
        { label: 'معارضة في حكم غيابي (7 أيام)', value: 'objection_absentia', days: 7 },
        { label: 'تظلم من أمر على عريضة (10 أيام)', value: 'grievance_order', days: 10 },
    ];
    
    const handleProcedureChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const procedureValue = e.target.value;
        setSelectedProcedure(procedureValue);
        const selected = commonDeadlines.find(d => d.value === procedureValue);
        if (selected && selected.days > 0) {
            setDays(selected.days);
        }
    };

    const handleCalculate = () => {
        if (!startDate || isNaN(days) || days <= 0) {
            alert("يرجى إدخال تاريخ بدء وعدد أيام صحيح.");
            return;
        }

        let currentDate = new Date(startDate);
        const eventDate = new Date(startDate); // Keep original date for notes
        let daysAdded = 0;
        let notes: string[] = [`- تاريخ الحدث (الحكم/الإعلان): ${formatDate(eventDate)}`];
        notes.push(`- يبدأ حساب الميعاد من اليوم التالي لصدور الحكم/الإعلان.`);
        
        const procedureLabel = commonDeadlines.find(p => p.value === selectedProcedure)?.label;
        if (procedureLabel) {
            notes.push(`- تم حساب الميعاد بناءً على: "${procedureLabel}".`);
        }
        let holidaysExcluded: string[] = [];

        while (daysAdded < days) {
            currentDate.setDate(currentDate.getDate() + 1);
            const holidayInfo = isHoliday(currentDate);
            if (excludeHolidays && (isWeekend(currentDate) || holidayInfo)) {
                if(holidayInfo) holidaysExcluded.push(`${formatDate(currentDate)} (${holidayInfo})`);
                continue;
            }
            daysAdded++;
        }
        notes.push(`- إضافة ${days} أيام عمل.`);
        if(holidaysExcluded.length > 0) notes.push(`- تم استبعاد ${holidaysExcluded.length} أيام عطلة.`);

        if (addDistance && distance > 0) {
            const distanceDays = Math.min(Math.floor(distance / 50), 4);
            if(distanceDays > 0) {
                notes.push(`- إضافة ميعاد مسافة (${distance} كم): ${distanceDays} أيام.`);
                currentDate.setDate(currentDate.getDate() + distanceDays);
            }
        }

        if (extendOnHoliday) {
            let extensionNoteAdded = false;
            while (isWeekend(currentDate) || isHoliday(currentDate)) {
                if(!extensionNoteAdded) {
                    notes.push(`- آخر يوم (${formatDate(currentDate)}) صادف عطلة، يتم الامتداد لأول يوم عمل تالٍ.`);
                    extensionNoteAdded = true;
                }
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }
        
        notes.push(`- تاريخ الانتهاء النهائي: ${formatDate(currentDate)}`);

        setResult({
            endDate: formatDate(currentDate),
            calculationNotes: notes,
        });
    };

    const formatDate = (date: Date): string => {
        return date.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center">
                <ClockIcon className="w-8 h-8 text-primary me-3" />
                <h1 className="text-3xl font-bold text-primary-dark">حاسبة المواعيد القانونية (الكويت)</h1>
            </div>

            <Card className="bg-blue-50 border-blue-200">
                <div className="flex items-start">
                    <InformationCircleIcon className="w-6 h-6 text-blue-600 me-3 mt-1 flex-shrink-0" />
                    <div>
                        <p className="text-sm text-blue-700 mb-3">
                            هذه الأداة تساعد في حساب المواعيد الإجرائية وفقًا لقانون المرافعات المدنية والتجارية الكويتي. <strong>(مادة 15: يبدأ الميعاد من اليوم التالي للتاريخ المعتبر مبدأً لسريان الميعاد).</strong>
                        </p>
                        <h4 className="text-md font-semibold text-blue-800 mb-2">أمثلة على المواعيد الإجرائية الشائعة:</h4>
                        <ul className="list-disc list-inside text-xs text-blue-700 space-y-1">
                            <li><strong>الاستئناف (مادة 141):</strong> ميعاد الاستئناف <strong>30 يومًا</strong> للأحكام الصادرة من المحكمة الكلية، و<strong>15 يومًا</strong> للأحكام الصادرة من المحكمة الجزئية.</li>
                            <li><strong>الطعن بالتمييز (مادة 152):</strong> ميعاد الطعن بالتمييز <strong>30 يومًا</strong>.</li>
                            <li><strong>التماس إعادة النظر (مادة 148):</strong> ميعاد التماس إعادة النظر <strong>30 يومًا</strong>.</li>
                            <li><strong>المعارضة في الأحكام الغيابية (مادة 137):</strong> ميعاد المعارضة <strong>7 أيام</strong> من تاريخ إعلان الحكم الغيابي.</li>
                            <li><strong>التظلم من الأوامر على العرائض (مادة 126):</strong> ميعاد التظلم <strong>10 أيام</strong> من تاريخ صدور الأمر أو إعلانه حسب الأحوال.</li>
                        </ul>
                         <p className="text-xs text-blue-600 mt-3">
                            <strong>إخلاء مسؤولية:</strong> النتائج تقديرية ولأغراض إرشادية فقط. يجب دائمًا الرجوع إلى النصوص القانونية والتأكد من التواريخ والعطلات الرسمية بشكل مستقل.
                        </p>
                    </div>
                </div>
            </Card>

            <Card title="إدخال بيانات الميعاد">
                 <Select
                    label="اختر إجراءً شائعًا (سيتم ملء الأيام تلقائيًا)"
                    value={selectedProcedure}
                    onChange={handleProcedureChange}
                    options={commonDeadlines.map(d => ({ value: d.value, label: d.label }))}
                    containerClassName="mb-4"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="تاريخ صدور الحكم أو الإعلان" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    <Input label="عدد الأيام" type="number" value={days.toString()} onChange={(e) => {setDays(parseInt(e.target.value) || 0); setSelectedProcedure('');}} />
                </div>
                <div className="mt-4 space-y-2">
                    <label className="flex items-center"><input type="checkbox" className="form-checkbox" checked={excludeHolidays} onChange={(e) => setExcludeHolidays(e.target.checked)} /><span className="ms-2 text-sm">استبعاد أيام العطل الرسمية والجمع والسبت</span></label>
                    <label className="flex items-center"><input type="checkbox" className="form-checkbox" checked={extendOnHoliday} onChange={(e) => setExtendOnHoliday(e.target.checked)} /><span className="ms-2 text-sm">امتداد الميعاد إذا صادف آخر يوم عطلة</span></label>
                    <label className="flex items-center"><input type="checkbox" className="form-checkbox" checked={addDistance} onChange={(e) => setAddDistance(e.target.checked)} /><span className="ms-2 text-sm">إضافة ميعاد المسافة</span></label>
                </div>
                {addDistance && (
                    <div className="mt-2 ps-6">
                        <Input label="المسافة (كم)" type="number" value={distance.toString()} onChange={(e) => setDistance(parseInt(e.target.value) || 0)} placeholder="أدخل المسافة بالكيلومتر" />
                        <p className="text-xs text-gray-500 mt-1">يوم عن كل 50 كم، بحد أقصى 4 أيام (وفقًا للمادة 16 مرافعات).</p>
                    </div>
                )}
                <div className="mt-6 flex justify-center">
                    <Button onClick={handleCalculate} size="lg">احسب تاريخ الانتهاء</Button>
                </div>
            </Card>
            
            {result && (
                <Card title="النتيجة">
                    <div className="text-center p-4 bg-gray-100 rounded-md">
                        <p className="text-sm text-gray-600">ينتهي الميعاد في يوم:</p>
                        <p className="text-2xl font-bold text-primary">{result.endDate}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t text-sm text-gray-700">
                        <p className="font-semibold mb-2">ملخص خطوات الحساب:</p>
                        <ul className="space-y-1">
                            {result.calculationNotes.map((note, index) => <li key={index}>{note}</li>)}
                        </ul>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default LegalDeadlinesPage;