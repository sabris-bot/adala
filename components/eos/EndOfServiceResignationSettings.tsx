import React, { useState, useEffect } from 'react';
import { Sliders, Save, Info, RotateCcw } from 'lucide-react';

export interface ResignationThresholds {
    under3Years: number;
    threeToFiveYears: number;
    fiveToTenYears: number;
    overTenYears: number;
}

const DEFAULT_THRESHOLDS: ResignationThresholds = {
    under3Years: 0,
    threeToFiveYears: 50,
    fiveToTenYears: 66.67,
    overTenYears: 100
};

interface ResignationSettingsProps {
    onUpdate: (thresholds: ResignationThresholds) => void;
    lang: 'ar' | 'en';
}

export const EndOfServiceResignationSettings: React.FC<ResignationSettingsProps> = ({ onUpdate, lang }) => {
    const isAr = lang === 'ar';
    const [thresholds, setThresholds] = useState<ResignationThresholds>(() => {
        const cached = localStorage.getItem('adalah_eos_resignation_settings');
        return cached ? JSON.parse(cached) : DEFAULT_THRESHOLDS;
    });

    useEffect(() => {
        onUpdate(thresholds);
    }, [thresholds, onUpdate]);

    const handleSave = () => {
        localStorage.setItem('adalah_eos_resignation_settings', JSON.stringify(thresholds));
        alert(isAr ? 'تم حفظ تعديلات نسب الاستقالة بنجاح وبدء التطبيق الفوري!' : 'Resignation thresholds saved successfully to local cache.');
    };

    const handleReset = () => {
        if (confirm(isAr ? 'هل تود استعادة الإعدادات والنسب الافتراضية لقانون العمل الكويتي مادة 53؟' : 'Reset thresholds to Kuwaiti Labor Law defaults?')) {
            setThresholds(DEFAULT_THRESHOLDS);
            localStorage.setItem('adalah_eos_resignation_settings', JSON.stringify(DEFAULT_THRESHOLDS));
        }
    };

    return (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 md:p-5 text-right font-sans" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#00796B]" />
                    <h4 className="text-xs font-black text-slate-800">
                        {isAr ? 'تحديث ضوابط نسب الاستقالة (المادة 53)' : 'Statutory Resignation Controls (Art. 53)'}
                    </h4>
                </div>
                <div className="flex gap-1">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                        title={isAr ? 'استعادة الافتراضي' : 'Reset defaults'}
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        className="px-2.5 py-1 text-[10px] bg-[#00796B] hover:bg-[#004D40] text-white rounded-lg flex items-center gap-1 cursor-pointer font-bold font-Tajawal"
                    >
                        <Save className="w-3 h-3" />
                        <span>{isAr ? 'حفظ الضوابط' : 'Save Rules'}</span>
                    </button>
                </div>
            </div>

            <p className="text-[10px] text-slate-450 mb-4 leading-normal font-medium">
                {isAr 
                    ? 'بموجب المادة 53 من قانون العمل الكويتي، تستحق المكافأة مجزأة بناء على مدة الخدمة. يمكنك سحب المؤشرات لتعديل نسب الاستحقاق لأي مستجدات قانونية مستقبلية دون الحاجة لتعديل الكود.'
                    : 'Kuwait labor Article 53 dictates partial indemnity depending on careers years. These sliders let administrators adjust percentages dynamically.'}
            </p>

            <div className="space-y-4">
                {/* 1. Under 3 years */}
                <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-650">{isAr ? 'الخدمة أقل من ٣ سنوات:' : 'Service < 3 years:'}</span>
                        <span className="font-mono text-[#00796b] font-black">{thresholds.under3Years}%</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={thresholds.under3Years}
                            onChange={(e) => setThresholds(p => ({ ...p, under3Years: Number(e.target.value) }))}
                            className="w-full accent-[#00796B] h-1.5 rounded-lg cursor-pointer"
                        />
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={thresholds.under3Years}
                            onChange={(e) => setThresholds(p => ({ ...p, under3Years: Number(e.target.value) }))}
                            className="w-14 h-7 text-center bg-white border border-slate-200 rounded-md font-mono text-xs font-bold"
                        />
                    </div>
                </div>

                {/* 2. 3 to 5 years */}
                <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-650">{isAr ? 'الخدمة من ٣ إلى ٥ سنوات:' : 'Service 3 to 5 years:'}</span>
                        <span className="font-mono text-[#00796b] font-black">{thresholds.threeToFiveYears}%</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={thresholds.threeToFiveYears}
                            onChange={(e) => setThresholds(p => ({ ...p, threeToFiveYears: Number(e.target.value) }))}
                            className="w-full accent-[#00796B] h-1.5 rounded-lg cursor-pointer"
                        />
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={thresholds.threeToFiveYears}
                            onChange={(e) => setThresholds(p => ({ ...p, threeToFiveYears: Number(e.target.value) }))}
                            className="w-14 h-7 text-center bg-white border border-slate-200 rounded-md font-mono text-xs font-bold"
                        />
                    </div>
                </div>

                {/* 3. 5 to 10 years */}
                <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-650">{isAr ? 'الخدمة من ٥ إلى ١٠ سنوات:' : 'Service 5 to 10 years:'}</span>
                        <span className="font-mono text-[#00796b] font-black">{thresholds.fiveToTenYears}%</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="0.01"
                            value={thresholds.fiveToTenYears}
                            onChange={(e) => setThresholds(p => ({ ...p, fiveToTenYears: Number(e.target.value) }))}
                            className="w-full accent-[#00796B] h-1.5 rounded-lg cursor-pointer"
                        />
                        <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={thresholds.fiveToTenYears}
                            onChange={(e) => setThresholds(p => ({ ...p, fiveToTenYears: Number(e.target.value) }))}
                            className="w-14 h-7 text-center bg-white border border-slate-200 rounded-md font-mono text-xs font-bold"
                        />
                    </div>
                </div>

                {/* 4. Over 10 years */}
                <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-650">{isAr ? 'الخدمة ١٠ سنوات فأكثر:' : 'Service 10+ years:'}</span>
                        <span className="font-mono text-[#00796b] font-black">{thresholds.overTenYears}%</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={thresholds.overTenYears}
                            onChange={(e) => setThresholds(p => ({ ...p, overTenYears: Number(e.target.value) }))}
                            className="w-full accent-[#00796B] h-1.5 rounded-lg cursor-pointer"
                        />
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={thresholds.overTenYears}
                            onChange={(e) => setThresholds(p => ({ ...p, overTenYears: Number(e.target.value) }))}
                            className="w-14 h-7 text-center bg-white border border-slate-200 rounded-md font-mono text-xs font-bold"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-4 p-2 bg-blue-50/50 border border-blue-100 rounded-xl flex gap-2 items-start text-[9.5px] text-blue-800 leading-normal">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                    {isAr
                        ? 'تنبيه: يتم تحديث قيم المخرجات مباشرة فور تغيير النسب ويتم الاعتماد فورا في ملف نهاية الخدمة النشط.'
                        : 'Alert: Outlined earnings calculate directly upon resizing the ratios for the active employee.'}
                </span>
            </div>
        </div>
    );
};
