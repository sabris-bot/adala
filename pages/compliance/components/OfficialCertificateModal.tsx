import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { PrinterIcon, ArrowDownTrayIcon, CheckCircleIcon, XMarkIcon } from '../../../constants';

interface OfficialCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  printableItem: any; // { item, submodule }
  translate: (ar: string, en: string) => string;
  triggerToast: (title: string, desc: string, type: 'success' | 'warning' | 'error') => void;
}

export const OfficialCertificateModal: React.FC<OfficialCertificateModalProps> = ({
  isOpen,
  onClose,
  printableItem,
  translate,
  triggerToast
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDigitalSignature, setHasDigitalSignature] = useState<string | null>(null);
  const [watermark, setWatermark] = useState<'None' | 'Draft' | 'Confidential' | 'Official'>('Official');
  const [includeSeal, setIncludeSeal] = useState(true);

  // Clear or initialize digital signatures
  useEffect(() => {
    if (isOpen) {
      setHasDigitalSignature(null);
    }
  }, [isOpen]);

  if (!isOpen || !printableItem) return null;

  const item = printableItem.item;
  const submodule = printableItem.submodule;

  // Sign helper on drawing canvas
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#1d4ed8'; // Blue inks
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDigitalSignature(null);
  };

  const acceptSignature = () => {
    setHasDigitalSignature(translate('توقيع إلكتروني معتمد', 'Certified Electronic Signee'));
    triggerToast(
      translate('تم ربط التوقيع بنجاح', 'Signature Registered'),
      translate('تم دمج التوقيع الرقمي بنسخة المستند الحوكمي.', 'Successfully merged signature into governance document.'),
      'success'
    );
  };

  // Printing & Exports systems
  const triggerNativePrint = () => {
    window.print();
  };

  const exportToExcelFormat = () => {
    // Generate actual CSV spreadsheet rows
    const h = translate('الخاصية,البيان والقيمة المعنية', 'Attribute,Details');
    const rows = [
      [translate('معرف المستند', 'Reference ID'), item.id || 'N/A'],
      [translate('عنوان السجل المعتمد', 'Subject Title'), item.title || item.subject || 'N/A'],
      [translate('التصنيف الرئيسي', 'Domain Category'), item.category || 'N/A'],
      [translate('جهة الإصدار', 'Authority'), item.authority || 'N/A'],
      [translate('درجة الأهمية والتعرض', 'Priority / Exposure'), item.riskLevel || 'N/A'],
      [translate('تاريخ سريان العمل', 'Due / Effective Date'), item.dueDate || item.effectiveDate || 'N/A'],
      [translate('المسؤول المعين بمكتب عدالة', 'Assigned Counsel'), item.assignedTo || item.owner || 'N/A'],
      [translate('قيمة الفاتورة والغرامة', 'Computed Penalty Amount (KWD)'), item.penaltyAmount || '0'],
      [translate('مضمون الشروح والملاحظات', 'Scope Narrative'), (item.description || item.findings || item.notes || '').replace(/,/g, ';')]
    ];
    
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + `${h}\n` + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Adala-Compliance-${item.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerToast(
      translate('مزامنة وتم التصدير للإكسيل', 'Exported to Excel'),
      translate('تم توليد وتنزيل ملف الجدول بنجاح.', 'CSV Sheet downloaded successfully.'),
      'success'
    );
  };

  const exportToWordFormat = () => {
    const textData = `
=============================================
             دولة الكويت - منظومة عدالة
=============================================
تقرير حوكمة معتمد بموجب هيئات أسواق المال ومكافحة غسيل الأموال

معرف المستند: ADALA-COMP-${item.id.toUpperCase()}
عنوان التقرير السري: ${item.title || item.subject}
التنظيم الإداري: ${submodule?.toUpperCase()}
التصنيف: ${item.category || translate('عام', 'General Category')}
الجهة الحكومية: ${item.authority || translate('هيئة أسواق المال', 'CMA')}
مسؤول الملف: ${item.assignedTo || item.owner}
تاريخ الإصدار والمهلة: ${item.dueDate || item.effectiveDate || '2026-05-24'}
درجة الأهمية والخطورة: ${item.riskLevel || 'High'}

شروح المستشار وملاحظات الحوكمة:
---------------------------------------------
${item.description || item.findings || item.notes || 'سجل امتثال مطابق متبادل دون مخالفات معلنة.'}

خاتمة وتوقيع:
---------------------------------------------
مكتب المحامي والمستشار القانوني صبري شطا
دولة الكويت - برج الحمراء
تم التنزيل إلكترونياً
=============================================
    `;
    const element = document.createElement("a");
    const file = new Blob([textData], {type: 'text/plain;charset=utf-8'});
    element.href = URL.createObjectURL(file);
    element.download = `Report-Compliance-${item.id}.doc`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    triggerToast(
      translate('تم التصدير لملف وورد', 'Exported to Word'),
      translate('تم توليد مستند Word التفاعلي بنجاح.', 'Word Text Document generated successfully.'),
      'success'
    );
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-gray-100 dark:bg-dm-card rounded-[32px] w-full max-w-5xl shadow-2xl overflow-hidden relative"
      >
        
        {/* Modal Navigation header */}
        <div className="flex justify-between items-center bg-white dark:bg-dm-card px-8 py-5 border-b border-gray-150/45 dark:border-gray-805">
          <div>
            <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-3 py-1 rounded-md">{translate('صك المطابقة وحوكمة المعايير الكويتيّة', 'Kuwait Legal Conformity Certificate')}</span>
            <h2 className="text-lg font-black text-gray-900 dark:text-dm-text mt-1.5">{translate('معاينة وطباعة الشهادة الرسمية المعتمدة', 'Governance Audit Print & Verification Hub')}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-50 dark:hover:bg-dark-border rounded-full transition-all text-gray-400">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 max-h-[75vh] overflow-y-auto">
          
          {/* Right Controller Options Pane (1 Col) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Watermark Selector */}
            <div className="bg-white dark:bg-dm-background p-5 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-3.5 shadow-xs">
              <h3 className="text-xs font-black text-gray-800 dark:text-gray-200">{translate('خيارات العلامة المائية للوثيقة', 'Document Watermarking Option')}</h3>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                {(['None', 'Draft', 'Confidential', 'Official'] as const).map(w => (
                  <button
                    key={w}
                    onClick={() => setWatermark(w)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      watermark === w 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                        : 'border-gray-100 dark:border-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    {translate(
                      w === 'None' ? 'بلا علامة' : w === 'Draft' ? 'مسودة معلقة' : w === 'Confidential' ? 'سري للغاية' : 'نسخة رسمية',
                      w
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Stamp Seals and Wax Controls */}
            <div className="bg-white dark:bg-dm-background p-5 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-3 shadow-xs">
              <h3 className="text-xs font-black text-gray-800 dark:text-gray-200">{translate('الختم والتوثيق المكتبي المعتمد', 'Official Group Stamp Seal')}</h3>
              <div className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-dm-card rounded-xl">
                <span className="text-xs font-extrabold text-gray-600 dark:text-gray-400">{translate('تغطية الختم الأحمر لـ صبري شطا', 'Apply Sabri Shatta Law Stamp')}</span>
                <input 
                  type="checkbox" 
                  checked={includeSeal} 
                  onChange={(e) => setIncludeSeal(e.target.checked)}
                  className="w-5 h-5 accent-blue-600 cursor-pointer" 
                />
              </div>
            </div>

            {/* Interactive Drawing Pad */}
            <div className="bg-white dark:bg-dm-background p-5 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-3 shadow-xs">
              <h3 className="text-xs font-black text-gray-800 dark:text-gray-200">{translate('لوحة توقيع المسؤول المعني', 'Signatory Board Pad')}</h3>
              
              {!hasDigitalSignature ? (
                <div className="space-y-3">
                  <div className="border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 overflow-hidden">
                    <canvas 
                      ref={canvasRef}
                      width={260}
                      height={100}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="cursor-crosshair w-full h-[100px] bg-white text-black"
                    />
                  </div>
                  <div className="flex gap-2 text-[10px] font-black uppercase justify-end">
                    <button onClick={clearSignature} className="px-3 py-1.5 text-gray-500 hover:bg-gray-100 rounded-lg">{translate('مسح اللوحة', 'Clear')}</button>
                    <button onClick={acceptSignature} className="px-4 py-1.5 bg-blue-600 text-white rounded-lg shadow-sm">{translate('تثبيت التوقيع', 'Approve Sign')}</button>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 dark:bg-emerald-950/25 p-3.5 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircleIcon className="w-4.5 h-4.5 text-emerald-500" />
                    <span>{hasDigitalSignature}</span>
                  </div>
                  <button onClick={() => setHasDigitalSignature(null)} className="text-[10px] underline font-black hover:text-red-700">{translate('تعديل', 'Reset')}</button>
                </div>
              )}
            </div>

            {/* Export buttons toolbar */}
            <div className="flex flex-col gap-2.5">
              <button 
                onClick={exportToExcelFormat}
                className="w-full bg-white dark:bg-dark-card hover:bg-gray-50 border border-gray-150 py-3 rounded-2xl text-xs font-black text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2 shadow-xs transition-all"
              >
                <ArrowDownTrayIcon className="w-4 h-4 text-emerald-600" />
                {translate('تحميل وتصدير للجدول الميكرو (Excel)', 'Export Dataset spreadsheet (Excel)')}
              </button>
              <button 
                onClick={exportToWordFormat}
                className="w-full bg-white dark:bg-dark-card hover:bg-gray-50 border border-gray-150 py-3 rounded-2xl text-xs font-black text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2 shadow-xs transition-all"
              >
                <ArrowDownTrayIcon className="w-4 h-4 text-blue-600" />
                {translate('تحميل مسودة التقرير كـ ملف وورد (Word)', 'Download Report Document (Word)')}
              </button>
            </div>

          </div>

          {/* Left Certificate Document preview (2 Col) */}
          <div className="lg:col-span-2 relative">
            
            {/* -------------------- DUAL STYLED ORIGINAL PRINT DOCUMENT CARD -------------------- */}
            <div 
              id="official-print-node-area"
              className="bg-white text-black p-8 md:p-12 rounded-[28px] border-[5px] border-double border-orange-950/80 shadow-lg space-y-6 text-right font-sans relative overflow-hidden select-none"
            >
              
              {/* WATERMARKS OVERLAYS */}
              {watermark !== 'None' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-[0.06] select-none">
                  <span className="text-6xl md:text-8xl font-black rotate-45 transform uppercase text-stone-900 leading-none">
                    {watermark === 'Draft' ? translate('مسودة مراجعة', 'DRAFT PREVIEW') :
                     watermark === 'Confidential' ? translate('سري للغاية', 'HIGH CONFIDENTIAL') :
                     translate('نسخة معتمدة', 'OFFICIAL ORIGINAL')}
                  </span>
                </div>
              )}

              {/* Certificate header */}
              <div className="flex justify-between items-start border-b border-stone-400 pb-5 z-10 relative">
                <div>
                  <h3 className="text-sm font-black text-stone-800">{translate('دولة الكويت', 'STATE OF KUWAIT')}</h3>
                  <p className="text-[10px] font-extrabold text-stone-500 mt-1 leading-relaxed">
                    {translate('وزارة التجارة وهيئة أسواق المال وتجارة الأعمال', 'Board of Legal Compliance & Governance')}<br />
                    {translate('مكتب صبري شطا للمحاماة والاستشاريات', 'Shatta Law & Corporate Solutions')}
                  </p>
                </div>
                <div className="text-center">
                  <span className="text-[14px] font-black text-rose-800 tracking-wider">⚖ {translate('وثيقة اعتماد حوكمة قانونية', 'ADALA VERIFIED LEDGER')} ⚖</span>
                  <p className="text-[8px] tracking-wide text-zinc-500 font-bold mt-1.5 uppercase">Reference: ADALA-COMP-{item.id?.toUpperCase()}</p>
                </div>
                <div className="text-left text-[9px] font-mono text-stone-400 font-bold leading-normal">
                  <p>Date: {new Date().toLocaleDateString('en-GB')}</p>
                  <p>Security: {watermark === 'Confidential' ? 'RESTRICTED' : 'PUBLIC ORIGINAL'}</p>
                  <p>Jurisdiction: KUWAIT CITY</p>
                </div>
              </div>

              {/* Title label */}
              <div className="text-center space-y-1.5 py-2">
                <h4 className="text-[15px] font-bold tracking-tight text-amber-950">
                  {translate('شهادة التحقق والمطابقة الاستباقيّة المعتمدة', 'OFFICIAL COMPLIANCE AND VERDICT OF CONFORMITY')}
                </h4>
                <div className="w-36 h-[1.5px] bg-amber-900 mx-auto" />
              </div>

              {/* Statement block */}
              <div className="text-xs text-stone-700 leading-relaxed font-semibold z-10 relative">
                <p>
                  {translate('يشهد مكتب صبري شطا للمحاماة والاستشارات القانونية والتحكيم في دولة الكويت بأن الوثيقة الواردة تفاصيلها أدناه قد استوفت كافة متطلبات التحقق الاستباقي للشركة وأنها تمت مراجعتها ومطابقتها بالكامل مع اللوائح الرقابية المرعية السليمة المنصوص عليها في قوانين دولة الكويت الشقيقة وحوكمة البورصة وهيئة أسواق المال ووحدة مكافحة غسيل الأموال.', 'This official report verifies that the corporate item mapped below is fully compliant with local Kuwait provisions and CMA governance directives.')}
                </p>
              </div>

              {/* Details grid box */}
              <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-4 text-[11px] font-black text-stone-900 z-10 relative">
                <div>
                  <span className="text-stone-400 font-bold">{translate('مسمى السجل والحالة المرجعية:', 'Record Subject:')}</span>{' '}
                  <span className="font-extrabold text-stone-950">{item.title || item.subject}</span>
                </div>
                {item.code && (
                  <div>
                    <span className="text-stone-400 font-bold">{translate('معيار التوثيق الخاص:', 'Standard Regulatory Code:')}</span>{' '}
                    <span className="font-mono text-blue-900">{item.code}</span>
                  </div>
                )}
                <div>
                  <span className="text-stone-400 font-bold">{translate('تصنيف المطابقة الإدارية:', 'Compliance Domain Category:')}</span>{' '}
                  <span className="text-stone-800">{item.category || translate('عام وشامل', 'General Content')}</span>
                </div>
                {item.riskLevel && (
                  <div>
                    <span className="text-stone-400 font-bold">{translate('درجة الخطورة المحسوبة:', 'Governing Exposure risk:')}</span>{' '}
                    <span className="font-extrabold text-red-700">{item.riskLevel}</span>
                  </div>
                )}
                {(item.dueDate || item.effectiveDate) && (
                  <div>
                    <span className="text-stone-400 font-bold">{translate('تاريخ بدء العمل والانتهاء:', 'Maturity / Due Date:')}</span>{' '}
                    <span className="font-mono">{item.dueDate || item.effectiveDate}</span>
                  </div>
                )}
                {(item.assignedTo || item.owner) && (
                  <div>
                    <span className="text-stone-400 font-bold">{translate('مستشار المطابقة المندوب:', 'Assigned Corporate Counsel:')}</span>{' '}
                    <span className="text-stone-800">{item.assignedTo || item.owner}</span>
                  </div>
                )}
                {item.penaltyAmount !== undefined && (
                  <div className="md:col-span-2 pt-1 border-t border-stone-150">
                    <span className="text-stone-400 font-bold">{translate('مجموع الغرامات والالتزام المالي المحتسب (د.ك):', 'Computed Payout size (KWD):')}</span>{' '}
                    <span className="font-mono text-red-800 text-xs font-black">{Number(item.penaltyAmount).toLocaleString()} KWD</span>
                  </div>
                )}
              </div>

              {/* Descriptions paragraphs */}
              {(item.description || item.findings || item.notes) && (
                <div className="space-y-1.5 pt-1.5 z-10 relative">
                  <span className="text-[10px] text-stone-400 font-bold block">{translate('التفاصيل وشروح الوقائع المعتمدة:', 'Compliance background context & annotations:')}</span>
                  <div className="bg-stone-50/50 p-3.5 rounded-xl border border-stone-150 text-[10px] leading-relaxed italic text-stone-600 font-bold whitespace-pre-line">
                    {item.description || item.findings || item.notes}
                  </div>
                </div>
              )}

              {/* Footers stamping & signature pad graphics details */}
              <div className="pt-6 border-t border-stone-200 grid grid-cols-1 md:grid-cols-3 gap-6 items-center text-xs z-10 relative">
                
                {/* Simulated QR block code */}
                <div className="flex flex-col gap-1 items-start">
                  <div className="w-16 h-16 bg-stone-100 border border-stone-300 rounded p-1 flex items-center justify-center">
                    <div className="grid grid-cols-3 gap-1 w-full h-full bg-stone-50">
                      <div className="bg-black" /> <div className="bg-black" /> <div className="bg-white" />
                      <div className="bg-white" /> <div className="bg-black" /> <div className="bg-black" />
                      <div className="bg-black" /> <div className="bg-white" /> <div className="bg-black" />
                    </div>
                  </div>
                  <span className="text-[7px] text-zinc-400 leading-none">{translate('التحقق الإلكتروني بالرمز', 'Scan to verify original record')}</span>
                </div>

                {/* Simulated red wax seal group stamp */}
                <div className="flex justify-center">
                  {includeSeal && (
                    <div className="w-20 h-20 rounded-full border-4 border-dashed border-red-700/80 flex flex-col items-center justify-center text-center p-2 text-red-700/80 transform rotate-6 scale-95 relative select-none animate-fade-in">
                      <div className="absolute inset-0 border border-red-700/60 rounded-full scale-90" />
                      <span className="text-[6px] font-black uppercase tracking-widest">{translate('رقابة ممتثلة', 'APPROVED SEAL')}</span>
                      <span className="text-[8px] font-sans font-extrabold leading-tight my-0.5">{translate('عدالة - حوكمة', 'ADALA LEGAL')}</span>
                      <span className="text-[5px] font-bold">{translate('مكتب صبري شطا', 'SHATTA LAWM')}</span>
                    </div>
                  )}
                </div>

                {/* Digital signature overlay block */}
                <div className="text-left space-y-1">
                  <span className="text-[8px] text-zinc-400 font-bold block">{translate('التوقيع والاعتماد والختم الرقمي الخاص:', 'Authorized signature seed:')}</span>
                  {hasDigitalSignature ? (
                    <div className="h-8 text-xs text-blue-800 font-extrabold flex items-center justify-start border-b border-stone-300">
                      <span>✓ {hasDigitalSignature}</span>
                    </div>
                  ) : (
                    <p className="text-[10px] text-stone-400 italic font-bold">{translate('لم يوقع بعد', 'Pending administrative signing')}</p>
                  )}
                  <span className="text-[9px] font-extrabold text-stone-900 block">{translate('المستشار القانوني العام شريك الحوكمة', 'Director of Corporate Compliance')}</span>
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* Modal bottom Footer bar */}
        <div className="flex justify-end gap-3 bg-white dark:bg-dm-card px-8 py-5 border-t border-gray-150/45 dark:border-gray-805">
          <button onClick={onClose} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-dark-border dark:hover:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 rounded-xl transition-all">
            {translate('إغلاق ومعاينة لاحقة', 'Dismiss Preview')}
          </button>
          <button 
            onClick={triggerNativePrint} 
            className="px-7 py-2.5 bg-blue-600 hover:bg-blue-700 text-xs font-black text-white rounded-xl shadow-xs flex items-center gap-2 transition-all"
          >
            <PrinterIcon className="w-4.5 h-4.5" />
            {translate('تصدير وطباعة المستند فورا', 'Trigger Native Print Now')}
          </button>
        </div>

      </motion.div>
    </div>
  );
};
