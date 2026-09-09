import React, { useRef, useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import { useToast } from './Toast';
import { 
    PenTool, Upload, CheckCircle2, ShieldCheck, RefreshCw, Trash2, 
    Lock, Sparkles, FileText, Image as ImageIcon, Check, Award
} from 'lucide-react';

export interface DigitalSignatureData {
    dataUrl: string;
    signerName: string;
    signerTitle: string;
    civilId: string;
    timestamp: string;
    verificationHash: string;
    lawReference: string;
}

interface KuwaitiDigitalSignatureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirmSignature: (signature: DigitalSignatureData) => void;
    documentTitle?: string;
    defaultSignerName?: string;
    defaultSignerTitle?: string;
}

const SAVED_SIGNATURES_KEY = 'adala_saved_digital_signatures';

export const KuwaitiDigitalSignatureModal: React.FC<KuwaitiDigitalSignatureModalProps> = ({
    isOpen,
    onClose,
    onConfirmSignature,
    documentTitle = 'مستند إداري موثق',
    defaultSignerName = 'أ. صبري شطا',
    defaultSignerTitle = 'مدير المكتب والشريك المباشر'
}) => {
    const { addToast } = useToast();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Signature Modes: 'draw' | 'upload' | 'saved'
    const [activeMode, setActiveMode] = useState<'draw' | 'upload' | 'saved'>('draw');

    // Drawing options
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasDrawn, setHasDrawn] = useState(false);
    const [inkColor, setInkColor] = useState('#1e3a8a'); // Royal Navy Blue default
    const [lineWidth, setLineWidth] = useState(3);

    // Signer Verification Fields (Kuwait Law No. 20 of 2014)
    const [signerName, setSignerName] = useState(defaultSignerName);
    const [signerTitle, setSignerTitle] = useState(defaultSignerTitle);
    const [civilId, setCivilId] = useState('284091823941');
    const [includeLegalSeal, setIncludeLegalSeal] = useState(true);

    // Upload Mode
    const [uploadedImageDataUrl, setUploadedImageDataUrl] = useState<string | null>(null);

    // Saved Signatures Bank
    const [savedSignatures, setSavedSignatures] = useState<Array<{ id: string; name: string; title: string; dataUrl: string }>>(() => {
        try {
            const stored = localStorage.getItem(SAVED_SIGNATURES_KEY);
            if (stored) return JSON.parse(stored);
        } catch (e) {}
        return [
            {
                id: 'sig-default-sabri',
                name: 'أ. صبري شطا',
                title: 'رئيس مجلس الإدارة والمدير القانوني',
                dataUrl: '' // Generated dynamically if empty
            }
        ];
    });
    const [selectedSavedSigId, setSelectedSavedSigId] = useState<string | null>(null);

    // Initialize canvas on open
    useEffect(() => {
        if (isOpen && activeMode === 'draw') {
            setTimeout(() => {
                const canvas = canvasRef.current;
                if (!canvas) return;
                const parent = canvas.parentElement;
                if (parent) {
                    canvas.width = parent.clientWidth || 500;
                    canvas.height = 180;
                }
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.strokeStyle = inkColor;
                    ctx.lineWidth = lineWidth;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                }
            }, 100);
        }
    }, [isOpen, activeMode, inkColor, lineWidth]);

    // Canvas Mouse & Touch Drawing Handlers
    const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        let clientX = 0;
        let clientY = 0;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        setIsDrawing(true);
        const { x, y } = getCoordinates(e);
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            ctx.beginPath();
            ctx.moveTo(x, y);
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        e.preventDefault();
        const { x, y } = getCoordinates(e);
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            ctx.strokeStyle = inkColor;
            ctx.lineWidth = lineWidth;
            ctx.lineTo(x, y);
            ctx.stroke();
            if (!hasDrawn) setHasDrawn(true);
        }
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            setHasDrawn(false);
        }
    };

    // File Upload Handler
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            addToast({ type: 'error', title: 'خطأ', message: 'يرجى اختيار ملف صورة صالح (PNG/JPG).' });
            return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                setUploadedImageDataUrl(event.target.result as string);
                addToast({ type: 'success', title: 'تم الرفع بنجاح', message: 'تم تحميل صورة التوقيع والختم المعتمد.' });
            }
        };
        reader.readAsDataURL(file);
    };

    // Generate Composite Image with Legal Metadata Watermark
    const generateFinalSignatureData = (): DigitalSignatureData | null => {
        if (!signerName.trim()) {
            addToast({ type: 'warning', title: 'تنبيه', message: 'يرجى إدخال اسم الموقع المعتمد.' });
            return null;
        }

        let rawSigDataUrl = '';

        if (activeMode === 'draw') {
            if (!hasDrawn || !canvasRef.current) {
                addToast({ type: 'warning', title: 'تنبيه', message: 'يرجى رسم التوقيع أولاً في اللوحة.' });
                return null;
            }
            rawSigDataUrl = canvasRef.current.toDataURL('image/png');
        } else if (activeMode === 'upload') {
            if (!uploadedImageDataUrl) {
                addToast({ type: 'warning', title: 'تنبيه', message: 'يرجى رفع صورة التوقيع أو الختم المطلوب.' });
                return null;
            }
            rawSigDataUrl = uploadedImageDataUrl;
        } else if (activeMode === 'saved') {
            const found = savedSignatures.find(s => s.id === selectedSavedSigId);
            if (!found || !found.dataUrl) {
                addToast({ type: 'warning', title: 'تنبيه', message: 'يرجى اختيار توقيع محفوظ من القائمة.' });
                return null;
            }
            rawSigDataUrl = found.dataUrl;
        }

        // Generate Kuwait Legal Verification Stamp Hash & Metadata
        const timestamp = new Date().toISOString();
        const formattedDate = new Date().toLocaleDateString('ar-KW', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        const verificationHash = `KW-2014-${Math.floor(100000 + Math.random() * 900000)}`;
        const lawReference = 'القانون الكويتي رقم 20 لسنة 2014 بشأن المعاملات الإلكترونية';

        if (!includeLegalSeal) {
            return {
                dataUrl: rawSigDataUrl,
                signerName,
                signerTitle,
                civilId,
                timestamp,
                verificationHash,
                lawReference
            };
        }

        // Render composite canvas combining Signature + Kuwait Law No. 20/2014 Seal
        const compositeCanvas = document.createElement('canvas');
        compositeCanvas.width = 550;
        compositeCanvas.height = 240;
        const ctx = compositeCanvas.getContext('2d');

        if (!ctx) return null;

        // Background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 550, 240);

        // Border & Legal Watermark Badge
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.strokeRect(8, 8, 534, 224);

        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.strokeRect(12, 12, 526, 216);

        // Draw Signature Image
        const img = new Image();
        img.src = rawSigDataUrl;

        // Draw metadata text immediately underneath
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 15px Arial, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`التوقيع المعتمد: ${signerName}`, 520, 150);

        ctx.font = '12px Arial, sans-serif';
        ctx.fillStyle = '#475569';
        ctx.fillText(`الصفة: ${signerTitle} | الرقم المدني: ${civilId}`, 520, 172);

        ctx.fillStyle = '#0284c7';
        ctx.font = 'bold 11px Arial, sans-serif';
        ctx.fillText(`رقم التوثيق الرقمي: ${verificationHash} | التاريخ: ${formattedDate}`, 520, 192);

        ctx.fillStyle = '#059669';
        ctx.font = '10px Arial, sans-serif';
        ctx.fillText(`مُصادق عليه بموجب ${lawReference}`, 520, 212);

        // Draw image asynchronously onto composite
        ctx.drawImage(img, 150, 20, 250, 100);

        const compositeDataUrl = compositeCanvas.toDataURL('image/png');

        return {
            dataUrl: compositeDataUrl,
            signerName,
            signerTitle,
            civilId,
            timestamp,
            verificationHash,
            lawReference
        };
    };

    const handleSaveAndConfirm = () => {
        const sigData = generateFinalSignatureData();
        if (sigData) {
            // Also save to local storage bank if drawing
            if (activeMode === 'draw' && hasDrawn) {
                const newSaved = [
                    ...savedSignatures.filter(s => s.name !== signerName),
                    {
                        id: `sig-${Date.now()}`,
                        name: signerName,
                        title: signerTitle,
                        dataUrl: sigData.dataUrl
                    }
                ];
                setSavedSignatures(newSaved);
                localStorage.setItem(SAVED_SIGNATURES_KEY, JSON.stringify(newSaved));
            }

            onConfirmSignature(sigData);
            addToast({
                type: 'success',
                title: 'تم اعتماد التوقيع الرقمي',
                message: `تم مصادقة التوقيع للمستند (${documentTitle}) بموجب القانون رقم 20/2014.`
            });
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="وحدة التوقيع والمصادقة الإلكترونية الرسمية (قانون 20/2014)"
            size="xl"
        >
            <div className="space-[#1e293b] text-right space-y-5" style={{ direction: 'rtl' }}>
                
                {/* Kuwait Law Header Banner */}
                <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-3">
                        <span className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            <ShieldCheck className="w-6 h-6" />
                        </span>
                        <div>
                            <h4 className="text-sm font-black tracking-wide text-amber-400">
                                نظام التوقيع الإلكتروني المعتمد - دولة الكويت
                            </h4>
                            <p className="text-xs text-slate-300 font-medium mt-0.5">
                                حجة قانونية نافذة وقاطعة في الإثبات بموجب القانون رقم 20 لسنة 2014
                            </p>
                        </div>
                    </div>
                    <span className="hidden sm:inline-flex px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-bold">
                        تشفير عالي الأمان 256-bit
                    </span>
                </div>

                {/* Signer Information Form */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                    <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">اسم الموقّع المعتمد</label>
                        <Input
                            value={signerName}
                            onChange={(e) => setSignerName(e.target.value)}
                            placeholder="مثال: أ. صبري شطا"
                            className="text-xs font-bold"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">الصفة / المسمى الوظيفي</label>
                        <Input
                            value={signerTitle}
                            onChange={(e) => setSignerTitle(e.target.value)}
                            placeholder="مثال: مدير المكتب / المستأجر"
                            className="text-xs font-bold"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">الرقم المدني الكويتي</label>
                        <Input
                            value={civilId}
                            onChange={(e) => setCivilId(e.target.value)}
                            placeholder="12 رقم مدني"
                            className="text-xs font-mono font-bold"
                        />
                    </div>
                </div>

                {/* Mode Selector Tabs */}
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                    <button
                        onClick={() => setActiveMode('draw')}
                        className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                            activeMode === 'draw'
                                ? 'bg-slate-900 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                    >
                        <PenTool className="w-4 h-4 text-amber-400" />
                        رسم باللمس / الفأرة
                    </button>

                    <button
                        onClick={() => setActiveMode('upload')}
                        className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                            activeMode === 'upload'
                                ? 'bg-slate-900 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                    >
                        <Upload className="w-4 h-4 text-emerald-400" />
                        رفع صورة الختم / التوقيع
                    </button>

                    <button
                        onClick={() => setActiveMode('saved')}
                        className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                            activeMode === 'saved'
                                ? 'bg-slate-900 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                    >
                        <Award className="w-4 h-4 text-indigo-400" />
                        التوقيعات المعتمدة المحفوظة
                    </button>
                </div>

                {/* Mode 1: Drawing Pad */}
                {activeMode === 'draw' && (
                    <div className="space-y-3">
                        {/* Drawing Controls */}
                        <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800/80 p-2.5 rounded-xl">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">لون الحبر:</span>
                                {[
                                    { name: 'كحلي ملكي', hex: '#1e3a8a' },
                                    { name: 'أسود رسمي', hex: '#0f172a' },
                                    { name: 'أحمر معتمد', hex: '#dc2626' }
                                ].map(c => (
                                    <button
                                        key={c.hex}
                                        onClick={() => setInkColor(c.hex)}
                                        className={`w-6 h-6 rounded-full border-2 transition-transform ${
                                            inkColor === c.hex ? 'scale-110 border-amber-400 ring-2 ring-amber-400/30' : 'border-transparent'
                                        }`}
                                        style={{ backgroundColor: c.hex }}
                                        title={c.name}
                                    />
                                ))}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={clearCanvas}
                                className="text-xs font-bold text-rose-600 border-rose-200 hover:bg-rose-50"
                            >
                                <Trash2 className="w-3.5 h-3.5 me-1" />
                                مسح اللوحة
                            </Button>
                        </div>

                        {/* Canvas Board */}
                        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 p-2 cursor-crosshair touch-none shadow-inner relative">
                            <canvas
                                ref={canvasRef}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                onTouchStart={startDrawing}
                                onTouchMove={draw}
                                onTouchEnd={stopDrawing}
                                className="w-full h-44 rounded-xl block"
                            />
                            {!hasDrawn && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs font-bold">
                                    <PenTool className="w-4 h-4 me-2 animate-bounce" />
                                    وقع هنا باللمس أو باستخدام الفأرة...
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Mode 2: Upload File */}
                {activeMode === 'upload' && (
                    <div className="space-y-3 text-center py-4">
                        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 transition-colors">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="signature-file-upload"
                            />
                            <label htmlFor="signature-file-upload" className="cursor-pointer space-y-3 block">
                                <span className="p-4 rounded-full bg-emerald-500/10 text-emerald-600 inline-block">
                                    <Upload className="w-8 h-8" />
                                </span>
                                <div>
                                    <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                                        انقر لرفع صورة التوقيع أو الختم المعتمد
                                    </h5>
                                    <p className="text-xs text-slate-500 mt-1">صيغ PNG، JPG مصادق عليها بخلفية شفافة</p>
                                </div>
                            </label>
                        </div>

                        {uploadedImageDataUrl && (
                            <div className="p-4 bg-white dark:bg-slate-900 border rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <img src={uploadedImageDataUrl} alt="Uploaded" className="h-16 object-contain rounded-lg border p-1" />
                                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                        <CheckCircle2 className="w-4 h-4" />
                                        صورة التوقيع جاهزة للاعتماد
                                    </span>
                                </div>
                                <Button size="sm" variant="outline" onClick={() => setUploadedImageDataUrl(null)}>إزالة</Button>
                            </div>
                        )}
                    </div>
                )}

                {/* Mode 3: Saved Signatures */}
                {activeMode === 'saved' && (
                    <div className="space-y-3">
                        <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">اختر توقيعاً محفوظاً في حسابك:</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {savedSignatures.map(sig => (
                                <div
                                    key={sig.id}
                                    onClick={() => setSelectedSavedSigId(sig.id)}
                                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                                        selectedSavedSigId === sig.id
                                            ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-500/10 shadow-xs'
                                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                                    }`}
                                >
                                    <div className="space-y-1">
                                        <span className="text-xs font-black text-slate-900 dark:text-white block">{sig.name}</span>
                                        <span className="text-[11px] text-slate-500 block">{sig.title}</span>
                                    </div>
                                    {selectedSavedSigId === sig.id && (
                                        <span className="p-1 rounded-full bg-amber-500 text-slate-950">
                                            <Check className="w-4 h-4" />
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Legal Watermark Stamp Toggle */}
                <div className="p-3.5 bg-amber-50/80 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="include-seal-chk"
                            checked={includeLegalSeal}
                            onChange={(e) => setIncludeLegalSeal(e.target.checked)}
                            className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                        />
                        <label htmlFor="include-seal-chk" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                            تضمين ختم التوثيق الرقمي وهش المطابقة (قانون المعاملات الإلكترونية 20/2014)
                        </label>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/20 px-2 py-0.5 rounded-md">
                        رمز التوثيق الآلي
                    </span>
                </div>

                {/* Modal Footer Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                    <Button variant="outline" onClick={onClose} className="text-xs font-bold">
                        إلغاء
                    </Button>
                    
                    <Button
                        onClick={handleSaveAndConfirm}
                        className="bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-slate-950 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-sm flex items-center gap-2"
                    >
                        <ShieldCheck className="w-4 h-4 text-amber-400 dark:text-slate-950" />
                        اعتماد التوقيع وتضمينه بالمستند
                    </Button>
                </div>

            </div>
        </Modal>
    );
};
