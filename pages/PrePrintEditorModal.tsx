import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Printer, Shield, QrCode } from 'lucide-react';

interface PrePrintEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  appraisal: any;
  employee: any;
  language: 'ar' | 'en';
  onSave?: (updatedAppraisal: any) => void;
}

export const PrePrintEditorModal: React.FC<PrePrintEditorModalProps> = ({
  isOpen,
  onClose,
  appraisal,
  employee,
  language,
  onSave
}) => {
  const isAr = language === 'ar';

  // Editable fields states
  const [docTitle, setDocTitle] = useState('');
  const [refId, setRefId] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [scores, setScores] = useState({ drafting: 5, successRate: 5, clientRelations: 5, compliance: 5 });
  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');
  const [training, setTraining] = useState('');
  const [signee, setSignee] = useState('');
  const [signeeTitle, setSigneeTitle] = useState('');
  const [stampText, setStampText] = useState('');

  useEffect(() => {
    if (appraisal) {
      setDocTitle(isAr ? 'صك تقييم الأداء الوظيفي والنزاهة المهنية الكادرية' : 'Official Performance & Integrity Evaluation Instrument');
      setRefId(appraisal.refId || `QA-PERF-2026-${Math.floor(100 + Math.random() * 900)}`);
      setDateStr(appraisal.appraisalDate || new Date().toISOString().split('T')[0]);
      setScores({
        drafting: appraisal.scores?.drafting ?? 5,
        successRate: appraisal.scores?.successRate ?? 5,
        clientRelations: appraisal.scores?.clientRelations ?? 5,
        compliance: appraisal.scores?.compliance ?? 5
      });
      setStrengths(appraisal.strengths?.[language] || appraisal.strengths?.ar || appraisal.strengths || '');
      setImprovements(appraisal.improvements?.[language] || appraisal.improvements?.ar || appraisal.improvements || '');
      setTraining(appraisal.training?.[language] || appraisal.training?.ar || appraisal.training || '');
      setSignee(appraisal.signeeName?.[language] || appraisal.signeeName?.ar || appraisal.signeeName || 'صبري شطا');
      setSigneeTitle(isAr ? 'المدير العام المسؤول بموجب ترخيص الهيئة' : 'Managing Director / Corporate Partner');
      setStampText(isAr ? 'مكتب المحامي صبري شطا للمحاماة - معتمد' : 'SABRI SHATTA LAW FIRM - ACCREDITED');
    }
  }, [appraisal, language]);

  if (!isOpen || !appraisal || !employee) return null;

  const calculateOverall = () => {
    const avg = (scores.drafting + scores.successRate + scores.clientRelations + scores.compliance) / 4;
    return parseFloat(avg.toFixed(2));
  };

  const getTier = (score: number) => {
    if (score >= 4.5) return isAr ? 'ممتاز جداً - استثنائي' : 'Excellent - Outperforming';
    if (score >= 3.8) return isAr ? 'جيد جداً - يفوق المتوقع' : 'Very Good - Proficient';
    if (score >= 3.0) return isAr ? 'جيد - مستوفي الشروط' : 'Good - Competent';
    return isAr ? 'ضعيف - يحتاج لتقويم فوري وسريع' : 'Needs Development Plans';
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9990] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
        
        {/* Style injection for seamless printing of ONLY the document sheet */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body * {
              visibility: hidden !important;
            }
            .print-sheet-container, .print-sheet-container * {
              visibility: visible !important;
            }
            .print-sheet-container {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              min-height: 100% !important;
              border: none !important;
              box-shadow: none !important;
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `}} />

        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.98, opacity: 0 }}
          className="bg-white rounded-[24px] w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] border border-slate-250 no-print"
        >
          {/* Side Panel: Interactive Inputs */}
          <div className="w-full md:w-[350px] bg-slate-50 border-r border-slate-200 p-5 flex flex-col justify-between overflow-y-auto shrink-0" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-3">
                <Shield className="w-5 h-5 text-[#00796B]" />
                <div>
                  <h3 className="text-xs font-black text-[#004D40]">{isAr ? 'محرر طباعة وتقليم الصكوك' : 'Pre-Print Editing Studio'}</h3>
                  <p className="text-[9px] text-slate-400 font-bold">{isAr ? 'نظام عدالة المتكامل للروابط والنزاهة' : 'Adala Integrated Ledger Studio'}</p>
                </div>
              </div>

              {/* Document Text Fields */}
              <div className="space-y-3 text-[10.5px] font-semibold text-slate-650">
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 block uppercase font-bold">{isAr ? 'عنوان المستند المطبوع' : 'Printed Document Title'}</label>
                  <input
                    type="text"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    className="w-full h-8.5 px-2 bg-white border border-slate-200 rounded-md text-xs font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 block uppercase font-bold">{isAr ? 'الرقم المرجعي والمطابقة' : 'Reference ID'}</label>
                    <input
                      type="text"
                      value={refId}
                      onChange={(e) => setRefId(e.target.value)}
                      className="w-full h-8.5 px-2 bg-white border border-slate-200 rounded-md text-xs font-mono font-bold text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 block uppercase font-bold">{isAr ? 'تاريخ صب المستند' : 'Issuance Date'}</label>
                    <input
                      type="date"
                      value={dateStr}
                      onChange={(e) => setDateStr(e.target.value)}
                      className="w-full h-8.5 px-2 bg-white border border-slate-200 rounded-md text-xs text-slate-800"
                    />
                  </div>
                </div>

                <p className="text-[9px] text-emerald-600 font-bold border-t pt-2 mt-2">📊 {isAr ? 'درجات الكفاءة (معدلة فورياً بالصك):' : 'Interactive Grades (Auto-Weights):'}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[8px] text-slate-400 block uppercase font-bold">{isAr ? 'صياغة المذكرات' : 'Drafting'}</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      step={0.1}
                      value={scores.drafting}
                      onChange={(e) => setScores({ ...scores, drafting: parseFloat(e.target.value) || 0 })}
                      className="w-full h-8 px-2 bg-white border border-slate-200 rounded-md text-center text-xs font-bold text-[#00796B]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] text-slate-400 block uppercase font-bold">{isAr ? 'آجال الجلسات وكسبها' : 'Success Rate'}</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      step={0.1}
                      value={scores.successRate}
                      onChange={(e) => setScores({ ...scores, successRate: parseFloat(e.target.value) || 0 })}
                      className="w-full h-8 px-2 bg-white border border-slate-200 rounded-md text-center text-xs font-bold text-[#00796B]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] text-slate-400 block uppercase font-bold">{isAr ? 'أخلاقيات الموكلين' : 'Client Relations'}</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      step={0.1}
                      value={scores.clientRelations}
                      onChange={(e) => setScores({ ...scores, clientRelations: parseFloat(e.target.value) || 0 })}
                      className="w-full h-8 px-2 bg-white border border-slate-200 rounded-md text-center text-xs font-bold text-[#00796B]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] text-slate-400 block uppercase font-bold">{isAr ? 'الامتثال والبصمة' : 'Compliance'}</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      step={0.1}
                      value={scores.compliance}
                      onChange={(e) => setScores({ ...scores, compliance: parseFloat(e.target.value) || 0 })}
                      className="w-full h-8 px-2 bg-white border border-slate-200 rounded-md text-center text-xs font-bold text-[#00796B]"
                    />
                  </div>
                </div>

                <div className="space-y-1 border-t pt-2">
                  <label className="text-[9px] text-slate-400 block uppercase font-bold">{isAr ? 'نقاط القوة الاستشارية بالتقرير' : 'Appraisal Strengths'}</label>
                  <textarea
                    rows={2}
                    value={strengths}
                    onChange={(e) => setStrengths(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-md text-xs font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 block uppercase font-bold">{isAr ? 'نقاط التطوير المستهدفة' : 'Improvement Areas'}</label>
                  <textarea
                    rows={2}
                    value={improvements}
                    onChange={(e) => setImprovements(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-md text-xs font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 block uppercase font-bold">{isAr ? 'الدورات والتمكين الموصى بها' : 'Required Training'}</label>
                  <input
                    type="text"
                    value={training}
                    onChange={(e) => setTraining(e.target.value)}
                    className="w-full h-8.5 px-2 bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 border-t pt-2">
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 block uppercase font-bold">{isAr ? 'اسم الشريك المفوض' : 'Managing Partner'}</label>
                    <input
                      type="text"
                      value={signee}
                      onChange={(e) => setSignee(e.target.value)}
                      className="w-full h-8.5 px-2 bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 block uppercase font-bold">{isAr ? 'المسمى الوظيفي للشريك' : 'Partner Title'}</label>
                    <input
                      type="text"
                      value={signeeTitle}
                      onChange={(e) => setSigneeTitle(e.target.value)}
                      className="w-full h-8.5 px-2 bg-white border border-slate-200 rounded-md text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 block uppercase font-bold">{isAr ? 'عنوان ختم المكتب المائي' : 'Watermark Official Seal'}</label>
                  <input
                    type="text"
                    value={stampText}
                    onChange={(e) => setStampText(e.target.value)}
                    className="w-full h-8.5 px-2 bg-white border border-slate-200 rounded-md text-[11px] font-bold text-[#00796B]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t mt-4 flex gap-2">
              <button
                onClick={() => {
                  if (onSave) {
                    const upApp = {
                      ...appraisal,
                      refId,
                      appraisalDate: dateStr,
                      scores,
                      overallScore: calculateOverall(),
                      strengths: typeof appraisal.strengths === 'object' ? { ...appraisal.strengths, [language]: strengths } : strengths,
                      improvements: typeof appraisal.improvements === 'object' ? { ...appraisal.improvements, [language]: improvements } : improvements,
                      training: typeof appraisal.training === 'object' ? { ...appraisal.training, [language]: training } : training,
                      signeeName: typeof appraisal.signeeName === 'object' ? { ...appraisal.signeeName, [language]: signee } : signee
                    };
                    onSave(upApp);
                  }
                  onClose();
                }}
                className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black border-none cursor-pointer"
              >
                {isAr ? 'اعتمد التغييرات بالدفتر' : 'Approve & Save Changes'}
              </button>
            </div>
          </div>

          {/* Main Paper Preview (A4 styled, live updating, and ContentEditable) */}
          <div className="flex-1 bg-slate-350 p-6 overflow-y-auto flex justify-center items-start">
            <div
              id="adala-print-sheet"
              className="print-sheet-container bg-white w-[210mm] min-h-[297mm] p-10 shadow-2xl relative border-2 border-double border-[#00796B] leading-relaxed text-xs text-slate-700"
              style={{ paddingBottom: '30mm' }}
              dir="rtl"
            >
              
              {/* Official Letterhead Header */}
              <div className="border-b-2 border-[#00796B] pb-5 flex justify-between items-start font-bold">
                <div className="space-y-1 text-right">
                  <h2 className="text-sm font-black text-[#004D40]">مكتب المحامي صبري شطا للمحاماة</h2>
                  <p className="text-[10px] text-slate-500 font-extrabold">للاستشارات القانونية والشركات والتحكيم والامتثال</p>
                  <p className="text-[9px] text-slate-400 font-medium">مسجل بنقابة المحامين الكويتية - الشرق بدولة الكويت</p>
                  <p className="text-[9px] text-[#00796B] font-mono">TEL: +965 2244 5566 | FAX: +965 2244 5577</p>
                </div>

                <div className="text-center space-y-1">
                  <div className="flex items-center justify-center gap-1 text-[#00796B]">
                    <Shield className="w-5 h-5 text-[#00796B]" />
                    <span className="font-black text-xs font-mono tracking-wider">ADALAH</span>
                  </div>
                  <h3 className="text-[8px] text-slate-400 uppercase font-black tracking-wider">Adalah Legal & Audit Suite</h3>
                  <div className="inline-block mt-2 px-3 py-1 bg-gradient-to-r from-[#004D40]/5 to-[#00796B]/5 border border-[#00796B]/20 rounded-lg">
                    <span className="text-xs font-black text-[#004D40] block">{docTitle}</span>
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <h2 className="text-xs font-black text-[#00796B]">عدالـة للإدارة الكادرية</h2>
                  <p className="text-[9px] text-slate-500 font-mono">ID: {refId}</p>
                  <p className="text-[9px] text-slate-500 font-mono">DATE: {dateStr}</p>
                  <p className="text-[9.5px] text-slate-400">بصمة البوابة: <strong className="font-mono text-[8px] text-emerald-600">CERTIFIED_LEGAL_SEAL</strong></p>
                </div>
              </div>

              {/* Document Content */}
              <div className="mt-6 space-y-5">
                
                {/* Employee Info Block */}
                <div className="bg-slate-50 rounded-xl border p-4 grid grid-cols-2 gap-4 font-bold text-[11px] leading-relaxed">
                  <div>
                    <span className="text-slate-400 uppercase text-[9px] block">اسم العامل المعني بالصك:</span>
                    <span className="text-slate-900">{employee.fullName?.[language] || employee.fullNameAr || employee.fullName || ''}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase text-[9px] block">الرقم المدني الكويتي الموثق:</span>
                    <span className="font-mono text-slate-800">{employee.civilId || '296052403198'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase text-[9px] block">المسمى الاستشاري والقسم:</span>
                    <span className="text-slate-800">
                      {employee.jobTitle?.[language] || employee.jobTitle || ''} 
                      {' / '}
                      {employee.department?.[language] || employee.department || ''}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase text-[9px] block">الراتب الشهري التراكمي:</span>
                    <span className="text-[#00796B] font-mono">{(employee.basicSalary || employee.salary || 0) + (employee.allowancesAmount || 0)} د.ك</span>
                  </div>
                </div>

                <p className="text-slate-700 leading-relaxed font-semibold text-[11.5px] whitespace-normal">
                  بموجب الفحوصات الدورية ومراقبة التزام الهيئة الاستشارية وقضايا التجارة والاستثمار المحققة بمستودع مكتب صبري شطا للعام المالي والتشغيلي الجاري، وبموافقة لجنة التدقيق والنزاهة الإدارية اللامركزية، تم اعتماد هذا التقييم كصك رسمي مندرج في كادر ملف العامل:
                </p>

                {/* Analytical Weighted Table */}
                <div className="border border-[#B2DFDB]/50 rounded-xl overflow-hidden mt-2 select-none">
                  <table className="w-full text-right text-[11px] font-semibold border-collapse">
                    <thead className="bg-[#E0F2F1] text-[#004D40] text-[9.5px] font-extrabold uppercase border-b border-[#B2DFDB]/40">
                      <tr>
                        <th className="p-3">معيار الكفاءة واللوائح المهنية المعتمدة</th>
                        <th className="p-3 text-center">الدرجة المقررة (5)</th>
                        <th className="p-3 text-center">الوزن النسبي</th>
                        <th className="p-3 text-center">الدرجة النهائية المثقلة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-3 font-bold">صياغة اللوائح والمذكرات والبحث المسبق في أحكام التمييز</td>
                        <td className="p-3 text-center font-sans font-extrabold text-slate-850">{scores.drafting}</td>
                        <td className="p-3 text-center text-slate-450 font-mono">25%</td>
                        <td className="p-3 text-center font-mono font-black text-base text-[#00796B] bg-[#E0F2F1]/30 border-r" rowSpan={4}>
                          {calculateOverall()}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold">كسب الدعاوى والترافع الصالح والالتزام بأوقات لجان الخبراء</td>
                        <td className="p-3 text-center font-sans font-extrabold text-slate-850">{scores.successRate}</td>
                        <td className="p-3 text-center text-slate-450 font-mono">25%</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold">النزاهة، شرف السلوك الإنساني، والتعامل الصبور السري مع الموكلين</td>
                        <td className="p-3 text-center font-sans font-extrabold text-slate-850">{scores.clientRelations}</td>
                        <td className="p-3 text-center text-slate-450 font-mono">25%</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold">الامتثال للأنظمة والدوام وبصمة وزارة الشؤون والجمعية الشريكة</td>
                        <td className="p-3 text-center font-sans font-extrabold text-slate-850">{scores.compliance}</td>
                        <td className="p-3 text-center text-slate-450 font-mono">25%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Overall Band */}
                <div className="flex justify-between items-center bg-[#E0F2F1]/30 border border-[#B2DFDB]/40 px-4 py-2.5 rounded-xl text-xs font-black">
                  <span className="text-[#004D40]">{isAr ? 'التقدير التراكمي العام للمستحق:' : 'Calculated Cumulative Evaluation:'}</span>
                  <span className="text-white px-3 py-1 rounded bg-[#00796B] font-mono text-center">
                    {getTier(calculateOverall())}
                  </span>
                </div>

                {/* Strengths & Narrative */}
                <div className="space-y-3">
                  <div className="border-r-4 border-[#00796B] pr-3.5">
                    <h4 className="text-xs font-black text-[#004D40] uppercase">{isAr ? 'أولاً: نقاط القوة الاستشارية والعملية الفعالة' : 'I. Core Strategy & Advisory Strengths'}</h4>
                  </div>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => setStrengths(e.currentTarget.textContent || '')}
                    className="p-3.5 bg-slate-50/50 rounded-xl border leading-relaxed text-slate-700 hover:bg-slate-50 transition-all font-medium whitespace-pre-wrap outline-emerald-600 outline-offset-2 cursor-text"
                  >
                    {strengths}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="border-r-4 border-amber-600 pr-3.5">
                    <h4 className="text-xs font-black text-[#004D40] uppercase">{isAr ? 'ثانياً: مسارات التطوير ومستهدد الـ 90 يوماً القادمة' : 'II. Target Objectives & 90-Day Corrective Paths'}</h4>
                  </div>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => setImprovements(e.currentTarget.textContent || '')}
                    className="p-3.5 bg-slate-50/50 rounded-xl border leading-relaxed text-slate-700 hover:bg-slate-50 transition-all font-medium whitespace-pre-wrap outline-emerald-600 outline-offset-2 cursor-text"
                  >
                    {improvements}
                  </div>
                </div>

                {training && (
                  <div className="bg-emerald-50/40 border border-[#B2DFDB]/25 p-3.5 rounded-xl flex items-start gap-2.5">
                    <span className="text-[9px] bg-[#00796B] text-white px-2 py-0.5 rounded font-black tracking-wide shrink-0">برنامج التدريب الإلزامي</span>
                    <p className="text-xs font-black text-[#004D40]">
                      {isAr ? 'يخضع الموظف لندوة صقل إلزامية بمعرفة المكتب:' : 'Requires the following mandatory legal seminars:'}
                      <span className="mx-1 font-bold text-slate-700">{training}</span>
                    </p>
                  </div>
                )}

                {/* Signatures & Stamper */}
                <div className="pt-8 flex justify-between items-center text-center">
                  <div className="space-y-2">
                    <p className="text-slate-400 font-bold text-[8.5px]">الختم المائي لمدير المطابقة والترخيص</p>
                    <div className="w-22 h-22 rounded-full border-4 border-dashed border-[#00796B]/30 text-[#00796B] text-[8px] font-black flex items-center justify-center rotate-12 mx-auto bg-[#E0F2F1]/10 px-2 leading-tight">
                      <span>{stampText}</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-center font-bold">
                    <p className="text-slate-400 text-[9px]">{isAr ? 'المفوض المعتمد بالتوقيع والصك' : 'Authorizing Managing Partner'}</p>
                    <p className="font-serif italic text-sm font-black text-slate-800 leading-none pt-2">{signee}</p>
                    <p className="text-[8.5px] text-slate-400 pt-1">{signeeTitle}</p>
                  </div>
                </div>

              </div>

              {/* Document Legal Footer with Address & Contact Info */}
              <div className="absolute bottom-10 left-10 right-10 border-t border-[#00796B]/30 pt-4 flex justify-between items-center text-[8.5px] text-slate-400 font-bold select-none">
                <div className="space-y-0.5 text-right">
                  <p>البريد الإلكتروني للتحقق والاستعلام: <span className="font-mono text-[#00796B] hover:underline">info@alwagayan-shatta.com</span></p>
                  <p>برج الوجيان، الدور الرابع، شارع جابر المبارك، دسمان - الشرق، دولة الكويت</p>
                </div>
                <div className="flex items-center gap-2">
                  <QrCode className="w-8 h-8 text-slate-450 border p-0.5 rounded bg-slate-50" />
                  <div className="text-left font-sans">
                    <p className="font-black text-[#004D40] leading-none">عدالـة ADALAH</p>
                    <p className="text-[7.5px] text-slate-400 mt-0.5">صفحة 1 من 1</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </motion.div>

        {/* Floating Controls for print modal */}
        <div className="fixed bottom-6 right-6 flex gap-2 z-[9995] no-print">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 h-12 px-6 bg-[#00796B] hover:bg-[#004D40] text-white rounded-full text-xs font-black shadow-lg cursor-pointer border-none"
          >
            <Printer className="w-4.5 h-4.5" />
            <span>{isAr ? 'طباعة مباشرة صك الورقي' : 'Direct Print Official Deed'}</span>
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 h-12 w-12 justify-center bg-slate-800 hover:bg-slate-900 text-white rounded-full text-xs font-black shadow-lg cursor-pointer border-none"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

      </div>
    </AnimatePresence>
  );
};
