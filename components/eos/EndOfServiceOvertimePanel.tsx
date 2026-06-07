import React, { useState, useEffect } from 'react';
import { Clock, HelpCircle, Activity, Plus, Trash2 } from 'lucide-react';

export interface OvertimeItem {
    id: string;
    type: 'regular' | 'night' | 'weekend' | 'holiday' | 'leave_work';
    hours: number;
    customHourlyRate?: number;
    multiplier: number;
    option: 'cash' | 'comp_leave';
}

interface OvertimePanelProps {
    grossSalary: number;
    onChange: (totalOvertimeAmount: number, items: OvertimeItem[]) => void;
    initialItems?: OvertimeItem[];
    lang: 'ar' | 'en';
}

export const EndOfServiceOvertimePanel: React.FC<OvertimePanelProps> = ({
    grossSalary,
    onChange,
    initialItems,
    lang
}) => {
    const isAr = lang === 'ar';
    const computedHourlyRate = (grossSalary / 26) / 8; // standard daily rate divided by 8 hours

    const [items, setItems] = useState<OvertimeItem[]>(initialItems && initialItems.length > 0 ? initialItems : [
        { id: '1', type: 'regular', hours: 0, multiplier: 1.25, option: 'cash' }
    ]);

    const handleAddItem = () => {
        setItems(prev => [
            ...prev,
            { id: Date.now().toString(), type: 'regular', hours: 0, multiplier: 1.25, option: 'cash' }
        ]);
    };

    const handleRemoveItem = (id: string) => {
        setItems(prev => prev.filter(x => x.id !== id));
    };

    const handleItemChange = (id: string, fields: Partial<OvertimeItem>) => {
        setItems(prev => prev.map(x => {
            if (x.id === id) {
                const updated = { ...x, ...fields };
                // Adjust dynamic defaults based on type shift
                if (fields.type) {
                    if (fields.type === 'regular') updated.multiplier = 1.25;
                    else if (fields.type === 'night') updated.multiplier = 1.5;
                    else if (fields.type === 'weekend') updated.multiplier = 1.5;
                    else if (fields.type === 'holiday') updated.multiplier = 2.0;
                    else if (fields.type === 'leave_work') updated.multiplier = 2.0;
                }
                return updated;
            }
            return x;
        }));
    };

    const totalOvertimeAmount = items.reduce((sum, item) => {
        if (item.option === 'comp_leave') return sum; // leave option does not accrue cash
        const hrRate = item.customHourlyRate !== undefined ? item.customHourlyRate : computedHourlyRate;
        return sum + (item.hours * hrRate * item.multiplier);
    }, 0);

    useEffect(() => {
        onChange(totalOvertimeAmount, items);
    }, [items, totalOvertimeAmount, onChange]);

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-xs text-right font-sans" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#00796B]" />
                    <h4 className="text-xs font-black text-slate-800">
                        {isAr ? 'العمل الإضافي وأيام العطل والراحات' : 'Labor Overtime, Holidays & Annual Leave Work'}
                    </h4>
                </div>
                <button
                    type="button"
                    onClick={handleAddItem}
                    className="h-8 px-3 bg-emerald-500/5 hover:bg-[#00796B]/10 border border-[#00796B]/20 rounded-lg text-[10px] font-black text-[#00796B] flex items-center gap-1 cursor-pointer"
                >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAr ? 'إضافة ساعات عمل' : 'Add Overtime Row'}</span>
                </button>
            </div>

            <p className="text-[10px] text-slate-450 mb-4 leading-normal font-medium text-start">
                {isAr 
                    ? 'بموجب قانون العمل الكويتي، يُعوض الموظف عن العمل الإضافي بنسب مضروبة: الأيام العادية (١.٢٥)، الساعات الليلية والراحات (١.٥)، الأعياد الرسمية (٢.٠). يمكنك السداد نقداً أو تدويرها لوقت راحة بديل.'
                    : 'Kuwait standards require compensating overtime: Regular days (1.25x), Night & rest shifts (1.5x), and Official holidays (2.0x). You can offset as cash or credit leave.'}
            </p>

            <div className="space-y-4">
                {items.map((item, idx) => {
                    const activeRate = item.customHourlyRate !== undefined ? item.customHourlyRate : computedHourlyRate;
                    const rowSum = item.option === 'cash' ? (item.hours * activeRate * item.multiplier) : 0;

                    return (
                        <div key={item.id} className="p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl relative space-y-3">
                            {items.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => handleRemoveItem(item.id)}
                                    className="absolute left-2.5 top-2.5 p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-200 cursor-pointer"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {/* Type selector */}
                                <div className="space-y-1 text-start">
                                    <label className="text-[9px] font-bold text-slate-400">{isAr ? 'نوع التكليف الإضافي:' : 'Overtime Duty Type:'}</label>
                                    <select
                                        value={item.type}
                                        onChange={(e) => handleItemChange(item.id, { type: e.target.value as any })}
                                        className="w-full h-8 px-2 bg-white border border-slate-250 rounded-lg text-xs font-bold"
                                    >
                                        <option value="regular">{isAr ? 'عمل إضافي عادي (1.25x)' : 'Regular Overtime (1.25x)'}</option>
                                        <option value="night">{isAr ? 'عمل ليلي إضافي (1.50x)' : 'Night Shift (1.50x)'}</option>
                                        <option value="weekend">{isAr ? 'تكليف يوم راحة (1.50x + بديل)' : 'Weekend Duty (1.50x + rest)'}</option>
                                        <option value="holiday">{isAr ? 'عمل في عطلة رسمية (2.00x)' : 'Public Holiday Shift (2.00x)'}</option>
                                        <option value="leave_work">{isAr ? 'قطع الإجازة السنوية (2.00x)' : 'Annual Leave Recall (2.00x)'}</option>
                                    </select>
                                </div>

                                {/* Hours worked */}
                                <div className="space-y-1 text-start">
                                    <label className="text-[9px] font-bold text-slate-400">{isAr ? 'ساعات العمل المنجزة:' : 'Hours Worked:'}</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={item.hours || ''}
                                        onChange={(e) => handleItemChange(item.id, { hours: Math.max(0, Number(e.target.value)) })}
                                        className="w-full h-8 px-2 bg-white border border-slate-250 rounded-lg text-xs font-mono font-bold text-left"
                                        placeholder="0"
                                    />
                                </div>

                                {/* Multiplier */}
                                <div className="space-y-1 text-start">
                                    <label className="text-[9px] font-bold text-slate-400">{isAr ? 'معامل الضرب (Multiplier):' : 'Multiplier Rate:'}</label>
                                    <input
                                        type="number"
                                        step="0.05"
                                        min="1"
                                        value={item.multiplier}
                                        onChange={(e) => handleItemChange(item.id, { multiplier: Math.max(1, Number(e.target.value)) })}
                                        className="w-full h-8 px-2 bg-white border border-slate-250 rounded-lg text-xs font-mono font-bold text-left"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-205/60 items-center justify-between">
                                {/* Option Compensation */}
                                <div className="flex items-center gap-4 text-[10px] text-slate-650 font-bold col-span-2 text-start select-none">
                                    <span className="text-[9.5px] text-slate-400">{isAr ? 'طريقة التعويض عمالياً:' : 'Compensation Method:'}</span>
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input
                                            type="radio"
                                            name={`opt-mode-${item.id}`}
                                            checked={item.option === 'cash'}
                                            onChange={() => handleItemChange(item.id, { option: 'cash' })}
                                            className="accent-[#00796B]"
                                        />
                                        <span>{isAr ? 'مخالصة نقدية (Cash)' : 'Cash Out'}</span>
                                    </label>
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input
                                            type="radio"
                                            name={`opt-mode-${item.id}`}
                                            checked={item.option === 'comp_leave'}
                                            onChange={() => handleItemChange(item.id, { option: 'comp_leave' })}
                                            className="accent-[#00796B]"
                                        />
                                        <span>{isAr ? 'راحة بديلة مدفوعة الإجر' : 'Compensatory Leave'}</span>
                                    </label>
                                </div>

                                {/* Calculated Row Due */}
                                <div className="text-left font-sans font-extrabold text-[11px] self-end rounded-lg p-1 px-3 bg-white border border-slate-100 flex justify-between items-center bg-slate-100/30">
                                    <span className="text-slate-400 font-bold ml-1">{isAr ? 'تحت الحساب ومستحق:' : 'Row Total Amount:'}</span>
                                    <span className="font-mono text-[#00796B] font-black text-right">
                                        {rowSum.toLocaleString(undefined, { minimumFractionDigits: 3 })} KWD
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Total Summary Row Widget */}
            <div className="mt-5 p-3.5 bg-slate-900 text-white rounded-xl flex items-center justify-between border border-slate-950 shadow-xxs font-sans font-extrabold select-none">
                <div className="flex items-center gap-1.5 text-[11px] font-bold">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>{isAr ? 'مجموع إضافات العمل الإضافي المالي:' : 'Gross Overtime Monetary Additions:'}</span>
                </div>
                <div className="font-mono text-emerald-300 text-sm font-black">
                    +{totalOvertimeAmount.toLocaleString(undefined, { minimumFractionDigits: 3 })} KWD
                </div>
            </div>
        </div>
    );
};
