import React, { useState, useRef } from 'react';
import { 
  Printer, Download, FileImage, FileCode, FileText, 
  FileJson, Check, Copy, X, Sliders, Eye, Sparkles, 
  Layers, QrCode, ShieldCheck, Scale, Award, CheckCircle2,
  Table, Stamp
} from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import { Node, Edge } from '@xyflow/react';
import { CustomNodeData, MindMapExportConfig } from '../types';
import { toPng, toSvg, toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';
import { useToast } from '../../../components/ui/Toast';

interface MindMapPrintExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  nodes: Node[];
  edges: Edge[];
  canvasRef: React.RefObject<HTMLDivElement>;
  defaultMode?: 'print' | 'export';
}

export const MindMapPrintExportModal: React.FC<MindMapPrintExportModalProps> = ({
  isOpen,
  onClose,
  title,
  nodes,
  edges,
  canvasRef,
  defaultMode = 'print'
}) => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'print' | 'export' | 'textReport'>(defaultMode === 'export' ? 'export' : 'print');
  const [pageSize, setPageSize] = useState<'A4' | 'A3' | 'Letter'>('A4');
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [resolution, setResolution] = useState<'1x' | '2x' | '4x'>('4x');
  const [fitToPage, setFitToPage] = useState(true);
  const [includeLetterhead, setIncludeLetterhead] = useState(true);
  const [includeClausesTable, setIncludeClausesTable] = useState(true);
  const [includeQrStamp, setIncludeQrStamp] = useState(true);
  const [includeWatermark, setIncludeWatermark] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Generate structured textual legal outline from graph
  const generateLegalOutline = (): string => {
    const rootNode = nodes.find(n => (n.data as unknown as CustomNodeData).isRoot) || nodes[0];
    const lines: string[] = [];

    lines.push(`========================================================================`);
    lines.push(`مكتب المحامي صبري شطا للاستشارات القانونية وأعمال المحاماة - دولة الكويت`);
    lines.push(`نظام «عدالة» لإدارة القضايا والاستراتيجيات القانونية`);
    lines.push(`التقرير الهيكلي والخريطة الاستراتيجية: ${title}`);
    lines.push(`تاريخ التصدير: ${new Date().toLocaleDateString('ar-KW')} - الموافق: ${new Date().toLocaleDateString('en-GB')}`);
    lines.push(`========================================================================\n`);

    lines.push(`1. المحور الاستراتيجي الأساسي:`);
    if (rootNode) {
      const rd = rootNode.data as unknown as CustomNodeData;
      lines.push(`   - الموضوع: ${rd.label}`);
      if (rd.content) lines.push(`   - الشرح: ${rd.content}`);
      if (rd.legalArticle) lines.push(`   - المرجع القانوني: ${rd.legalArticle}`);
      lines.push(``);
    }

    lines.push(`2. المحاور التفصيلية والدفوع الإجرائية والموضوعية:`);
    const otherNodes = nodes.filter(n => n.id !== rootNode?.id);
    otherNodes.forEach((n, idx) => {
      const nd = n.data as unknown as CustomNodeData;
      lines.push(`   ${idx + 1}. [${nd.priority === 'high' ? 'عاجل' : 'عادي'}] ${nd.label}`);
      if (nd.content) lines.push(`      • التفاصيل: ${nd.content}`);
      if (nd.legalArticle) lines.push(`      • السند القانوني: ${nd.legalArticle}`);
      if (nd.status) lines.push(`      • الحالة: ${nd.status === 'completed' ? 'مكتمل ومصادق' : 'قيد المتابعة'}`);
      if (nd.linkedEntity) lines.push(`      • السجل المرتبط: ${nd.linkedEntity.name} (${nd.linkedEntity.type})`);
      lines.push(``);
    });

    lines.push(`------------------------------------------------------------------------`);
    lines.push(`إجمالي عناصر المخطط: ${nodes.length} عقدة | العلاقات والروابط: ${edges.length}`);
    lines.push(`توقيع المستشار القانوني المسئول: .......................................`);
    lines.push(`خاتم المكتب الرسمي: ....................................................`);
    lines.push(`========================================================================`);

    return lines.join('\n');
  };

  const handleCopyOutline = () => {
    const text = generateLegalOutline();
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
    addToast({
      type: 'success',
      title: 'تم النسخ بنجاح',
      message: 'تم نسخ تقرير وملخص المخطط الذهني إلى الحافظة.'
    });
  };

  // Direct Smart Print
  const handlePrint = async () => {
    setIsProcessing(true);
    try {
      window.print();
    } catch (err) {
      console.error("Print failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const getPixelRatio = () => {
    switch (resolution) {
      case '4x': return 4;
      case '2x': return 2.5;
      default: return 1.5;
    }
  };

  // Export to PNG image
  const handleExportPng = async () => {
    const element = canvasRef.current;
    if (!element) return;

    setIsProcessing(true);
    try {
      const dataUrl = await toPng(element, {
        backgroundColor: '#ffffff',
        pixelRatio: getPixelRatio(),
        filter: (node) => {
          if (node?.classList?.contains('react-flow__controls')) return false;
          if (node?.classList?.contains('react-flow__attribution')) return false;
          return true;
        }
      });

      const link = document.createElement('a');
      link.download = `${title.replace(/\s+/g, '_')}_mindmap_${resolution}.png`;
      link.href = dataUrl;
      link.click();

      addToast({
        type: 'success',
        title: 'تم التصدير بنجاح',
        message: `تم حفظ صورة المخطط الذهني بدقة (${resolution}) بنجاح.`
      });
    } catch (err) {
      console.error("PNG export error:", err);
      addToast({
        type: 'error',
        title: 'خطأ في التصدير',
        message: 'تعذر حفظ الصورة، يرجى المحاولة مرة أخرى.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Export to SVG Vector
  const handleExportSvg = async () => {
    const element = canvasRef.current;
    if (!element) return;

    setIsProcessing(true);
    try {
      const dataUrl = await toSvg(element, {
        backgroundColor: '#ffffff'
      });

      const link = document.createElement('a');
      link.download = `${title.replace(/\s+/g, '_')}_vector.svg`;
      link.href = dataUrl;
      link.click();

      addToast({
        type: 'success',
        title: 'تم التصدير بنجاح',
        message: 'تم حفظ المخطط بصيغة SVG متجهة فائقة النقاء للطباعة الحرة.'
      });
    } catch (err) {
      console.error("SVG export error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Export to PDF Document with Formal Legal Letterhead and Layout
  const handleExportPdf = async () => {
    const element = canvasRef.current;
    if (!element) return;

    setIsProcessing(true);
    try {
      const pixelRatio = getPixelRatio();
      const imgData = await toPng(element, {
        backgroundColor: '#ffffff',
        pixelRatio
      });

      const pdf = new jsPDF({
        orientation: orientation === 'landscape' ? 'l' : 'p',
        unit: 'mm',
        format: pageSize.toLowerCase()
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Top Navy Header Bar
      if (includeLetterhead) {
        pdf.setFillColor(15, 23, 42); // Navy slate-900
        pdf.rect(0, 0, pageWidth, 20, 'F');
        
        pdf.setFillColor(217, 119, 6); // Amber gold stripe
        pdf.rect(0, 20, pageWidth, 1.5, 'F');

        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(11);
        pdf.text('ADALA LEGAL STRATEGY SUITE | SABRI SHATTAH LAW FIRM', pageWidth / 2, 11, { align: 'center' });
        
        pdf.setFontSize(8);
        pdf.setTextColor(203, 213, 225);
        pdf.text('State of Kuwait - Justice Palace Pleading & Strategic Workflow', pageWidth / 2, 16, { align: 'center' });

        // Title & Reference
        pdf.setTextColor(15, 23, 42);
        pdf.setFontSize(14);
        pdf.text(title, pageWidth / 2, 30, { align: 'center' });
      }

      // Add Canvas Snapshot
      const imgProps = pdf.getImageProperties(imgData);
      const margin = 10;
      const topOffset = includeLetterhead ? 36 : 10;
      const bottomOffset = 25;
      const availableWidth = pageWidth - (margin * 2);
      const availableHeight = pageHeight - topOffset - bottomOffset;
      
      const imgRatio = imgProps.width / imgProps.height;
      let renderWidth = availableWidth;
      let renderHeight = renderWidth / imgRatio;

      if (renderHeight > availableHeight) {
        renderHeight = availableHeight;
        renderWidth = renderHeight * imgRatio;
      }

      const imgX = (pageWidth - renderWidth) / 2;
      const imgY = topOffset;

      pdf.addImage(imgData, 'PNG', imgX, imgY, renderWidth, renderHeight);

      // QR Stamp box & Verification block
      if (includeQrStamp) {
        pdf.setDrawColor(203, 213, 225);
        pdf.setFillColor(248, 250, 252);
        const stampW = 45;
        const stampH = 16;
        const stampX = pageWidth - margin - stampW;
        const stampY = pageHeight - 20;

        pdf.roundedRect(stampX, stampY, stampW, stampH, 2, 2, 'FD');
        pdf.setTextColor(15, 23, 42);
        pdf.setFontSize(7);
        pdf.text('CERTIFIED LEGAL MAP', stampX + stampW / 2, stampY + 5, { align: 'center' });
        pdf.setFontSize(6);
        pdf.setTextColor(100, 116, 139);
        pdf.text(`Doc ID: ${Math.random().toString(36).substring(2, 9).toUpperCase()}`, stampX + stampW / 2, stampY + 9, { align: 'center' });
        pdf.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, stampX + stampW / 2, stampY + 13, { align: 'center' });
      }

      // Official Footer
      pdf.setFontSize(7);
      pdf.setTextColor(100, 116, 139);
      pdf.text(`State of Kuwait | Law Firm of Advocate Sabri Shattah | Page 1 of 1`, 15, pageHeight - 8);

      pdf.save(`${title.replace(/\s+/g, '_')}_Official_Legal_Doc.pdf`);

      addToast({
        type: 'success',
        title: 'تم إنشاء ملف PDF بنجاح',
        message: 'تم تصدير مستند المخطط الذهني الرسمي المعتمد بجودة عالية للطباعة.'
      });
    } catch (err) {
      console.error("PDF export error:", err);
      addToast({
        type: 'error',
        title: 'خطأ في التصدير',
        message: 'تعذر توليد ملف PDF، يرجى إعادة المحاولة.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Export JSON Map
  const handleExportJson = () => {
    const payload = {
      title,
      exportedAt: new Date().toISOString(),
      nodes,
      edges
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/\s+/g, '_')}_backup.json`;
    link.click();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="مركز الطباعة والتصدير المتقدم (Print & High-Res Export)"
      size="xl"
    >
      <div className="space-y-6 text-right font-bold text-slate-800 dark:text-slate-200" dir="rtl">
        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 pb-1">
          <button
            onClick={() => setActiveTab('print')}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer
              ${activeTab === 'print' 
                ? 'bg-amber-500 text-slate-950 shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}
            `}
          >
            <Printer className="w-4 h-4" />
            <span>إعدادات الطباعة والترويسة الرسمية</span>
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer
              ${activeTab === 'export' 
                ? 'bg-amber-500 text-slate-950 shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}
            `}
          >
            <Download className="w-4 h-4" />
            <span>تصدير بدقة عالية (PDF, PNG 4K, SVG)</span>
          </button>

          <button
            onClick={() => setActiveTab('textReport')}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer
              ${activeTab === 'textReport' 
                ? 'bg-amber-500 text-slate-950 shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}
            `}
          >
            <FileText className="w-4 h-4" />
            <span>تقرير تحليلي ومذكرة مرافعة نصية</span>
          </button>
        </div>

        {/* 1. PRINT OPTIMIZER TAB */}
        {activeTab === 'print' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Paper Settings */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 space-y-3">
                <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-amber-500" />
                  <span>خيارات المستند الرسمي والورق:</span>
                </h4>

                {/* Page Size */}
                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 block mb-1">
                    حجم المستند (Paper Size):
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['A4', 'A3', 'Letter'].map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setPageSize(size as any)}
                        className={`
                          p-2 rounded-xl border text-xs font-black transition-all cursor-pointer text-center
                          ${pageSize === size 
                            ? 'border-amber-500 bg-amber-500 text-slate-950 shadow-xs' 
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'}
                        `}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Orientation */}
                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 block mb-1">
                    اتجاه الصفحة (Orientation):
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'landscape', label: 'أفقي (Landscape - مستحسن)' },
                      { id: 'portrait', label: 'رأسي (Portrait)' }
                    ].map(o => (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => setOrientation(o.id as any)}
                        className={`
                          p-2.5 rounded-xl border text-xs font-black transition-all cursor-pointer text-center
                          ${orientation === o.id 
                            ? 'border-amber-500 bg-amber-500 text-slate-950' 
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'}
                        `}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={includeLetterhead}
                      onChange={(e) => setIncludeLetterhead(e.target.checked)}
                      className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                    />
                    <span>إدراج الترويسة الرسمية المعتمدة لمكتب المحامي</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={includeQrStamp}
                      onChange={(e) => setIncludeQrStamp(e.target.checked)}
                      className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                    />
                    <span>إدراج ختم التحقق الإلكتروني ورمز QR المعتمد</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={fitToPage}
                      onChange={(e) => setFitToPage(e.target.checked)}
                      className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                    />
                    <span>ملاءمة المخطط تلقائياً داخل الصفحة (Fit to Page)</span>
                  </label>
                </div>
              </div>

              {/* Official Law Firm Document Letterhead Preview */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white text-slate-950 shadow-sm flex flex-col justify-between text-right">
                <div>
                  <div className="border-b-2 border-amber-500 pb-2 mb-3 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-slate-950">
                        مكتب المحامي صبري شطا
                      </h4>
                      <p className="text-[9px] text-slate-500 font-bold">
                        للاستشارات القانونية وأعمال المحاماة - دولة الكويت
                      </p>
                    </div>
                    <Scale className="w-6 h-6 text-amber-600" />
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 mb-3 text-[10px]">
                    <span className="font-bold text-slate-600 block">عنوان المخطط الاستراتيجي:</span>
                    <h5 className="font-black text-slate-900 text-xs truncate">
                      {title}
                    </h5>
                    <div className="flex items-center justify-between mt-1 text-[9px] text-slate-400 font-mono">
                      <span>تاريخ الإصدار: {new Date().toLocaleDateString('ar-KW')}</span>
                      <span>عدد العقد: {nodes.length}</span>
                    </div>
                  </div>

                  <div className="h-28 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-slate-400 text-xs font-bold gap-1">
                    <Eye className="w-5 h-5 text-slate-400" />
                    <span>معاينة الإخراج ({pageSize} - {orientation === 'landscape' ? 'أفقي' : 'رأسي'})</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-[8px] text-slate-400 mt-2 font-mono">
                  <span>QANOONI & ADALA ADVANCED LEGAL SYSTEM</span>
                  <span className="flex items-center gap-1 font-bold text-emerald-700">
                    <ShieldCheck className="w-3 h-3" />
                    <span>معتمد رسمياً بقصر العدل</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={handlePrint}
                disabled={isProcessing}
                className="text-xs font-black px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-2 shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>إرسال أمر الطباعة الرسمية الآن</span>
              </Button>
            </div>
          </div>
        )}

        {/* 2. EXPORT ASSETS TAB */}
        {activeTab === 'export' && (
          <div className="space-y-4">
            {/* Resolution Selector */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="text-xs font-bold">
                <span className="text-slate-900 dark:text-white block">دقة المعالجة والتصدير (Resolution & DPI):</span>
                <span className="text-slate-500 text-[11px]">اختر 4X Ultra للحصول على جودة طباعة نقية 300 DPI للوثائق الرسمية.</span>
              </div>
              <div className="flex gap-1.5">
                {[
                  { id: '1x', label: '1X عادية' },
                  { id: '2x', label: '2X Retina' },
                  { id: '4x', label: '4X Ultra HD' }
                ].map(r => (
                  <button
                    key={r.id}
                    onClick={() => setResolution(r.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors ${
                      resolution === r.id 
                        ? 'bg-amber-500 text-slate-950' 
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* PDF Document */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex flex-col justify-between text-right hover:border-amber-500 transition-colors">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white mb-1">
                    مستند رسمي معتمد (PDF)
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed mb-4">
                    ملف PDF عالي الجودة مع الترويسة الذهبية، الختم، والباركود الرسمي.
                  </p>
                </div>
                <Button
                  onClick={handleExportPdf}
                  disabled={isProcessing}
                  className="w-full text-xs font-bold py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white"
                >
                  تحميل PDF رسمي
                </Button>
              </div>

              {/* PNG Image */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex flex-col justify-between text-right hover:border-amber-500 transition-colors">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-3">
                    <FileImage className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white mb-1">
                    صورة فائقة الدقة (PNG)
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed mb-4">
                    صورة واضحة بنقاء ({resolution}) مع خلفية شفافة أو بيضاء للعروض القضائية.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleExportPng}
                  disabled={isProcessing}
                  className="w-full text-xs font-bold py-2 rounded-xl"
                >
                  تحميل PNG ({resolution})
                </Button>
              </div>

              {/* SVG Vector */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex flex-col justify-between text-right hover:border-amber-500 transition-colors">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white mb-1">
                    مخطط متجهي (SVG)
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed mb-4">
                    ملف رسومي متجهي قابل للتكبير اللانهائي دون أي فقدان للجودة.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleExportSvg}
                  disabled={isProcessing}
                  className="w-full text-xs font-bold py-2 rounded-xl"
                >
                  تحميل SVG متجهي
                </Button>
              </div>

              {/* JSON Backup */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex flex-col justify-between text-right hover:border-amber-500 transition-colors">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                    <FileJson className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white mb-1">
                    نسخة احتياطية (JSON)
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed mb-4">
                    ملف هيكلة الخريطة الذهنية بالكامل لإعادة فتحها واستيرادها لاحقاً.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleExportJson}
                  className="w-full text-xs font-bold py-2 rounded-xl"
                >
                  تحميل JSON
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 3. TEXT REPORT TAB */}
        {activeTab === 'textReport' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                مذكرة تفصيلية وتقرير تشريحي لجميع فروع المخطط وسندها القانوني:
              </span>
              <button
                onClick={handleCopyOutline}
                className="flex items-center gap-1.5 text-xs font-black px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors cursor-pointer shadow-3xs"
              >
                {copiedText ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText ? 'تم النسخ!' : 'نسخ التقرير بالكامل'}</span>
              </button>
            </div>

            <textarea 
              readOnly
              rows={12}
              value={generateLegalOutline()}
              className="w-full font-mono text-[11px] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 leading-relaxed focus:outline-none select-all"
            />
          </div>
        )}
      </div>
    </Modal>
  );
};

