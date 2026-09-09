import React, { useState } from 'react';
import { Users, PlusCircle, Trash2, Layers, Bookmark, AlertCircle, Baby, HelpCircle, ShieldAlert } from 'lucide-react';
import { HeirDefinition, HeirSpecialCondition, Gender } from '../../services/inheritanceEngine';
import Card from '../ui/Card';
import Button from '../ui/Button';

export const HEIR_CATALOG = [
    { id: 'husband', label: 'زوج', genders: ['M'], max: 1, group: 'spouse', icon: '🤵' },
    { id: 'wife', label: 'زوجة / زوجات', genders: ['F'], max: 4, group: 'spouse', icon: '👰' },
    { id: 'son', label: 'ابن مباشر (صلبي)', genders: ['M'], max: 25, group: 'descendant', icon: '👦' },
    { id: 'daughter', label: 'بنت مباشرة (صلبية)', genders: ['F'], max: 25, group: 'descendant', icon: '👧' },
    { id: 'grandson', label: 'ابن ابن (حفيد)', genders: ['M'], max: 20, group: 'descendant', icon: '👦' },
    { id: 'granddaughter', label: 'بنت ابن (حفيدة)', genders: ['F'], max: 20, group: 'descendant', icon: '👧' },
    { id: 'father', label: 'أب المتوفى', genders: ['M'], max: 1, group: 'ascendant', icon: '👨' },
    { id: 'mother', label: 'أم المتوفى', genders: ['F'], max: 1, group: 'ascendant', icon: '👩' },
    { id: 'paternal_grandfather', label: 'جد صحيح (أبو الأب)', genders: ['M'], max: 1, group: 'ascendant', icon: '👴' },
    { id: 'paternal_grandmother', label: 'جدة لأب (أم الأب)', genders: ['F'], max: 1, group: 'ascendant', icon: '👵' },
    { id: 'maternal_grandmother', label: 'جدة لأم (أم الأم)', genders: ['F'], max: 1, group: 'ascendant', icon: '👵' },
    { id: 'full_brother', label: 'أخ شقيق', genders: ['M'], max: 20, group: 'sibling', icon: '👨' },
    { id: 'full_sister', label: 'أخت شقيقة', genders: ['F'], max: 20, group: 'sibling', icon: '👩' },
    { id: 'paternal_brother', label: 'أخ لأب', genders: ['M'], max: 20, group: 'sibling', icon: '👨' },
    { id: 'paternal_sister', label: 'أخت لأب', genders: ['F'], max: 20, group: 'sibling', icon: '👩' },
    { id: 'maternal_brother', label: 'أخ لأم', genders: ['M'], max: 10, group: 'sibling', icon: '👨' },
    { id: 'maternal_sister', label: 'أخت لأم', genders: ['F'], max: 10, group: 'sibling', icon: '👩' },
    { id: 'paternal_uncle', label: 'عم شقيق لأب', genders: ['M'], max: 10, group: 'relative', icon: '👤' },
    { id: 'paternal_cousin', label: 'ابن عم شقيق', genders: ['M'], max: 10, group: 'relative', icon: '👤' }
];

interface Props {
    heirs: HeirDefinition[];
    setHeirs: React.Dispatch<React.SetStateAction<HeirDefinition[]>>;
    onOpenAddModal: () => void;
    onCompare: () => void;
    onSaveCase: () => void;
    hasActiveCalc: boolean;
    onPrevStep?: () => void;
    onCalculateJump?: () => void;
}

export const HeirsTreeCard: React.FC<Props> = ({
    heirs,
    setHeirs,
    onOpenAddModal,
    onCompare,
    onSaveCase,
    hasActiveCalc,
    onPrevStep,
    onCalculateJump
}) => {
    const [filterGroup, setFilterGroup] = useState<string>('all');

    const handleUpdateCount = (id: string, newCount: number) => {
        const item = heirs.find(h => h.id === id);
        if (!item) return;
        const catalogInfo = HEIR_CATALOG.find(c => c.id === item.type);
        const max = catalogInfo?.max || 25;
        const count = Math.min(max, Math.max(1, newCount));
        setHeirs(heirs.map(h => h.id === id ? { ...h, count } : h));
    };

    const handleSpecialConditionChange = (id: string, condition: HeirSpecialCondition) => {
        setHeirs(heirs.map(h => h.id === id ? { ...h, specialCondition: condition } : h));
    };

    const handleRemoveHeir = (id: string) => {
        setHeirs(heirs.filter(h => h.id !== id));
    };

    const filteredHeirs = filterGroup === 'all' 
        ? heirs 
        : heirs.filter(h => {
            const info = HEIR_CATALOG.find(c => c.id === h.type);
            return info?.group === filterGroup;
        });

    return (
        <Card className="p-5 sm:p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-card bg-white dark:bg-[#132742] rounded-2xl transition-all">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0F2744] dark:bg-[#0A1C30] text-[#D4AF37] flex items-center justify-center font-bold border border-[#D4AF37]/40 shadow-xs">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-800 dark:text-[#E6CA65] border border-amber-500/30">
                                الخطوة 3
                            </span>
                            <h3 className="text-base font-black text-slate-900 dark:text-white">
                                حصر وتحديد الورثة والمستحقين وحالاتهم الخاصة
                            </h3>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            تحديد الأقارب والأعداد وتطبيق الموانع الشرعية (الحمل، الوصية الواجبة، اختلاف الدين، القتل)
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={onOpenAddModal}
                        className="px-4 py-2 rounded-xl bg-[#0F2744] hover:bg-[#0A1C30] text-white dark:text-[#D4AF37] border border-[#0F2744] dark:border-[#D4AF37]/40 text-xs font-black transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                        <PlusCircle className="w-4 h-4 text-[#D4AF37]" />
                        <span>إدراج وريث جديد</span>
                    </button>
                    {heirs.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setHeirs([])}
                            className="px-3 py-2 text-xs font-bold text-slate-400 hover:text-red-500 rounded-xl transition-all cursor-pointer"
                        >
                            تفريغ الشجرة
                        </button>
                    )}
                </div>
            </div>

            {/* Quick Filter Badges */}
            {heirs.length > 0 && (
                <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 text-xs">
                    <span className="text-slate-400 dark:text-slate-500 text-[11px] font-bold">تصنيف العرض:</span>
                    {[
                        { id: 'all', label: `الكل (${heirs.length})` },
                        { id: 'spouse', label: 'الزوجية' },
                        { id: 'descendant', label: 'الفروع (الأولاد)' },
                        { id: 'ascendant', label: 'الأصول (الوالدان)' },
                        { id: 'sibling', label: 'الحواشي (الإخوة)' },
                        { id: 'relative', label: 'العصبات (الأعمام)' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setFilterGroup(tab.id)}
                            className={`px-3 py-1 rounded-xl font-bold transition-all text-xs cursor-pointer ${
                                filterGroup === tab.id
                                    ? 'bg-[#0F2744] text-white dark:bg-[#D4AF37] dark:text-slate-950 shadow-xs'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Heirs Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[500px] overflow-y-auto pr-1">
                {filteredHeirs.length > 0 ? (
                    filteredHeirs.map(heir => {
                        const catalogItem = HEIR_CATALOG.find(c => c.id === heir.type);
                        return (
                            <div
                                key={heir.id}
                                className="p-3.5 bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 hover:border-[#D4AF37]/50 rounded-2xl transition-all space-y-2.5"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-3">
                                        <div className="text-2xl bg-white dark:bg-slate-800 p-2 rounded-xl shadow-xs border border-slate-100 dark:border-slate-700">
                                            {catalogItem?.icon || '👤'}
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black text-slate-900 dark:text-white">{heir.label}</h4>
                                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block">
                                                الجنس: {heir.gender === 'M' ? 'ذكر' : 'أنثى'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-0.5 shadow-xs">
                                            <button
                                                type="button"
                                                onClick={() => handleUpdateCount(heir.id, heir.count - 1)}
                                                className="w-6 h-6 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 font-bold text-xs"
                                            >
                                                -
                                            </button>
                                            <span className="px-2.5 text-xs font-black font-mono text-slate-800 dark:text-slate-200">{heir.count}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleUpdateCount(heir.id, heir.count + 1)}
                                                className="w-6 h-6 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 font-bold text-xs"
                                            >
                                                +
                                            </button>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleRemoveHeir(heir.id)}
                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-all cursor-pointer"
                                            title="إزالة الوارث"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Special Condition Selector */}
                                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2">
                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                        <span>الحالة الخاصة:</span>
                                    </span>
                                    <select
                                        value={heir.specialCondition || 'normal'}
                                        onChange={e => handleSpecialConditionChange(heir.id, e.target.value as HeirSpecialCondition)}
                                        className="text-[10px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-amber-500"
                                    >
                                        <option value="normal">حالة طبيعية (مستحق)</option>
                                        <option value="deceased_before">توفي والده قبل المورث (وصية واجبة مادة 328)</option>
                                        <option value="impediment_religion">مانع شرعي: اختلاف الدين (مادة 342)</option>
                                        <option value="impediment_homicide">مانع شرعي: القتل المانع (مادة 341)</option>
                                        <option value="fetus">حمل مستكن / جنين (مادة 337)</option>
                                        <option value="khuntha">خنثى مشكل (مادة 338)</option>
                                    </select>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-2 py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl bg-slate-50/50 dark:bg-slate-800/30">
                        <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                        <h5 className="text-xs font-black text-slate-700 dark:text-slate-200">شجرة الورثة فارغة</h5>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
                            استخدم زر "إدراج وريث جديد" أو اختر قالباً نموذجياً من القائمة الجانبية لبدء التوزيع الشرعي.
                        </p>
                    </div>
                )}
            </div>

            {/* Step Navigation & Bottom Actions */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 space-y-4">
                {(onPrevStep || onCalculateJump) && (
                    <div className="flex items-center justify-between gap-3">
                        {onPrevStep ? (
                            <button
                                type="button"
                                onClick={onPrevStep}
                                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer"
                            >
                                ← السابق: تصفية التركة
                            </button>
                        ) : <div />}

                        {onCalculateJump && (
                            <button
                                type="button"
                                onClick={onCalculateJump}
                                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                            >
                                <span>معاينة جدول الأنصبة والنتائج</span>
                                <span>↓</span>
                            </button>
                        )}
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button
                        className="flex-1 h-11 bg-[#0F2744] hover:bg-[#0A1C30] text-[#D4AF37] border border-[#D4AF37]/40 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                        onClick={onCompare}
                        disabled={heirs.length === 0}
                    >
                        <Layers className="w-4 h-4 text-[#D4AF37]" />
                        المحاكاة المزدوجة التناظرية (مقارنة السني والجعفري)
                    </Button>

                    {hasActiveCalc && (
                        <Button
                            variant="outline"
                            onClick={onSaveCase}
                            className="h-11 font-black border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-6 rounded-xl flex items-center justify-center text-xs cursor-pointer hover:border-emerald-500"
                        >
                            <Bookmark className="w-4 h-4 me-1.5 text-emerald-600" />
                            أرشفة القضية بالسجل المحلي
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
};
