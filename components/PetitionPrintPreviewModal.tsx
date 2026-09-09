import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Printer, Copy, Check, ShieldCheck, Scale, QrCode } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { OFFICE_NAME } from '../constants';
import { useToast } from './ui/Toast';

interface PetitionPrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  petition: {
    clientName: string;
    caseTitle: string;
    courtVenue: string;
    petitionType: string;
    content: string;
    refNumber?: string;
    dateStr?: string;
    lawyerName?: string;
    assignerSignature?: string;
  } | null;
}

export const PetitionPrintPreviewModal: React.FC<PetitionPrintPreviewModalProps> = ({
  isOpen,
  onClose,
  petition
}) => {
  const { addToast } = useToast();
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !petition) return null;

  const todayStr = petition.dateStr || new Date().toLocaleDateString('ar-KW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const refCode = petition.refNumber || `PET-KW-${Math.floor(100000 + Math.random() * 900000)}`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    if (!petition.content) return;
    navigator.clipboard.writeText(petition.content);
    setCopied(true);
    addToast({
      type: 'success',
      title: 'تم نسخ العريضة',
      message: 'تم نسخ نص العريضة القانونية بنجاح إلى الحافظة.'
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9990] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white" dir="rtl">
        
        {/* Style injection for seamless printing of ONLY the document sheet */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body * {
              visibility: hidden !important;
            }
            .petition-print-sheet, .petition-print-sheet * {
              visibility: visible !important;
            }
            .petition-print-sheet {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              min-height: 100% !important;
              border: none !important;
              box-shadow: none !important;
              margin: 0 !important;
              padding: 20mm !important;
              background: white !important;
            }
            .no-print {
              display: none !important;
            }
          }
        ` }} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:rounded-none border border-slate-200"
        >
          {/* Top Non-Printable Action Bar */}
          <div className="no-print p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">معاينة صحيفة العريضة للطباعة الرسمية</h3>
                <p className="text-[11px] text-slate-400 font-medium">نموذج جاهز للتقديم أمام المحاكم والجهات القضائية بدولة الكويت</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-700"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'تم النسخ' : 'نسخ النص'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة العريضة (Print A4)</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable A4 Document Sheet */}
          <div className="petition-print-sheet flex-1 overflow-y-auto p-6 sm:p-10 bg-white font-sans text-right relative">
            
            {/* Watermark Seal Background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
              <div className="w-96 h-96 border-[16px] border-slate-900 rounded-full flex items-center justify-center">
                <Scale className="w-64 h-64 text-slate-900" />
              </div>
            </div>

            {/* Official Legal Document Header */}
            <div className="border-b-2 border-slate-900 pb-4 mb-6 space-y-3">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <h1 className="text-xl font-black text-slate-900 leading-tight">
                    {OFFICE_NAME}
                  </h1>
                  <p className="text-xs font-bold text-slate-700">
                    للمحاماة والاستشارات القانونية والتحكيم - دولة الكويت
                  </p>
                  <p className="text-[10px] text-slate-500 font-semibold">
                    المقر الرئيسي: مرخص ومعتمد أمام محكمة التمييز والدستورية العليا
                  </p>
                </div>

                <div className="text-left text-[11px] font-mono space-y-0.5 text-slate-600 shrink-0">
                  <div className="flex items-center justify-end gap-1 font-bold text-slate-900">
                    <span>رقم المرجع:</span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{refCode}</span>
                  </div>
                  <div>التاريخ: {todayStr}</div>
                  <div className="text-[10px] text-slate-500">مقر المحكمة: {petition.courtVenue}</div>
                </div>
              </div>
            </div>

            {/* Court Recipient & Case Title Block */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-6 space-y-2 text-xs">
              <div className="text-sm font-black text-slate-900">
                إلى السيد الأستاذ / رئيس محكمة ({petition.courtVenue}) الكلي/الاستئناف الموقر
              </div>
              <div className="text-slate-700 font-bold">
                تحية طيبة وبعد،،
              </div>
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs border-t border-slate-200/80">
                <div>
                  <span className="text-slate-500 font-bold">مقدمه لعدالتكم المحامي: </span>
                  <span className="font-black text-slate-900">{petition.lawyerName || 'أستاذ صبري شطا'}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold">وكيلاً عن الموكل: </span>
                  <span className="font-black text-slate-900">{petition.clientName || 'غير محدد'}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500 font-bold">موضوع العريضة: </span>
                  <span className="font-black text-amber-900">{petition.petitionType} - {petition.caseTitle}</span>
                </div>
              </div>
            </div>

            {/* Main Petition Body Content */}
            <div className="space-y-4 text-xs sm:text-sm text-slate-900 leading-relaxed font-medium min-h-[300px]">
              <div className="p-2 text-slate-900 leading-loose prose prose-slate max-w-none">
                <ReactMarkdown>{petition.content}</ReactMarkdown>
              </div>
            </div>

            {/* Official Legal Footer & Signature Block */}
            <div className="mt-12 pt-6 border-t-2 border-slate-900 space-y-6">
              <div className="flex justify-between items-end gap-6 text-xs">
                
                {/* Stamp & Verification Badge */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-black text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>عريضة قضائية معتمدة ومسجلة إلكترونياً</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                    <QrCode className="w-10 h-10 text-slate-800 shrink-0" />
                    <div className="text-[10px] text-slate-600 space-y-0.5">
                      <p className="font-bold text-slate-800">رمز التحقق الآلي (QR Verification)</p>
                      <p>صادرة عن منظومة عدالة للإدارة القانونية</p>
                      <p className="font-mono text-[9px] text-slate-500">{refCode}</p>
                    </div>
                  </div>
                </div>

                {/* Signature Box */}
                <div className="text-center space-y-2 min-w-[200px]">
                  <p className="font-bold text-slate-700 text-xs">وتقبلوا بقبول فائق الاحترام والتقدير،،</p>
                  <p className="font-black text-slate-900 text-sm">مقدمه لسيادتكم وكيلاً عن الموكل</p>
                  <p className="font-black text-amber-900">{petition.lawyerName || 'المحامي صبري شطا'}</p>
                  
                  {petition.assignerSignature ? (
                    <div className="pt-1 flex justify-center">
                      <img src={petition.assignerSignature} alt="Signature" className="h-12 max-w-[150px] object-contain grayscale" />
                    </div>
                  ) : (
                    <div className="h-10 border-b border-dashed border-slate-300 w-36 mx-auto flex items-end justify-center text-[10px] text-slate-400 italic">
                      [التوقيع والختم الرسمي]
                    </div>
                  )}
                </div>

              </div>

              <div className="text-center text-[10px] text-slate-400 border-t border-slate-100 pt-3">
                تعتبر هذه الصحيفة مستنداً قضائياً صادراً عن مكتب {OFFICE_NAME} - هاتف الخدمة القانونية الكويتي الموحد
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PetitionPrintPreviewModal;
