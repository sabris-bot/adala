import React from 'react';
import { UserCheck, Shield, Sparkles, ArrowLeft } from 'lucide-react';
import { Gender, CalculationMadhab } from '../../services/inheritanceEngine';
import Card from '../ui/Card';
import Input from '../ui/Input';

interface Props {
    deceasedName: string;
    setDeceasedName: (v: string) => void;
    deceasedGender: Gender;
    setDeceasedGender: (v: Gender) => void;
    civilId: string;
    setCivilId: (v: string) => void;
    dateOfDeath: string;
    setDateOfDeath: (v: string) => void;
    madhab: CalculationMadhab;
    setMadhab: (v: CalculationMadhab) => void;
    note: string;
    setNote: (v: string) => void;
    onNextStep?: () => void;
}

export const DeceasedMetadataCard: React.FC<Props> = ({
    deceasedName,
    setDeceasedName,
    deceasedGender,
    setDeceasedGender,
    civilId,
    setCivilId,
    dateOfDeath,
    setDateOfDeath,
    madhab,
    setMadhab,
    note,
    setNote,
    onNextStep
}) => {
    return (
        <Card className="p-5 sm:p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-card bg-white dark:bg-[#132742] rounded-2xl transition-all">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0F2744] dark:bg-[#0A1C30] text-[#D4AF37] flex items-center justify-center font-bold border border-[#D4AF37]/40 shadow-xs">
                        <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-800 dark:text-[#E6CA65] border border-amber-500/30">
                                الخطوة 1
                            </span>
                            <h3 className="text-base font-black text-slate-900 dark:text-white">
                                بيانات المتوفى (المورث) والتأصيل الشرعي والقضائي
                            </h3>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            توثيق الرقم المدني وتحديد المذهب الشرعي لتطبيق القواعد القانونية المعتمدة
                        </p>
                    </div>
                </div>

                {/* Madhab Selector */}
                <div className="flex items-center bg-slate-100/90 dark:bg-slate-900/90 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                    <button
                        type="button"
                        onClick={() => setMadhab('sunni')}
                        className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                            madhab === 'sunni'
                                ? 'bg-[#0F2744] text-white dark:bg-[#0A1C30] dark:text-[#D4AF37] dark:border dark:border-[#D4AF37]/40 shadow-xs'
                                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <Shield className="w-3.5 h-3.5 text-amber-500 dark:text-[#D4AF37]" />
                        المذهب السني (قانون 51/1984)
                    </button>
                    <button
                        type="button"
                        onClick={() => setMadhab('jafari')}
                        className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                            madhab === 'jafari'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                        المحكمة الجعفرية (الطبقات)
                    </button>
                </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input
                    label="اسم المورث الرباعي"
                    placeholder="مثال: سعود ناصر مبارك الصباح"
                    value={deceasedName}
                    onChange={e => setDeceasedName(e.target.value)}
                    className="rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:border-[#D4AF37]"
                />

                <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 dark:text-slate-300">جنس المورث</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => setDeceasedGender('M')}
                            className={`py-2 px-3 rounded-xl border transition-all font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                                deceasedGender === 'M'
                                    ? 'border-[#0F2744] bg-[#0F2744] text-white dark:border-[#D4AF37] dark:bg-[#0A1C30] dark:text-[#D4AF37] shadow-xs'
                                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                            }`}
                        >
                            <span>👨</span>
                            <span>ذكر (متوفى)</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setDeceasedGender('F')}
                            className={`py-2 px-3 rounded-xl border transition-all font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                                deceasedGender === 'F'
                                    ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                            }`}
                        >
                            <span>👩</span>
                            <span>أنثى (متوفاة)</span>
                        </button>
                    </div>
                </div>

                <Input
                    label="الرقم المدني (12 رقم)"
                    placeholder="285010101234"
                    maxLength={12}
                    value={civilId}
                    onChange={e => setCivilId(e.target.value.replace(/\D/g, ''))}
                    className="rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-mono focus:border-[#D4AF37]"
                />

                <Input
                    label="تاريخ الوفاة المعتمد"
                    type="date"
                    value={dateOfDeath}
                    onChange={e => setDateOfDeath(e.target.value)}
                    className="rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:border-[#D4AF37]"
                />
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1.5">
                    ملاحظات وقيود قضائية مرافقة للتركة
                </label>
                <input
                    type="text"
                    placeholder="مثال: يوجد إشعار حصر وراثة صادر من المحكمة الكلية - دائرة الأحوال الشخصية..."
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    className="w-full h-10 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-slate-50/60 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#D4AF37] transition-all"
                />
            </div>

            {/* Next Step Action */}
            {onNextStep && (
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button
                        type="button"
                        onClick={onNextStep}
                        className="px-5 py-2.5 rounded-xl bg-[#0F2744] hover:bg-[#0A1C30] text-white dark:text-[#D4AF37] border border-[#0F2744] dark:border-[#D4AF37]/40 text-xs font-black transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                    >
                        <span>التالي: تصفية التركة والذمة المالية</span>
                        <span>→</span>
                    </button>
                </div>
            )}
        </Card>
    );
};

