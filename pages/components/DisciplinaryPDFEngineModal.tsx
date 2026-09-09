import React, { useState } from 'react';
import { 
    Printer, X, ShieldCheck, Download, Scale, Stamp, 
    CheckCircle2, FileText, QrCode, Building, Award, Check
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { DisciplinaryRecord, calculate20DayCountdown } from './DisciplinaryTypes';

interface DisciplinaryPDFEngineModalProps {
    isOpen: boolean;
    onClose: () => void;
    record: DisciplinaryRecord | null;
}

export const DisciplinaryPDFEngineModal: React.FC<DisciplinaryPDFEngineModalProps> = ({
    isOpen,
    onClose,
    record
}) => {
    if (!isOpen || !record) return null;

    const [activeStamp, setActiveStamp] = useState<'investigation' | 'paf_approved' | 'confidential' | null>('investigation');

    const countdown = calculate20DayCountdown(record.notificationDate, record.appealDeadlineDate);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800">
                
                {/* Modal Header Toolbar */}
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0F172A] to-[#1E293B] text-[#C19A5B] flex items-center justify-center shadow-xs">
                            <Printer className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xs font-black text-slate-900 dark:text-white">
                                محرك طباعة القرارات التأديبية والمحررات الرسمية
                            </h3>
                            <p className="text-[10px] text-slate-500 font-mono">
                                صك رسمي موثق برمز QR وختم مكتب المحامي صبري شطا
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Stamp selector */}
                        <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-700 p-1 rounded-xl text-[10px] font-bold">
                            <button
                                onClick={() => setActiveStamp('investigation')}
                                className={`px-2 py-1 rounded-lg transition-all ${
                                    activeStamp === 'investigation' ? 'bg-teal-700 text-white' : 'text-slate-600 dark:text-slate-300'
                                }`}
                            >
                                ختم التحقيق
                            </button>
                            <button
                                onClick={() => setActiveStamp('paf_approved')}
                                className={`px-2 py-1 rounded-lg transition-all ${
                                    activeStamp === 'paf_approved' ? 'bg-[#C19A5B] text-[#0F172A]' : 'text-slate-600 dark:text-slate-300'
                                }`}
                            >
                                ختم الاعتماد
                            </button>
                            <button
                                onClick={() => setActiveStamp('confidential')}
                                className={`px-2 py-1 rounded-lg transition-all ${
                                    activeStamp === 'confidential' ? 'bg-rose-700 text-white' : 'text-slate-600 dark:text-slate-300'
                                }`}
                            >
                                سري وخاص
                            </button>
                            <button
                                onClick={() => setActiveStamp(null)}
                                className={`px-2 py-1 rounded-lg transition-all ${
                                    activeStamp === null ? 'bg-slate-400 text-white' : 'text-slate-600 dark:text-slate-300'
                                }`}
                            >
                                بدون ختم
                            </button>
                        </div>

                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handlePrint}
                            className="bg-[#113F36] hover:bg-[#0d312a] text-white font-black text-xs h-9 px-4 rounded-xl shadow-xs"
                        >
                            <Printer className="w-4 h-4 ml-1.5 text-[#C19A5B]" />
                            طباعة / PDF
                        </Button>

                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Printable Document Body */}
                <div className="p-8 overflow-y-auto bg-slate-100 dark:bg-slate-950 flex justify-center">
                    <div 
                        id="printable-disciplinary-record" 
                        className="bg-white text-slate-900 w-full max-w-2xl p-8 rounded-2xl shadow-lg border border-slate-300 relative font-sans space-y-6 text-right"
                    >
                        
                        {/* Official Letterhead */}
                        <div className="border-b-2 border-[#113F36] pb-4 flex justify-between items-start">
                            <div>
                                <h1 className="text-base font-black text-[#113F36]">
                                    مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية
                                </h1>
                                <p className="text-[11px] text-slate-600 font-bold mt-0.5">
                                    قسم التحقيقات والنزاعات العمالية وإدارة شؤون الموظفين
                                </p>
                                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                                    دولة الكويت • معتمد لدى القوى العاملة وغرفة التجارة
                                </p>
                            </div>

                            <div className="text-left font-mono text-[10px] text-slate-600 font-bold space-y-1">
                                <div>رقم القرار: <strong className="text-[#113F36] font-black">{record.recordNumber}</strong></div>
                                <div>تاريخ الإصدار: {record.issueDate || record.notificationDate}</div>
                                <div>رقم المحضر: {record.relatedInvestigationNo || 'QA-INV-001'}</div>
                            </div>
                        </div>

                        {/* Title of Document */}
                        <div className="text-center py-2 bg-slate-50 rounded-xl border border-slate-200">
                            <h2 className="text-sm font-black text-[#113F36] uppercase tracking-wider">
                                قرار تأديبي صادر بموجب قانون العمل الكويتي رقم (6) لسنة 2010
                            </h2>
                        </div>

                        {/* Employee Details Box */}
                        <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50/80 p-4 rounded-xl border border-slate-200 font-medium">
                            <div>
                                <span className="text-slate-500 block font-bold">اسم الموظف المشكو بحقه:</span>
                                <strong className="text-slate-900">{record.employeeName}</strong>
                            </div>
                            <div>
                                <span className="text-slate-500 block font-bold">الرقم المدني:</span>
                                <span className="font-mono font-bold text-slate-900">{record.civilId}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 block font-bold">المسمى الوظيفي:</span>
                                <span className="text-slate-900">{record.employeeJobTitle}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 block font-bold">الإدارة / القسم التابع له:</span>
                                <span className="text-slate-900">{record.employeeDepartment}</span>
                            </div>
                        </div>

                        {/* Violation & Investigation Grounds */}
                        <div className="space-y-2 text-xs leading-relaxed">
                            <h3 className="font-black text-[#113F36] border-r-4 border-[#C19A5B] pr-2">
                                أولاً: الوقائع وثبوت المخالفة المنسوبة
                            </h3>
                            <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                                {record.details}
                            </p>
                            {record.evidenceNotes && (
                                <p className="text-[11px] text-slate-600 font-medium">
                                    <strong>الأدلة والقرائن الثابتة:</strong> {record.evidenceNotes}
                                </p>
                            )}
                        </div>

                        {/* Legal Decision */}
                        <div className="space-y-2 text-xs leading-relaxed">
                            <h3 className="font-black text-[#113F36] border-r-4 border-[#C19A5B] pr-2">
                                ثانياً: منطوق القرار التأديبي (المادتان 35 و 102)
                            </h3>
                            <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-[#113F36] font-bold">
                                بناءً على ما أسفر عنه التحقيق الإداري وسماع أقوال الموظف المذكور وإعمالاً لسلطة صاحب العمل المقررة بالمادة (102) من قانون العمل في القطاع الأهلي، تقرر ما يلي:
                                <div className="text-sm font-black text-teal-900 mt-2 text-center">
                                    «توقيع جزاء: {record.sanctionType}»
                                </div>
                            </div>
                        </div>

                        {/* Legal Appeal Notice (20 Days) */}
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 font-medium space-y-1">
                            <strong className="block font-black text-amber-950">إخطار قانوني بمهلة التظلم:</strong>
                            <p>
                                يخطر الموظف بأنه يحق له التظلم من هذا القرار لدى الإدارة القانونية خلال مهلة أقصاها (20) يوماً من تاريخ إخطاره الرسمي، وينتهي ميعاد التظلم بتاريخ: <strong className="font-mono text-amber-950 font-black">{countdown.deadlineFormatted}</strong>.
                            </p>
                        </div>

                        {/* Signatures & Stamps Footer */}
                        <div className="grid grid-cols-2 gap-6 pt-4 border-t-2 border-slate-200 text-xs font-bold relative">
                            
                            {/* Stamp Graphic */}
                            {activeStamp && (
                                <div className="absolute left-1/2 top-2 -translate-x-1/2 pointer-events-none opacity-85 rotate-[-12deg]">
                                    {activeStamp === 'investigation' && (
                                        <div className="w-28 h-28 rounded-full border-4 border-teal-700 text-teal-700 flex flex-col items-center justify-center p-2 text-center shadow-xs">
                                            <Scale className="w-6 h-6 mb-1" />
                                            <span className="text-[9px] font-black leading-tight">لجنة التحقيق الإداري</span>
                                            <span className="text-[8px] font-bold">معتمد ومطابق</span>
                                            <span className="text-[8px] font-mono mt-0.5">{record.recordNumber}</span>
                                        </div>
                                    )}
                                    {activeStamp === 'paf_approved' && (
                                        <div className="w-28 h-28 rounded-full border-4 border-[#C19A5B] text-[#916b2c] flex flex-col items-center justify-center p-2 text-center shadow-xs">
                                            <Award className="w-6 h-6 mb-1" />
                                            <span className="text-[9px] font-black leading-tight">اعتماد الشؤون القانونية</span>
                                            <span className="text-[8px] font-bold">صبري شطا للمحاماة</span>
                                            <span className="text-[8px] font-mono mt-0.5">APPROVED</span>
                                        </div>
                                    )}
                                    {activeStamp === 'confidential' && (
                                        <div className="w-32 h-14 border-4 border-rose-700 text-rose-700 flex flex-col items-center justify-center text-center font-black">
                                            <span className="text-xs uppercase tracking-widest">سري وخاص جداً</span>
                                            <span className="text-[8px]">ملف الشؤون القانونية</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Investigator Signature */}
                            <div className="space-y-4 text-center">
                                <span className="text-slate-500 block">المحقق / المستشار القانوني:</span>
                                <p className="text-[#113F36] font-black">المستشار/ صبري شطا</p>
                                <div className="font-serif italic text-sm text-slate-700 pt-2 border-b border-dashed border-slate-300 w-36 mx-auto">
                                    Sabri Shata
                                </div>
                            </div>

                            {/* Employee Receipt Signature */}
                            <div className="space-y-4 text-center">
                                <span className="text-slate-500 block">توقيع المستلم بما يفيد الإخطار:</span>
                                <p className="text-slate-900 font-black">{record.employeeName}</p>
                                <div className="text-[10px] text-slate-400 pt-2 border-b border-dashed border-slate-300 w-36 mx-auto">
                                    بصمة / توقيع العامل
                                </div>
                            </div>

                        </div>

                        {/* Bottom QR Code & Barcode */}
                        <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-[9px] text-slate-400 font-mono">
                            <span>نظام عدالة للمحاماة والشؤون العمالية • كود التوثيق: {record.id.toUpperCase()}</span>
                            <div className="flex items-center gap-1.5">
                                <QrCode className="w-5 h-5 text-slate-700" />
                                <span>التحقق الرقمي السريع</span>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};
