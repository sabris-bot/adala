import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    FileText, 
    Printer, 
    Download, 
    ChevronRight, 
    Eye, 
    FileSignature, 
    Check, 
    Award, 
    QrCode, 
    Calendar, 
    Briefcase,
    Settings,
    Plus,
    Trash2,
    CheckCircle,
    XCircle
} from 'lucide-react';

interface OfficialDocumentsHubProps {
    formatCurrency: (amount: number, currency?: string) => string;
}

export const OfficialDocumentsHub: React.FC<OfficialDocumentsHubProps> = ({ formatCurrency }) => {
    // Current document types in selection
    type DocType = 'invoice' | 'receipt' | 'payslip' | 'settlement' | 'loan' | 'installment' | 'treasury' | 'disbursement' | 'collection' | 'official_report';

    const [activeDocType, setActiveDocType] = useState<DocType>('invoice');

    // Live Editable Fields inside document
    const [docNumber, setDocNumber] = useState('ADL-FIN-2024-998');
    const [clientName, setClientName] = useState('مجموعة الغانم الهندسية الكبرى');
    const [employeeName, setEmployeeName] = useState('أحمد فهد الرشيدي');
    const [docDate, setDocDate] = useState(new Date().toLocaleDateString('ar-KW'));
    const [amount, setAmount] = useState<number>(3750);
    const [description, setDescription] = useState('أتعاب صياغة ومراجعة عقود الاستحواذ والشركات التمهيدية');
    const [terms, setTerms] = useState('يلتزم الطرف الثاني بسداد الدفعة المتبقية فور تصديق العقد أمام السجل العقاري والتوثيق والعدل.');
    const [signatoryName, setSignatoryName] = useState('المستشار صبري شطا');

    // Live Notification/State for alert replacement
    const [notice, setNotice] = useState<string | null>(null);

    // Line items for Invoice/Report templates
    const [items, setItems] = useState([
        { id: 1, name: 'صياغة المذكرات العمالية والتدقيق الاسترشادي', price: 2500 },
        { id: 2, name: 'حضور جلسات الترافع أمام محكمة الكلية', price: 1250 }
    ]);

    // Authorized Stamp & Signature toggles
    const [applySignature, setApplySignature] = useState(true);
    const [applyStamp, setApplyStamp] = useState(true);

    const handleAddItem = () => {
        setItems([...items, { id: Date.now(), name: 'بند جديد مخصص', price: 0 }]);
    };

    const handleRemoveItem = (id: number) => {
        setItems(items.filter(it => it.id !== id));
    };

    const handleItemChange = (id: number, field: 'name' | 'price', value: any) => {
         setItems(items.map(it => {
            if (it.id === id) {
                return { ...it, [field]: value };
            }
            return it;
         }));
    };

    const sumOfItems = items.reduce((sum, it) => sum + it.price, 0);

    // Dynamic label mapping
    const getDocumentTitle = () => {
        switch (activeDocType) {
            case 'invoice': return 'فاتورة ضريبية رسمية';
            case 'receipt': return 'سند قبض معتمد الكتروني';
            case 'payslip': return 'كشف راتب تفصيلي للموظف';
            case 'settlement': return 'تسوية مالية وإقرار مخالصة';
            case 'loan': return 'سند اتفاقية سلفة وقرض موظف';
            case 'installment': return 'إقرار مديونية وجدولة أقساط عقارية';
            case 'treasury': return 'كشف جرد الخزينة والصندوق المركزي';
            case 'disbursement': return 'أمر صرف مالي رسمي عمومي';
            case 'collection': return 'أمر تحصيل ومتابعة ديون ومستحقات';
            case 'official_report': return 'تقرير مالي معتمد للشركاء';
            default: return 'مستند مالي رسمي';
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const simulateDownload = (format: 'PDF' | 'Excel' | 'Word') => {
        setNotice(`جاري تجهيز مستند ${getDocumentTitle()} وتصديره بصيغة ${format}... تم الترميز والختم الرقمي بنجاح وقيد التحميل الآن.`);
        setTimeout(() => {
            setNotice(null);
        }, 5000);
    };

    return (
        <div className="bg-[#0a1424] border-2 border-[#DFBA5A]/35 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden text-right" dir="rtl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#DFBA5A]/5 rounded-full blur-3xl pointer-events-none" />
            
            {/* Live Notification Bar */}
            <AnimatePresence>
                {notice && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-6 left-6 right-6 md:left-auto md:right-6 md:w-[420px] bg-gradient-to-l from-[#DFBA5A] to-[#B8922A] text-[#050b15] px-5 py-4 rounded-2xl shadow-2xl border border-[#DFBA5A]/30 z-50 flex items-start gap-3 text-right"
                    >
                        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h5 className="text-xs font-black">إشعار النظام المالي</h5>
                            <p className="text-[10px] font-bold mt-1 leading-relaxed">{notice}</p>
                        </div>
                        <button 
                            onClick={() => setNotice(null)} 
                            className="text-xs hover:bg-black/10 p-1 rounded-md"
                        >
                            إغلاق
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-center gap-3 mb-8 relative z-10">
                <div className="p-3 bg-[#DFBA5A]/15 border border-[#DFBA5A]/30 text-[#DFBA5A] rounded-2xl">
                    <FileText className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-lg font-black text-[#DFBA5A]">بوابة النماذج والوثائق والمستندات المعاصرة</h3>
                    <p className="text-xs text-slate-300 font-medium font-sans">اختر نموذجاً مالياً، وقع واختم المستند، ثم قم بطباعته وتصديره بامتثال قانوني كويتي كامل</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
                {/* 1. Templates Selection & Customizer Sidebar */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-[#101F37] p-5 rounded-3xl border border-white/5 space-y-4">
                        <h4 className="text-xs font-black text-[#DFBA5A] uppercase tracking-widest pb-2 border-b border-white/5 font-sans">1. تحديد نوع المستند الرسمي</h4>
                        
                        <div className="grid grid-cols-2 gap-2 h-[220px] overflow-y-auto no-scrollbar">
                            {[
                                { key: 'invoice', label: 'فاتورة ضريبية رسمية' },
                                { key: 'receipt', label: 'سند قبض نقدي/بنوك' },
                                { key: 'payslip', label: 'كشف راتب تفصيلي' },
                                { key: 'settlement', label: 'تسوية نهاية خدمة' },
                                { key: 'loan', label: 'اتفاقية سلفة وقرض' },
                                { key: 'installment', label: 'إقرار وجدولة مديونية' },
                                { key: 'treasury', label: 'تقرير جرد الخزينة' },
                                { key: 'disbursement', label: 'أمر صرف مالي' },
                                { key: 'collection', label: 'أمر تحصيل ديون' },
                                { key: 'official_report', label: 'تقرير مالي للشركاء' }
                            ].map(doc => (
                                <button 
                                    key={doc.key}
                                    onClick={() => setActiveDocType(doc.key as DocType)}
                                    className={`p-2.5 rounded-xl text-xs font-bold text-right border transition-all truncate ${
                                        activeDocType === doc.key 
                                        ? 'bg-[#DFBA5A]/15 border-[#DFBA5A]/30 text-[#DFBA5A] font-black' 
                                        : 'border-white/5 hover:bg-white/5 text-slate-300 bg-[#13243F]'
                                    }`}
                                >
                                    {doc.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Editor Form Parameters */}
                    <div className="bg-[#101F37] p-5 rounded-3xl border border-white/5 space-y-4">
                        <h4 className="text-xs font-black text-[#DFBA5A] uppercase tracking-widest pb-2 border-b border-white/5 font-sans">2. تخصيص محتوى المستند وبياناته</h4>
                        
                        <div className="space-y-4 text-xs font-sans">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-slate-300 block mb-1">الرقم المرجعي</label>
                                    <input 
                                        type="text" 
                                        value={docNumber}
                                        onChange={(e) => setDocNumber(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-[#13243F] border border-white/10 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#DFBA5A]/30 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-slate-300 block mb-1">تاريخ المعاملة</label>
                                    <input 
                                        type="text" 
                                        value={docDate}
                                        onChange={(e) => setDocDate(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-[#13243F] border border-white/10 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#DFBA5A]/30 text-white"
                                    />
                                </div>
                            </div>

                            {/* Show / Hide fields conditionally */}
                            {(activeDocType === 'invoice' || activeDocType === 'receipt' || activeDocType === 'installment' || activeDocType === 'collection') && (
                                <div>
                                    <label className="text-slate-300 block mb-1">اسم العميل / الجهة</label>
                                    <input 
                                        type="text" 
                                        value={clientName}
                                        onChange={(e) => setClientName(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-[#13243F] border border-white/10 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#DFBA5A]/30 text-white"
                                    />
                                </div>
                            )}

                            {(activeDocType === 'payslip' || activeDocType === 'settlement' || activeDocType === 'loan') && (
                                <div>
                                    <label className="text-slate-300 block mb-1">اسم الموظف المستفيد</label>
                                    <input 
                                        type="text" 
                                        value={employeeName}
                                        onChange={(e) => setEmployeeName(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-[#13243F] border border-white/10 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#DFBA5A]/30 text-white"
                                    />
                                </div>
                            )}

                            {activeDocType !== 'invoice' && activeDocType !== 'official_report' && (
                                <div>
                                    <label className="text-slate-300 block mb-1">القيمة المالية الإجمالية</label>
                                    <input 
                                        type="number" 
                                        value={amount}
                                        onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2.5 bg-[#13243F] border border-white/10 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#DFBA5A]/30 text-white font-mono"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="text-slate-300 block mb-1">البيان والشرح العام</label>
                                <textarea
                                    value={description}
                                    rows={2}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-[#13243F] border border-white/10 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#DFBA5A]/30 text-white font-sans text-right"
                                />
                            </div>

                            {activeDocType === 'invoice' && (
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center pb-1 border-b border-white/5">
                                        <span className="text-slate-300 font-bold">بنود الفاتورة الضريبية</span>
                                        <button 
                                            onClick={handleAddItem}
                                            className="px-2 py-0.5 bg-[#DFBA5A]/15 border border-[#DFBA5A]/20 text-[#DFBA5A] rounded text-[10px] font-bold flex items-center gap-0.5 hover:bg-[#DFBA5A]/30 transition-colors"
                                        >
                                            <Plus className="w-3 h-3" /> بند إضافي
                                        </button>
                                    </div>
                                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto no-scrollbar">
                                        {items.map(it => (
                                            <div key={it.id} className="flex gap-2">
                                                <input 
                                                    type="text" 
                                                    value={it.name}
                                                    onChange={(e) => handleItemChange(it.id, 'name', e.target.value)}
                                                    className="flex-1 px-2 py-1.5 bg-[#13243F] border border-white/10 text-white rounded text-[10px]"
                                                />
                                                <input 
                                                    type="number" 
                                                    value={it.price}
                                                    onChange={(e) => handleItemChange(it.id, 'price', parseFloat(e.target.value) || 0)}
                                                    className="w-16 px-2 py-1.5 bg-[#13243F] border border-white/10 text-[#DFBA5A] rounded text-[10px] font-mono text-center"
                                                />
                                                <button 
                                                    onClick={() => handleRemoveItem(it.id)}
                                                    className="p-1 text-rose-400 hover:bg-white/5 rounded"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-slate-300 block mb-1">الشروط والأحكام / الملاحظات والتثبيت</label>
                                <textarea
                                    value={terms}
                                    rows={2}
                                    onChange={(e) => setTerms(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-[#13243F] border border-white/10 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#DFBA5A]/30 text-white font-sans text-right"
                                />
                            </div>

                            <div className="pt-3 border-t border-white/5 space-y-3">
                                <label className="text-xs font-bold text-slate-300 block">إعدادات الإمضاء والختم الرسمي للمؤسسة</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="checkbox" 
                                            id="sigCheck" 
                                            checked={applySignature}
                                            onChange={(e) => setApplySignature(e.target.checked)}
                                            className="w-4 h-4 accent-[#DFBA5A] rounded"
                                        />
                                        <label htmlFor="sigCheck" className="text-xs font-bold cursor-pointer text-slate-200">سند التوقيع المعتمد</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="checkbox" 
                                            id="stampCheck" 
                                            checked={applyStamp}
                                            onChange={(e) => setApplyStamp(e.target.checked)}
                                            className="w-4 h-4 accent-[#DFBA5A] rounded"
                                        />
                                        <label htmlFor="stampCheck" className="text-xs font-bold cursor-pointer text-slate-200">تطبيق الختم المائي</label>
                                    </div>
                                </div>
                                {applySignature && (
                                    <div>
                                        <label className="text-slate-300 block mb-1">اسم المشرف المفوض بالمصادقة</label>
                                        <input 
                                            type="text" 
                                            value={signatoryName}
                                            onChange={(e) => setSignatoryName(e.target.value)}
                                            className="w-full px-3 py-2.5 bg-[#13243F] border border-white/10 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#DFBA5A]/30 text-white"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Side-By-Side High-Contrast Official Letterhead Live Preview Panel */}
                <div className="lg:col-span-7 flex flex-col justify-between">
                    <div className="bg-[#101F37] p-3 rounded-t-[2.5rem] border-x border-t border-[#DFBA5A]/25 flex justify-between items-center">
                        <span className="text-[10px] font-black text-[#DFBA5A] tracking-wider">لوحة المعاينة الحية الرسمية مستند {getDocumentTitle()}</span>
                        <div className="flex gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-450 bg-emerald-400"></span>
                        </div>
                    </div>

                    {/* Paper emulation sheet */}
                    <div id="printableDoc" className="bg-white text-slate-900 p-8 border-x border-b border-[#DFBA5A]/35 shadow-2xl font-sans text-right min-h-[580px] flex flex-col justify-between relative overflow-hidden">
                        
                        {/* Letterhead Header */}
                        <div>
                            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-6">
                                <div className="text-right">
                                    <h2 className="text-xl font-black text-[#B8922A] flex items-center gap-1.5">
                                        <Award className="w-5 h-5 text-[#B8922A]" />
                                        <span>عدالة للمنظومة القانونية المتكاملة</span>
                                    </h2>
                                    <p className="text-[10px] text-gray-400 font-sans mt-0.5">مكتب المحاماة والخدمات والتحكيم التجاري المعتمد</p>
                                    <p className="text-[9px] text-gray-400 font-sans mt-0.5">الكويت - مجمع الصفاة التجاري، الميزانين 3</p>
                                </div>
                                <div className="text-left font-sans text-[10px] text-gray-400 leading-normal font-mono">
                                    <p className="font-bold text-slate-900">Ref: <span>{docNumber}</span></p>
                                    <p>Date: {docDate}</p>
                                    <p>State of Kuwait</p>
                                </div>
                            </div>

                            {/* Document dynamic title header */}
                            <h3 className="text-center font-black text-lg text-slate-800 bg-[#DFBA5A]/10 p-2.5 underline underline-offset-8 decoration-[#DFBA5A] tracking-wider mb-8">
                                {getDocumentTitle()}
                            </h3>

                            {/* Document main structured fields */}
                            <div className="space-y-6 text-xs leading-relaxed text-slate-700">
                                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-dashed border-gray-150">
                                    {(activeDocType === 'invoice' || activeDocType === 'receipt' || activeDocType === 'installment' || activeDocType === 'collection') && (
                                        <div>
                                            <span className="text-gray-400 font-sans text-[10px] font-bold block">مقدم أو موجه إلى (الطرف الثاني)</span>
                                            <span className="font-black text-slate-900 text-sm">{clientName}</span>
                                        </div>
                                    )}

                                    {(activeDocType === 'payslip' || activeDocType === 'settlement' || activeDocType === 'loan') && (
                                        <div>
                                            <span className="text-gray-400 font-sans text-[10px] font-bold block">اسم الموظف المستفيد</span>
                                            <span className="font-black text-slate-900 text-sm">{employeeName}</span>
                                        </div>
                                    )}

                                    <div>
                                        <span className="text-gray-400 font-sans text-[10px] font-bold block">شكل المعاملة المالية</span>
                                        <span className="font-black text-slate-800 text-xs">
                                            {activeDocType === 'invoice' ? 'مطالبة بسداد أتعاب قضائية' : activeDocType === 'receipt' ? 'إثبات تحصيل وقبض رسمي' : 'تسجيل تسوية واعتماد بيانات'}
                                        </span>
                                    </div>
                                </div>

                                {/* Conditionally Render Description and Amount or Items Table */}
                                {activeDocType === 'invoice' ? (
                                    <div className="space-y-4 pt-2">
                                        <table className="w-full text-xs border border-gray-200">
                                            <thead>
                                                <tr className="bg-[#050C16] text-white font-bold">
                                                    <th className="p-2 border">الرقيم</th>
                                                    <th className="p-2 border">تفاصيل ووصف البنود المستحقة للفاتورة</th>
                                                    <th className="p-2 border text-left">مجموع القيمة</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {items.map((it, idx) => (
                                                    <tr key={it.id} className="border-b">
                                                        <td className="p-2 border font-mono text-center">{idx + 1}</td>
                                                        <td className="p-2 border">{it.name}</td>
                                                        <td className="p-2 border text-left font-mono font-bold">{formatCurrency(it.price)}</td>
                                                    </tr>
                                                ))}
                                                <tr className="bg-[#DFBA5A]/10 font-bold">
                                                    <td colSpan={2} className="p-2 border text-right text-slate-800">المجموع الفرعي الإجمالي المتبقي</td>
                                                    <td className="p-2 border text-left font-mono text-[#B8922A]">{formatCurrency(sumOfItems)}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-gray-250">
                                        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                            <span className="text-gray-500 font-bold">تفاصيل وسند المبلغ المقبوض/المطالب به</span>
                                            <span className="text-lg font-black font-mono text-[#B8922A]">{formatCurrency(amount)}</span>
                                        </div>
                                        <p className="text-xs text-[#050b15]/90 leading-relaxed">
                                            يقر قيد الشئون الإدارية والمالية وبراءة الذمة لدى المنظومة الكلية بوجوب التثبيت لهذا المبلغ كونه: <span className="font-bold underline underline-offset-4">{description}</span>
                                        </p>
                                    </div>
                                )}

                                {/* Terms Block */}
                                <div className="pt-4 border-t border-gray-100">
                                    <span className="text-gray-400 font-sans text-[9px] font-bold block mb-1">البنود والشروط القانونية المرفقة</span>
                                    <p className="text-[10px] text-gray-500 leading-relaxed italic block max-w-xl">
                                        * {terms}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Signs & Seal Room inside previews */}
                        <div className="pt-8 mt-6 border-t border-gray-100 flex justify-between items-end relative z-10 font-sans">
                            {/* Signature element */}
                            <div className="text-right min-w-[140px]">
                                {applySignature ? (
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">توقيع المسؤول المالي المعتمد</p>
                                        <p className="text-sm font-bold text-gray-800">{signatoryName}</p>
                                        <p className="text-[14px] text-[#B8922A] italic font-mono tracking-tighter opacity-75 underline underline-offset-4 rotate-3 block select-none">
                                            {signatoryName.replace('المستشار ', '')} __Approved_ADL
                                        </p>
                                    </div>
                                ) : (
                                    <div className="h-12 w-32 border border-dashed border-gray-200 rounded flex items-center justify-center text-[10px] text-gray-300">
                                        مسار التوقيع معطل
                                    </div>
                                )}
                            </div>

                            {/* Rotated Seal Seal Graphic element */}
                            {applyStamp && (
                                <div className="absolute left-1/2 bottom-4 -translate-x-1/2 w-24 h-24 border-4 border-double border-[#DFBA5A]/50 rounded-full flex flex-col items-center justify-center rotate-12 bg-white/5 backdrop-blur-[1px] pointer-events-none select-none">
                                    <div className="text-[9px] font-black text-[#B8922A]/60 uppercase tracking-widest leading-none">ADALA FINANCIAL</div>
                                    <div className="text-[10px] font-black text-[#B8922A] my-0.5">عدالة للمحاماة</div>
                                    <div className="text-[8px] font-black text-[#B8922A]/50 leading-none">مكتب الاعتماد العام</div>
                                </div>
                            )}

                            {/* Standard validation QR blocks */}
                            <div className="text-left font-mono">
                                <QrCode className="w-12 h-12 text-[#050C16] border border-slate-200 p-0.5 rounded" />
                                <p className="text-[8px] text-gray-400 mt-1 uppercase">Secure QR ID</p>
                            </div>
                        </div>
                    </div>

                    {/* Operational export actions */}
                    <div className="p-6 bg-[#101F37] rounded-b-[2.5rem] border-x border-b border-[#DFBA5A]/25 flex flex-wrap gap-4 justify-between items-center">
                        <p className="text-[10px] text-slate-300 leading-relaxed truncate max-w-sm font-sans">
                            * يتم توليد هذه المستندات بمطابقة لمتطلبات ديوان المحاسبة والتشريعات العمالية والمدنية الكلية بوزارة العدل الكويتية.
                        </p>
                        <div className="flex gap-2 font-black text-xs">
                            <button 
                                onClick={handlePrint}
                                className="px-4 py-2.5 bg-gradient-to-l from-[#DFBA5A] to-[#B8922A] text-[#050b15] hover:opacity-90 rounded-xl flex items-center gap-2 transition-all shadow-md cursor-pointer"
                            >
                                <Printer className="w-4 h-4" />
                                <span>طباعة المستند ورقيّاً</span>
                            </button>
                            <button 
                                onClick={() => simulateDownload('PDF')}
                                className="px-4 py-2.5 bg-slate-800 border border-white/5 text-white hover:bg-slate-700 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                                <Download className="w-4 h-4" />
                                <span>تصدير PDF</span>
                            </button>
                            <button 
                                onClick={() => simulateDownload('Excel')}
                                className="px-3 py-2.5 bg-slate-800 border border-white/5 text-white hover:bg-slate-700 rounded-xl flex items-center gap-1.5 transition-all text-[11px] cursor-pointer"
                            >
                                <span>جدول Excel</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
