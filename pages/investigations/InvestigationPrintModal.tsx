import React, { useMemo } from 'react';
import { Investigation } from '../../types';
import { OFFICE_NAME } from '../../constants';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { PrinterIcon } from 'lucide-react';

interface InvestigationPrintModalProps {
    investigation: Investigation | null;
    onClose: () => void;
}

export const InvestigationPrintModal: React.FC<InvestigationPrintModalProps> = ({ investigation, onClose }) => {
    if (!investigation) return null;

    // Load dynamic office name to keep it synchronized with the rest of any printable items
    const officeNameAr = useMemo(() => {
        try {
            const savedOffice = localStorage.getItem('profile_office_info');
            if (savedOffice) {
                const parsed = JSON.parse(savedOffice);
                if (parsed.name) return parsed.name;
            }
        } catch (e) {
            console.error('Failed to load dynamic office name in InvestigationPrintModal', e);
        }
        return OFFICE_NAME;
    }, []);

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'غير محدد';
        return new Date(dateStr).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const handlePrint = () => {
        const printContent = document.getElementById("printable-prosecution-report");
        if (printContent) {
            const printWindow = window.open('', '', 'height=700,width=900');
            if (printWindow) {
                printWindow.document.write('<html><head><title>محضر التحقيق الإداري الرسمي</title>');
                printWindow.document.write('<style>');
                printWindow.document.write(`
                    body { font-family: "Georgia", serif; direction: rtl; padding: 50px; color: #1e293b; background-color: #fff; line-height: 1.6; }
                    .prosecution-border { border: 4px double #0f172a; padding: 30px; border-radius: 8px; position: relative; }
                    .watermark { position: absolute; transform: translate(-50%, -50%) rotate(-45deg); opacity: 0.05; font-size: 80px; font-weight: 900; top: 50%; left: 50%; color: #ef4444; text-transform: uppercase; z-index: 100; pointer-events: none; white-space: nowrap; }
                    .header-flex { display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 25px; }
                    .central-seal { text-align: center; font-size: 26px; font-weight: 900; letter-spacing: 1px; margin-bottom: 30px; text-shadow: 1px 1px #e2e8f0; }
                    .meta-block { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 35px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 6px; }
                    .details-title { font-weight: 900; border-right: 4px solid #1e293b; padding-right: 12px; margin: 25px 0 15px 0; background: #f1f5f9; padding-top: 5px; padding-bottom: 5px; }
                    .session-item { border: 1px solid #cbd5e1; border-radius: 6px; padding: 20px; margin-bottom: 25px; background: #fff; }
                    .qa-block { margin-top: 15px; margin-right: 20px; border-right: 2px solid #cbd5e1; padding-right: 15px; }
                    .stamp-grid { display: flex; justify-content: space-between; margin-top: 50px; }
                    .stamp-circle { width: 100px; height: 100px; border: 2px dashed #94a3b8; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #94a3b8; }
                `);
                printWindow.document.write('</style></head><body>');
                printWindow.document.write(printContent.innerHTML);
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                printWindow.print();
            }
        }
    };

    return (
        <Modal isOpen={!!investigation} onClose={onClose} title="محضر تحقيق رسمي (جاهز للطباعة)" size="xl">
            <div className="p-1" dir="rtl">
                <div id="printable-prosecution-report" className="relative p-8 bg-white text-slate-900 border-4 border-double border-slate-950 font-serif text-right max-h-[70vh] overflow-y-auto">
                    {/* Watermark */}
                    <div className="watermark select-none pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-40deg] opacity-[0.03] text-rose-600 text-7xl font-black whitespace-nowrap tracking-widest z-0">
                        سِرّي للغاية وموثق
                    </div>

                    <div className="relative z-10">
                        {/* Legal Header */}
                        <div className="header-flex flex justify-between items-start border-b-2 border-slate-950 pb-4 mb-6 text-sm">
                            <div className="space-y-1">
                                <h2 className="text-xl font-black">{officeNameAr}</h2>
                                <p className="text-xs font-bold text-[#134D41]">عدالة - منظومة الإدارة القانونية المتكاملة v3 | الإدارة القانونية</p>
                                <p className="text-[10px] text-slate-400">موطد بأحكام المرسوم بقانون رقم 6 لسنة 2010</p>
                            </div>
                            <div className="text-left font-mono text-xs">
                                <p><strong>رقم التحقيق:</strong> {investigation.investigationNumber}</p>
                                <p><strong>تاريخ بدء الاستدلال:</strong> {new Date(investigation.startDate).toLocaleDateString('ar-EG')}</p>
                                <p><strong>حالة القضية:</strong> {investigation.status}</p>
                            </div>
                        </div>

                        {/* Title Section */}
                        <div className="central-seal text-center py-4 mb-6 bg-slate-50 border rounded-xl">
                            <h1 className="text-2xl font-black underline underline-offset-4 tracking-wide text-slate-900">محضر تفصيلي للتحقيق الإداري الرسمي</h1>
                            <p className="text-[10px] text-slate-400 mt-2 font-black">(محرر وموثق في السجلات الإدارية بوزارة العدل والعمل الكويتية)</p>
                        </div>

                        {/* Metadata block */}
                        <div className="meta-block grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 border rounded-xl mb-6">
                            <div>
                                <p><strong>أولاً: رئيس سلطة التحقيق:</strong> {investigation.investigator}</p>
                                <p className="mt-2"><strong>ثانياً: موضوع ووقائع الملف:</strong> {investigation.subject}</p>
                                <p className="mt-2"><strong>ثالثاً: الموظف المحال للتحقيق:</strong> {investigation.employeeName || "غير محدد"}</p>
                            </div>
                            <div>
                                <p><strong>رابعاً: الإدارية والوظيفية:</strong> {investigation.employeeDepartment || "الإدارة العمالية"}</p>
                                <p className="mt-2"><strong>خامساً: مقدم الشكوى والادعاء:</strong> {investigation.complainantName || "بدون اسم مباشر"}</p>
                                <p className="mt-2"><strong>سادساً: المسمى الوظيفي للمتهم:</strong> {investigation.employeeJobTitle || "وظيفة إدارية"}</p>
                            </div>
                        </div>

                        {/* Legal References */}
                        {(investigation.legalReferences && investigation.legalReferences.length > 0) && (
                            <div className="mb-6">
                                <h3 className="details-title font-bold text-base bg-slate-50 py-1 pr-2 border-r-4 border-slate-900 mb-2">الأسانيد القانونية ومخالفة لوائح المنشأة:</h3>
                                <div className="flex flex-wrap gap-2 pr-4 text-xs font-sans text-slate-700 font-bold">
                                    {investigation.legalReferences.map((refStr, idx) => (
                                        <span key={idx} className="bg-slate-100 border px-3 py-1.5 rounded-lg">■ {refStr}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Narrative Summary */}
                        <div className="mb-6">
                            <h3 className="details-title font-bold text-base bg-slate-50 py-1 pr-2 border-r-4 border-slate-900 mb-2">وقائع الاستدلال والدفوع الثبوتية (ملخص الواقعة):</h3>
                            <p className="text-sm leading-relaxed text-slate-800 pr-4 whitespace-pre-wrap">{investigation.summary || "لم يتم تدوين ملخص وقائع شامل حتى الآن."}</p>
                        </div>

                        {/* Sessions Logs */}
                        <div className="mb-6">
                            <h3 className="details-title font-bold text-base bg-slate-50 py-1 pr-2 border-r-4 border-slate-900 mb-4">جلسات التحقيق التفصيلية وسؤال وإجابات الأطراف المعنية:</h3>
                            {investigation.sessions.map((session, sIdx) => (
                                <div key={session.id} className="session-item mb-4 border p-4 rounded-xl bg-slate-50/50">
                                    <div className="flex justify-between items-center bg-slate-200/50 p-2 rounded-lg font-bold text-xs mb-3">
                                        <span>الجلسة رقم ({sIdx + 1}) - تاريخ: {formatDate(session.sessionDate)} | التوقيت: {session.sessionTime || "10:00 صباحاً"}</span>
                                        <span>المستجوب: {session.partyName} ({session.partyType})</span>
                                    </div>
                                    <div className="space-y-4 pr-3">
                                        {session.questions.map((q, qIdx) => (
                                            <div key={q.id}>
                                                <p className="font-bold text-slate-900 text-sm">سؤال ({qIdx + 1}): {q.questionText}</p>
                                                <p className="mr-8 mt-1 text-slate-700 italic border-r-2 border-slate-300 pr-3">{q.answerText || "(لم يرد بأي إجابة قانونية)"}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Embedded Signatures within this session */}
                                    <div className="grid grid-cols-2 gap-6 mt-6 border-t pt-4 text-[11px] font-sans font-black text-slate-500 text-center">
                                        <div className="flex flex-col items-center">
                                            <p className="mb-2">توقيع المستجوب / الشاهد بيده</p>
                                            {session.partySignature ? (
                                                <img src={session.partySignature} alt="Party Signature" className="h-12 object-contain bg-slate-100 p-1 border rounded" />
                                            ) : (
                                                <p className="text-xs text-slate-400 italic">........................</p>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <p className="mb-2">توقيع المحقق المعتمد</p>
                                            {session.investigatorSignature ? (
                                                <img src={session.investigatorSignature} alt="Investigator Signature" className="h-12 object-contain bg-slate-100 p-1 border rounded" />
                                            ) : (
                                                <p className="text-xs text-slate-400 italic">........................</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {investigation.sessions.length === 0 && (
                                <p className="text-center text-slate-400 py-6 text-xs italic">لم يتم إلحاق أي جلسات تحقيق رسمية بهذا الملف بعد.</p>
                            )}
                        </div>

                        {/* Evidence section */}
                        {(investigation.evidence && investigation.evidence.length > 0) && (
                            <div className="mb-6">
                                <h3 className="details-title font-bold text-base bg-slate-50 py-1 pr-2 border-r-4 border-slate-900 mb-2">أحراز الإثبات والمرفقات المعتمدة (القرائن الفنية):</h3>
                                <ul className="list-decimal list-inside text-xs pr-4 space-y-1.5 font-sans font-bold text-slate-800">
                                    {investigation.evidence.map((ev, evIdx) => (
                                        <li key={ev.id} className="bg-slate-50 p-2 rounded border">
                                            <span>{ev.name} ({ev.type}) ({ev.dateAdded})</span>
                                            {ev.notes && <span className="block text-[10px] text-slate-500 mt-1 font-sans">{ev.notes}</span>}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Final Recommendation */}
                        {investigation.recommendation && (
                            <div className="mt-8 border-4 border-slate-950 p-6 bg-slate-50 rounded-xl">
                                <h3 className="text-lg font-black mb-3 underline underline-offset-4 decoration-2">الرأي والتوصيات القانونية الختامية:</h3>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{investigation.recommendation}</p>
                            </div>
                        )}

                        {/* Signatures & seals section */}
                        <div className="stamp-grid flex justify-between items-end pt-12 text-sm border-t border-slate-200 mt-12">
                            <div className="text-center w-48">
                                <p className="font-bold mb-10">مدير الإدارة القانونية</p>
                                <p className="text-xs text-slate-400">.............................</p>
                            </div>
                            <div className="stamp-circle">
                                ختم لجنة التحقيق
                            </div>
                            <div className="text-center w-48">
                                <p className="font-bold mb-10">التصديق العام والوزاري</p>
                                <p className="text-xs text-slate-400">.............................</p>
                            </div>
                        </div>

                        <div className="mt-16 pt-3 border-t text-[10px] text-slate-400 text-center font-mono">
                            منهج عدالة القانوني للدفاع والنيابة الكونية للأفراد - الكود الاستدلالي الرقمي: ADF-GEN-{investigation.id}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
                    <Button variant="outline" onClick={onClose}>إغلاق</Button>
                    <Button variant="primary" onClick={handlePrint} leftIcon={<PrinterIcon className="w-4 h-4" />}>بدء الطباعة القانونية</Button>
                </div>
            </div>
        </Modal>
    );
};
