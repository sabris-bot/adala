import React, { useMemo, useState } from 'react';
import { OFFICE_NAME } from '../../constants';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Printer, ShieldCheck, QrCode, FileText, CheckCircle2, FileCheck, Scale, Award } from 'lucide-react';
import { InvestigationCase } from './types';

interface InvestigationPrintModalProps {
    investigation: InvestigationCase | null;
    onClose: () => void;
}

export const InvestigationPrintModal: React.FC<InvestigationPrintModalProps> = ({ investigation, onClose }) => {
    const [printDocType, setPrintDocType] = useState<'transcript' | 'resolution' | 'summons'>('transcript');

    if (!investigation) return null;

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'غير محدد';
        try {
            return new Date(dateStr).toLocaleDateString('ar-KW', { year: 'numeric', month: 'long', day: 'numeric' });
        } catch {
            return dateStr;
        }
    };

    const handlePrint = () => {
        const printContent = document.getElementById("printable-prosecution-report");
        if (printContent) {
            const printWindow = window.open('', '', 'height=800,width=1000');
            if (printWindow) {
                printWindow.document.write('<!DOCTYPE html><html dir="rtl" lang="ar"><head><title>مكتب المحامي صبري شطا - محضر التحقيق الرسمي</title>');
                printWindow.document.write('<style>');
                printWindow.document.write(`
                    @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Tajawal:wght@400;500;700;900&display=swap');
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    body { font-family: 'Tajawal', sans-serif; direction: rtl; padding: 35px; color: #0f172a; background-color: #fff; line-height: 1.6; }
                    .print-container { border: 2px solid #0f172a; padding: 30px; border-radius: 4px; position: relative; }
                    .gold-stripe { height: 5px; background: linear-gradient(90deg, #C19A5B, #dfba73, #C19A5B); margin: 15px 0 25px 0; border-radius: 2px; }
                    .header-flex { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 15px; }
                    .seal-box { border: 2px solid #C19A5B; padding: 12px; border-radius: 8px; text-align: center; width: 140px; background: #faf8f5; }
                    .title-center { text-align: center; margin: 20px 0; padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; font-weight: 900; font-size: 18px; }
                    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; background: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0; font-size: 13px; }
                    .qa-item { border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px; margin-bottom: 12px; background: #fff; }
                    .q-text { font-weight: bold; color: #0f172a; margin-bottom: 6px; font-size: 13px; }
                    .a-text { font-weight: normal; color: #334155; padding-right: 15px; font-size: 13px; }
                    .signatures-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 40px; text-align: center; font-size: 12px; }
                    .signature-box { border-top: 1px solid #0f172a; padding-top: 8px; margin-top: 50px; font-weight: bold; }
                    @media print {
                        body { padding: 15px; }
                        button { display: none; }
                    }
                `);
                printWindow.document.write('</style></head><body>');
                printWindow.document.write(printContent.innerHTML);
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                printWindow.focus();
                setTimeout(() => {
                    printWindow.print();
                }, 400);
            }
        }
    };

    return (
        <Modal isOpen={!!investigation} onClose={onClose} title="محرر ومحرك الطباعة الرسمي (صيغة معتمدة)" size="xl">
            <div className="space-y-4 text-right" style={{ direction: 'rtl' }}>
                
                {/* Document Type Selector Bar */}
                <div className="flex items-center justify-between bg-slate-100 p-2 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setPrintDocType('transcript')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                printDocType === 'transcript' ? 'bg-slate-900 text-amber-400 shadow-xs' : 'text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            <FileText className="w-3.5 h-3.5 ml-1 inline-block" />
                            محضر التحقيق وسماع الأقوال
                        </button>
                        <button
                            onClick={() => setPrintDocType('resolution')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                printDocType === 'resolution' ? 'bg-slate-900 text-amber-400 shadow-xs' : 'text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            <Scale className="w-3.5 h-3.5 ml-1 inline-block" />
                            مذكرة القرار والتوصية التأديبية
                        </button>
                        <button
                            onClick={() => setPrintDocType('summons')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                printDocType === 'summons' ? 'bg-slate-900 text-amber-400 shadow-xs' : 'text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            <FileCheck className="w-3.5 h-3.5 ml-1 inline-block" />
                            إعلان استدعاء رسمي للجلسة
                        </button>
                    </div>

                    <Button
                        size="sm"
                        variant="primary"
                        className="bg-amber-600 hover:bg-amber-700 text-slate-950 font-black text-xs px-4 py-2 rounded-xl"
                        onClick={handlePrint}
                    >
                        <Printer className="w-4 h-4 ml-1.5 inline-block" />
                        طباعة المستند الرسمي (PDF)
                    </Button>
                </div>

                {/* Printable Document Preview Canvas */}
                <div id="printable-prosecution-report" className="relative p-8 bg-white text-slate-900 border-2 border-slate-900 font-sans text-right max-h-[65vh] overflow-y-auto rounded-lg shadow-inner">
                    
                    {/* Official Kuwait Law Office Header */}
                    <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                        <div className="space-y-1 text-right">
                            <h1 className="text-lg font-black text-slate-950">مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية</h1>
                            <h2 className="text-xs font-bold text-slate-700">دولة الكويت • قطاع الامتثال والتحقيقات الإدارية والعمالية</h2>
                            <p className="text-[10px] font-bold text-emerald-800">منظومة الإدارة القانونية والامتثال «عدالة»</p>
                            <p className="text-[9px] text-slate-400">محرر وفق أحكام القانون رقم 6 لسنة 2010 بشأن العمل في القطاع الأهلي</p>
                        </div>

                        {/* Digital Verification & QR Seal */}
                        <div className="border border-amber-600/60 bg-amber-50/40 p-2.5 rounded-xl text-center space-y-1 w-36 shrink-0">
                            <div className="w-10 h-10 mx-auto bg-slate-900 text-amber-400 rounded-lg flex items-center justify-center font-mono font-bold text-xs">
                                QR
                            </div>
                            <span className="text-[9px] font-mono font-bold text-slate-700 block">{investigation.caseNumber}</span>
                            <span className="text-[8px] font-bold text-emerald-700 block">✓ موثق إلكترونياً</span>
                        </div>
                    </div>

                    {/* Kuwait Gold Stripe Accent */}
                    <div className="h-1 w-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 my-3 rounded-full" />

                    {/* Title block depending on document type */}
                    {printDocType === 'transcript' && (
                        <>
                            <div className="text-center py-2 bg-slate-50 border border-slate-200 rounded-lg my-4">
                                <h2 className="text-base font-black text-slate-900">محضر رسمي لسماع أقوال واستجواب</h2>
                                <p className="text-[10px] text-slate-500 font-bold">جلسة تحقيق إداري مستوفية لكافة الضمانات اللائحية</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 bg-slate-50/80 p-3 rounded-lg border border-slate-200 text-xs my-3">
                                <div>
                                    <p><strong>رقم التحقيق:</strong> <span className="font-mono">{investigation.caseNumber}</span></p>
                                    <p className="mt-1"><strong>المحقق المختص:</strong> {investigation.investigator}</p>
                                    <p className="mt-1"><strong>المشكو في حقه:</strong> {investigation.employeeName} ({investigation.employeeJobTitle})</p>
                                </div>
                                <div>
                                    <p><strong>تاريخ بدء التحقيق:</strong> {formatDate(investigation.startDate)}</p>
                                    <p className="mt-1"><strong>الرقم المدني:</strong> <span className="font-mono">{investigation.civilId || '292000000000'}</span></p>
                                    <p className="mt-1"><strong>الإدارة / القسم:</strong> {investigation.employeeDepartment}</p>
                                </div>
                            </div>

                            <div className="my-4 text-xs space-y-1">
                                <h3 className="font-black text-slate-900 bg-slate-100 p-1.5 rounded border-r-4 border-slate-900">موضوع وبلاغ الواقعة:</h3>
                                <p className="p-2 text-slate-800 leading-relaxed font-sans">{investigation.subject}</p>
                            </div>

                            <div className="my-4 text-xs space-y-1">
                                <h3 className="font-black text-slate-900 bg-slate-100 p-1.5 rounded border-r-4 border-slate-900">سرد الوقائع والاستدلالات:</h3>
                                <p className="p-2 text-slate-800 leading-relaxed font-sans">{investigation.facts || "تم الاستماع لأقوال الأطراف وتثبيت الإفادات بالمحضر."}</p>
                            </div>

                            {/* Q&A Transcripts */}
                            <div className="my-4 space-y-2">
                                <h3 className="font-black text-xs text-slate-900 bg-slate-100 p-1.5 rounded border-r-4 border-slate-900">نص تفريغ الأسئلة والأجوبة (الاستجواب):</h3>
                                {(investigation.sessions && investigation.sessions.length > 0) ? (
                                    investigation.sessions.map((sess, sIdx) => (
                                        <div key={sIdx} className="space-y-2 pt-2">
                                            <div className="text-[11px] font-bold text-amber-900 bg-amber-50 p-1.5 rounded border border-amber-200">
                                                الجلسة رقم ({sIdx + 1}) مع: {sess.partyName} ({sess.partyType === 'employee' ? 'المستجوب المشكو في حقه' : 'الشاهد'})
                                            </div>
                                            {sess.questions?.map((q, qIdx) => (
                                                <div key={qIdx} className="border border-slate-200 rounded p-2.5 text-xs space-y-1 bg-white">
                                                    <p className="font-bold text-slate-900">{q.question}</p>
                                                    <p className="text-slate-700 pr-4">{q.answer}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-slate-500 p-2">لم يتم تدوين جلسات استجواب بالملف بعد.</p>
                                )}
                            </div>
                        </>
                    )}

                    {printDocType === 'resolution' && (
                        <>
                            <div className="text-center py-2 bg-slate-50 border border-slate-200 rounded-lg my-4">
                                <h2 className="text-base font-black text-slate-900">مذكرة الرأي القانوني والقرار التأديبي المعتمد</h2>
                                <p className="text-[10px] text-slate-500 font-bold">بموجب المادتين 35 و 102 من قانون العمل الكويتي رقم 6 لسنة 2010</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 bg-slate-50/80 p-3 rounded-lg border border-slate-200 text-xs my-3">
                                <div>
                                    <p><strong>رقم القرار:</strong> <span className="font-mono">{investigation.caseNumber}</span></p>
                                    <p className="mt-1"><strong>الموظف الصادر بحقه الجزاء:</strong> {investigation.employeeName}</p>
                                    <p className="mt-1"><strong>المسمى الوظيفي:</strong> {investigation.employeeJobTitle}</p>
                                </div>
                                <div>
                                    <p><strong>تاريخ صدور القرار:</strong> {formatDate(investigation.endDate || investigation.startDate)}</p>
                                    <p className="mt-1"><strong>الرقم المدني:</strong> <span className="font-mono">{investigation.civilId || '292000000000'}</span></p>
                                    <p className="mt-1"><strong>الإدارة:</strong> {investigation.employeeDepartment}</p>
                                </div>
                            </div>

                            <div className="my-4 text-xs space-y-2">
                                <h3 className="font-black text-slate-900 bg-slate-100 p-1.5 rounded border-r-4 border-slate-900">التكييف القانوني والأسباب:</h3>
                                <p className="p-2 text-slate-800 leading-relaxed font-sans">
                                    {investigation.recommendation || "ثبت للجنة التحقيق قيام الموظف بالمخالفة المنسوبة إليه بعد سماع دفاعه ومواجهته بالأدلة، مما يستوجب توقيع الجزاء المناسب لائحياً."}
                                </p>
                            </div>

                            <div className="my-4 text-xs space-y-2">
                                <h3 className="font-black text-slate-900 bg-slate-100 p-1.5 rounded border-r-4 border-slate-900">منطوق القرار التأديبي:</h3>
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs font-bold text-amber-950">
                                    {investigation.proposedPenalty || "توقيع الجزاء اللائحي المقرر وفقاً لسلم المخالفات"}
                                </div>
                            </div>

                            <div className="my-4 text-[11px] text-slate-600 bg-slate-50 p-3 rounded border">
                                <strong>تنبيه قانوني بشأن التظلم (المادة 102):</strong> يحق للموظف التظلم من هذا القرار خلال 20 يوماً من تاريخ إخطاره به رسمياً أمام لجنة التظلمات المركزية بالمنشأة.
                            </div>
                        </>
                    )}

                    {printDocType === 'summons' && (
                        <>
                            <div className="text-center py-2 bg-slate-50 border border-slate-200 rounded-lg my-4">
                                <h2 className="text-base font-black text-slate-900">إعلان رسمي واستدعاء لحضور جلسة تحقيق</h2>
                                <p className="text-[10px] text-slate-500 font-bold">وفقاً لأحكام المادة 35 من قانون العمل رقم 6 لسنة 2010</p>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs leading-relaxed space-y-3 my-4">
                                <p><strong>إلى السيد / السيدة:</strong> {investigation.employeeName} المحترم</p>
                                <p><strong>المسمى الوظيفي:</strong> {investigation.employeeJobTitle} • <strong>الإدارة:</strong> {investigation.employeeDepartment}</p>
                                <p className="pt-2">
                                    بناءً على الشكوى الإدارية المقيدة برقم (<span className="font-mono font-bold">{investigation.caseNumber}</span>)، يرجى الحضور إلى مقر قطاع الامتثال والتحقيقات بمكتب صبري شطا للمحاماة، وذلك في تمام الساعة العاشرة صباحاً، للإدلاء بأقوالكم وسماع دفاعكم بشأن واقعة:
                                </p>
                                <div className="p-2.5 bg-white border rounded font-bold text-slate-900">
                                    "{investigation.subject}"
                                </div>
                                <p className="text-[10px] text-rose-700 font-bold">
                                    * يعتبر هذا الإخطار استدعاءً رسمياً، وفي حال عدم الحضور دون عذر معتمد سيتم استكمال التحقيق وفقاً للمستندات القائمة.
                                </p>
                            </div>
                        </>
                    )}

                    {/* Official Signatures Block */}
                    <div className="grid grid-cols-3 gap-4 pt-10 border-t border-slate-300 text-center text-xs">
                        <div className="space-y-12">
                            <p className="font-bold text-slate-900">المحقق الإداري المختص</p>
                            <p className="text-[11px] font-mono text-slate-600 border-t border-slate-300 pt-1 mx-4">
                                {investigation.investigator || 'أ. صبري شطا'}
                            </p>
                        </div>

                        <div className="space-y-12">
                            <p className="font-bold text-slate-900">الموظف / المستجوب</p>
                            <p className="text-[11px] font-mono text-slate-600 border-t border-slate-300 pt-1 mx-4">
                                {investigation.employeeName}
                            </p>
                        </div>

                        <div className="space-y-12">
                            <p className="font-bold text-slate-900">اعتماد إدارة المنشأة</p>
                            <p className="text-[11px] font-mono text-slate-600 border-t border-slate-300 pt-1 mx-4">
                                الختم الرسمي والتوقيع
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
