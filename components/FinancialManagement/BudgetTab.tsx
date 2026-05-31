import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
    CalculatorIcon, 
    ArrowTrendingUpIcon, 
    AdjustmentsHorizontalIcon,
    ArrowUpRightIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Badge } from '../ui/Badge';
import { useToast } from '../ui/Toast';

interface BudgetConstraint {
    category: string;
    categoryEn: string;
    budgeted: number;
    actual: number;
    color: string;
}

interface BudgetTabProps {
    formatCurrency: (amount: number, currency?: string) => string;
    isAr?: boolean;
}

export const BudgetTab: React.FC<BudgetTabProps> = ({ formatCurrency, isAr = true }) => {
    const { addToast } = useToast();

    // 1. Core budgets representation
    const [budgets, setBudgets] = useState<BudgetConstraint[]>([
        { category: 'الرواتب والأجور الأساسية', categoryEn: 'Payroll & Salaries', budgeted: 150000, actual: 142000, color: 'bg-indigo-600' },
        { category: 'استئجار مقرات المكاتب والفروع', categoryEn: 'Corporate Office Leases', budgeted: 12000, actual: 11500, color: 'bg-[#004D40]' },
        { category: 'التسويق والإعلان والنقابات الكبرى', categoryEn: 'Marketing & Symposia', budgeted: 8000, actual: 9200, color: 'bg-rose-500' },
        { category: 'برامج التشفير السحابى وحواسب', categoryEn: 'Cloud Infra & Tech Licensing', budgeted: 5000, actual: 3800, color: 'bg-amber-500' },
    ]);

    // Forecasting settings
    const [forecastingScenario, setForecastingScenario] = useState<'conservative' | 'optimistic' | 'seasonal'>('seasonal');
    const [historicalBase, setHistoricalBase] = useState(250000); // 250k standard base case

    const handleUpdateBudget = (categoryIdx: number, newBudget: number) => {
        if (newBudget < 0) return;
        setBudgets(prev => prev.map((b, idx) => idx === categoryIdx ? { ...b, budgeted: newBudget } : b));
        addToast({
            type: 'success',
            title: isAr ? 'تم تعديل الموازنة التقديرية' : 'Budget Updated',
            message: isAr ? 'تم حفظ الحد التقديري للمصروف للميزانية الحالية.' : 'Adjusted budgeted bounds successfully.'
        });
    };

    // 2. Linear projection algorithm to forecast revenues for next quarters
    const projectionOutcome = useMemo(() => {
        let multipliers = [1.05, 1.12, 1.18, 1.25]; // default seasonal

        if (forecastingScenario === 'conservative') {
            multipliers = [1.01, 1.02, 1.03, 1.05];
        } else if (forecastingScenario === 'optimistic') {
            multipliers = [1.10, 1.20, 1.35, 1.50];
        }

        return multipliers.map((m, idx) => ({
            quarter: `Q${idx + 1} - ${new Date().getFullYear() + (idx === 3 ? 1 : 0)}`,
            projectedRevenue: historicalBase * m,
            projectedExpenses: (historicalBase * 0.45) * (m * 0.95), // Expenses grow slightly slower
        }));
    }, [forecastingScenario, historicalBase]);

    return (
        <div className="space-y-8 text-right" dir={isAr ? 'rtl' : 'ltr'}>
            
            {/* Split layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Variance and Budget constraints ledger */}
                <Card className="p-6 md:p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl space-y-6">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                        <div>
                            <h4 className="text-md font-bold text-slate-850 dark:text-white flex items-center gap-2">
                                <AdjustmentsHorizontalIcon className="w-5 h-5 text-indigo-600" />
                                {isAr ? 'مراقبة الميزانيات التقديرية (الأهداف والميزان الفعلي)' : 'Budget Variance & Boundaries Tracker'}
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-1">
                                {isAr ? 'مقارنة مستمرة بين الأسقف التقديرية المخططة سنوياً للمصروفات والتدفق الفعلي.' : 'Compare active general ledger outflows versus annual budget thresholds.'}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6 pt-2">
                        {budgets.map((item, idx) => {
                            const variance = item.budgeted - item.actual;
                            const percentage = Math.round((item.actual / item.budgeted) * 100);
                            const isOver = item.actual > item.budgeted;

                            return (
                                <div key={idx} className="space-y-2 text-xs">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <span className="text-sm font-bold text-slate-800 dark:text-dm-text">
                                                {isAr ? item.category : item.categoryEn}
                                            </span>
                                        </div>
                                        <div className="text-left">
                                            <span className="text-[10px] text-slate-400 font-mono tracking-tight font-bold">
                                                {isAr ? 'الفعلي:' : 'Actual:'} <span className="text-slate-700 dark:text-white">{formatCurrency(item.actual)}</span> / {isAr ? 'المقَدّر:' : 'Budgeted:'}
                                            </span>
                                            <input 
                                                type="number"
                                                className="w-24 text-center font-mono font-bold bg-slate-50 dark:bg-dm-background border border-slate-100 dark:border-slate-800 rounded px-1.5 py-0.5 ml-2 mt-1 focus:outline-none focus:ring-1 focus:ring-indigo-600/30 text-[11px]"
                                                value={item.budgeted}
                                                onChange={(e) => handleUpdateBudget(idx, parseFloat(e.target.value) || 0)}
                                            />
                                        </div>
                                    </div>

                                    {/* Progress fluid bar */}
                                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden flex">
                                        <div 
                                            className={`h-full ${item.color} rounded-full transition-all duration-1000`} 
                                            style={{ width: `${Math.min(100, (item.actual / item.budgeted) * 100)}%` }}
                                        />
                                    </div>

                                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest leading-relaxed">
                                        <span className={isOver ? 'text-rose-500' : 'text-emerald-600'}>
                                            {isOver ? (isAr ? '🚨 تجاوز التقدير!' : '🚨 Over budget threshold!') : (isAr ? '✓ ضمن الحدود' : '✓ Under margins')} ({percentage}%)
                                        </span>
                                        <span className="text-slate-400 font-mono">
                                            {isAr ? 'المتبقي:' : 'Buffer:'} {formatCurrency(Math.max(0, variance))}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                {/* Intelligent Revenue Forecasting Section (Linear Trend Models) */}
                <Card className="p-6 md:p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h4 className="text-md font-bold text-slate-850 dark:text-white flex items-center gap-2">
                                <ArrowTrendingUpIcon className="w-5 h-5 text-indigo-600 animate-pulse" />
                                {isAr ? 'مركز إسقاطات وتوقعات التدفقات النقدية الذكي' : 'Cash Flow Projections & Predictive Models'}
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-1">
                                {isAr ? 'الذكاء المالي المتقدم للتنبؤ بالعائد ربع السنوي وحجم الإنفاق بدلالة العقود والادعاءات النشطة.' : 'Linear algorithms projecting corporate profitability indices and seasonal litigation triggers.'}
                            </p>
                        </div>
                    </div>

                    {/* Scenario toggles */}
                    <div className="bg-slate-50 dark:bg-dm-background p-4 rounded-2xl flex justify-between items-center flex-wrap gap-2">
                        <span className="text-xs font-bold text-slate-400">{isAr ? 'سيناريو المحاكاة:' : 'Forecasting Model:'}</span>
                        <div className="flex gap-1.5 text-[10px] font-black">
                            <button 
                                className={`px-2.5 py-1.5 rounded-lg border transition-all ${
                                    forecastingScenario === 'seasonal' 
                                    ? 'bg-indigo-600 text-white border-transparent' 
                                    : 'bg-white text-slate-550 border-slate-100'
                                }`}
                                onClick={() => setForecastingScenario('seasonal')}
                            >
                                {isAr ? 'موسمي متفائل' : 'Seasonal Target'}
                            </button>
                            <button 
                                className={`px-2.5 py-1.5 rounded-lg border transition-all ${
                                    forecastingScenario === 'optimistic' 
                                    ? 'bg-indigo-600 text-white border-transparent' 
                                    : 'bg-white text-slate-550 border-slate-100'
                                }`}
                                onClick={() => setForecastingScenario('optimistic')}
                            >
                                {isAr ? 'توسعي قوي' : 'Aggressive Growth'}
                            </button>
                            <button 
                                className={`px-2.5 py-1.5 rounded-lg border transition-all ${
                                    forecastingScenario === 'conservative' 
                                    ? 'bg-indigo-600 text-white border-transparent' 
                                    : 'bg-white text-slate-550 border-slate-100'
                                }`}
                                onClick={() => setForecastingScenario('conservative')}
                            >
                                {isAr ? 'محافظ جداً' : 'Conservative'}
                            </button>
                        </div>
                    </div>

                    {/* Linear model calculations */}
                    <div className="space-y-4">
                        {projectionOutcome.map((proj, idx) => (
                            <div key={idx} className="p-4 bg-slate-50 dark:bg-dm-background border border-slate-100 dark:border-slate-850 rounded-2xl flex justify-between items-center gap-4 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-1.5 h-full bg-slate-300 group-hover:bg-indigo-600 transition-colors" />
                                
                                <div className="pr-2">
                                    <p className="font-bold text-slate-850 dark:text-white text-sm">{proj.quarter}</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">{isAr ? 'الرصيد الفصلي المتوقع' : 'Estimated closing books'}</p>
                                </div>

                                <div className="text-left font-serif">
                                    <div className="flex items-center gap-1.5 justify-end">
                                        <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1 py-0.5 rounded flex items-center">
                                            <ArrowUpRightIcon className="w-3 h-3" />
                                            {isAr ? 'إيرادات:' : 'Revenue:'}
                                        </span>
                                        <p className="font-mono font-black text-emerald-600">{formatCurrency(proj.projectedRevenue)}</p>
                                    </div>
                                    <div className="flex items-center gap-1.5 justify-end mt-1 text-[10px]">
                                        <span className="text-rose-500">{isAr ? 'نفقات تقديرية:' : 'Outflows:'}</span>
                                        <p className="font-mono text-rose-500 font-bold">-{formatCurrency(proj.projectedExpenses)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
            
        </div>
    );
};
