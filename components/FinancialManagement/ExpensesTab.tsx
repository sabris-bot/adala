import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    TrendingDown, 
    DollarSign, 
    AlertOctagon, 
    Bookmark, 
    Plus, 
    CheckCircle, 
    UploadCloud, 
    FileText, 
    Trash, 
    Calculator,
    ShieldX
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useToast } from '../ui/Toast';

interface ExpenseRecord {
    id: string;
    category: 'admin' | 'operational' | 'salaries' | 'systems' | 'legal';
    description: string;
    amount: number;
    recordedAt: string;
    recordedBy: string;
    receiptFile?: string;
    receiptSize?: string;
}

interface ExpensesTabProps {
    formatCurrency: (amount: number, currency?: string) => string;
}

export const ExpensesTab: React.FC<ExpensesTabProps> = ({ formatCurrency }) => {
    const { addToast } = useToast();
    
    // Core expense dataset
    const [expenses, setExpenses] = useState<ExpenseRecord[]>([
        {
            id: 'EXP-2024-501',
            category: 'salaries',
            description: 'رواتب موظفي السلك القضائي ومكافئات معاوني المكتب الكبار لشهر مايو',
            amount: 14200.000,
            recordedAt: '2024-05-25',
            recordedBy: 'صبري شطا',
            receiptFile: 'salaries-payroll-may-24.pdf',
            receiptSize: '4.2 MB'
        },
        {
            id: 'EXP-2024-502',
            category: 'systems',
            description: 'رسوم تراخيص برمجيات السيرفر السنوي واستضافة غرف المحادثة الافتراضية والذكاء الاصطناعي',
            amount: 3200.000,
            recordedAt: '2024-05-20',
            recordedBy: 'فاطمة علي',
            receiptFile: 'server-invoice-june.pdf',
            receiptSize: '1.2 MB'
        },
        {
            id: 'EXP-2024-503',
            category: 'operational',
            description: 'تجديد عقود إيجار المقرات والاستضافة والمقار القضائية التابعة للشركة',
            amount: 2500.000,
            recordedAt: '2024-05-10',
            recordedBy: 'صبري شطا',
            receiptFile: 'rent_contract_2024_may.pdf',
            receiptSize: '9.8 MB'
        },
        {
            id: 'EXP-2024-504',
            category: 'admin',
            description: 'أدوات مكتبية ومستلزمات مطبوعات ورقية رسمية واستهلاك الضيافة الفندقية للعملاء',
            amount: 850.000,
            recordedAt: '2024-05-05',
            recordedBy: 'أحمد العبدالله',
            receiptFile: 'office_supplies_recd_05.jpg',
            receiptSize: '2.4 MB'
        }
    ]);

    // Budget Limits configuration (to trigger alerts and constraints)
    const [salariesCeiling, setSalariesCeiling] = useState(12000); // 12,000 threshold
    const [systemsCeiling, setSystemsCeiling] = useState(4000); 
    const [operationalCeiling, setOperationalCeiling] = useState(3000);

    // Filter by categorizations
    const [filterCategory, setFilterCategory] = useState<'all' | 'admin' | 'operational' | 'salaries' | 'systems' | 'legal'>('all');
    
    // Add Expense Modal
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [formCategory, setFormCategory] = useState<'admin' | 'operational' | 'salaries' | 'systems' | 'legal'>('operational');
    const [formDesc, setFormDesc] = useState('');
    const [formAmt, setFormAmt] = useState('');
    const [attachedName, setAttachedName] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    // Sum-ups
    const totalSalaries = expenses.filter(e => e.category === 'salaries').reduce((s, e) => s + e.amount, 0);
    const totalSystems = expenses.filter(e => e.category === 'systems').reduce((s, e) => s + e.amount, 0);
    const totalOps = expenses.filter(e => e.category === 'operational').reduce((s, e) => s + e.amount, 0);

    const handleCreateExpense = () => {
        if (!formDesc.trim() || !formAmt) {
            addToast({
                type: 'error',
                title: 'حقول مطلوبة',
                message: 'يرجى إكمال تفاصيل المصروف وكتابة القيمة المالية بدقة.'
            });
            return;
        }

        const amt = parseFloat(formAmt);
        if (isNaN(amt) || amt <= 0) {
            addToast({
                type: 'error',
                title: 'مبلغ غير صحيح',
                message: 'مبلغ فاتورة النفقات يجب أن يكون أكبر من الصفر.'
            });
            return;
        }

        const newExp: ExpenseRecord = {
            id: `EXP-2024-${Math.floor(Math.random() * 900) + 100}`,
            category: formCategory,
            description: formDesc,
            amount: amt,
            recordedAt: new Date().toISOString().split('T')[0],
            recordedBy: 'المدير المالي (صبري شطا)',
            receiptFile: attachedName || 'receipt_attached_signed.pdf',
            receiptSize: attachedName ? '3.5 MB' : '1.8 MB'
        };

        setExpenses([newExp, ...expenses]);
        setAddModalOpen(false);
        setFormDesc('');
        setFormAmt('');
        setAttachedName('');

        // Trigger dynamic toast check if ceiling exceeded
        const newCategorySum = expenses.filter(e => e.category === formCategory).reduce((s, e) => s + e.amount, 0) + amt;
        const currentCeiling = formCategory === 'salaries' ? salariesCeiling : formCategory === 'systems' ? systemsCeiling : formCategory === 'operational' ? operationalCeiling : 999999;
        
        if (newCategorySum > currentCeiling) {
            addToast({
                type: 'warning',
                title: '⚠️ تجاوز السقف المسموح للميزانية',
                message: 'القيد الأخير تسبب في تخطي الموازنة التقديرية المرصودة لهذا التصنيف!'
            });
        } else {
            addToast({
                type: 'success',
                title: 'تم تسجيل سند الصرف 📄',
                message: 'تم تدوين المصروف وقيده فورياً تحت سجل ميزانية كود التحليل العام.'
            });
        }
    };

    const handleDeleteExpense = (id: string) => {
        if (confirm('هل ترغب في شطب هذا القيد المالي نهائياً من سجل النفقات؟')) {
            setExpenses(prev => prev.filter(e => e.id !== id));
            addToast({
                type: 'info',
                title: 'تم شطب المصروف',
                message: 'شطب السند بنجاح وتم تسوية السجل التراكمي للميزانية.'
            });
        }
    };

    // Simulated Drag and Drop handles
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setAttachedName(e.dataTransfer.files[0].name);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAttachedName(e.target.files[0].name);
        }
    };

    // Filter Logic
    const filteredExpenses = expenses.filter(exp => {
        if (filterCategory === 'all') return true;
        return exp.category === filterCategory;
    });

    return (
        <div className="space-y-6 text-right" dir="rtl">
            
            {/* Ceiling Alerters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. Salaries indicator */}
                <div className={`p-6 bg-white dark:bg-dm-card rounded-[2rem] border shadow-sm relative overflow-hidden ${totalSalaries > salariesCeiling ? 'border-rose-300 dark:border-rose-950' : 'border-slate-100 dark:border-slate-800'}`}>
                    {totalSalaries > salariesCeiling && (
                        <div className="absolute top-0 right-0 left-0 bg-rose-500 h-1.5" />
                    )}
                    <h5 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">رواتب ومكافئات معاوني السلك</h5>
                    
                    <div className="flex justify-between items-baseline mt-2">
                        <span className="text-xl font-black font-mono text-slate-850 dark:text-white">{formatCurrency(totalSalaries)}</span>
                        <span className="text-[9px] text-slate-400 font-bold">بالمقارنة مع {formatCurrency(salariesCeiling)}</span>
                    </div>

                    <div className="w-full h-2 bg-slate-50 dark:bg-slate-900 rounded-full overflow-hidden mt-3 font-mono flex">
                        <div 
                            className={`h-full rounded-full ${totalSalaries > salariesCeiling ? 'bg-rose-500 animate-pulse' : 'bg-indigo-600'}`} 
                            style={{ width: `${Math.min(100, (totalSalaries / salariesCeiling) * 100)}%` }}
                        />
                    </div>

                    <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest mt-2">
                        <span className={totalSalaries > salariesCeiling ? 'text-rose-600' : 'text-emerald-600'}>
                            {totalSalaries > salariesCeiling ? 'تجاوز حد الميزانية! ⚠️' : 'آمن وضمن الخطة ✓'} ({Math.round((totalSalaries / salariesCeiling) * 100)}%)
                        </span>
                    </div>
                </div>

                {/* 2. Systems and IT Ceiling indicator */}
                <div className={`p-6 bg-white dark:bg-dm-card rounded-[2rem] border shadow-sm relative overflow-hidden ${totalSystems > systemsCeiling ? 'border-rose-300 dark:border-rose-950' : 'border-slate-100 dark:border-slate-800'}`}>
                    <h5 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">البرمجيات والتراخيص والذكاء الصناعي</h5>
                    
                    <div className="flex justify-between items-baseline mt-2">
                        <span className="text-xl font-black font-mono text-slate-850 dark:text-white">{formatCurrency(totalSystems)}</span>
                        <span className="text-[9px] text-slate-400 font-bold">بالمقارنة مع {formatCurrency(systemsCeiling)}</span>
                    </div>

                    <div className="w-full h-2 bg-slate-50 dark:bg-slate-900 rounded-full overflow-hidden mt-3 font-mono flex">
                        <div 
                            className="h-full rounded-full bg-indigo-600" 
                            style={{ width: `${Math.min(100, (totalSystems / systemsCeiling) * 100)}%` }}
                        />
                    </div>

                    <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest mt-2">
                        <span className="text-emerald-200 text-emerald-600">آمن وضمن الخطة ✓ ({Math.round((totalSystems / systemsCeiling) * 100)}%)</span>
                    </div>
                </div>

                {/* 3. Operational Costs Ceilings */}
                <div className={`p-6 bg-white dark:bg-dm-card rounded-[2rem] border shadow-sm relative overflow-hidden ${totalOps > operationalCeiling ? 'border-rose-300 dark:border-rose-950' : 'border-slate-100 dark:border-slate-800'}`}>
                    <h5 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">الاستئجار والمقرات والضيافة والمقرات</h5>
                    
                    <div className="flex justify-between items-baseline mt-2">
                        <span className="text-xl font-black font-mono text-slate-850 dark:text-white">{formatCurrency(totalOps)}</span>
                        <span className="text-[9px] text-slate-400 font-bold">بالمقارنة مع {formatCurrency(operationalCeiling)}</span>
                    </div>

                    <div className="w-full h-2 bg-slate-50 dark:bg-slate-900 rounded-full overflow-hidden mt-3 font-mono flex">
                        <div 
                            className="h-full rounded-full bg-indigo-600" 
                            style={{ width: `${Math.min(100, (totalOps / operationalCeiling) * 100)}%` }}
                        />
                    </div>

                    <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest mt-2">
                        <span className="text-emerald-200 text-emerald-600">آمن وضمن الخطة ✓ ({Math.round((totalOps / operationalCeiling) * 100)}%)</span>
                    </div>
                </div>

            </div>

            {/* Filter controls and expense journal table */}
            <div className="bg-white dark:bg-dm-card p-5 rounded-[2rem] border border-slate-150 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex flex-wrap gap-2">
                        {(['all', 'operational', 'salaries', 'systems', 'admin'] as const).map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilterCategory(cat)}
                                className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all ${filterCategory === cat ? 'bg-indigo-600 text-white' : 'bg-slate-50 dark:bg-slate-900 text-slate-400'}`}
                            >
                                {cat === 'all' ? 'جميع المصاريف' : cat === 'salaries' ? 'رواتب شركاء' : cat === 'systems' ? 'برمجيات واستضافّة' : cat === 'operational' ? 'المقرات والإيجار' : 'أخرى وإداريات'}
                            </button>
                        ))}
                    </div>

                    <Button
                        onClick={() => setAddModalOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl h-10 px-5 flex items-center gap-1.5"
                    >
                        <Plus className="w-4 h-4" /> تدوين مصروف (صرف ورقة)
                    </Button>
                </div>

                {/* List Table Portion */}
                <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-850">
                    <table className="w-full text-right text-xs" dir="rtl">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-850 text-slate-450 dark:text-slate-500 font-bold">
                                <th className="px-5 py-3">رقم السند</th>
                                <th className="px-5 py-3">التفصيل والتوصيف لورقة الصرف</th>
                                <th className="px-5 py-3 font-mono text-center">التصنيف والباب</th>
                                <th className="px-5 py-3 text-left">مجموع الإنفاق</th>
                                <th className="px-5 py-3 text-center">المستند والبيانات</th>
                                <th className="px-5 py-3 text-center">المُسجل والمراجع</th>
                                <th className="px-5 py-3 text-center">الإجراء</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                            {filteredExpenses.map((exp) => (
                                <tr key={exp.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/10">
                                    <td className="px-5 py-4 font-mono font-black text-slate-400">
                                        #{exp.id}
                                    </td>
                                    <td className="px-5 py-4 max-w-[320px]">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-800 dark:text-slate-200 leading-relaxed block">{exp.description}</span>
                                            <span className="text-[9px] text-slate-400 block mt-1 font-mono">تاريخ القيد: {exp.recordedAt}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded capitalize ${exp.category === 'salaries' ? 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600' : exp.category === 'systems' ? 'bg-violet-50 dark:bg-violet-950/20 text-violet-600' : exp.category === 'operational' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600' : 'bg-slate-50 dark:bg-slate-900 text-slate-500'}`}>
                                            {exp.category === 'salaries' ? 'رواتب' : exp.category === 'systems' ? 'برمجيات' : exp.category === 'operational' ? 'مقرات' : 'إدارية'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-left font-mono font-black text-rose-600">
                                        {formatCurrency(exp.amount)}
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                        {exp.receiptFile ? (
                                            <span className="text-[10px] text-indigo-600 font-bold inline-flex items-center gap-1 hover:underline cursor-pointer">
                                                <FileText className="w-3.5 h-3.5" /> {(exp.receiptFile as string).slice(0, 15)}...
                                            </span>
                                        ) : (
                                            <span className="text-[9px] text-slate-350">لا يوجد إثبات</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-4 text-center font-bold text-slate-500">
                                        {exp.recordedBy}
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                        <button
                                            onClick={() => handleDeleteExpense(exp.id)}
                                            className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-600 transition-colors"
                                            title="إزالة السند"
                                        >
                                            <Trash className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal: Write down custom expense */}
            <AnimatePresence>
                {addModalOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0, y: 25 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 25 }}
                            className="bg-white dark:bg-dm-card rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl space-y-6 text-right"
                        >
                            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
                                <h4 className="text-sm font-black text-slate-850 dark:text-white flex items-center gap-1.5 font-sans">
                                    <TrendingDown className="w-5 h-5 text-rose-550 text-rose-600" /> تدوين وقيد ورقة الصرف المالي للأعمال (جديد)
                                </h4>
                                <button onClick={() => setAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm font-black">&times;</button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-450 dark:text-slate-450 block">حساب التبويب والإنفاق الموجه</label>
                                    <select
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-205 border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold"
                                        value={formCategory}
                                        onChange={(e) => setFormCategory(e.target.value as any)}
                                    >
                                        <option value="operational">المقرات واستئجار مكاتب عدالة</option>
                                        <option value="salaries">رواتب موظفي السلك العام ومكافئات معاوني المكتب</option>
                                        <option value="systems">صيانة الخوادم والاشتراكات البرمجية وتراخيص AI</option>
                                        <option value="admin">الأدوات المكتبية والمطبوعات الإدارية والخدمية</option>
                                        <option value="legal">مصاريف قضائية وبوابات وزارة العدل والخبراء</option>
                                    </select>
                                </div>

                                <Input 
                                    label="مجموع الفاتورة KWD"
                                    placeholder="0.000"
                                    type="number"
                                    value={formAmt}
                                    onChange={(e) => setFormAmt(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-450 dark:text-slate-450 block">البيان والشرح للترافع أو الصيانة</label>
                                <textarea 
                                    rows={3}
                                    placeholder="شرح تفصيلي للبيان والمستهلكات المرفقة وتوجيه الموازنة..."
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-600/10"
                                    value={formDesc}
                                    onChange={(e) => setFormDesc(e.target.value)}
                                    required
                                />
                            </div>

                            {/*Receipt Attachments drag & drop mock zone */}
                            <div className="space-y-1.5">
                                <span className="text-[10px] font-black text-slate-450 dark:text-slate-455 block">إرفاق إيصال ورقة الصرف أو الفاتورة المعتمدة</span>
                                <div 
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer relative ${isDragging ? 'border-indigo-600 bg-indigo-50/10' : 'border-slate-200 dark:border-slate-850 hover:bg-slate-50/40'}`}
                                >
                                    <input 
                                        type="file" 
                                        id="expense-file" 
                                        className="hidden" 
                                        onChange={handleFileSelect}
                                    />
                                    <label htmlFor="expense-file" className="cursor-pointer space-y-1.5 block">
                                        <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
                                        <p className="text-[11px] font-black text-slate-600 dark:text-slate-350">اسحب إيصال الفواتير أو اضغط للاستعراض</p>
                                        <p className="text-[9px] text-slate-400 font-medium">يدعم مستندات PDF أو الصور المعتمدة (JPG/PNG)</p>
                                    </label>
                                    {attachedName && (
                                        <div className="mt-3.5 bg-emerald-50 dark:bg-emerald-950/20 p-2 border border-emerald-100 dark:border-emerald-850/50 rounded-xl text-[10px] text-emerald-600 font-bold inline-flex items-center gap-1.5 mx-auto">
                                            <CheckCircle className="w-3.5 h-3.5" /> تم تحميل: {attachedName}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2 justify-end pt-2">
                                <Button 
                                    onClick={() => setAddModalOpen(false)} 
                                    variant="secondary"
                                    className="text-xs font-black rounded-xl h-10 px-5"
                                >
                                    إلغاء الأمر
                                </Button>
                                <Button 
                                    onClick={handleCreateExpense} 
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl h-10 px-6 shadow-md shadow-indigo-600/15"
                                >
                                    حفظ وتدوين ورقة الصرف
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};
