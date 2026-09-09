import React, { useState } from 'react';
import { 
    Layers, 
    ArrowRightLeft, 
    TrendingUp, 
    TrendingDown, 
    Minus, 
    Copy, 
    Check, 
    Printer, 
    Plus, 
    Trash2, 
    RefreshCw,
    Scale,
    Shield,
    FileSpreadsheet,
    DollarSign,
    Users
} from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useToast } from '../ui/Toast';
import { 
    InheritanceCalculation, 
    HeirDefinition, 
    Gender, 
    CalculationMadhab,
    EstateAssets,
    EstateDeductions,
    calculateInheritance 
} from '../../services/inheritanceEngine';
import { HEIR_CATALOG } from './HeirsTreeCard';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    baseCalculation: InheritanceCalculation | null;
    onApplyScenario?: (newCalculation: InheritanceCalculation) => void;
}

export const ScenarioComparisonModal: React.FC<Props> = ({
    isOpen,
    onClose,
    baseCalculation,
    onApplyScenario
}) => {
    const { addToast } = useToast();
    const [copied, setCopied] = useState(false);

    // Scenario Customization State
    const [scenarioName, setScenarioName] = useState('سيناريو افتراضي (تعديل الورثة أو التركة)');
    const [scenarioTotalCash, setScenarioTotalCash] = useState<number>(() => baseCalculation?.assets?.cash || 100000);
    const [scenarioRealEstate, setScenarioRealEstate] = useState<number>(() => baseCalculation?.assets?.realEstate || 0);
    const [scenarioDebts, setScenarioDebts] = useState<number>(() => baseCalculation?.debts || 0);
    const [scenarioWills, setScenarioWills] = useState<number>(() => baseCalculation?.wills || 0);
    const [scenarioMadhab, setScenarioMadhab] = useState<CalculationMadhab>(() => baseCalculation?.madhab || 'sunni');

    const [scenarioHeirs, setScenarioHeirs] = useState<HeirDefinition[]>(() => {
        if (!baseCalculation) return [];
        return baseCalculation.shares.map((s, idx) => ({
            id: `sc-heir-${idx}-${s.heirType}`,
            type: s.heirType,
            label: s.heirLabel,
            gender: 'M',
            count: s.count
        }));
    });

    // Preset quick adjustments
    const handleQuickCashAdjust = (percent: number) => {
        const current = scenarioTotalCash;
        const updated = Math.max(0, Math.round(current * (1 + percent / 100)));
        setScenarioTotalCash(updated);
    };

    const handleUpdateHeirCount = (id: string, delta: number) => {
        setScenarioHeirs(prev => prev.map(h => {
            if (h.id === id) {
                const newCount = Math.max(0, h.count + delta);
                return { ...h, count: newCount };
            }
            return h;
        }).filter(h => h.count > 0));
    };

    const handleAddQuickHeir = (type: string, gender: Gender, label: string) => {
        const exists = scenarioHeirs.find(h => h.type === type);
        if (exists) {
            handleUpdateHeirCount(exists.id, 1);
        } else {
            setScenarioHeirs(prev => [
                ...prev,
                { id: `scen-${Date.now()}`, type, label, gender, count: 1 }
            ]);
        }
    };

    // Calculate Scenario 2 in real time
    const scenarioAssets: EstateAssets = {
        cash: scenarioTotalCash,
        realEstate: scenarioRealEstate,
        stocks: 0,
        jewelry: 0,
        vehicles: 0,
        receivables: 0
    };

    const scenarioDeductions: EstateDeductions = {
        securedDebts: 0,
        funeralExpenses: baseCalculation?.funeralExpenses || 1000,
        unsecuredDebts: scenarioDebts,
        wills: scenarioWills
    };

    const scenarioCalculation = calculateInheritance({
        deceasedGender: baseCalculation?.deceasedGender || 'M',
        madhab: scenarioMadhab,
        assets: scenarioAssets,
        deductions: scenarioDeductions,
        heirs: scenarioHeirs,
        deceasedName: `${baseCalculation?.deceasedName || 'المتوفى'} (${scenarioName})`
    });

    if (!baseCalculation) return null;

    // Build unified list of heirs across both scenarios for delta comparison
    const allUniqueHeirLabels = Array.from(new Set([
        ...baseCalculation.shares.map(s => s.heirLabel),
        ...scenarioCalculation.shares.map(s => s.heirLabel),
        ...baseCalculation.excludedHeirs.map(e => e.label),
        ...scenarioCalculation.excludedHeirs.map(e => e.label)
    ]));

    const comparisonRows = allUniqueHeirLabels.map(label => {
        const baseShare = baseCalculation.shares.find(s => s.heirLabel === label);
        const scenShare = scenarioCalculation.shares.find(s => s.heirLabel === label);
        const baseExcluded = baseCalculation.excludedHeirs.find(e => e.label === label);
        const scenExcluded = scenarioCalculation.excludedHeirs.find(e => e.label === label);

        const baseAmount = baseShare ? baseShare.amount : 0;
        const scenAmount = scenShare ? scenShare.amount : 0;
        const amountDiff = scenAmount - baseAmount;

        const basePercent = baseShare ? baseShare.shareValue * 100 : 0;
        const scenPercent = scenShare ? scenShare.shareValue * 100 : 0;
        const percentDiff = scenPercent - basePercent;

        return {
            label,
            baseShareLabel: baseShare?.shareLabel || (baseExcluded ? 'محجوب' : 'غير موجود'),
            scenShareLabel: scenShare?.shareLabel || (scenExcluded ? 'محجوب' : 'غير موجود'),
            baseAmount,
            scenAmount,
            amountDiff,
            basePercent,
            scenPercent,
            percentDiff,
            isBaseExcluded: !!baseExcluded,
            isScenExcluded: !!scenExcluded
        };
    });

    const handleCopyComparison = () => {
        let text = `【تقرير مقارنة سيناريوهات توزيع التركة - منظومة عدالة】\n`;
        text += `المورث: ${baseCalculation.deceasedName || 'غير معنون'} (${baseCalculation.deceasedGender === 'M' ? 'ذكر' : 'أنثى'})\n`;
        text += `--------------------------------------------------\n`;
        text += `السيناريو (1) [الأساس]: صافي ${baseCalculation.netEstate.toLocaleString()} د.ك (${baseCalculation.madhab === 'sunni' ? 'سني' : 'جعفري'})\n`;
        text += `السيناريو (2) [المقارن]: صافي ${scenarioCalculation.netEstate.toLocaleString()} د.ك (${scenarioCalculation.madhab === 'sunni' ? 'سني' : 'جعفري'})\n`;
        text += `فارق صافي التركة: ${(scenarioCalculation.netEstate - baseCalculation.netEstate).toLocaleString()} د.ك\n`;
        text += `--------------------------------------------------\n`;
        text += `جدول فروق الأنصبة:\n`;
        comparisonRows.forEach(row => {
            const diffSign = row.amountDiff > 0 ? '+' : '';
            text += `- ${row.label}:\n`;
            text += `   * الأساسي: ${row.baseShareLabel} | ${row.baseAmount.toLocaleString(undefined, { minimumFractionDigits: 3 })} د.ك (${row.basePercent.toFixed(2)}%)\n`;
            text += `   * المقارن: ${row.scenShareLabel} | ${row.scenAmount.toLocaleString(undefined, { minimumFractionDigits: 3 })} د.ك (${row.scenPercent.toFixed(2)}%)\n`;
            text += `   * الفارق: ${diffSign}${row.amountDiff.toLocaleString(undefined, { minimumFractionDigits: 3 })} د.ك (${diffSign}${row.percentDiff.toFixed(2)}%)\n`;
        });

        navigator.clipboard.writeText(text);
        setCopied(true);
        addToast({ type: 'success', title: 'تم النسخ', message: 'تم نسخ تقرير مقارنة السيناريوهات بنجاح.' });
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="مقارن ومحلل سيناريوهات توزيع التركات المتقدم"
            size="xl"
        >
            <div className="space-y-6">
                {/* Header Subtitle */}
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    قارن بين الوضع القائم وسيناريوهات بديلة (تغير قيمة التركة، استحقاق وصايا، إضافة أو حجب ورثة، أو المقارنة بين المذهبين السني والجعفري) لتحليل الفروق المالية والحصصية بدقة.
                </p>

                {/* Scenario Setup Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Scenario 1: Base Case (Fixed) */}
                    <div className="p-4 bg-slate-900 text-white rounded-3xl border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                السيناريو (1): الحالة الأساسية المسجلة
                            </span>
                            <Badge
                                text={baseCalculation.madhab === 'sunni' ? 'سني (51/1984)' : 'جعفري'}
                                variant={baseCalculation.madhab === 'sunni' ? 'primary' : 'success'}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-800/80 rounded-2xl border border-slate-700 text-center text-xs font-mono">
                            <div>
                                <span className="text-[9px] text-slate-400 font-sans block">إجمالي التركة</span>
                                <span className="font-bold text-slate-100">{baseCalculation.totalEstate.toLocaleString()} د.ك</span>
                            </div>
                            <div>
                                <span className="text-[9px] text-slate-400 font-sans block">الديون والوصايا</span>
                                <span className="font-bold text-rose-300">{(baseCalculation.debts + baseCalculation.wills).toLocaleString()} د.ك</span>
                            </div>
                            <div>
                                <span className="text-[9px] text-slate-400 font-sans block">صافي القسمة</span>
                                <span className="font-black text-amber-300">{baseCalculation.netEstate.toLocaleString()} د.ك</span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 font-bold block">الورثة المسجلون ({baseCalculation.shares.length}):</span>
                            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                                {baseCalculation.shares.map((s, i) => (
                                    <span key={i} className="text-[11px] bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-lg text-slate-200">
                                        {s.heirLabel} ({s.count}) - {s.shareLabel}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Scenario 2: Dynamic Scenario Controls */}
                    <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-3xl border border-emerald-200 dark:border-emerald-800/60 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                السيناريو (2): الفرضية والمحاكاة المقارنة
                            </span>
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => setScenarioMadhab('sunni')}
                                    className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition-all ${
                                        scenarioMadhab === 'sunni' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                    }`}
                                >
                                    سني
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setScenarioMadhab('jafari')}
                                    className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition-all ${
                                        scenarioMadhab === 'jafari' ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                    }`}
                                >
                                    جعفري
                                </button>
                            </div>
                        </div>

                        {/* Financial Inputs for Scenario 2 */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5">
                                    السيولة والتركة (KWD):
                                </label>
                                <div className="flex items-center gap-1">
                                    <input
                                        type="number"
                                        value={scenarioTotalCash}
                                        onChange={e => setScenarioTotalCash(Math.max(0, Number(e.target.value)))}
                                        className="w-full h-8 px-2 text-xs font-mono font-bold bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 rounded-xl"
                                    />
                                    <div className="flex flex-col gap-0.5">
                                        <button
                                            type="button"
                                            onClick={() => handleQuickCashAdjust(25)}
                                            className="px-1 py-0.5 bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 rounded text-[8px] font-bold"
                                            title="زيادة 25%"
                                        >
                                            +25%
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleQuickCashAdjust(-25)}
                                            className="px-1 py-0.5 bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-300 rounded text-[8px] font-bold"
                                            title="إنقاص 25%"
                                        >
                                            -25%
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5">
                                    الديون والوصايا (KWD):
                                </label>
                                <input
                                    type="number"
                                    value={scenarioDebts + scenarioWills}
                                    onChange={e => {
                                        const v = Math.max(0, Number(e.target.value));
                                        setScenarioDebts(v);
                                    }}
                                    className="w-full h-8 px-2 text-xs font-mono font-bold bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 rounded-xl"
                                />
                            </div>
                        </div>

                        {/* Heir modifier chips */}
                        <div className="space-y-1">
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">تعديل الورثة في السيناريو:</span>
                            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                                {scenarioHeirs.map(h => (
                                    <div key={h.id} className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-lg text-xs font-bold">
                                        <span>{h.label} ({h.count})</span>
                                        <button
                                            type="button"
                                            onClick={() => handleUpdateHeirCount(h.id, -1)}
                                            className="w-4 h-4 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 hover:text-rose-600 flex items-center justify-center text-[10px]"
                                        >
                                            -
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleUpdateHeirCount(h.id, 1)}
                                            className="w-4 h-4 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 hover:text-emerald-600 flex items-center justify-center text-[10px]"
                                        >
                                            +
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary Delta Bar */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                        <ArrowRightLeft className="w-5 h-5 text-amber-500" />
                        <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200 block">فارق صافي التركة الإجمالي:</span>
                            <span className="text-[11px] text-slate-500 font-mono">
                                من {baseCalculation.netEstate.toLocaleString()} د.ك إلى {scenarioCalculation.netEstate.toLocaleString()} د.ك
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className={`px-3 py-1.5 rounded-xl font-mono font-black text-xs flex items-center gap-1.5 ${
                            scenarioCalculation.netEstate >= baseCalculation.netEstate 
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                            {scenarioCalculation.netEstate >= baseCalculation.netEstate ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            <span>
                                {scenarioCalculation.netEstate >= baseCalculation.netEstate ? '+' : ''}
                                {(scenarioCalculation.netEstate - baseCalculation.netEstate).toLocaleString(undefined, { minimumFractionDigits: 3 })} د.ك
                            </span>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopyComparison}
                            className="rounded-xl text-xs font-bold border-slate-200 dark:border-slate-700"
                        >
                            {copied ? <Check className="w-3.5 h-3.5 me-1 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 me-1" />}
                            <span>{copied ? 'تم النسخ' : 'نسخ التقرير المقارن'}</span>
                        </Button>
                    </div>
                </div>

                {/* Side-by-Side Detailed Comparison Table */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden overflow-x-auto shadow-xs">
                    <table className="w-full text-start text-xs">
                        <thead>
                            <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold">
                                <th className="p-3 text-start">الوارث / المستحق</th>
                                <th className="p-3 text-start bg-slate-200/50 dark:bg-slate-800/80">السيناريو (1) [الأساسي]</th>
                                <th className="p-3 text-start bg-emerald-50 dark:bg-emerald-950/40">السيناريو (2) [المقارن]</th>
                                <th className="p-3 text-end">الفارق المالي (د.ك)</th>
                                <th className="p-3 text-end">فارق النسبة</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                            {comparisonRows.map((row, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                                    <td className="p-3 font-black text-slate-900 dark:text-slate-100">
                                        {row.label}
                                    </td>
                                    <td className="p-3 bg-slate-50/50 dark:bg-slate-800/40">
                                        <div className="font-bold text-slate-800 dark:text-slate-200">{row.baseShareLabel}</div>
                                        <div className="font-mono text-[11px] text-slate-500">
                                            {row.baseAmount.toLocaleString(undefined, { minimumFractionDigits: 3 })} د.ك ({row.basePercent.toFixed(2)}%)
                                        </div>
                                    </td>
                                    <td className="p-3 bg-emerald-50/30 dark:bg-emerald-950/20">
                                        <div className="font-bold text-emerald-900 dark:text-emerald-300">{row.scenShareLabel}</div>
                                        <div className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400">
                                            {row.scenAmount.toLocaleString(undefined, { minimumFractionDigits: 3 })} د.ك ({row.scenPercent.toFixed(2)}%)
                                        </div>
                                    </td>
                                    <td className="p-3 text-end font-mono font-black">
                                        {row.amountDiff === 0 ? (
                                            <span className="text-slate-400 font-normal">0.000 د.ك</span>
                                        ) : row.amountDiff > 0 ? (
                                            <span className="text-emerald-600 dark:text-emerald-400">+{row.amountDiff.toLocaleString(undefined, { minimumFractionDigits: 3 })} د.ك</span>
                                        ) : (
                                            <span className="text-rose-600 dark:text-rose-400">{row.amountDiff.toLocaleString(undefined, { minimumFractionDigits: 3 })} د.ك</span>
                                        )}
                                    </td>
                                    <td className="p-3 text-end font-mono font-bold">
                                        {row.percentDiff === 0 ? (
                                            <span className="text-slate-400 font-normal">0.00%</span>
                                        ) : row.percentDiff > 0 ? (
                                            <span className="text-emerald-600 dark:text-emerald-400">+{row.percentDiff.toFixed(2)}%</span>
                                        ) : (
                                            <span className="text-rose-600 dark:text-rose-400">{row.percentDiff.toFixed(2)}%</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Bottom Actions */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="rounded-xl text-xs font-bold border-slate-200 dark:border-slate-700"
                    >
                        إغلاق المقارن
                    </Button>
                    {onApplyScenario && (
                        <Button
                            onClick={() => {
                                onApplyScenario(scenarioCalculation);
                                onClose();
                                addToast({ type: 'success', title: 'تم التطبيق', message: 'تم اعتماد سيناريو المحاكاة وتحديث الحاسبة.' });
                            }}
                            className="rounded-xl text-xs font-black bg-emerald-700 hover:bg-emerald-800 text-white"
                        >
                            اعتماد وتطبيق السيناريو (2) في الحاسبة
                        </Button>
                    )}
                </div>
            </div>
        </Modal>
    );
};
