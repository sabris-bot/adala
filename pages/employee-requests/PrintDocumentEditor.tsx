import React, { useState, useEffect } from 'react';
import { 
    Printer, Save, Copy, FileEdit, Eye, 
    Trash2, PlusCircle, CheckCircle2, QrCode, Clipboard
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { EmployeeRequest } from './request-types';
import { getDefaultDocumentText } from './mock-data';

interface PrintDocumentEditorProps {
    request: EmployeeRequest;
    onClose: () => void;
    onSaveDocumentText: (requestId: string, text: string) => void;
    onDuplicateAsNewRequest: (request: EmployeeRequest, editedText: string) => void;
}

export const PrintDocumentEditor: React.FC<PrintDocumentEditorProps> = ({
    request,
    onClose,
    onSaveDocumentText,
    onDuplicateAsNewRequest
}) => {
    const [editMode, setEditMode] = useState(false);
    const [documentText, setDocumentText] = useState('');
    const [extraNotes, setExtraNotes] = useState<string[]>([]);
    const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
    const [showSuccessBanner, setShowSuccessBanner] = useState(false);
    const [bannerMessage, setBannerMessage] = useState('');

    // Load initial or previously edited document text
    useEffect(() => {
        if (request) {
            setDocumentText(request.customPrintedDocContent || getDefaultDocumentText(request));
            setExtraNotes(request.notes ? [request.notes] : []);
        }
    }, [request]);

    const handleSave = () => {
        onSaveDocumentText(request.id, documentText);
        setBannerMessage('تم حفظ التعديلات عمالياً في سجل هذا الطلب الحالي بنجاح!');
        setShowSuccessBanner(true);
        setTimeout(() => setShowSuccessBanner(false), 4000);
    };

    const handleDuplicate = () => {
        onDuplicateAsNewRequest(request, documentText);
        setBannerMessage('تم استنساخ المستند وإنشاء نسخة رسمية جديدة برقم مرجعي مستقل!');
        setShowSuccessBanner(true);
        setTimeout(() => setShowSuccessBanner(false), 4000);
    };

    const handleAddNote = () => {
        setExtraNotes([...extraNotes, 'ملاحظة إضافية جديدة: الرجاء الالتزام ببنود لائحة شؤون الموظفين الكويتية.']);
    };

    const handleRemoveNote = (index: number) => {
        setExtraNotes(extraNotes.filter((_, i) => i !== index));
    };

    const handlePrint = () => {
        window.print();
    };

    const fontStyles = {
        sm: 'text-[11px] leading-relaxed',
        md: 'text-[13px] leading-relaxed',
        lg: 'text-[15px] leading-relaxed'
    };

    const todayDate = new Date().toLocaleDateString('ar-KW', { year: 'numeric', month: '2-digit', day: '2-digit' });

    return (
        <div className="space-y-6">
            {/* Toolbar section */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 border rounded-2xl bg-slate-50/80">
                <div className="flex flex-wrap items-center gap-2">
                    <Button 
                        variant={editMode ? 'primary' : 'outline'} 
                        size="sm" 
                        onClick={() => setEditMode(!editMode)}
                        className="flex items-center gap-1.5 font-bold"
                    >
                        {editMode ? <Eye className="w-4 h-4" /> : <FileEdit className="w-4 h-4" />}
                        {editMode ? 'معاينة المستند المطبوع' : 'تعديل النصوص والحقول (محرر)'}
                    </Button>

                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleSave}
                        className="flex items-center gap-1.5 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                    >
                        <Save className="w-4 h-4" />
                        حفظ التعديلات
                    </Button>

                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleDuplicate}
                        className="flex items-center gap-1.5 text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                    >
                        <Copy className="w-4 h-4" />
                        حفظ كنسخة مستقلة جديدة
                    </Button>

                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleAddNote}
                        className="flex items-center gap-1.5"
                    >
                        <PlusCircle className="w-4 h-4" />
                        إضافة ملاحظة
                    </Button>
                </div>

                <div className="flex items-center gap-3">
                    {/* Font sizes */}
                    <div className="flex items-center gap-1 border rounded-lg bg-white p-1">
                        <button 
                            className={`px-2 py-1 text-xs rounded transition-colors ${fontSize === 'sm' ? 'bg-primary text-white font-bold' : 'text-slate-500 hover:text-slate-800'}`}
                            onClick={() => setFontSize('sm')}
                        >
                            صغير
                        </button>
                        <button 
                            className={`px-2 py-1 text-xs rounded transition-colors ${fontSize === 'md' ? 'bg-primary text-white font-bold' : 'text-slate-500 hover:text-slate-800'}`}
                            onClick={() => setFontSize('md')}
                        >
                            متوسط
                        </button>
                        <button 
                            className={`px-2 py-1 text-xs rounded transition-colors ${fontSize === 'lg' ? 'bg-primary text-white font-bold' : 'text-slate-500 hover:text-slate-800'}`}
                            onClick={() => setFontSize('lg')}
                        >
                            كبير
                        </button>
                    </div>

                    <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={handlePrint}
                        className="flex items-center gap-1.5 hover:scale-105 transition-all font-bold"
                    >
                        <Printer className="w-4 h-4" />
                        طباعة المستند الرسمي
                    </Button>
                </div>
            </div>

            {/* Notification Banner */}
            {showSuccessBanner && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold animate-pulse">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{bannerMessage}</span>
                </div>
            )}

            {/* Simulated Official Paper */}
            <div 
                id="printable-document-sheet" 
                className="relative bg-white border border-slate-200 shadow-2xl rounded-3xl p-8 max-w-4xl mx-auto overflow-hidden text-right leading-relaxed font-sans text-slate-800 min-h-[842px]"
                style={{ direction: 'rtl' }}
            >
                {/* Official Back Watermark Pattern */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] select-none flex items-center justify-center">
                    <span className="text-9xl font-black rotate-45 transform">عـدالة</span>
                </div>

                {/* Adala Premium Official Header (ترويسة المكتب الرسمية) */}
                <div className="grid grid-cols-3 items-center border-b-2 border-slate-900 pb-5 mb-6">
                    <div className="text-right space-y-1">
                        <h2 className="text-xs font-black text-slate-900">مجموعة عـدالة الكلية</h2>
                        <p className="text-[10px] text-slate-500 leading-normal">مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية</p>
                        <p className="text-[9px] text-slate-400 font-mono font-bold">QA-REG-NO: 2026/05</p>
                    </div>

                    {/* Logo */}
                    <div className="flex flex-col items-center justify-center">
                        <div className="w-14 h-14 rounded-full border-4 border-double border-primary/90 flex items-center justify-center bg-primary/5 shadow-md">
                            <span className="text-primary font-serif font-black text-lg tracking-widest text-center block">QA</span>
                        </div>
                        <span className="text-xs font-black text-slate-900 mt-2 tracking-widest uppercase">ADALA SYSTEM</span>
                    </div>

                    <div className="text-left space-y-1 font-mono text-[9px] text-slate-500">
                        <p className="font-bold">المستند: <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">{request.requestType}</span></p>
                        <p>الرقم المرجعي: <span className="font-bold text-slate-950 underline">{request.referenceNumber}</span></p>
                        <p>تاريخ الطلب: <span>{request.requestDate}</span></p>
                        <p>تاريخ الطباعة: <span>{todayDate}</span></p>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="my-6 space-y-6">
                    {editMode ? (
                        <div className="space-y-4">
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs text-right font-medium">
                                💡 أنت الآن في <strong>وضع التحرير الذكي للمستند</strong>. يمكنك الضغط على النص وتعديل ومسح أي جملة، أو كتابة شروط وبنود قانونية إضافية قبل طباعة المستند رسمياً.
                            </div>
                            <textarea
                                value={documentText}
                                onChange={(e) => setDocumentText(e.target.value)}
                                className="w-full h-96 p-4 border-2 border-slate-300 rounded-2xl focus:border-primary focus:ring-0 text-xs font-mono font-semibold leading-relaxed bg-slate-50/50"
                                placeholder="اكتب نص المستند الرسمي هنا..."
                            />
                        </div>
                    ) : (
                        <div className={`${fontStyles[fontSize]} text-slate-850 font-semibold whitespace-pre-wrap leading-loose text-justify px-4`}>
                            {documentText}
                        </div>
                    )}
                </div>

                {/* Extra Notes Listing in Print View */}
                {extraNotes.length > 0 && (
                    <div className="mt-8 pt-4 border-t border-dashed border-slate-200 space-y-2">
                        <h4 className="text-xs font-black text-red-700">ملاحظات وقيود إدارية إضافية:</h4>
                        <ul className="list-decimal ps-5 space-y-1">
                            {extraNotes.map((note, idx) => (
                                <li key={idx} className="text-xs font-bold text-slate-705 flex items-start justify-between gap-4">
                                    <span className="bg-amber-50 p-1.5 rounded-lg border border-amber-100 flex-1">{note}</span>
                                    {editMode && (
                                        <button 
                                            onClick={() => handleRemoveNote(idx)}
                                            className="text-red-500 hover:text-red-700 shrink-0 self-center"
                                            title="حذف الملاحظة"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Official Signatures Bar */}
                <div className="mt-16 pt-8 border-t-2 border-slate-150 grid grid-cols-4 gap-4 text-center">
                    <div className="space-y-4 text-[10px] font-bold text-slate-700">
                        <span>توقيع الموظف المعني</span>
                        <div className="h-10 border-b border-dashed border-slate-300 w-3/4 mx-auto"></div>
                        <span className="text-[8px] text-slate-400 block">{request.employeeName}</span>
                    </div>

                    <div className="space-y-4 text-[10px] font-bold text-slate-700">
                        <span>اعتماد الموارد البشرية</span>
                        <div className="h-10 flex items-center justify-center">
                            {request.status !== 'Draft' && request.status !== 'Pending Line Manager' ? (
                                <span className="font-serif italic text-emerald-600 font-black">جاهز وموافق</span>
                            ) : (
                                <span className="text-slate-300">...................</span>
                            )}
                        </div>
                        <span className="text-[8px] text-slate-400 block">نوف العتيبي</span>
                    </div>

                    <div className="space-y-4 text-[10px] font-bold text-slate-700">
                        <span>الامتثال والقانونية</span>
                        <div className="h-10 flex items-center justify-center">
                            {request.status === 'Signed & Completed' ? (
                                <span className="font-serif italic text-blue-600 font-bold text-xs select-none">المستشار القانوني</span>
                            ) : (
                                <span className="text-slate-300">...................</span>
                            )}
                        </div>
                        <span className="text-[8px] text-slate-400 block">أبو الوفا الدسوقي</span>
                    </div>

                    <div className="space-y-2 text-[10px] font-bold text-slate-700 flex flex-col items-center">
                        <span>ختم وتوقيع الشريك</span>
                        <div className="w-16 h-16 rounded-full border-4 border-dashed border-primary/35 flex items-center justify-center p-1 font-black text-[8px] text-primary/45 text-center leading-tight uppercase tracking-tighter">
                            مجموعة عدالة<br/>الكويت
                        </div>
                    </div>
                </div>

                {/* Contact and Legal Compliance Footer */}
                <div className="mt-16 pt-4 border-t border-slate-900 flex justify-between items-center text-[8px] text-slate-400 font-semibold Grayscale">
                    <span className="max-w-lg leading-relaxed text-right">
                        مستند إداري موثق صادر من مجموعة عدالة للمحاماة (مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية). جميع البيانات محمية ومطابقة لأحكام المادة رقم 6 لسنة 2010 بشأن العمل في القطاع الأهلي بدولة الكويت ولائحتها المنظمة.
                    </span>
                    <div className="flex items-center gap-2">
                        <div className="text-left font-mono">
                            <span className="block font-bold">QR VERIFICATION</span>
                            <span className="block text-[7px] text-slate-500 font-bold">REF: {request.referenceNumber}</span>
                        </div>
                        <div className="w-8 h-8 border bg-slate-50 flex items-center justify-center text-[7px] font-mono text-slate-300 select-none">
                            <QrCode className="w-6 h-6 text-slate-300" />
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={onClose} size="sm">
                    إغلاق المعاينة والمحرر
                </Button>
            </div>
        </div>
    );
};
export default PrintDocumentEditor;
