import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    FileText, 
    Printer, 
    Download, 
    Plus, 
    CheckCircle, 
    Clock, 
    AlertTriangle, 
    Trash, 
    Calculator,
    TrendingUp,
    Bookmark,
    Eye,
    Briefcase
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useToast } from '../ui/Toast';
import { initialCases } from '../../data/caseData';

interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
}

interface Invoice {
    id: string;
    caseId: string;
    caseNumber: string;
    clientName: string;
    type: string;
    amount: number;
    dueDate: string;
    status: 'paid' | 'pending' | 'overdue';
    taxPercent: number;
    discountAmount: number;
    items: InvoiceItem[];
}

interface InvoicesTabProps {
    formatCurrency: (amount: number, currency?: string) => string;
}

export const InvoicesTab: React.FC<InvoicesTabProps> = ({ formatCurrency }) => {
    const { addToast } = useToast();
    
    // Core invoices dataset (Preserving pre-existing mock structures and metadata)
    const [invoices, setInvoices] = useState<Invoice[]>([
        {
            id: 'INV-2024-001',
            caseId: '1',
            caseNumber: 'CML-2024-101',
            clientName: 'بنك بوبيان ش.م.ك',
            type: 'أتعاب المرافعة القضائية أمام التمييز',
            amount: 12500,
            dueDate: '2024-05-30',
            status: 'pending',
            taxPercent: 5,
            discountAmount: 200,
            items: [
                { description: 'صياغة المذكرات وتدقيق الطعن بالتمييز', quantity: 1, unitPrice: 8000 },
                { description: 'حضور جلسات الترافع والتقييم اللفظي', quantity: 3, unitPrice: 1500 }
            ]
        },
        {
            id: 'INV-2024-002',
            caseId: '2',
            caseNumber: 'LAB-2024-045',
            clientName: 'شركة الغانم الهندسية الكبرى',
            type: 'تدقيق وصياغة لوائح العمل والمخالصات العمالية',
            amount: 5700,
            dueDate: '2024-05-10',
            status: 'paid',
            taxPercent: 5,
            discountAmount: 0,
            items: [
                { description: 'تحديث ميثاق العمل للتوافق مع المادة 6/2010', quantity: 1, unitPrice: 4000 },
                { description: 'استشارات تسوية حقوق عمالة وافدة', quantity: 10, unitPrice: 170 }
            ]
        },
        {
            id: 'INV-2024-003',
            caseId: '3',
            caseNumber: 'RENT-EVICT-001-2024',
            clientName: 'السيد أحمد محمود العبدالله',
            type: 'دعوى إخلاء العقار الاستثماري وتأخير القيمة الإيجارية',
            amount: 8900,
            dueDate: '2024-04-20',
            status: 'overdue',
            taxPercent: 10,
            discountAmount: 500,
            items: [
                { description: 'صياغة صحيفة الدعوى وطلب عزل العقار المأجور', quantity: 1, unitPrice: 7000 },
                { description: 'رسوم إيداع الخبراء القضائية ومذكرات الإعلان', quantity: 1, unitPrice: 2400 }
            ]
        }
    ]);

    // UI state managers
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
    
    // Invoice creator form states
    const [creatorOpen, setCreatorOpen] = useState(false);
    const [formClient, setFormClient] = useState('');
    const [formCaseId, setFormCaseId] = useState(initialCases[0]?.id || '1');
    const [formType, setFormType] = useState('أتعاب مرافعة واستشارات قضائية');
    const [formTax, setFormTax] = useState('5');
    const [formDiscount, setFormDiscount] = useState('0');
    const [formDueDate, setFormDueDate] = useState(new Date().toISOString().split('T')[0]);
    // items lines
    const [formItems, setFormItems] = useState<InvoiceItem[]>([
        { description: 'الاستماع القضائي وتحليل العقود التمهيدية', quantity: 1, unitPrice: 1500 }
    ]);

    // Item creation helper
    const handleAddLineItem = () => {
        setFormItems([...formItems, { description: '', quantity: 1, unitPrice: 0 }]);
    };

    const handleRemoveLineItem = (idx: number) => {
        if (formItems.length === 1) return;
        setFormItems(formItems.filter((_, i) => i !== idx));
    };

    const handleUpdateLineItem = (idx: number, field: keyof InvoiceItem, value: any) => {
        setFormItems(prev => prev.map((item, i) => {
            if (i === idx) {
                return { ...item, [field]: value };
            }
            return item;
        }));
    };

    // Calculate sum for creator form
    const formGrossTotal = formItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const calculatedTax = (formGrossTotal * parseFloat(formTax)) / 100;
    const finalFormTotal = Math.max(0, formGrossTotal + calculatedTax - parseFloat(formDiscount || '0'));

    const handleCreateInvoice = () => {
        if (!formClient.trim() || formItems.some(i => !i.description.trim())) {
            addToast({
                type: 'error',
                title: 'بيانات ناقصة',
                message: 'يرجى كتابة اسم العميل ووصف بنود الفاتورة بالكامل.'
            });
            return;
        }

        const selectedCase = initialCases.find(c => c.id === formCaseId);
        
        const newInvoice: Invoice = {
            id: `INV-2024-00${invoices.length + 1}`,
            caseId: formCaseId,
            caseNumber: selectedCase ? selectedCase.caseNumber : 'GEN-2024-99',
            clientName: formClient,
            type: formType,
            amount: finalFormTotal,
            dueDate: formDueDate,
            status: 'pending',
            taxPercent: parseFloat(formTax),
            discountAmount: parseFloat(formDiscount),
            items: formItems
        };

        setInvoices([newInvoice, ...invoices]);
        setCreatorOpen(false);
        setFormClient('');
        setFormItems([{ description: 'الاستماع القضائي وتحليل العقود التمهيدية', quantity: 1, unitPrice: 1500 }]);
        addToast({
            type: 'success',
            title: 'تم إنشاء الفاتورة 🧾',
            message: `صدر رقم الفاتورة ${newInvoice.id} ومربوط بالقضية ${newInvoice.caseNumber}.`
        });
    };

    const handleMarkAsPaid = (id: string) => {
        setInvoices(prev => prev.map(inv => {
            if (inv.id === id) {
                return { ...inv, status: 'paid' };
            }
            return inv;
        }));
        addToast({
            type: 'success',
            title: 'تم استحقاق الفاتورة ✅',
            message: 'تم تسجيل تحصيل كامل المبلغ وحساب الإيراد والضرائب المستحقة.'
        });
    };

    // File exporters
    const handleDownloadCSV = (inv: Invoice) => {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Invoice ID,Client Name,Case Number,Service Type,Amount,Due Date,Status\n";
        csvContent += `${inv.id},"${inv.clientName}",${inv.caseNumber},"${inv.type}",${inv.amount},${inv.dueDate},${inv.status}\n\n`;
        csvContent += "Item,Qty,Unit Price,Total Price\n";
        inv.items.forEach(it => {
            csvContent += `"${it.description}",${it.quantity},${it.unitPrice},${it.quantity * it.unitPrice}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `invoice-${inv.id}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        addToast({
            type: 'success',
            title: 'مستند Excel جاهز 📥',
            message: 'تم تنزيل جدول الفاتورة بصيغة CSV المتوافقة مع الإدارة الضريبية.'
        });
    };

    const handlePrintInvoice = () => {
        window.print();
    };

    // Filters logic
    const filteredInvoices = invoices.filter(inv => {
        const matchesSearch = inv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              inv.caseNumber.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6 text-right" dir="rtl">
            
            {/* KPI Overview Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 no-print">
                {[
                    { label: 'إجمالي سندات الفوترة', value: 27100, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/20' },
                    { label: 'الأتعاب المحصلة', value: 5700, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
                    { label: 'بانتظار السداد', value: 12500, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/20' },
                    { label: 'المتأخرات والجزاءات', value: 8900, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/20' },
                ].map((s, i) => (
                    <Card key={i} className="p-6 rounded-[2rem] border-normal bg-white dark:bg-dm-card relative overflow-hidden flex flex-col justify-between min-h-[140px]">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">{s.label}</span>
                            <div className={`p-2 rounded-xl ${s.bg} ${s.color}`}>
                                <s.icon className="w-4 h-4" />
                            </div>
                        </div>
                        <h4 className="text-2xl font-black mt-4 font-mono text-slate-850 dark:text-white">{formatCurrency(s.value)}</h4>
                    </Card>
                ))}
            </div>

            {/* Invoices List and Filter Bar */}
            <div className="bg-white dark:bg-dm-card p-5 rounded-[2rem] border border-slate-150 dark:border-slate-800 shadow-sm space-y-4 no-print">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex flex-wrap gap-2">
                        {(['all', 'paid', 'pending', 'overdue'] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setStatusFilter(f)}
                                className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all ${statusFilter === f ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' : 'bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-slate-650'}`}
                            >
                                {f === 'all' ? 'الكل' : f === 'paid' ? 'المحصلة' : f === 'pending' ? 'بانتظار التحصيل' : 'المتأخرة'}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <input 
                            type="text"
                            placeholder="ابحث برقم الفاتورة، العميل، القضية..."
                            className="text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl px-4 py-2 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-600/10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Button
                            onClick={() => setCreatorOpen(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl h-10 px-5 shrink-0 flex items-center gap-1.5"
                        >
                            <Plus className="w-4 h-4" /> إصدار فاتورة
                        </Button>
                    </div>
                </div>

                {/* Table Portion */}
                <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-850">
                    <table className="w-full text-right text-xs" dir="rtl">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-900/40 text-slate-450 dark:text-slate-500 font-bold border-b border-slate-100 dark:border-slate-850">
                                <th className="px-6 py-4">رقم الفاتورة</th>
                                <th className="px-6 py-4">العميل والمُوجَّه</th>
                                <th className="px-6 py-4 font-mono">ملخص القضية</th>
                                <th className="px-6 py-4 text-left">قيمة الفاتورة</th>
                                <th className="px-6 py-4 text-center">تاريخ الاستحقاق</th>
                                <th className="px-6 py-4 text-center">حالة السداد</th>
                                <th className="px-6 py-4 text-center">الإجراءات والسحب</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
                            {filteredInvoices.map(inv => (
                                <tr key={inv.id} className="hover:bg-indigo-50/5 dark:hover:bg-slate-900/10 transition-colors">
                                    <td className="px-6 py-4 font-mono font-black text-indigo-650 dark:text-indigo-400">
                                        #{inv.id}
                                    </td>
                                    <td className="px-6 py-4 max-w-[220px]">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">{inv.clientName}</span>
                                            <span className="text-[10px] text-slate-400 block truncate">{inv.type}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono font-black text-[10px] text-slate-400">
                                        {inv.caseNumber}
                                    </td>
                                    <td className="px-6 py-4 text-left font-bold font-mono text-slate-850 dark:text-white">
                                        {formatCurrency(inv.amount)}
                                    </td>
                                    <td className="px-6 py-4 text-center font-bold font-mono text-slate-500">
                                        {inv.dueDate}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {inv.status === 'paid' && <span className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black px-2.5 py-1 rounded-full inline-block">مُحصّلة</span>}
                                        {inv.status === 'pending' && <span className="bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 text-[9px] font-black px-2.5 py-1 rounded-full inline-block">قيد الانتظار</span>}
                                        {inv.status === 'overdue' && <span className="bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-[9px] font-black px-2.5 py-1 rounded-full inline-block">متأخرة السداد</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center items-center gap-1">
                                            <button 
                                                onClick={() => {
                                                    setSelectedInvoice(inv);
                                                    setInvoiceModalOpen(true);
                                                }}
                                                className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-500 hover:text-indigo-600 border border-transparent hover:border-slate-100 transition-all"
                                                title="معاينة الفاتورة البصرية"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDownloadCSV(inv)}
                                                className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-500 hover:text-emerald-600 border border-transparent hover:border-slate-100 transition-all"
                                                title="تصدير Excel/CSV"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                            {inv.status !== 'paid' && (
                                                <button 
                                                    onClick={() => handleMarkAsPaid(inv.id)}
                                                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black rounded-lg"
                                                >
                                                    تحصيل
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredInvoices.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-10 text-slate-400 font-bold">
                                        لم يتم العثور على أي فواتير تطابق شروط البحث والفرز المحددة.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal 1: Beautiful PDF Print & Brand Invoice View */}
            <AnimatePresence>
                {invoiceModalOpen && selectedInvoice && (
                    <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-[2rem] max-w-2xl w-full p-4 md:p-8 shadow-2.5xl overflow-y-auto max-h-[90vh] text-right"
                        >
                            {/* Head Buttons (Excluded from print) */}
                            <div className="flex justify-between items-center pb-4 border-b border-slate-100 no-print">
                                <span className="text-xs font-black text-slate-450 uppercase flex items-center gap-1.5">
                                    <Bookmark className="w-4 h-4 text-indigo-650" /> معاينة مستند الفاتورة لشركة عدالة القابضة
                                </span>
                                <div className="flex gap-1.5">
                                    <button 
                                        onClick={handlePrintInvoice}
                                        className="bg-indigo-600 text-white hover:bg-indigo-750 px-4 h-9 rounded-xl text-[10px] font-black flex items-center gap-1 shadow-md shadow-indigo-600/10"
                                    >
                                        <Printer className="w-3.5 h-3.5" /> طباعة المستند PDF
                                    </button>
                                    <button 
                                        onClick={() => setInvoiceModalOpen(false)} 
                                        className="text-slate-400 focus:outline-none hover:text-slate-600 text-base font-black px-2"
                                    >
                                        &times;
                                    </button>
                                </div>
                            </div>

                            {/* Actual Styled Invoice Print Template */}
                            <div className="p-8 border-4 border-slate-50 rounded-2xl bg-white space-y-8 font-sans text-slate-800" id="print-area">
                                
                                {/* Legal Branding Header */}
                                <div className="flex justify-between items-start border-b-2 border-indigo-600 pb-5">
                                    <div className="space-y-1">
                                        <h2 className="text-xl font-black text-indigo-600">عَدالة للخدمات القانونية والمحاماة</h2>
                                        <p className="text-[10px] text-slate-500 font-bold">مكتب الاستشارات القضائية وتصفية النزاعات العمالية والتجارية</p>
                                        <p className="text-[10px] text-slate-400">الشرق - شارع أحمد الجابر - برج الصفاة، د. 14</p>
                                        <p className="text-[10px] text-slate-450 font-mono">هاتف: +965 2244 6688 - ترخيص: #990263</p>
                                    </div>
                                    <div className="text-left font-mono">
                                        <span className="text-indigo-600 font-black text-sm block">فاتورة أجور أتعاب</span>
                                        <span className="text-[10px] text-slate-400 block font-black mt-1">NUMBER: {selectedInvoice.id}</span>
                                        <span className="text-[10px] text-slate-400 block font-black">DATE: {selectedInvoice.dueDate}</span>
                                        <span className="text-[10px] text-slate-400 block font-black">CASE REF: {selectedInvoice.caseNumber}</span>
                                    </div>
                                </div>

                                {/* Subject Details */}
                                <div className="grid grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl">
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black text-slate-400 uppercase">المستفيد / الجهة الموجه إليها الفاتورة</span>
                                        <p className="font-black text-indigo-900 text-xs">{selectedInvoice.clientName}</p>
                                        <p className="text-[10px] text-slate-500 font-bold">نوع الخدمة المنجزة: {selectedInvoice.type}</p>
                                    </div>
                                    <div className="text-left space-y-1">
                                        <span className="text-[9px] font-black text-slate-400 uppercase block">مرجع الضابط المالي للشركة</span>
                                        <p className="text-xs text-slate-700 font-bold">دائرة الشؤون المالية والقضايا</p>
                                        <p className="text-[10px] text-slate-400">حالة السند: {selectedInvoice.status === 'paid' ? 'مستوفى بالكامل ✅' : 'قيد سريان الأجل ⚠️'}</p>
                                    </div>
                                </div>

                                {/* Items list table */}
                                <table className="w-full text-right text-xs border-collapse">
                                    <thead>
                                        <tr className="bg-indigo-650 bg-indigo-600 text-white font-black">
                                            <th className="p-2.5 rounded-r-xl border-b border-indigo-700">البند والوصف الفني للمستند القضائي المنجز</th>
                                            <th className="p-2.5 text-center border-b border-indigo-700">الكمية</th>
                                            <th className="p-2.5 text-left border-b border-indigo-700">سعر الوحدة</th>
                                            <th className="p-2.5 text-left rounded-l-xl border-b border-indigo-700">الإجمالي Gross</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {selectedInvoice.items.map((it, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/50">
                                                <td className="p-3 font-semibold text-slate-800">{it.description}</td>
                                                <td className="p-3 text-center font-mono font-bold text-slate-500">{it.quantity}</td>
                                                <td className="p-3 text-left font-mono font-bold text-slate-500">{formatCurrency(it.unitPrice)}</td>
                                                <td className="p-3 text-left font-mono font-black text-slate-800">{formatCurrency(it.quantity * it.unitPrice)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Formula Summary row */}
                                <div className="border-t border-slate-100 pt-5 flex justify-end">
                                    <div className="w-64 space-y-2 text-xs font-bold text-slate-500">
                                        <div className="flex justify-between">
                                            <span>مجموع الفاتورة الإجمالي:</span>
                                            <span className="font-mono text-slate-700">{formatCurrency(selectedInvoice.items.reduce((s, it) => s + (it.quantity * it.unitPrice), 0))}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>الرسوم والضريبة المضافة ({selectedInvoice.taxPercent}%):</span>
                                            <span className="font-mono text-slate-750 font-semibold">+{formatCurrency(selectedInvoice.items.reduce((s, it) => s + (it.quantity * it.unitPrice), 0) * selectedInvoice.taxPercent / 100)}</span>
                                        </div>
                                        {selectedInvoice.discountAmount > 0 && (
                                            <div className="flex justify-between text-rose-600">
                                                <span>الخصم المسموح به:</span>
                                                <span className="font-mono">-{formatCurrency(selectedInvoice.discountAmount)}</span>
                                            </div>
                                        )}
                                        <div className="h-px bg-slate-200 my-1"></div>
                                        <div className="flex justify-between text-sm font-black text-indigo-600 pt-1">
                                            <span>المبلغ الصافي المطلوب:</span>
                                            <span className="font-mono text-base">{formatCurrency(selectedInvoice.amount)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Signatures info */}
                                <div className="pt-8 border-t border-slate-100 flex justify-between items-end">
                                    <div className="text-[10px] space-y-4">
                                        <p className="font-black text-slate-400 uppercase">اعتماد المدير العام للشؤون المالية</p>
                                        <p className="font-bold text-indigo-900 border-b border-slate-200 pb-1 w-36">صبري شطا (المستشار)</p>
                                    </div>
                                    
                                    <div className="h-20 w-20 rounded-full border border-indigo-650 border-indigo-650/40 border-2 border-dashed flex items-center justify-center text-indigo-600 font-extrabold text-xs rotate-12 opacity-40">
                                        عدالة قانونية
                                    </div>
                                </div>

                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal 2: Create Invoice Creator Form */}
            <AnimatePresence>
                {creatorOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 30 }}
                            className="bg-white rounded-[2.5rem] p-8 max-w-2xl w-full shadow-2.5xl space-y-6 text-right overflow-y-auto max-h-[90vh]"
                        >
                            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
                                <h4 className="text-sm font-black text-slate-850 dark:text-white flex items-center gap-1.5 font-sans">
                                    <FileText className="w-5 h-5 text-indigo-600" /> إصدار مستند مطالبة بالرعايات والأتعاب (جديد)
                                </h4>
                                <button onClick={() => setCreatorOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm font-black">&times;</button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Input 
                                    label="اسم الموكل / الشركة المعنية"
                                    placeholder="مثلاً: شركة نفط الكويت..."
                                    value={formClient}
                                    onChange={(e) => setFormClient(e.target.value)}
                                    required
                                />
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-450 dark:text-slate-400">ربط القضية المرجعية لقاعدة البيانات</label>
                                    <select
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold"
                                        value={formCaseId}
                                        onChange={(e) => setFormCaseId(e.target.value)}
                                    >
                                        {initialCases.map(c => (
                                            <option key={c.id} value={c.id}>{c.caseNumber} - {c.title}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <Input 
                                    label="تاريخ سريان الاستحقاق"
                                    type="date"
                                    value={formDueDate}
                                    onChange={(e) => setFormDueDate(e.target.value)}
                                    required
                                />
                                <Input 
                                    label="الضريبة المضافة (%)"
                                    type="number"
                                    value={formTax}
                                    onChange={(e) => setFormTax(e.target.value)}
                                    required
                                />
                                <Input 
                                    label="قيمة الخصم المسموح به KWD"
                                    type="number"
                                    value={formDiscount}
                                    onChange={(e) => setFormDiscount(e.target.value)}
                                />
                            </div>

                            <Input 
                                label="عنوان وتصنيف السند المطالب به"
                                placeholder="مثلاً: صياغة مسودات وتحكيم النزاعات..."
                                value={formType}
                                onChange={(e) => setFormType(e.target.value)}
                                required
                            />

                            {/* Item lines forms list */}
                            <div className="space-y-3.5 border-t border-slate-100 dark:border-slate-800 pt-5">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-black text-slate-450 dark:text-slate-400 block">البنود التفصيلية لأتعاب الفاتورة (قائمة المقاصة)</span>
                                    <button 
                                        onClick={handleAddLineItem}
                                        type="button" 
                                        className="bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 hover:bg-indigo-100 px-3 py-1 text-[9px] rounded-lg font-black"
                                    >
                                        + إضافة بند للجدول
                                    </button>
                                </div>

                                {formItems.map((item, idx) => (
                                    <div key={idx} className="flex gap-3.5 items-end">
                                        <div className="flex-1">
                                            <input 
                                                placeholder="وصف وتوصيف البند المنجز..."
                                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-600/10"
                                                value={item.description}
                                                onChange={(e) => handleUpdateLineItem(idx, 'description', e.target.value)}
                                            />
                                        </div>
                                        <div className="w-20">
                                            <input 
                                                type="number" 
                                                placeholder="الكمية"
                                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-600/10 font-mono text-center"
                                                value={item.quantity}
                                                onChange={(e) => handleUpdateLineItem(idx, 'quantity', parseInt(e.target.value) || 0)}
                                            />
                                        </div>
                                        <div className="w-28">
                                            <input 
                                                type="number" 
                                                placeholder="أجر الوحدة KWD"
                                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-600/10 font-mono text-left"
                                                value={item.unitPrice || ''}
                                                onChange={(e) => handleUpdateLineItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                                            />
                                        </div>
                                        {formItems.length > 1 && (
                                            <button 
                                                onClick={() => handleRemoveLineItem(idx)}
                                                type="button" 
                                                className="p-2 border border-rose-100 hover:bg-rose-50 text-rose-650 rounded-xl"
                                            >
                                                <Trash className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Total estimation panel */}
                            <div className="p-4 bg-indigo-50/20 dark:bg-slate-900/50 rounded-2xl flex justify-between items-center text-xs font-bold font-sans">
                                <div className="space-y-1">
                                    <span className="text-slate-450 text-[9px] block">جملة بنود العقد (قبل الضرائب والخصومات)</span>
                                    <span className="text-slate-800 dark:text-slate-200 font-mono block">إجمالي أولي: {formatCurrency(formGrossTotal)}</span>
                                </div>
                                <div className="text-left">
                                    <span className="text-slate-450 text-[9px] block">المبلغ النهائي المطالب به (الصافي)</span>
                                    <span className="text-indigo-650 dark:text-indigo-400 text-base font-black font-mono block">{formatCurrency(finalFormTotal)}</span>
                                </div>
                            </div>

                            <div className="flex gap-2 justify-end pt-2">
                                <Button 
                                    onClick={() => setCreatorOpen(false)} 
                                    variant="secondary"
                                    className="text-xs font-black rounded-xl h-10 px-5"
                                >
                                    إلغاء الأمر
                                </Button>
                                <Button 
                                    onClick={handleCreateInvoice} 
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl h-10 px-6 shadow-md shadow-indigo-600/15"
                                >
                                    حفظ وتوليد مستند السند
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};
