import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  AlertTriangle, 
  Download, 
  Plus, 
  DollarSign, 
  PieChart, 
  FileSpreadsheet, 
  Sparkles,
  Printer
} from 'lucide-react';
import { useToast } from '../ui/Toast';

interface BudgetCategory {
  id: string;
  name: string;
  planned: number;
  actual: number;
  notes: string;
}

export const AnnualBudgetAuditView: React.FC = () => {
  const { addToast } = useToast();
  const [selectedYear, setSelectedYear] = useState('2026');
  const [showAddBudgetModal, setShowAddBudgetModal] = useState(false);

  // Dynamic state for budget categories
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>(() => {
    const saved = localStorage.getItem('adala_annual_budget_audit_data');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'المصاريف التشغيلية والصيانة الدورية للعقارات', planned: 35000, actual: 38200, notes: 'زيادة ناتجة عن صيانة مصاعد وطوارئ التكييف بالصيف' },
      { id: '2', name: 'أتعاب المحاماة والرسوم القضائية والطوابع', planned: 25000, actual: 21400, notes: 'وفورات محققة عبر تحصيل أتعاب قضائية محكوم بها' },
      { id: '3', name: 'تسويق وإعلان العقارات وجلب المستأجرين', planned: 15000, actual: 12100, notes: 'الاعتماد على التسويق الرقمي الداخلي المباشر' },
      { id: '4', name: 'رواتب ومكافآت الطاقم الإداري والقانوني', planned: 40000, actual: 38500, notes: 'ضمن حدود النطاق المستهدف' },
      { id: '5', name: 'التأمين والتراخيص والاشتراطات البلدية', planned: 10000, actual: 2250, notes: 'تأجيل بعض التجديدات للربع الرابع' },
    ];
  });

  const [newCatName, setNewCatName] = useState('');
  const [newPlanned, setNewPlanned] = useState('');
  const [newActual, setNewActual] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const saveBudgetData = (data: BudgetCategory[]) => {
    setBudgetCategories(data);
    localStorage.setItem('adala_annual_budget_audit_data', JSON.stringify(data));
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName || !newPlanned) {
      addToast({ type: 'error', title: 'بيانات غير مكتملة', message: 'يرجى كتابة اسم البند والميزانية المخططة.' });
      return;
    }

    const newItem: BudgetCategory = {
      id: `budget-${Date.now()}`,
      name: newCatName,
      planned: parseFloat(newPlanned),
      actual: parseFloat(newActual || '0'),
      notes: newNotes || 'بند مخصص جديد'
    };

    saveBudgetData([...budgetCategories, newItem]);
    setShowAddBudgetModal(false);
    setNewCatName('');
    setNewPlanned('');
    setNewActual('');
    setNewNotes('');
    addToast({ type: 'success', title: 'تم إدراج البند', message: 'تمت إضافة بند الميزانية الجديد إلى تقرير التدقيق.' });
  };

  // KPI Calculations
  const totalPlanned = budgetCategories.reduce((sum, item) => sum + item.planned, 0);
  const totalActual = budgetCategories.reduce((sum, item) => sum + item.actual, 0);
  const variance = totalPlanned - totalActual; // Positive = under budget (savings), Negative = over budget
  const variancePercent = totalPlanned > 0 ? ((variance / totalPlanned) * 100).toFixed(1) : '0';

  // Cost Reduction Opportunities
  const costOpportunities = [
    {
      id: 'opp-1',
      title: 'إعادة تفاوض عقود الصيانة الدورية للتكييف والمصاعد',
      currentCost: '14,500 د.ك',
      potentialSavings: '1,800 د.ك',
      impact: 'عالي',
      description: 'دمج عقود عقارات المنطقة العاشرة مع متعهد موحد للحصول على خصم كميات بنسبة 12%.'
    },
    {
      id: 'opp-2',
      title: 'أتمتة تحصيل الإيجارات عبر KNet والتحويل المباشر',
      currentCost: '3,200 د.ك (عمولات ومحصلين)',
      potentialSavings: '1,200 د.ك',
      impact: 'متوسط',
      description: 'إلغاء التحصيل النقدي والاعتماد المباشر على بوابة عدالة KNet لخفض تكلفة الإدارة الميدانية.'
    },
    {
      id: 'opp-3',
      title: 'تحويل مراسلات الإنذارات والإخطارات إلى WhatsApp/SMS بدلاً من البريد المسجل',
      currentCost: '1,500 د.ك',
      potentialSavings: '800 د.ك',
      impact: 'متوسط',
      description: 'استخدام الإخطار الإلكتروني الموثق مع تتبع حالة الاستلام وفقاً للأنظمة الرقمية.'
    }
  ];

  const formatKWD = (val: number) => {
    return new Intl.NumberFormat('ar-KW', { style: 'currency', currency: 'KWD', minimumFractionDigits: 3 }).format(val);
  };

  return (
    <div className="space-y-6 text-right font-sans" dir="rtl">
      {/* Header Bar */}
      <div className="p-6 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl border border-purple-800/50 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 px-3 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full text-[10px] font-black uppercase tracking-wider">
              وحدة التدقيق المالي السنوي
            </span>
            <span className="text-xs text-purple-200 font-mono">Annual Financial Audit Unit</span>
          </div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            تقرير تدقيق الميزانية السنوية والأداء المالي للمكتب والعقارات
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed font-medium">
            مقارنة التكاليف الفعلية بالمخطط لها، تحليل انحرافات الميزانية، وتحديد فرص تقليل المصاريف التشغيلية للمكتب العقاري.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            className="bg-slate-800 text-white border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold font-mono outline-none"
          >
            <option value="2026">ميزانية سنة 2026</option>
            <option value="2025">ميزانية سنة 2025</option>
          </select>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة التقرير 📄</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-[11px] font-bold text-slate-400">الميزانية المخططة الإجمالية</span>
          <h3 className="text-xl font-black text-slate-900 dark:text-white font-mono">{formatKWD(totalPlanned)}</h3>
          <p className="text-[10px] text-slate-400">السقف المعتمد للعام المالي {selectedYear}</p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-[11px] font-bold text-slate-400">المصاريف الفعلية المنفذة</span>
          <h3 className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono">{formatKWD(totalActual)}</h3>
          <p className="text-[10px] text-slate-400">إجمالي المدفوعات المسجلة فعلياً</p>
        </div>

        <div className={`p-5 rounded-2xl border shadow-sm space-y-2 ${
          variance >= 0 
            ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-300'
            : 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/50 text-rose-900 dark:text-rose-300'
        }`}>
          <span className="text-[11px] font-bold">صافي انحراف الميزانية (Variance)</span>
          <h3 className="text-xl font-black font-mono">
            {variance >= 0 ? `+${formatKWD(variance)}` : formatKWD(variance)}
          </h3>
          <p className="text-[10px] font-bold">
            {variance >= 0 ? `🟢 وفر في الميزانية بنسبة ${variancePercent}%` : `🔴 تجاوز في الميزانية بنسبة ${Math.abs(Number(variancePercent))}%`}
          </p>
        </div>

        <div className="p-5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl shadow-sm space-y-2 text-amber-900 dark:text-amber-300">
          <span className="text-[11px] font-bold">إجمالي وفر المصاريف المستهدف</span>
          <h3 className="text-xl font-black font-mono">3,800.000 د.ك</h3>
          <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400">3 فرص تحسين تشغيلي متاحة</p>
        </div>
      </div>

      {/* Main Budget Breakdown Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-purple-600" />
              جدول مقارنة التكاليف الفعلية بالمخطط لها حسب البنود
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">تفاصيل الميزانية المعتمدة والانحراف التشغيلي بكل بند.</p>
          </div>

          <button
            onClick={() => setShowAddBudgetModal(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-purple-950/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة بند ميزانية ➕</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-black border-b border-slate-200 dark:border-slate-700">
                <th className="p-3">بند المصروفات</th>
                <th className="p-3">المخطط له (د.ك)</th>
                <th className="p-3">الفعلي (د.ك)</th>
                <th className="p-3">الفرق الانحرافي (د.ك)</th>
                <th className="p-3">مؤشر الأداء والالتزام</th>
                <th className="p-3">ملاحظات وقراءات التدقيق</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold text-slate-700 dark:text-slate-300">
              {budgetCategories.map(item => {
                const diff = item.planned - item.actual;
                const ratio = item.planned > 0 ? (item.actual / item.planned) * 100 : 0;
                const isOver = diff < 0;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-all">
                    <td className="p-3 font-black text-slate-900 dark:text-white">{item.name}</td>
                    <td className="p-3 font-mono">{formatKWD(item.planned)}</td>
                    <td className="p-3 font-mono">{formatKWD(item.actual)}</td>
                    <td className={`p-3 font-mono font-black ${isOver ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {diff >= 0 ? `+${formatKWD(diff)}` : formatKWD(diff)}
                    </td>
                    <td className="p-3 w-48">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono">
                          <span>{ratio.toFixed(0)}%</span>
                          <span className={isOver ? 'text-rose-600 font-black' : 'text-emerald-600 font-black'}>
                            {isOver ? 'تجاوز 🔴' : 'ضمن الميزانية 🟢'}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isOver ? 'bg-rose-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(ratio, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-[11px] text-slate-500 dark:text-slate-400">{item.notes}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cost Reduction Opportunities Module */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            فرص تقليل المصاريف التشغيلية والتوصيات الذكية (Cost Optimization Recommendations)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            توصيات تحليليّة مخصصة لخفض التكاليف المباشرة مع الحفاظ على كفاءة وجودة الخدمات العقارية والقانونية.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {costOpportunities.map(opp => (
            <div
              key={opp.id}
              className="p-5 bg-gradient-to-b from-slate-50 to-amber-50/30 dark:from-slate-800/40 dark:to-amber-950/10 rounded-2xl border border-amber-200/60 dark:border-amber-800/40 space-y-3"
            >
              <div className="flex justify-between items-start gap-2">
                <h4 className="font-black text-xs text-slate-900 dark:text-white">{opp.title}</h4>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 rounded text-[9px] font-black shrink-0">
                  تأثير {opp.impact}
                </span>
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {opp.description}
              </p>

              <div className="pt-2 border-t border-amber-200/40 dark:border-amber-800/30 flex justify-between items-center text-xs font-black">
                <span className="text-slate-400 text-[10px]">التوفير المتوقع:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono">{opp.potentialSavings}</span>
              </div>

              <button
                onClick={() => {
                  addToast({
                    type: 'success',
                    title: 'تمت إضافة التوصية لخطة التنفيذ',
                    message: `تم اعتماد توصية: "${opp.title}" وجاري إحالتها للإدارة.`
                  });
                }}
                className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl transition-all shadow-sm"
              >
                اعتماد وتطبيق التوصية 💡
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for adding custom budget item */}
      {showAddBudgetModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddCategory} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white border-b pb-3">إضافة بند ميزانية جديد لـ {selectedYear}</h3>

            <div className="space-y-3 text-xs font-bold text-slate-700 dark:text-slate-300">
              <div>
                <label className="block mb-1">اسم بند المصروفات:</label>
                <input
                  type="text"
                  placeholder="مثال: رسوم تراخيص وتجديدات البلدية"
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">الميزانية المخططة (د.ك):</label>
                  <input
                    type="number"
                    placeholder="5000"
                    value={newPlanned}
                    onChange={e => setNewPlanned(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl outline-none font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1">المصروف الفعلي حتى الآن (د.ك):</label>
                  <input
                    type="number"
                    placeholder="2500"
                    value={newActual}
                    onChange={e => setNewActual(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">ملاحظات التدقيق التشغيلي:</label>
                <input
                  type="text"
                  placeholder="سبب الإنفاق أو توجيهات خفض التكلفة"
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs font-black pt-3">
              <button
                type="button"
                onClick={() => setShowAddBudgetModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl"
              >
                حفظ وإدراج للبند
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
