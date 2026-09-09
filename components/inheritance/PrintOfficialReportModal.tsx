import React, { useState, useRef } from 'react';
import { 
    Printer, 
    Download, 
    Scale, 
    ShieldCheck, 
    QrCode, 
    FileText, 
    CheckCircle2, 
    Building, 
    DollarSign,
    Sparkles,
    Check
} from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { InheritanceCalculation } from '../../services/inheritanceEngine';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useToast } from '../ui/Toast';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    calculation: InheritanceCalculation | null;
}

export const PrintOfficialReportModal: React.FC<Props> = ({
    isOpen,
    onClose,
    calculation
}) => {
    const { addToast } = useToast();
    const certificateRef = useRef<HTMLDivElement>(null);
    const [isExportingPdf, setIsExportingPdf] = useState(false);
    const [isPdfExported, setIsPdfExported] = useState(false);

    if (!calculation) return null;

    const handleExportPdf = async () => {
        const element = certificateRef.current;
        if (!element) return;

        setIsExportingPdf(true);
        try {
            const dataUrl = await toPng(element, {
                backgroundColor: '#ffffff',
                pixelRatio: 3, // High DPI for crystal-clear vector look
                cacheBust: true
            });

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            // Calculate image dimensions to fit page nicely
            const margin = 8;
            const imgWidth = pageWidth - (margin * 2);
            // Calculate proportional height based on canvas aspect ratio
            const imgHeight = (element.offsetHeight * imgWidth) / element.offsetWidth;

            if (imgHeight <= pageHeight - (margin * 2)) {
                pdf.addImage(dataUrl, 'PNG', margin, margin, imgWidth, imgHeight, undefined, 'FAST');
            } else {
                // If content is tall, paginate or fit to single page height with proportion
                const scale = (pageHeight - (margin * 2)) / imgHeight;
                pdf.addImage(dataUrl, 'PNG', margin, margin, imgWidth * scale, (pageHeight - (margin * 2)), undefined, 'FAST');
            }

            const fileName = `صك_حصر_التركة_${(calculation.deceasedName || 'المورث').replace(/\s+/g, '_')}.pdf`;
            pdf.save(fileName);

            setIsPdfExported(true);
            addToast({
                type: 'success',
                title: 'تم تصدير ملف PDF بنجاح',
                message: `تم تحميل صك التركة المعتمد (${fileName}) بجودة عالية.`
            });
            setTimeout(() => setIsPdfExported(false), 3000);
        } catch (err) {
            console.error('PDF generation error:', err);
            addToast({
                type: 'error',
                title: 'خطأ في تصدير PDF',
                message: 'تعذر حفظ ملف PDF مباشرة، يمكنك استخدام خيار الطباعة والحفظ كـ PDF.'
            });
        } finally {
            setIsExportingPdf(false);
        }
    };

    const handlePrint = () => {
        const printContent = document.getElementById('printable-official-certificate');
        if (!printContent) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            window.print();
            return;
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html dir="rtl" lang="ar">
            <head>
                <meta charset="utf-8" />
                <title>صك حصر الإرث والأنصبة الشرعية - ${calculation.deceasedName || 'المورث'}</title>
                <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Tajawal:wght@400;500;700;900&display=swap" rel="stylesheet">
                <style>
                    body {
                        font-family: 'Tajawal', 'Amiri', Tahoma, sans-serif;
                        color: #0f172a;
                        background: #ffffff;
                        padding: 24px;
                        margin: 0;
                        direction: rtl;
                        font-size: 12px;
                        line-height: 1.6;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 10px;
                        margin-bottom: 12px;
                        font-size: 11px;
                    }
                    th, td {
                        border: 1px solid #cbd5e1;
                        padding: 7px 10px;
                        text-align: right;
                    }
                    th {
                        background-color: #f8fafc;
                        font-weight: 700;
                        color: #0f172a;
                    }
                    .header-box {
                        border-bottom: 2px solid #0f172a;
                        padding-bottom: 15px;
                        margin-bottom: 20px;
                    }
                    .gold-accent {
                        color: #b45309;
                        font-weight: bold;
                    }
                    .amount-mono {
                        font-family: monospace;
                        font-weight: bold;
                    }
                    @media print {
                        body { padding: 0; }
                        button { display: none; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                ${printContent.innerHTML}
                <script>
                    window.onload = function() {
                        window.print();
                        window.onafterprint = function() { window.close(); };
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    const formattedDate = new Date().toLocaleDateString('ar-KW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const certSerial = `ADL-EST-${Date.now().toString().slice(-6)}`;

    // Asset items list for itemized inventory
    const assetItems = [
        { label: 'السيولة النقدية والحسابات المصرفية', val: calculation.assets?.cash || 0 },
        { label: 'العقارات والأراضي الاستثمارية', val: calculation.assets?.realEstate || 0 },
        { label: 'الأسهم والمحافظ والصناديق الاستثمارية', val: calculation.assets?.stocks || 0 },
        { label: 'الذهب والمجوهرات والمعادن الثمينة', val: calculation.assets?.jewelry || 0 },
        { label: 'المركبات والآليات والقوارب', val: calculation.assets?.vehicles || 0 },
        { label: 'الديون المرجوة وحقوق الذمم المدينة', val: calculation.assets?.receivables || 0 },
        { label: 'مكافأة نهاية الخدمة والمعاشات التقاعدية', val: calculation.assets?.endOfService || 0 },
        { label: 'الشركات والرخص والمؤسسات التجارية', val: calculation.assets?.businessLicenses || 0 },
        { label: 'أصول وممتلكات عينية أخرى', val: calculation.assets?.otherAssets || 0 },
    ].filter(a => a.val > 0);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="معاينة صك حصر الإرث وتصدير PDF المعتمد"
            size="xl"
        >
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl gap-3">
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-bold">
                        صك فني وقضائي معتمد يحمل الهوية الرسمية لمكتب المحامي صبري شطا
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            onClick={handleExportPdf}
                            disabled={isExportingPdf}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs h-10 px-4 rounded-xl flex items-center gap-2 shadow-sm cursor-pointer"
                        >
                            {isExportingPdf ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : isPdfExported ? (
                                <Check className="w-4 h-4 text-emerald-200" />
                            ) : (
                                <Download className="w-4 h-4 text-amber-300" />
                            )}
                            <span>{isExportingPdf ? 'جارٍ إنشاء PDF...' : isPdfExported ? 'تم التحميل!' : 'تصدير ملف PDF احترافي'}</span>
                        </Button>

                        <Button
                            onClick={handlePrint}
                            className="bg-[#0F2744] hover:bg-[#0A1C30] text-white font-black text-xs h-10 px-4 rounded-xl flex items-center gap-2 shadow-sm cursor-pointer"
                        >
                            <Printer className="w-4 h-4 text-amber-400" />
                            <span>طباعة الصك الفوري</span>
                        </Button>
                    </div>
                </div>

                {/* Print Content Canvas */}
                <div
                    ref={certificateRef}
                    id="printable-official-certificate"
                    className="bg-white p-6 sm:p-10 border-2 border-slate-900 rounded-3xl text-slate-900 shadow-sm relative overflow-hidden"
                    style={{ fontFamily: "'Tajawal', 'Amiri', serif" }}
                >
                    {/* Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-3 pointer-events-none select-none">
                        <Scale className="w-96 h-96 text-slate-900" />
                    </div>

                    {/* Official Law Firm Header */}
                    <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5 mb-5">
                        <div className="space-y-1">
                            <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                                مكتب المحامي صبري شطا
                            </h2>
                            <h3 className="text-sm font-bold text-amber-700">
                                للمحاماة والاستشارات القانونية والتحكيم
                            </h3>
                            <p className="text-[11px] text-slate-500">
                                دولة الكويت - مجمع المحاكم والدوائر المدنية والتجارية
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">
                                التاريخ: {formattedDate} | الرقم المرجعي: {certSerial}
                            </p>
                        </div>

                        <div className="text-center flex flex-col items-center">
                            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-amber-400 font-bold text-2xl shadow-sm mb-1">
                                ⚖
                            </div>
                            <span className="text-[9px] font-black text-slate-600 uppercase">
                                قسم التركات والمواريث
                            </span>
                        </div>
                    </div>

                    {/* Certificate Title */}
                    <div className="text-center my-5 space-y-1">
                        <h3 className="text-xl font-black text-slate-900 underline decoration-amber-500 decoration-2 underline-offset-8">
                            صك حصر التركات ومحمل الأنصبة الشرعية
                        </h3>
                        <p className="text-xs text-slate-500 pt-2 font-sans">
                            تم استخراج هذه المسألة طبقاً لأحكام قانون الأحوال الشخصية الكويتي رقم (51 لسنة 1984) ومبادئ الفقه والقضاء المستقر
                        </p>
                    </div>

                    {/* Section 1: Deceased & Estate Metadata */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-5 text-xs space-y-3 font-sans">
                        <h4 className="font-black text-slate-900 border-r-4 border-r-slate-900 pr-2">
                            أولاً: بيانات المورث والذمة المالية
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                            <div>
                                <span className="text-slate-400 block text-[10px]">اسم المورث:</span>
                                <span className="font-black text-slate-800">{calculation.deceasedName || 'غير محدد'}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block text-[10px]">صفة المتوفى:</span>
                                <span className="font-black text-slate-800">{calculation.deceasedGender === 'M' ? 'ذكر' : 'أنثى'}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block text-[10px]">المذهب المطبق:</span>
                                <span className="font-black text-amber-800">
                                    {calculation.madhab === 'sunni' ? 'الأحوال الشخصية السني (51/1984)' : 'المذهب الجعفري (الطبقات)'}
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-400 block text-[10px]">إجمالي التركة المحصورة:</span>
                                <span className="font-black font-mono text-slate-900">
                                    {calculation.totalEstate.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} د.ك
                                </span>
                            </div>
                        </div>

                        {/* Inventory Grid if details exist */}
                        {assetItems.length > 0 && (
                            <div className="pt-2 border-t border-slate-200">
                                <span className="text-[10px] font-bold text-slate-500 block mb-1.5">بيان الأصول المحصورة:</span>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {assetItems.map((item, i) => (
                                        <div key={i} className="bg-white p-2 rounded-xl border border-slate-200 flex justify-between items-center text-[10px]">
                                            <span className="text-slate-600 truncate">{item.label}</span>
                                            <span className="font-black font-mono text-slate-900">{item.val.toLocaleString(undefined, { minimumFractionDigits: 1 })} د.ك</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Deductions breakdown */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200">
                            <div>
                                <span className="text-slate-400 block text-[10px]">الديون المحسومة (عينية ومرسلة):</span>
                                <span className="font-black font-mono text-rose-700">
                                    {calculation.debts.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} د.ك
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-400 block text-[10px]">مصاريف التجهيز والتكفين:</span>
                                <span className="font-black font-mono text-rose-700">
                                    {calculation.funeralExpenses.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} د.ك
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-400 block text-[10px]">صافي التركة الصالحة للقسمة:</span>
                                <span className="font-black font-mono text-emerald-700 text-sm">
                                    {calculation.netEstate.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} د.ك
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Distribution Table */}
                    <div className="mb-5 space-y-3 font-sans">
                        <div className="flex justify-between items-center">
                            <h4 className="font-black text-slate-900 text-xs border-r-4 border-r-slate-900 pr-2">
                                ثانياً: جدول توزيع الحصص والفروض الشرعية
                            </h4>
                            <span className="text-[10px] font-bold text-slate-500 font-mono">
                                أصل المسألة: {calculation.baseProblem || '-'} {calculation.isAoul ? '(عول)' : calculation.isRadd ? '(رد)' : ''}
                            </span>
                        </div>
                        <table className="w-full text-xs text-start border border-slate-300">
                            <thead>
                                <tr className="bg-slate-100 text-slate-800">
                                    <th className="p-2 text-start border border-slate-300">صفة الوارث</th>
                                    <th className="p-2 text-start border border-slate-300">العدد</th>
                                    <th className="p-2 text-start border border-slate-300">نوع الفرض والصفة</th>
                                    <th className="p-2 text-start border border-slate-300">النسبة المئوية (%)</th>
                                    <th className="p-2 text-start border border-slate-300">الحصة بالدينار الكويتي (صافي)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {calculation.shares.map((s, idx) => (
                                    <tr key={idx} className="border-b border-slate-200">
                                        <td className="p-2 font-black text-slate-900 border border-slate-200">{s.heirLabel}</td>
                                        <td className="p-2 font-bold font-mono border border-slate-200">{s.count}</td>
                                        <td className="p-2 text-slate-700 border border-slate-200">{s.shareLabel}</td>
                                        <td className="p-2 font-mono font-bold text-emerald-800 border border-slate-200">
                                            {(s.shareValue * 100).toFixed(2)}%
                                        </td>
                                        <td className="p-2 font-mono font-black text-slate-950 border border-slate-200">
                                            {s.amount.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} د.ك
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Section 2.5: Excluded Heirs if any */}
                    {calculation.excludedHeirs && calculation.excludedHeirs.length > 0 && (
                        <div className="mb-5 bg-rose-50/60 p-3.5 rounded-2xl border border-rose-200 text-xs font-sans space-y-1.5">
                            <h4 className="font-black text-rose-950 border-r-4 border-r-rose-700 pr-2">
                                المحجوبون من الإرث والموانع الشرعية:
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                {calculation.excludedHeirs.map((ex, i) => (
                                    <div key={i} className="text-[11px] text-slate-700">
                                        • <span className="font-bold">{ex.label}</span>: {ex.reason} (حُجب بواسطة: {ex.excludedBy})
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Section 3: Legal Advisory Note */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-6 text-xs leading-relaxed space-y-1.5 font-sans">
                        <h4 className="font-black text-slate-900 border-r-4 border-r-slate-900 pr-2">
                            ثالثاً: المنطوق والتوجيه القانوني والفقهي
                        </h4>
                        <p className="text-slate-700 pt-1">
                            {calculation.advisoryText}
                        </p>
                    </div>

                    {/* Signatures & Seal & QR */}
                    <div className="grid grid-cols-3 gap-6 pt-5 border-t-2 border-slate-900 text-xs font-sans items-center">
                        <div>
                            <span className="block font-bold text-slate-900">المستشار القانوني المعتمد:</span>
                            <span className="block mt-1 font-bold text-amber-700">المحامي صبري شطا</span>
                            <span className="block text-[10px] text-slate-400">محامٍ مقيد أمام الدستورية والتمييز</span>
                            <div className="h-8 mt-1 italic font-serif text-slate-500 font-bold opacity-70">
                                Sabry Shatta, Esq.
                            </div>
                        </div>

                        <div className="text-center flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full border-4 border-amber-600 bg-amber-50/50 flex items-center justify-center border-dashed font-black text-[9px] text-amber-800 text-center select-none rotate-12 leading-tight">
                                ختم الاعتماد <br />
                                صبري شطا
                            </div>
                            <span className="text-[9px] text-slate-400 mt-1">خاتم التوثيق الرسمي</span>
                        </div>

                        <div className="text-end flex flex-col items-end">
                            <div className="p-1.5 bg-slate-100 rounded-lg border border-slate-200 inline-block mb-1">
                                <QrCode className="w-10 h-10 text-slate-800" />
                            </div>
                            <span className="text-[9px] text-slate-400 block font-mono">التحقق الإلكتروني: {certSerial}</span>
                            <span className="text-[9px] text-emerald-700 font-bold block">منظومة عدالة للمحاماة</span>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
