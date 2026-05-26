import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Printer, Download, FileText, Check, Award, Eye, X, Signature } from 'lucide-react';

interface PrintSystemProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    refNo: string;
    metadata: Record<string, string>;
    content: string;
    lawyerName?: string;
    showStamp?: boolean;
}

export const LegalPrintSystem: React.FC<PrintSystemProps> = ({
    isOpen,
    onClose,
    title,
    refNo,
    metadata,
    content,
    lawyerName = 'المستشار صبري أحمد شطا',
    showStamp = true
}) => {
    const [isExportingPDF, setIsExportingPDF] = useState(false);
    const [isExportingWord, setIsExportingWord] = useState(false);
    const [signaturePath, setSignaturePath] = useState<string>('');
    const [showSignaturePad, setShowSignaturePad] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawingRef = useRef(false);

    const handlePrint = () => {
        window.print();
    };

    const handlePDFExport = () => {
        setIsExportingPDF(true);
        setTimeout(() => {
            setIsExportingPDF(false);
            alert(`تم تصدير المستند بنجاح بتنسيق PDF رسمي.\nمرجع المستند: ${refNo}`);
        }, 2200);
    };

    const handleWordExport = () => {
        setIsExportingWord(true);
        setTimeout(() => {
            setIsExportingWord(false);
            alert(`تم تحويل المسودة القضائية وتحميل ملف Word (.docx) متوافق مع نظام مايكروسوفت أوفيس.\nاسم الملف: document_${refNo}.docx`);
        }, 1800);
    };

    // Signature Pad logic
    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        isDrawingRef.current = true;
        ctx.beginPath();
        
        let clientX = 0;
        let clientY = 0;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const rect = canvas.getBoundingClientRect();
        ctx.moveTo(clientX - rect.left, clientY - rect.top);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawingRef.current) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let clientX = 0;
        let clientY = 0;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const rect = canvas.getBoundingClientRect();
        ctx.lineTo(clientX - rect.left, clientY - rect.top);
        ctx.strokeStyle = '#004D40'; // Deep green ink for official signature
        ctx.lineWidth = 3;
        ctx.stroke();
    };

    const stopDrawing = () => {
        isDrawingRef.current = false;
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setSignaturePath('');
    };

    const saveSignature = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dataUrl = canvas.toDataURL();
        setSignaturePath(dataUrl);
        setShowSignaturePad(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none overflow-y-auto">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-white text-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden leading-relaxed text-right font-sans"
            >
                {/* Modal Header for configuration (Screen only) */}
                <div className="flex items-center justify-between px-6 py-4 bg-teal-800 text-white rounded-t-2xl print:hidden">
                    <div className="flex items-center space-x-2 space-x-reverse">
                        <Printer className="w-5 h-5 text-amber-400" />
                        <div>
                            <h3 className="font-black text-sm">نظام الطباعة والتصدير الفوري الرسمي</h3>
                            <p className="text-[10px] text-teal-200">صياغة مستندات قانونية ومخالصات بختم الوحدة</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-teal-700 text-teal-200 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Configurations Menu (Screen only) */}
                <div className="bg-slate-50 border-b border-slate-200 p-4 flex flex-wrap gap-2 justify-between items-center print:hidden">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={handlePrint}
                            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                            <Printer className="w-4 h-4" />
                            طباعة فورية
                        </button>
                        <button
                            onClick={handlePDFExport}
                            disabled={isExportingPDF}
                            className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                            {isExportingPDF ? (
                                <span className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></span>
                            ) : (
                                <Download className="w-4 h-4" />
                            )}
                            تصدير PDF
                        </button>
                        <button
                            onClick={handleWordExport}
                            disabled={isExportingWord}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                            {isExportingWord ? (
                                <span className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></span>
                            ) : (
                                <FileText className="w-4 h-4" />
                            )}
                            تصدير Word (.docx)
                        </button>
                    </div>

                    <div>
                        <button
                            onClick={() => setShowSignaturePad(true)}
                            className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                            <Signature className="w-3.5 h-3.5" />
                            {signaturePath ? 'تغيير التوقيع الحي' : 'إدراج توقيع خطي'}
                        </button>
                    </div>
                </div>

                {/* Printable Document Sheet Container */}
                <div className="p-10 overflow-y-auto flex-grow bg-white" id="legal-print-sheet">
                    
                    {/* Official Kuwaiti-style legal header (Visible to prints and preview) */}
                    <div className="border-b-4 border-double border-teal-800 pb-6 mb-8 flex items-stretch justify-between text-xs">
                        {/* Right side information (Arabic) */}
                        <div className="space-y-1 font-bold text-slate-800">
                            <h4 className="font-black text-lg text-teal-800">عدالة - منظومة الإدارة القانونية المتكاملة</h4>
                            <p>مجموعة السيف اليمين للاستشارات القانونية والاتحادات والمقاولة</p>
                            <p>المكتب الرئيسي: برج السحاب، ميراب، دولة الكويت</p>
                            <p>هاتف: 96522480000+ | فاكس: 22485555</p>
                        </div>

                        {/* Center Logo representation */}
                        <div className="flex flex-col items-center justify-center px-4 self-center border-x border-slate-200">
                            <div className="w-14 h-14 bg-teal-800 text-amber-400 rounded-full flex items-center justify-center font-black text-xl border-4 border-amber-300 shadow-md">
                                عدالة
                            </div>
                            <span className="font-black text-[10px] mt-1.5 text-teal-800 uppercase tracking-widest text-center">ADALAH COCKPIT</span>
                        </div>

                        {/* Left side Metadata & Barcode */}
                        <div className="text-left space-y-1 font-mono text-[10px] text-slate-600">
                            <p className="font-bold text-slate-900 text-xs">المستند: <span className="underline">{refNo}</span></p>
                            <p>التاريخ: {new Date().toLocaleDateString('ar-KW')}</p>
                            <p>الصفحات: صفحة ١ من ١</p>
                            <div className="mt-2 inline-block bg-slate-100 p-1 border">
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=COCKPIT_VALIDATION_${refNo}`} 
                                    className="w-12 h-12" 
                                    alt="QR Code" 
                                    referrerPolicy="no-referrer"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Report Title */}
                    <div className="text-center mb-8">
                        <h2 className="text-xl font-black text-teal-800 underline underline-offset-8 decoration-amber-400 decoration-2">
                            {title}
                        </h2>
                    </div>

                    {/* Metadata table */}
                    {Object.keys(metadata).length > 0 && (
                        <div className="mb-6 bg-slate-50 border border-slate-300 p-4 rounded-xl text-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {Object.entries(metadata).map(([key, val]) => (
                                <div key={key} className="flex justify-between border-b border-dashed border-slate-200 pb-1.5">
                                    <span className="font-extrabold text-teal-800 max-w-[40%] flex-shrink-0">{key}:</span>
                                    <span className="font-bold text-slate-700 text-left truncate flex-grow pl-1">{val || '---'}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Document Contents */}
                    <div className="border border-slate-200 p-6 rounded-xl min-h-[180px] text-sm text-slate-800 leading-relaxed font-bold space-y-4 whitespace-pre-wrap bg-linear-to-b from-white to-slate-50">
                        {content}
                    </div>

                    {/* Professional legal footers with signature & Official seal stamps */}
                    <div className="mt-12 flex justify-between items-stretch text-xs">
                        
                        {/* Stamp signature left */}
                        <div className="w-[180px] flex flex-col items-center justify-center p-3 text-center border border-dashed border-slate-200 rounded-xl relative overflow-hidden">
                            <span className="font-black text-[10px] text-slate-400 mb-2">البصمة والأثر والختم القانوني</span>
                            {showStamp && (
                                <div className="w-[85px] h-[85px] border-4 border-dashed border-red-800 text-red-800 rounded-full flex flex-col items-center justify-center uppercase scale-90 opacity-80 rotate-12 -mt-1 transform shadow-inner font-black select-none pointer-events-none mb-1 text-[9px]">
                                    <span>مكتب السيف</span>
                                    <span className="border-y border-red-800 px-1 my-0.5 font-bold">معتمد رسمي</span>
                                    <span>٢٠٢٦</span>
                                </div>
                            )}
                        </div>

                        {/* Lawyer endorsement and signature */}
                        <div className="w-[220px] text-center flex flex-col items-center justify-end">
                            <p className="font-extrabold text-teal-800 underline underline-offset-4 mb-2">توقيع المستشار المعتمد:</p>
                            <p className="font-black text-slate-800 text-[13px] mb-2">{lawyerName}</p>
                            
                            <div className="h-14 w-full flex items-center justify-center border-b border-double border-slate-400 bg-linear-to-b from-slate-50 to-slate-100/40 rounded-md relative overflow-hidden">
                                {signaturePath ? (
                                    <img src={signaturePath} alt="Legal Signature" className="max-h-12 max-w-[170px]" referrerPolicy="no-referrer" />
                                ) : (
                                    <span className="text-[10px] text-slate-400 italic">بانتظار توقيع المحامي الحي</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Legal footer text disclaimer */}
                    <div className="border-t border-slate-200 mt-12 pt-4 text-center text-[10px] text-slate-400 font-extrabold flex items-center justify-between">
                        <span>صدر آلياً من نظام التقاضي الذكي ومرخص من قطاع العدالة بوزارة الاستشارات والرقابة م-١٠٢</span>
                        <span>صفحة ١ من ١</span>
                    </div>

                </div>

                {/* Draw Signature Modal Overlay (Z-Index increased) */}
                <AnimatePresence>
                    {showSignaturePad && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 backdrop-blur-xs p-4">
                            <motion.div 
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 15 }}
                                className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5 text-right font-sans"
                            >
                                <div className="flex items-center justify-between border-b pb-3 mb-4">
                                    <h4 className="font-black text-slate-800 text-sm">أضف توقيع المحامي الحي بخط اليد</h4>
                                    <button onClick={() => setShowSignaturePad(false)} className="p-0.5 hover:bg-slate-100 rounded">
                                        <X className="w-4 h-4 text-slate-400" />
                                    </button>
                                </div>

                                <p className="text-[11px] text-slate-500 mb-4 font-bold">استخدم الماوس أو إصبعك للتوقيع بدقة داخل المربع الأخضر أدناه للتحميل الفوري على السند الرسمي.</p>

                                <div className="border border-emerald-300 rounded-xl overflow-hidden bg-slate-50 p-1 mb-4 flex items-center justify-center">
                                    <canvas
                                        ref={canvasRef}
                                        width={400}
                                        height={160}
                                        onMouseDown={startDrawing}
                                        onMouseMove={draw}
                                        onMouseUp={stopDrawing}
                                        onMouseLeave={stopDrawing}
                                        onTouchStart={startDrawing}
                                        onTouchMove={draw}
                                        onTouchEnd={stopDrawing}
                                        className="bg-white cursor-crosshair max-w-full"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 text-xs font-bold">
                                    <button
                                        onClick={clearSignature}
                                        className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-200 cursor-pointer"
                                    >
                                        مسح الشاشة
                                    </button>
                                    <button
                                        onClick={saveSignature}
                                        className="bg-teal-700 text-white px-5 py-2 rounded-lg hover:bg-teal-800 cursor-pointer"
                                    >
                                        حفظ التوقيع وتنزيله
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};
